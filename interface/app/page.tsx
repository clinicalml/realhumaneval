"use client";
import Image from "next/image";
import Chat from "./components/Chat";
import "./style.css";
import { use, useEffect, useRef } from "react";
import { useState } from "react";
import Editor from "./components/Editor";
import TopPanel from "./components/TopPanel";
import TaskBar from "./components/TaskBar";
import PromptModal, { PromptProp } from "./components/PromptModal";
import {
  default_prompts,
  proactive_tutorial,
  tutorial_wait_time,
  settings,
  wait_time_autocomplete_suggestion,
} from "./components/settings";
import { MessageData } from "./components/Message";
import { useInterval } from "./functions/custom_hooks";
import Markdown from "react-markdown";

// Add local storage helpers
const saveToLocalStorage = (key: string, value: any) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const loadFromLocalStorage = (key: string) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : null;
};

// Placeholder for Firebase writeUserData
const writeUserData = (responseId: string, telemetry: any[]) => {
  console.log("Writing telemetry data locally", { responseId, telemetry });
  saveToLocalStorage(`telemetry_${responseId}`, telemetry);
};

// Add helper function before Home component
const loadSettingsFromConfig = () => {
  const { taskSettings, modelSettings, prompts } = settings;
  return {
    taskSettings,
    modelSettings

  };
};

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [theme, setTheme] = useState("monokai");
  const [code, setCode] = useState("");
  const [showPopup, setShowPopup] = useState(-1);
  const [showButtonInfo, setShowButtonInfo] = useState(false);

  const codeRef = useRef(code);
  const editorRef: any = useRef(null);
  const actualEditorRef = useRef(null);
  const monacoRef = useRef(null);
  const chatRef = useRef(null);

  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const generatingRef = useRef(generating);

  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: "system", content: "help with python" },
  ]);
  const [messages, setMessages] = useState<MessageData[]>([
    { text: "How can I help you today?", sender: "bot" },
  ]);

  // Login info
  const [email, setEmail] = useState("");
  const [error, setError] = useState(" ");

  const [inputValue, setInputValue] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [awaitingManualSuggestions, setAwaitingManualSuggestions] =
    useState(false);

  // Task state
  const [responseId, setResponseId] = useState("");
  const [taskId, setTaskId] = useState("");
  const [expCondition, setExpCondition] = useState("");
  const [workerId, setWorkerId] = useState("");
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [taskNameDB, setTaskNameDB] = useState("");

  // Further task state.
  const [taskDescriptions, setTaskDescriptions] = useState<string[]>([]);
  const [functionSignatures, setFunctionSignatures] = useState<string[]>([]);

  const [unitTests, setUnitTests] = useState<string[]>([]);
  const [maxTokensTask, setMaxTokensTask] = useState(2000);
  const [taskIndex, setTaskIndex] = useState(0);

  // Telemetry data
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [messageAIIndex, setMessageAIIndex] = useState(0);
  const [chatResponse, setChatResponse] = useState("");
  const [chatLogProbs, setChatLogProbs] = useState("");
  const [logProbs, setLogprobsCompletion] = useState("");
  const [modelAutocomplete, setModelAutocomplete] = useState(
    "Off"
  );
  const [modelChat, setModelChat] = useState(
    "gpt-4o"
  );
  const [proactive, setProactive] = useState(true);
  const [prompts, setPrompts] = useState<PromptProp>(default_prompts);
  const [suggestion_max_options, setSuggestionMaxOptions] = useState(3);
  const [insert_cursor, setInsertCursor] = useState(true);

  // autocomplete spinning
  const [isSpinning, setIsSpinning] = useState(false);

  let last_code_saved = "";

  // Constants
  const wait_time_for_sug = wait_time_autocomplete_suggestion;
  const contextLength = 6000;
  const interval_time_savecode = 10000; // 10 seconds (previously 15)
  const [skipTime, setSkipTime] = useState(0);

  const [proactive_refresh_time_active, setProactiveRefreshTimeActive] =
    useState(15_000);
  const [proactive_refresh_time_inactive, setProactiveRefreshTimeInactive] =
    useState(30_000);
  const [proactive_delete_time, setProactiveDeleteTime] = useState(60_000);
  const [task_duration_minutes, setDurationMinutes] = useState(35);
  const [proactive_available_start, setProactiveAvailableStart] =
    useState(true);
  const [proactive_switch_minutes, setProactiveSwitchMinutes] = useState(5);
  const [showAIOptions, setShowAIOptions] = useState(false);
  const [initialMounted, setInitialMounted] = useState(false);
  const handleLogin = async () => {


    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");

    // Generate a random task ID for local version
    const randomTaskId = `local_${Math.random().toString(36).substr(2, 9)}`;
    setTaskId(randomTaskId);

    // Generate a random response ID
    const randomResponseId = `response_${Math.random().toString(36).substr(2, 9)}`;
    setResponseId(randomResponseId);

    // Save initial data locally
    const initialData = {
      telemetry_data: [],
      timestamp: Date.now(),
      email: email,
      taskid: randomTaskId,
      settingsid: "local_settings",
      proactive_available_start: proactive_available_start,
    };

    saveToLocalStorage(`response_${randomResponseId}`, initialData);
    localStorage.setItem("response_id", randomResponseId);
  };

  useEffect(() => {
    if (isAuthenticated && responseId && telemetry.length > 0) {
      writeUserData(responseId, telemetry);
    }
  }, [telemetry]);

  const handleSaveToSession = () => {
    console.log("saving data");

    if (editorRef.current) {
      let editor_value = editorRef.current.getValue();
      localStorage.setItem(
        "sessionData",
        JSON.stringify({
          isAuthenticated,
          responseId,
          taskId,
          expCondition,
          workerId,
          telemetry,
          taskIndex,
          messages,
          chatHistory,
          editor_value,
        })
      );
      localStorage.setItem("editor_value", editor_value);
      localStorage.setItem("response_id", responseId);
      localStorage.setItem("exp_condition", expCondition);
      localStorage.setItem("worker_id", workerId);
      localStorage.setItem("task_index", JSON.stringify(taskIndex));
      localStorage.setItem("messages", JSON.stringify(messages));
      localStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  };

  useInterval(() => {
    handleSaveToSession();
  }, 5000);



  useEffect(() => {
    window.onbeforeunload = () => {
      // Clear local storage when the window is about to be closed
      localStorage.clear();

      // Optionally, you can still show a confirmation dialog
      return "Are you sure you want to leave? All your progress will be lost.";
    };

    return () => {
      // It's a good practice to clean up event listeners when the component unmounts
      window.onbeforeunload = null;
    };
  }, []);



  useEffect(() => {

    setCode(functionSignatures[taskIndex] || "");

  }, [taskIndex]);

  useEffect(() => {
    generatingRef.current = generating;
  }, [generating]);

  function repeatSaveCodeFunction() {
    if (
      editorRef.current != null &&
      last_code_saved != editorRef.current.getValue()
    ) {
      setTelemetry((prev) => [
        ...prev,
        {
          event_type: "save_code",
          task_index: taskIndex, // FIXME: This might also be stale.
          code: editorRef.current.getValue(),
          timestamp: Date.now(),
        },
      ]);
      last_code_saved = editorRef.current.getValue();
    }
  }

  const [showNextIntro, setShowNextIntro] = useState(false);
  const [showNextCode, setShowNextCode] = useState(false);
  const [showNextProactive, setShowNextProactive] = useState(false);
  const [taskStarted, setTaskStarted] = useState(false);

  useEffect(() => {
    if (taskStarted) return;

    if (showPopup == 0) {
      setTimeout(() => {
        setShowNextIntro(true);
      }, 1000);
    }
    if (showPopup == 1) {
      setTimeout(() => {
        setShowNextCode(true);
      }, 1000);
    }
    if (showPopup == 3) {
      setTimeout(() => {
        setShowNextProactive(true);
      }, 1000);
    }
  }, [showPopup]);

  function onEditorMount(editor: any, monaco: any) {
    if (initialMounted) return;
    setInitialMounted(true);
    editorRef.current = editor;
    monacoRef.current = monaco;

    setInterval(() => {
      repeatSaveCodeFunction();
    }, interval_time_savecode);

    // Load local task data
    const mockTaskData = {
      functionSignatures: ["def plus_one(x):"],
      unitTests: ["assert plus_one(1) == 2"],
      taskDescriptions: ["Write a function that adds one to the input."],
      model: "gpt-3.5-turbo",
      maxTokens: 2000,
      expCondition: "control"
    };

    setFunctionSignatures(mockTaskData.functionSignatures);
    setUnitTests(mockTaskData.unitTests);
    setTaskDescriptions(mockTaskData.taskDescriptions);
    setModel(mockTaskData.model);
    setMaxTokensTask(mockTaskData.maxTokens);
    setExpCondition(mockTaskData.expCondition);
  }

  useEffect(() => {
    // Load settings from config when component mounts
    const { taskSettings, modelSettings } = loadSettingsFromConfig();

    // Apply task settings
    setDurationMinutes(taskSettings.durationMinutes);
    setSkipTime(taskSettings.skipTaskMinutes * 60000); // Convert to milliseconds
    setProactiveAvailableStart(taskSettings.proactiveAvailableStart);
    setProactiveSwitchMinutes(taskSettings.proactiveSwitchMinutes);
    setShowAIOptions(taskSettings.showAiSettings);

    // Apply model settings
    setModelChat(modelSettings.chatModel);
    setModelAutocomplete(modelSettings.autocompleteModel);
    setProactiveRefreshTimeActive(modelSettings.activeRefreshTimeSeconds * 1000);
    setProactiveRefreshTimeInactive(modelSettings.inactiveRefreshTimeSeconds * 1000);
    setProactiveDeleteTime(modelSettings.proactiveDeleteTimeSeconds * 1000);
    setSuggestionMaxOptions(modelSettings.numOptions);
    setInsertCursor(modelSettings.insertCursor);

    // Apply prompts
  }, []);

  if (!isAuthenticated || taskId == "") { // !isAuthenticated || taskId == ""
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> RealHumanEval </title>
        <div className="login-container">
          <h1>Welcome to RealHumanEval!</h1>
          <p>
    </p>
          <br />
          <br />

          <button onClick={handleLogin}>Start</button>
          <p className="error">{error}</p>
        </div>
      </>
    );
  } else if (false) { // taskIndex == -1
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> Python Coding Study </title>
        <div className="login-container">
          <h1>Thank you for participating in the study!</h1>
          <p>Please complete the exit survey to receive your compensation. </p>
          <a
            href="https://forms.gle/3iTyKfjhkQQ8kTZX6"
            target="_blank"
            rel="noreferrer"
            id="post-task"
          >
            Exit Survey
          </a>
          <br />
          <p>
            Your compensation is contingent upon completing the exit survey.{" "}
          </p>
          <p>You can now close the window.</p>
        </div>
      </>
    );
  } else {
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title> Python Coding Study </title>
        <div id="timeout_popup" className="popup" style={{ display: "none" }}>
          <h2>Time is Up!</h2>
          <p> You have reached the end of the coding part of the study.</p>
          <br />
          <button onClick={() => null}>Proceed</button>{" "}
          {/*FIXME: This needs to proceed later on. */}
        </div>
        {/*FIXME: In below clasName replace 2 by showPopup */}
        <div
          id="popup_tutorial"
          className={showPopup == 2 ? "popup hidden" : "popup"}
        >
          <div
            className={showPopup == 0 ? "popup-page" : "popup-page hidden"}
            id="page1"
          >
            <h2>Study Introduction</h2>
            <p>Welcome to RealHumanEval!</p>
            <ul className="list-disc ml-5">
              <li>
                {" "}
                You will be writing code in Python only, and use only standard
                python libraries in addition to numpy.
              </li>
              <li>
                {" "}
                You will have 40 minutes total where you will try to solve as
                many coding tasks as possible one at a time.{" "}
              </li>
              <li>
                {" "}
                It is NOT allowed to use any outside resources to solve the
                coding questions (e.g. Google, StackOverflow, ChatGPT), your
                compensation is tied to effort only.{" "}
              </li>
            </ul>

            <br />
            {showNextIntro && (
              <button onClick={() => setShowPopup(1)}>Next</button>
            )}
          </div>
          <div
            className={showPopup == 1 ? "popup-page" : "popup-page hidden"}
            id="page2"
          >
            <h2>Code Editor & Chat Information</h2>
            <img
              // TODO: UPDATE PIC
              src="/interface.png"
              // style={{ width: "39vw", height: "30vh" }}
              alt="Code Editor"
              className="h-2/3 w-2/3"
            />
            <br></br>
            <span id="page2_tutorial_text">
              {" "}
              You will write code in the interface above: a code editor equipped
              with an AI assistant chatbot. The chatbot does not have access to
              either the code editor or the task description.{" "}
              {/* You will write code in the code editor. */}
              <ul className="list-disc ml-5">
                {/* <li>
                  {" "}
                  The AI automatically provides a suggestion whenever you stop
                  typing for more than 2 seconds.
                </li>
                <li>
                  {" "}
                  You can accept a suggestion by pressing the key [TAB] or reject
                  a suggestion by pressing [ESC].{" "}
                </li> */}
                <li>
                  {" "}
                  Please write python code only in the editor. We only support
                  standard python3.8 packages and numpy.
                </li>
                <li>
                  {" "}
                  You can run your code by pressing the "Run" button and the
                  output will be in the output box at the bottom in grey.{" "}
                </li>
                <li>
                  {" "}
                  {/* Press the submit &quot;Submit📤&quot; button to evaluate your code
                    for corectness. You can submit your code as many times as you
                    wish until the code is correct.{" "} */}
                  Press the "Submit" button to submit your code. You can only
                  submit your code once for each task.{" "}
                </li>
                <li>
                {" "}
                  You are provided with a chat interface that you can use to
                  help you with the coding tasks.
                </li>
                <li>
                {" "}
                  Code autocomplete: The AI automatically provides a suggestion inline whenever you stop typing for more than 1.5s seconds.
                </li>
                <li>
                {" "}
                  Pressing the "Clear" button on the top of the chat window will
                  clear the current chat history. Chat history will be
                  automatically cleared when you move to the next task.
                </li>
                <li>
                  If the chat output contains a code snippet, you can click{" "}
                  <svg
                    viewBox="0 0 384 512"
                    width="20"
                    height="20"
                    fill="white"
                    className="inline"
                  >
                    <path d="M280 240H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0 96H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zM112 232c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zM336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 48c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm144 408c0 4.4-3.6 8-8 8H56c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8h40v32c0 8.8 7.2 16 16 16h160c8.8 0 16-7.2 16-16v-32h40c4.4 0 8 3.6 8 8v336z" />
                  </svg>{" "}
                  icon to copy the code to your clipboard.
                </li>
                <li>Please be aware that its output is not always correct.</li>
              </ul>
            </span>
            <br />
            {showNextCode &&
              (proactive ? (
                <button onClick={() => setShowPopup(3)}>Next</button>
              ) : (
                <button
                  onClick={() => {
                    setShowPopup(2);
                    setTaskStarted(true);
                  }}
                >
                  Close
                </button>
              ))}
          </div>
          <div
            className={showPopup == 3 ? "popup-page" : "popup-page hidden"}
            style={{ width: "70vw" }}
            id="page3"
          >
            {proactive_tutorial()}
            {(taskStarted || showNextProactive) && (
              <button
                onClick={() => {
                  setShowPopup(2);
                  setTaskStarted(true);
                }}
              >
                Close
              </button>
            )}
            <br />
            <br />
          </div>
        </div>

        <div className="top-panel">
          <TopPanel
            showButtonInfo={showButtonInfo}
            setShowButtonInfo={setShowButtonInfo}
            showPopup={showPopup}
            setShowPopup={setShowPopup}
            theme={theme}
            setTheme={setTheme}
            editor={editorRef.current}
            task_index={taskIndex}
            setTaskIndex={setTaskIndex}
            function_signatures={functionSignatures}
            task_descriptions={taskDescriptions}
            setTelemetry={setTelemetry}
            task_id={taskId}
            response_id={responseId}
            exp_condition={expCondition}
            worker_id={workerId}
            telemetry={telemetry}
            setModelAutocomplete={setModelAutocomplete}
            setModelChat={setModelChat}
            setProactive={setProactive}
            isSpinning={isSpinning}
            setProactiveRefreshTimeActive={setProactiveRefreshTimeActive}
            setProactiveRefreshTimeInactive={setProactiveRefreshTimeInactive}
            prompts={prompts}
            setPrompts={setPrompts}
            task_duration_minutes={task_duration_minutes}
            proactive_switch_minutes={proactive_switch_minutes}
            proactive_available_start={proactive_available_start}
            showAIOptions={showAIOptions}
            taskStarted={taskStarted}
            editorRef={editorRef}
            actualEditorRef={actualEditorRef}
          ></TopPanel>
        </div>

        <div className="custom-container">
          <div
            className="flex-grow-0 text-xs mr-[5px] h-[70vh] w-[20vw]"
            id="taskDescription"
          >
            {/* <p>{(taskDescriptions[taskIndex] || "").replace(/\\n/g, "\n")}</p> */}
            {/* {(taskDescriptions[taskIndex] || "")} */}
            <Markdown className="whitespace-pre-wrap">
              {taskDescriptions[taskIndex] || ""}
            </Markdown>
          </div>
          <div id="chat-container" className="flex-grow-0 h-[70vh] w-[30vw]">
            <Chat
              theme={theme}
              code={code}
              setCode={setCode}
              inputValue={inputValue}
              setInputValue={setInputValue}
              awaitingResponse={awaitingResponse}
              setAwaitingResponse={setAwaitingResponse}
              actualEditorRef={actualEditorRef}
              setTaskId={setTaskId}
              responseId={responseId}
              setResponseId={setResponseId}
              expCondition={expCondition}
              setExpCondition={setExpCondition}
              workerId={setWorkerId}
              setWorkerId={setWorkerId}
              model={model}
              chatHistory={chatHistory}
              max_tokens={maxTokensTask}
              messages={messages}
              setMessages={setMessages}
              setTelemetry={setTelemetry}
              task_index={taskIndex}
              setChatHistory={setChatHistory}
              messageAIIndex={messageAIIndex}
              setMessageAIIndex={setMessageAIIndex}
              logprob={chatLogProbs}
              setChatLogProbs={setChatLogProbs}
              modelChat={modelChat}
              proactive={proactive}
              proactive_refresh_time={proactive_refresh_time_active}
              prompt={prompts}
              actualEditorRef={actualEditorRef}
              editorRef={editorRef}
              suggestion_max_options={suggestion_max_options}
              insert_cursor={insert_cursor}
              proactive_delete_time={proactive_delete_time}
              awaitingManualSuggestions={awaitingManualSuggestions}
              setAwaitingManualSuggestions={setAwaitingManualSuggestions}
              ref={chatRef}
            // logprobs={null}
            // setLogprobs={null}
            ></Chat>
          </div>
          <div id="editor" className="flex-grow h-[70vh]">
            <Editor
              onEditorMount={onEditorMount}
              contextLength={contextLength}
              wait_time_for_sug={wait_time_for_sug}
              setSuggestionIdx={setSuggestionIdx}
              setTelemetry={setTelemetry}
              modelAutocomplete={modelAutocomplete}
              taskIndex={taskIndex}
              setLogprobsCompletion={setLogprobsCompletion}
              logProbs={logProbs}
              suggestionIdx={suggestionIdx}
              messageAIIndex={messageAIIndex}
              setIsSpinning={setIsSpinning}
              proactive_refresh_time_inactive={proactive_refresh_time_inactive}
              chatRef={chatRef}
              ref={actualEditorRef}
            ></Editor>
          </div>
          {/*FIXME: Restyle component and re-add in logic. */}
        </div>

        <div>
          <TaskBar
            setTaskDescriptions={setTaskDescriptions}
            setFunctionSignatures={setFunctionSignatures}
            setUnitTests={setUnitTests}
            setExpCondition={setExpCondition}
            setModel={setModel}
            setMaxTokensTask={setMaxTokensTask}
            editor={editorRef.current} // FIXME: The editor isn't mounted yet.
            task_index={taskIndex}
            unit_tests={unitTests}
            setMessages={setMessages}
            exp_condition={expCondition}
            response_id={responseId}
            worker_id={workerId}
            setTaskIndex={setTaskIndex}
            function_signatures={functionSignatures}
            setTelemetry={setTelemetry}
            task_id={taskId}
            telemetry={telemetry}
            chatRef={chatRef}
            skipTime={skipTime}
            actualEditorRef={actualEditorRef}
          ></TaskBar>
        </div>
      </>
    );
  }
}
