import { doc, getFirestore, updateDoc } from "firebase/firestore";
import React, { Dispatch, SetStateAction } from "react";
import { useEffect, useState, useRef } from "react";
import { app } from "../functions/initialize_firebase";
import { writeUserData } from "../functions/task_logic";
import ExitSurvey from './ExitSurvey';
//import Dropdown from 'react-dropdown';
//import 'react-dropdown/style.css'; // Import default styling
import './OptionsMenu.css';
import MonacoEditor, {
  DiffEditor,
  useMonaco,
  loader,
} from "@monaco-editor/react";

interface TopPanelProps {
  showButtonInfo: boolean;
  setShowButtonInfo: (showButtonInfo: boolean) => void;
  showPopup: number;
  setShowPopup: (showPopup: number) => void;
  theme: string;
  setTheme: (theme: string) => void;
  editor: any;
  task_index: number;
  setTaskIndex: Dispatch<SetStateAction<number>>;
  function_signatures: string[];
  task_descriptions: string[];
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_id: string;
  response_id: string;
  exp_condition: string;
  worker_id: string;
  telemetry: any[];
  setModelAutocomplete: Dispatch<SetStateAction<string>>;
  setModelChat: Dispatch<SetStateAction<string>>;
  isSpinning: boolean;
}

const TopPanel: React.FC<TopPanelProps> = ({
  showButtonInfo,
  setShowButtonInfo,
  showPopup,
  setShowPopup,
  theme,
  setTheme,
  editor,
  task_index,
  setTaskIndex,
  function_signatures,
  task_descriptions,
  setTelemetry,
  task_id,
  response_id,
  exp_condition,
  worker_id,
  telemetry,
  setModelAutocomplete,
  setModelChat,
  isSpinning,
}) => {
  const timer_minutes = 180;
  const [currTime, setCurrTime] = useState("35:00");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownVisibleAI, setDropdownVisibleAI] = useState(false);

  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsAIButtonRef = useRef<HTMLButtonElement>(null);

  const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0, bottom: 0, right: 0 });
  const [buttonAIPosition, setButtonAIPosition] = useState({ top: 0, left: 0, bottom: 0, right: 0 });

  const toggleDropdown = () => {
    setDropdownVisibleAI(false);
    setDropdownVisible(!dropdownVisible);
    if (optionsButtonRef.current) {
      // Now TypeScript knows optionsButtonRef.current is an HTMLButtonElement
      setButtonPosition(optionsButtonRef.current.getBoundingClientRect());
    }
  };

  const toggleDropdownAI = () => {
    setDropdownVisible(false);
    setDropdownVisibleAI(!dropdownVisibleAI);
    if (optionsAIButtonRef.current) {
      // Now TypeScript knows optionsButtonRef.current is an HTMLButtonElement
      setButtonAIPosition(optionsAIButtonRef.current.getBoundingClientRect());
    }
  };


  useEffect(() => {
    var endTime = localStorage.getItem("endTime");
    if (!endTime) {
      endTime = (new Date().getTime() + timer_minutes * 60 * 1000).toString();
      localStorage.setItem("endTime", endTime);
    }
    updateTimer(endTime);
  }, []);

  const [showExitSurvey, setShowExitSurvey] = useState(false);

  const handleOpenSurvey = () => {
    setShowExitSurvey(true);

  };

  const handleCloseSurvey = () => {
    setShowExitSurvey(false);
  };


  // useEffect for when you get task_descriptions.

  const updateTimer: (endTime: string) => void = (endTime) => {
    var interval = setInterval(
      (
        response_id: any,
        telemetry: any,
        task_id: any,
        exp_condition: any,
        worker_id: any
      ) => {
        var currentTime = new Date().getTime();

        var distance = Number(endTime) - currentTime;
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result in the timer div

        // If the count down is over, display "Time is up"
        if (distance < 0) {
          // // get the user out
          setCurrTime("Time is up");

          // FIXME: I don't think any of this is necessary except the updateDoc.
          writeUserData(response_id, telemetry);
          var time_completed = new Date();
          var time_completed_string = time_completed.toString();
          try {
            const db = getFirestore(app);
            console.log("response id inside exit" + response_id);
            let userDoc = doc(db, "responses", response_id);
            const newData = {
              time_completed: time_completed_string,
            }

            const updateDocData = updateDoc(userDoc, newData);
          } catch (error) {
            console.error('Error writing document: ', error);
          }
          handleOpenSurvey();
        }
        else {
          setCurrTime(minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
        }

      },
      1000,
      response_id,
      telemetry,
      task_id,
      exp_condition,
      worker_id
    );
  };

  const changeTheme: (theme_param: string) => void = (theme_param) => {
    if (theme_param === "light") {
      setTheme("light");
      editor.updateOptions({ theme: "vs" });
    } else {
      setTheme("dark");
      editor.updateOptions({ theme: "vs-dark" });
    }
    toggleDropdown();
  };

  const saveCode: () => void = () => {
    // save code editor to file for user
    var blob = new Blob([editor.getValue()], { type: "text/plain" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "code.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    toggleDropdown();
  };

  const changeAutocompleteModel: (model: string) => void = (model) => {
    console.log("Changing autocomplete model to " + model);
    setModelAutocomplete(model);
    toggleDropdownAI();

  }
  const changeChatModel: (model: string) => void = (model) => {
    setModelChat(model);
    toggleDropdownAI();
  }



  const resetCode: () => void = () => {
    var isConfirmed = confirm(
      "Are you sure you want to reset your code to when the task was loaded? This deletes your current code."
    );

    if (isConfirmed) {
      // FIXME: Add telemetry data and based on the actual stuff rn
      setTelemetry((prev) => {
        return [
          ...prev,
          {
            event_type: "code_reset",
            code: editor.getValue(),
            task_id: task_id,
            task_index: task_index,
            timestamp: Date.now(),
          },
        ];
      });

      console.log("Resetting code");

      editor.setValue(function_signatures[task_index].replace(/\\n/g, "\n"));

    }
    toggleDropdown();

  };

  return (
    <>
      <div className="top-panel">

        <button ref={optionsButtonRef} onClick={toggleDropdown}>Options</button>
        {dropdownVisible && (
          <div className="dropdown-menu" style={{ top: `${buttonPosition.bottom}px`, left: `${buttonPosition.left}px` }}>
            <div className="menu-item">
              Change Theme
              <div className="submenu">
                <button onClick={() => changeTheme("dark")}>Dark </button>
                <button onClick={() => changeTheme("light")}>Light</button>
              </div>
            </div>
            <button onClick={resetCode}>Reset Code</button>
            <button onClick={saveCode}>Save Code to file</button>
            <div className="menu-item">
              Autocomplete Model
              <div className="submenu">
                <button onClick={() => changeAutocompleteModel("codellama/CodeLlama-70b-Python-hf")}>CodeLlama-70b-Python-hf </button>
                <button onClick={() => changeAutocompleteModel("codellama/CodeLlama-7b-Python-hf")}>CodeLlama-7b-Python-hf</button>
                <button onClick={() => changeAutocompleteModel("Phind/Phind-CodeLlama-34B-v2")}>Phind-CodeLlama-34B-v2</button>
                <button onClick={() => changeAutocompleteModel("gpt-3.5")}>GPT-3.5</button>
                <button onClick={() => changeAutocompleteModel("Off")}>Off</button>

              </div>
            </div>
            <div className="menu-item">
              Chat Model
              <div className="submenu">
                <button onClick={() => changeChatModel("codellama/CodeLlama-7b-Instruct-hf")}>CodeLlama-7b-Instruct-hf </button>
                <button onClick={() => changeChatModel("codellama/CodeLlama-70b-Instruct-hf")}>CodeLlama-70b-Instruct-hf</button>
                <button onClick={() => changeChatModel("meta-llama/Llama-3-70b-chat-hf")}>Llama-3-70b-chat-hf</button>
                <button onClick={() => changeChatModel("meta-llama/Llama-3-8b-chat-hf")}>Llama-3-8b-chat-hf</button>
                <button onClick={() => changeChatModel("mistralai/Mixtral-8x22B-Instruct-v0.1")}>Mixtral-8x22B</button>
                <button onClick={() => changeChatModel("gpt-3.5-turbo")}>GPT-3.5</button>
                <button onClick={() => changeChatModel("gpt-4-turbo")}>GPT-4</button>
                <button onClick={() => changeChatModel("Off")}>Off</button>

              </div>
            </div>
          </div>
        )}

        <button ref={optionsAIButtonRef} onClick={toggleDropdownAI}>AI Settings</button>
        {dropdownVisibleAI && (
          <div className="dropdown-menu" style={{ top: `${buttonAIPosition.bottom}px`, left: `${buttonAIPosition.left}px` }}>
            <div className="menu-item">
              Autocomplete Model
              <div className="submenu">
                <button onClick={() => changeAutocompleteModel("codellama/CodeLlama-70b-Python-hf")}>CodeLlama-70b-Python-hf </button>
                <button onClick={() => changeAutocompleteModel("codellama/CodeLlama-7b-Python-hf")}>CodeLlama-7b-Python-hf</button>
                <button onClick={() => changeAutocompleteModel("Phind/Phind-CodeLlama-34B-v2")}>Phind-CodeLlama-34B-v2</button>
                <button onClick={() => changeAutocompleteModel("gpt-3.5")}>GPT-3.5</button>
                <button onClick={() => changeAutocompleteModel("Off")}>Off</button>

              </div>
            </div>
            <div className="menu-item">
              Chat Model
              <div className="submenu">
                <button onClick={() => changeChatModel("codellama/CodeLlama-7b-Instruct-hf")}>CodeLlama-7b-Instruct-hf </button>
                <button onClick={() => changeChatModel("codellama/CodeLlama-70b-Instruct-hf")}>CodeLlama-70b-Instruct-hf</button>
                <button onClick={() => changeChatModel("meta-llama/Llama-3-70b-chat-hf")}>Llama-3-70b-chat-hf</button>
                <button onClick={() => changeChatModel("meta-llama/Llama-3-8b-chat-hf")}>Llama-3-8b-chat-hf</button>
                <button onClick={() => changeChatModel("mistralai/Mixtral-8x22B-Instruct-v0.1")}>Mixtral-8x22B</button>
                <button onClick={() => changeChatModel("gpt-3.5-turbo")}>GPT-3.5</button>
                <button onClick={() => changeChatModel("gpt-4-turbo")}>GPT-4</button>
                <button onClick={() => changeChatModel("Off")}>Off</button>

              </div>
            </div>
          </div>
        )}



        <button onClick={() => setShowButtonInfo(true)}>
          Show Shortcuts and Button Info
        </button>
        <button onClick={() => setShowPopup(1)}>Show Instructions</button>

        {/* <!-- Overlay for the popup --> */}
        <div className="overlay" id="overlay" onClick={() => "FIXME"}></div>

        {/* <!-- Popup box --> */}
        <div className={showButtonInfo ? "popup" : "popup hidden"} id="popup">
          <h2> Button Information</h2>
          <p>
            {/* <!-- <b>Start Recording</b> - Starts recording your screen. <br />
                <b>Stop Recording</b> - Stops recording screen <br />
                <b>Model Selector</b> - Selects the model to use for suggestions. <br />
                <b>Max Tokens Suggestion</b> - Sets the maximum number of tokens to use for suggestions. <br /> --> */}
            <b>Show Button Info</b> - Shows this popup. <br />
            <b>Show Instructions</b> - Shows the instructions for the study.{" "}
            <br />

            <div style={{ "display": "flex" }}>
              <img id="ai_icon" src="/ai_icon.png" className="h-5 w-5" /> - When this icon spins, the AI is generating an autocomplete suggestion{" "} </div>
            <b> Timer </b> - Displays the time remaining in the task. <br />
            <b> Progress Bar </b> - Displays the progress of the task. <br />
            <b> Run </b> - Runs the code in the editor and displays output in box
            below code. <br />
            <b> Submit </b> - Evaluates the code in the editor with unit tests
            given task. <br />
            Under the <b>Options</b> tab: <br />
            &nbsp;<b>Change Theme</b> - Changes the theme of the editor. <br />
            &nbsp;<b>Reset Code</b> - Resets the code in the editor to the original
            code. <br />
            &nbsp;<b>Save Code to File</b> - Saves the code in editor to a .txt file <br />
            &nbsp;<b>Autocomplete Model</b> - Change the autocomplete model<br />
            &nbsp;<b>Chat Model</b> - Change the chat model<br />
          </p>
          <h2>Keyboard Shortcuts</h2>
          <p>
            [TAB] to accept a suggestion
            <br />
            [ESC] to reject suggestion
            <br />
            [CTRL+ENTER] (Windows) and [CMD+ENTER] (Mac) to request a suggestion
          </p>
          <button onClick={() => setShowButtonInfo(false)}>Close</button>
        </div>
        {/* <button onClick={handleOpenSurvey}>Open Exit Survey</button> */}

        {/* <div className={showExitSurvey ? "popup" : "popup hidden"} id="popup">

        <ExitSurvey response_id={response_id} app={app} />
            <button onClick={handleCloseSurvey}>Close</button>
            </div> */}

        {showExitSurvey && (
          <div className="exit-survey-overlay">
            <div className="exit-survey-popup">
              <ExitSurvey response_id={response_id} app={app} />
              <button onClick={handleCloseSurvey}>Close</button>
            </div>
          </div>
        )}


        <div className="parentprogress">
          <span> Time Left: &nbsp; </span>
          <div id="timer">{currTime}</div>
          &nbsp;
          <div id="progressContainer">
            <progress id="taskProgress" value="0" max="5">  </progress>
            <span id="progressText">
              {task_index == -1 ? 0 : task_index}/{function_signatures.length} tasks completed
            </span>
          </div>
          &nbsp;
          <img id="thinkingIcon" src="/ai_icon.png" className={isSpinning ? 'spinning' : ''} />

        </div>
      </div>




    </>
  );
};

export default TopPanel;
