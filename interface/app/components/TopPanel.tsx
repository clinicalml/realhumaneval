import React, { Dispatch, SetStateAction, useCallback } from "react";
import { useEffect, useState, useRef } from "react";
import { app } from "../functions/initialize_firebase";
import ExitSurvey from "./ExitSurvey";
import PromptModal, { PromptProp } from "./PromptModal";
import {
  default_prompts,
  proactive_tutorial,
  tutorial_wait_time,
} from "./settings";

import "./OptionsMenu.css";
import MonacoEditor, {
  DiffEditor,
  useMonaco,
  loader,
} from "@monaco-editor/react";
import {
  trackProactiveTurnedOnOff,
  trackSubmitCode,
} from "../functions/telemetry";

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
  setProactive: Dispatch<SetStateAction<boolean>>;
  isSpinning: boolean;
  setProactiveRefreshTimeActive: Dispatch<SetStateAction<number>>;
  setProactiveRefreshTimeInactive: Dispatch<SetStateAction<number>>;
  prompts: PromptProp;
  setPrompts: Dispatch<SetStateAction<PromptProp>>;
  task_duration_minutes: number;
  proactive_switch_minutes: number;
  proactive_available_start: boolean;
  showAIOptions: boolean;
  taskStarted: boolean;
  editorRef: any;
  actualEditorRef: any;
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
  setProactive,
  isSpinning,
  setProactiveRefreshTimeActive,
  setProactiveRefreshTimeInactive,
  prompts,
  setPrompts,
  task_duration_minutes,
  proactive_switch_minutes,
  proactive_available_start,
  showAIOptions,
  taskStarted,
  editorRef,
  actualEditorRef,
}) => {
  // const timer_minutes = 180;
  // const timer_minutes = task_duration_minutes;
  const [currTime, setCurrTime] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [dropdownVisibleAI, setDropdownVisibleAI] = useState(false);
  const [proactivePopupVisible, setProactivePopupVisible] = useState(false);
  const [noProactivePopupVisible, setNoProactivePopupVisible] = useState(false);
  const isPartTwo = useRef(false);

  var interval: any;
  var endTime: any;

  const changePrompt = () => {
    setShowPromptModal(true);
  };

  const handleClosePromptModal = () => {
    setShowPromptModal(false);
  };

  const handleSavePrompts = (newPrompts: PromptProp) => {
    setPrompts(newPrompts);
  };

  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const optionsAIButtonRef = useRef<HTMLButtonElement>(null);

  const [buttonPosition, setButtonPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });
  const [buttonAIPosition, setButtonAIPosition] = useState({
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  });

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
    if (!taskStarted) return;

    if (task_index == partTwoTaskIndex.current && proactivePopupVisible) {
      clearInterval(interval);
      setCurrTime("");
      return;
    }
    if (task_index == partTwoTaskIndex.current) {
      endTime = (
        new Date().getTime() +
        task_duration_minutes * 0.5 * 60 * 1000
      ).toString();
      localStorage.setItem("endTime", endTime);
      updateTimer(endTime);
      return () => clearInterval(interval);
    }

    if (task_index == 0) {
      endTime = (
        new Date().getTime() +
        task_duration_minutes * 60 * 1000
      ).toString();
      localStorage.setItem("endTime", endTime);
      updateTimer(endTime);
      return () => clearInterval(interval);
    }

    endTime = localStorage.getItem("endTime");
    updateTimer(endTime);
    return () => clearInterval(interval);
  }, [taskStarted, task_index, proactivePopupVisible]);

  const [showExitSurvey, setShowExitSurvey] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handleOpenSurvey = () => {
    setShowExitSurvey(true);
  };

  const handleCloseSurvey = () => {
    setShowExitSurvey(false);
  };

  useEffect(() => {
    if (task_index != 0 && task_index >= function_signatures.length) {
      // handleOpenSurvey();
      var time_completed = new Date();
      var time_completed_string = time_completed.toString();
      console.log("response id inside exit" + response_id);
      const newData = {
        time_completed: time_completed_string,
      };

      console.log("useEffect");
      setTaskIndex(-1);
    }
  }, [task_index, function_signatures]);

  // const [partTwoTaskIndex, setPartTwoTaskIndex] = useState(-1);
  const partTwoTaskIndex = useRef(-1);
  useEffect(() => {
    console.log("function_signatures", function_signatures);
    if (function_signatures.length == 0) return;
    partTwoTaskIndex.current = Math.floor(function_signatures.length / 2);
  }, [function_signatures]);

  const goToPartTwo = () => {
    if (!isPartTwo.current) {
      trackSubmitCode(
        setTelemetry,
        task_index,
        "time is up",
        false,
        editorRef.current
      );
      console.log("goToPartTwo");
      setTaskIndex(partTwoTaskIndex.current);
      isPartTwo.current = true;
      switchProactive();
    }
  };

  const switchProactive = () => {
    if (proactive_available_start) {
      setProactive(false);
      setNoProactivePopupVisible(true);
      trackProactiveTurnedOnOff(setTelemetry, false, task_index);
    } else {
      setProactive(true);
      setProactivePopupVisible(true);
      trackProactiveTurnedOnOff(setTelemetry, true, task_index);
    }
  };

  useEffect(() => {
    if (task_index == partTwoTaskIndex.current && !isPartTwo.current) {
      switchProactive();
      isPartTwo.current = true;
    }
  }, [task_index == partTwoTaskIndex.current]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      goToPartTwo();
      clearInterval(timeout);
    }, proactive_switch_minutes * 60 * 1000);
  }, []);

  // useEffect for when you get task_descriptions.

  const finishAllTasks = (task_index: any, editorRef: any) => {
    trackSubmitCode(
      setTelemetry,
      task_index,
      "incomplete",
      false,
      editorRef.current
    );

    setTimeout(() => {
      setTaskIndex(-1);
    }, 1000);
  };

  const updateTimer: (endTime: string) => void = (endTime) => {
    interval = setInterval(
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
          console.log("time is up updateTimer");

          trackSubmitCode(
            setTelemetry,
            task_index,
            "incomplete",
            false,
            editorRef.current
          );
          setTimeout(() => {
            setTaskIndex(-1);
          }, 1000);
          // FIXME: I don't think any of this is necessary except the updateDoc.
          // writeUserData(response_id, telemetry);

          // handleOpenSurvey();
          clearInterval(interval);
        } else {
          setCurrTime(minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
        }

        return () => clearInterval(interval);
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
  };
  const changeChatModel: (model: string) => void = (model) => {
    console.log("Changing chat model to " + model);
    setModelChat(model);
    toggleDropdownAI();
  };
  const changeProactive: (on: boolean) => void = (on) => {
    console.log("Changing proactive chat suggestion to " + on);
    setProactive(on);
    toggleDropdownAI();
  };

  const changeRefreshTime: (
    active: number | null,
    inactive: number | null
  ) => void = (active, inactive) => {
    console.log(
      "Changing proactive refresh time to " + active + " and " + inactive
    );
    if (active) setProactiveRefreshTimeActive(active * 1000);
    if (inactive) setProactiveRefreshTimeInactive(inactive * 1000);
    toggleDropdownAI();
  };

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
      actualEditorRef.current.setEditorType(
        false,
        function_signatures[task_index].replace(/\\n/g, "\n"),
        function_signatures[task_index].replace(/\\n/g, "\n")
      );

      editor.setValue(function_signatures[task_index].replace(/\\n/g, "\n"));
    }
    toggleDropdown();
  };

  const part_two = () => {
    return (
      <>
        <p>
          This is the second part of the study. You will have 20 minutes to
          solve coding tasks.
        </p>
      </>
    );
  };

  const [showProactiveContinue, setShowProactiveContinue] = useState(false);

  useEffect(() => {
    if (proactivePopupVisible) {
      setTimeout(() => {
        setShowProactiveContinue(true);
      }, tutorial_wait_time);
    }
  }, [proactivePopupVisible]);

  return (
    <>
      <div className="top-panel">
        <button ref={optionsButtonRef} onClick={toggleDropdown}>
          Options
        </button>
        {dropdownVisible && (
          <div
            className="dropdown-menu"
            style={{
              top: `${buttonPosition.bottom}px`,
              left: `${buttonPosition.left}px`,
            }}
          >
            {/* <div className="menu-item">
              Change Theme
              <div className="submenu">
                <button onClick={() => changeTheme("dark")}>Dark </button>
                <button onClick={() => changeTheme("light")}>Light</button>
              </div>
            </div> */}
            <button onClick={resetCode}>Reset Code</button>
            <button onClick={saveCode}>Save Code to file</button>
          </div>
        )}

        {/* {showAIOptions && <button ref={optionsAIButtonRef} onClick={toggleDropdownAI}>(debug) AI Settings</button>} */}
        {<button ref={optionsAIButtonRef} onClick={toggleDropdownAI}>AI Settings</button> }
        {dropdownVisibleAI && (
          <div
            className="dropdown-menu"
            style={{
              top: `${buttonAIPosition.bottom}px`,
              left: `${buttonAIPosition.left}px`,
            }}
          >
            <div className="menu-item">
              Proactive Asistant
              <div className="submenu">
                <button onClick={() => changeProactive(true)}>On </button>
                <button onClick={() => changeProactive(false)}>Off </button>
              </div>
            </div>
            <div className="menu-item">
              Autocomplete Model
              <div className="submenu">
                <button
                  onClick={() =>
                    changeAutocompleteModel("codellama/CodeLlama-70b-Python-hf")
                  }
                >
                  CodeLlama-70b-Python-hf{" "}
                </button>
                <button
                  onClick={() =>
                    changeAutocompleteModel("codellama/CodeLlama-7b-Python-hf")
                  }
                >
                  CodeLlama-7b-Python-hf
                </button>
                <button
                  onClick={() =>
                    changeAutocompleteModel("Phind/Phind-CodeLlama-34B-v2")
                  }
                >
                  Phind-CodeLlama-34B-v2
                </button>
                <button onClick={() => changeAutocompleteModel("gpt-3.5")}>
                  GPT-3.5
                </button>
                <button onClick={() => changeAutocompleteModel("Off")}>
                  Off
                </button>
              </div>
            </div>
            <div className="menu-item">
              Chat Model
              <div className="submenu">
                <button onClick={() => changeChatModel("llama3-8b-8192")}>
                  llama3-8b-8192
                </button>
                <button onClick={() => changeChatModel("llama3-70b-8192")}>
                  llama3-70b-8192
                </button>
                <button onClick={() => changeChatModel("mixtral-8x7b-32768")}>
                  mixtral-8x7b-32768
                </button>
                <button onClick={() => changeChatModel("gemma-7b-it")}>
                  gemma-7b-it
                </button>
                <button
                  onClick={() => changeChatModel("Qwen/Qwen2-72B-Instruct")}
                >
                  Qwen2-72B-Instruct
                </button>
                <button
                  onClick={() =>
                    changeChatModel("codellama/CodeLlama-7b-Instruct-hf")
                  }
                >
                  CodeLlama-7b-Instruct-hf{" "}
                </button>
                <button
                  onClick={() =>
                    changeChatModel("codellama/CodeLlama-70b-Instruct-hf")
                  }
                >
                  CodeLlama-70b-Instruct-hf
                </button>
                <button
                  onClick={() =>
                    changeChatModel("meta-llama/Llama-3-70b-chat-hf")
                  }
                >
                  Llama-3-70b-chat-hf
                </button>
                <button
                  onClick={() =>
                    changeChatModel("meta-llama/Llama-3-8b-chat-hf")
                  }
                >
                  Llama-3-8b-chat-hf
                </button>
                <button
                  onClick={() =>
                    changeChatModel("mistralai/Mixtral-8x22B-Instruct-v0.1")
                  }
                >
                  Mixtral-8x22B
                </button>
                <button onClick={() => changeChatModel("gpt-3.5-turbo")}>
                  GPT-3.5
                </button>
                <button onClick={() => changeChatModel("gpt-4-turbo")}>
                  GPT-4
                </button>
                <button onClick={() => changeChatModel("gpt-4o")}>
                  GPT-4o
                </button>
                <button onClick={() => changeChatModel("gpt-4o-mini")}>
                  GPT-4o-mini
                </button>
                <button onClick={() => changeChatModel("Off")}>Off</button>
              </div>
            </div>
            <div className="menu-item">
              Refresh Interval
              <div className="submenu-item">
                <button> Active </button>
                <div className="subsubmenu">
                  <button onClick={() => changeRefreshTime(10, null)}>
                    10s
                  </button>
                  <button onClick={() => changeRefreshTime(15, null)}>
                    15s
                  </button>
                  <button onClick={() => changeRefreshTime(30, null)}>
                    30s
                  </button>
                  <button onClick={() => changeRefreshTime(45, null)}>
                    45s
                  </button>
                  <button onClick={() => changeRefreshTime(60, null)}>
                    1m
                  </button>
                </div>
              </div>
              <div className="submenu-item" style={{ top: "100%" }}>
                <button> Inactive </button>
                <div className="subsubmenu">
                  <button onClick={() => changeRefreshTime(null, 30)}>
                    30s
                  </button>
                  <button onClick={() => changeRefreshTime(null, 45)}>
                    45s
                  </button>
                  <button onClick={() => changeRefreshTime(null, 60)}>
                    1m
                  </button>
                  <button onClick={() => changeRefreshTime(null, 120)}>
                    2m
                  </button>
                  <button onClick={() => changeRefreshTime(null, 180)}>
                    3m
                  </button>
                </div>
              </div>
            </div>
            <button onClick={changePrompt}>Edit Prompt</button>
          </div>
        )}

        <PromptModal
          show={showPromptModal}
          onClose={handleClosePromptModal}
          onSave={handleSavePrompts}
          promptProp={prompts}
        />

        {/* <button onClick={() => setShowButtonInfo(true)}>Show Button Info</button> */}
        <button onClick={() => setShowPopup(1)}>Show Instructions</button>
        {showAIOptions && (
          <button onClick={() => goToPartTwo()}>(debug) go to part two</button>
        )}
        {showAIOptions && (
          <button onClick={() => setTaskIndex(-1)}>(debug) exit survey</button>
        )}
        {/* {<button onClick={() => goToPartTwo()}>(debug) go to part two</button>} */}
        {/* {<button onClick={() => setTaskIndex(-1)}>(debug) exit survey</button>} */}

        {/* <!-- Overlay for the popup --> */}
        <div className="overlay" id="overlay" onClick={() => "FIXME"}></div>

        {/* <!-- Popup box --> */}
        <div className={showButtonInfo ? "popup" : "popup hidden"} id="popup">
          <h2> Button Information</h2>
          <p>
            <ul className="list-disc ml-5">
              <li>
                <b>Show Button Info</b> - Shows this popup.{" "}
              </li>
              <li>
                <b>Show Instructions</b> - Shows the instructions for the study.
              </li>
              <li>
                <b> Timer </b> - Displays the time remaining in the task.
              </li>
              <li>
                <b> Progress Bar </b> - Displays the progress of the task.
              </li>
              <li>
                <b> Run </b> - Runs the code in the editor and displays output
                in box below code.
              </li>
              <li>
                <b> Submit </b> - Evaluates the code in the editor with unit
                tests given task.
              </li>
              <li>
                Under the <b>Options</b> tab:{" "}
              </li>
              <ul className="list-disc ml-5">
                {/* &nbsp;<b>Change Theme</b> - Changes the theme of the editor. <br /> */}
                <li>
                  <b>Reset Code</b> - Resets the code in the editor to the
                  original code.
                </li>
                <li>
                  <b>Save Code to File</b> - Saves the code in editor to a .txt
                  file
                </li>
                {/* &nbsp;<b>Autocomplete Model</b> - Change the autocomplete model<br /> */}
                {/* &nbsp;<b>Chat Model</b> - Change the chat model<br /> */}
              </ul>
            </ul>
          </p>
          {/* <h2>Keyboard Shortcuts</h2>
          <p>
            [CTRL+ENTER] (Windows) and [CMD+ENTER] (Mac) to request a suggestions (if proactive suggestions are enabled)
          </p> */}
          <button onClick={() => setShowButtonInfo(false)}>Close</button>
        </div>
        <div className={proactivePopupVisible ? "popup" : "popup hidden"}>
          <div
            className={
              proactivePopupVisible ? "popup-page" : "popup-page hidden"
            }
            style={{ width: "70vw" }}
          >
            {part_two()}
            <br />
            {proactive_tutorial()}
            <br />
            {showProactiveContinue && (
              <button onClick={() => setProactivePopupVisible(false)}>
                Close
              </button>
            )}
            <br />
          </div>
        </div>
        <div className={noProactivePopupVisible ? "popup" : "popup hidden"}>
          {part_two()}
          <p>
            Now you no longer have access to the proactive chat assistant. You
            can still use the chat function normally.{" "}
          </p>
          <br />
          <button onClick={() => setNoProactivePopupVisible(false)}>Ok</button>
        </div>

        {showExitSurvey && (
          <div className="exit-survey-overlay">
            <div className="exit-survey-popup">
              <ExitSurvey response_id={response_id} app={app} />
              {/* <button onClick={handleCloseSurvey}>Close</button> */}
            </div>
          </div>
        )}
        {/* {showPromptModal && (
          <PromptModal
            initialPrompt={currentPrompt}
            onClose={() => setShowPromptModal(false)}
            onSave={handlePromptSave}
          />
        )} */}

        <div className="parentprogress">
          <span> Time Left: &nbsp; </span>
          <div id="timer">{currTime}</div>
          &nbsp;
          {/* <div id="progressContainer">
            <progress id="taskProgress" value={task_index == -1 ? 0 : task_index} max={function_signatures.length}>  </progress>
            <span id="progressText">
              {task_index == -1 ? 0 : task_index}/{function_signatures.length} tasks completed
            </span>
          </div> */}
          &nbsp;
          {/* <img id="thinkingIcon" src="/ai_icon.png" className={isSpinning ? 'spinning' : ''} /> */}
        </div>
      </div>
    </>
  );
};

export default TopPanel;
