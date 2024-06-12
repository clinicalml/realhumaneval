"use client";
import Image from "next/image";
import { app } from "./functions/initialize_firebase";
import Chat from "./components/Chat";
import "./style.css";
import Head from "next/head";
import Script from "next/script";
import { use, useEffect, useRef } from "react";
import { useState } from "react";
import Editor from "./components/Editor";
import TopPanel from "./components/TopPanel";
import TaskBar from "./components/TaskBar";

import { MessageData } from "./components/Message";
import { addDoc, collection, getDocs, getFirestore } from "firebase/firestore";

import { get_completion_together } from "./functions/cloud_functions_helper";
import firebase, { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  sampleGaussianTruncated,
  getModelName,
  trackSuggestionAccept,
} from "./functions/chat_logic";

import {
  loadlocalstorage,
  loadTaskData,
  restoreAfterRefresh,
  writeUserData,
} from "./functions/task_logic";
import { useInterval } from "./functions/custom_hooks";


import {localVersion} from "./functions/config";


export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [theme, setTheme] = useState("monokai");
  const [code, setCode] = useState("");
  const [showPopup, setShowPopup] = useState(0);
  const [showButtonInfo, setShowButtonInfo] = useState(false);

  const codeRef = useRef(code);
  const editorRef: any = useRef(null);
  const monacoRef = useRef(null);

  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState("");
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const generatingRef = useRef(generating);

  const [chatHistory, setChatHistory] = useState<any[]>([
    { role: "system", content: "help with python" },
  ]); // FIXME: when typing is corect
  const [messages, setMessages] = useState<MessageData[]>([
    { text: "How can I help you today?", sender: "bot" },
  ]);

  // Login info
  const [email, setEmail] = useState("");
  const [error, setError] = useState(" ");

  const [inputValue, setInputValue] = useState("");
  const [awaitingResponse, setAwaitingResponse] = useState(false);

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
  const [maxTokensTask, setMaxTokensTask] = useState(0);
  const [taskIndex, setTaskIndex] = useState(0);

  // Telemetry data
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [messageAIIndex, setMessageAIIndex] = useState(0);
  const [chatResponse, setChatResponse] = useState("");
  const [chatLogProbs, setChatLogProbs] = useState("");
  const [logProbs, setLogprobsCompletion] = useState("");
  const [modelAutocomplete, setModelAutocomplete] = useState(
    "codellama/CodeLlama-70b-Python-hf"
  );
  const [modelChat, setModelChat] = useState(
    "togethercomputer/CodeLlama-34b-Instruct"
  );

  // autocomplete spinning
  const [isSpinning, setIsSpinning] = useState(false);

  let last_code_saved = "";

  // Constants
  const wait_time_for_sug = 1500;
  const contextLength = 6000;
  const timeout_time_skip = 600000; // 10 minutes
  const interval_time_savecode = 15000; // 15 seconds

  const handleLogin = async () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");

    try {

      if (localVersion){
        setTaskId("local");
        return () => {};
      }

      // FIX ME
      const db = getFirestore(app);
      const cors = require("cors")({ origin: true });

      let auth = getAuth();
      signInWithEmailAndPassword(auth, "sebzhao@gmail.com", "test1234");

      const appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaEnterpriseProvider(
          "6LfC0aUpAAAAAF93ISVv7WVC4CltS7Ygnvdb3hvK"
        ),
        isTokenAutoRefreshEnabled: true, // Set to true to allow auto-refresh.
      });
      const analytics = getAnalytics(app);

      // sample random task from tasks
      const taskRef = collection(db, "tasks");
      const taskSnapshot = await getDocs(taskRef);
      const taskDocs = taskSnapshot.docs;
      const randomTaskIndex = Math.floor(Math.random() * taskDocs.length);
      const randomTask = taskDocs[randomTaskIndex];
      setTaskId(randomTask.id);

      localStorage.setItem("taskId", randomTask.id);

      // Also create the doc
      let data = {
        telemetry_data: [],
        timestamp: Date.now(),
        email: email,
        taskid: randomTask.id,
      };

      addDoc(collection(db, "responses"), data).then((doc) => {
        setResponseId(doc.id);
        localStorage.setItem("response_id", doc.id);
      });

      return () => {};
    } catch (error) {
      setError("Failed to login: " + error);
      localStorage.setItem("isAuthenticated", "false");
    }
  };

  useEffect(() => {
    // TEMPOORARY LOG TELEMETRY TO DEBUG.
    if (isAuthenticated) {
      if (responseId != "" && telemetry.length > 0) {
        if (!localVersion){ // FIX
        writeUserData(responseId, telemetry);
        }
      }
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

  // // disable refresh
  // useEffect(() => {
  //   window.onbeforeunload = function () {
  //     return "Are you sure you want to leave?";
  //   };
  // }, []);


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
    // Check local storage and update state accordingly
    const savedIsAuthenticated = localStorage.getItem("isAuthenticated");
    const savedTaskId = localStorage.getItem("taskId");

    if (savedIsAuthenticated) {
      setIsAuthenticated(savedIsAuthenticated === "true");
      handleLogin();
    }

    if (savedTaskId) {
      setTaskId(savedTaskId);
    }
    const editor_value = localStorage.getItem("editor_value");
    const response_id = localStorage.getItem("response_id");
    const exp_condition = localStorage.getItem("exp_condition");
    const worker_id = localStorage.getItem("worker_id");
    const task_index = localStorage.getItem("task_index");
    const messages = localStorage.getItem("messages");
    const chatHistory = localStorage.getItem("chatHistory");

    if (editor_value) {
      if (editorRef.current) {
        editorRef.current.setValue(editor_value);
      }
    }
    if (response_id) {
      setResponseId(response_id);
    }
    // if (telemetry_saved) {
    //   setTelemetry(JSON.parse(telemetry_saved));
    //   console.log(telemetry);
    // }

    // TODO: task index 
    if (messages) {
      setMessages(JSON.parse(messages));
    }
    if (chatHistory) {
      setChatHistory(JSON.parse(chatHistory));
    }
  }, [editorRef.current]);

  useEffect(() => {
    if (!localVersion){
    setCode(functionSignatures[taskIndex] || "");
    }
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

  function onEditorMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;

    setInterval(() => {
      repeatSaveCodeFunction();
    }, interval_time_savecode);

    if (!localVersion){ // FIX
    loadTaskData(
      taskId,
      setFunctionSignatures,
      setUnitTests,
      setTaskDescriptions,
      setModel,
      setMaxTokensTask,
      setExpCondition,
      editor,
      setMessages,
      expCondition,
      taskIndex,
      responseId,
      workerId,
      telemetry,
      setTelemetry
    );
  }
  }

  if (!isAuthenticated || taskId == "") {
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RealHumanEval </title>
        <div className="login-container">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <button onClick={handleLogin}>Login</button>
          {error && <p className="error">{error}</p>}
        </div>
      </>
    );
  } else {
    return (
      <>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>RealHumanEval </title>
        <div id="timeout_popup" className="popup" style={{ display: "none" }}>
          <h2>Time is Up!</h2>
          <p> You have reached the end of the coding part of the studys.</p>
          <br />
          <button onClick={() => null}>Proceed</button>{" "}
          {/*FIXME: This needs to proceed later on. */}
        </div>
         <div
          id="popup_tutorial"
          className={showPopup == 2 ? "popup hidden" : "popup"}
        >
          <div
            className={showPopup == 0 ? "popup-page" : "popup-page hidden"}
            id="page1"
          >
            <h2>Study Introduction</h2>
            <p>
              Welcome to RealHumanEval! 
            </p>
            <ul className="list-disc ml-5">
              <li>
                {" "}
                You will be writing code in Python only and use only standard
                python libraries in addition to numpy and pandas.
              </li>
              <li>
                {" "}
                You will have 35 minutes total where you
                will try to solve as many coding tasks as possible one at a time.{" "}
              </li>
              {/* <li>
                {" "}
                It is NOT allowed to use any outside resources to solve the coding
                questions (e.g. Google, StackOverflow, ChatGPT), your compensation
                is tied to effort only.{" "}
              </li> */}
            </ul>

            <br />
            <button onClick={() => setShowPopup(1)}>Next</button>
          </div>
          <div
            className={showPopup == 1 ? "popup-page" : "popup-page hidden"}
            id="page2"
          >
            <h2>Code Editor Information:</h2>
            <img 
            // TODO: UPDATE PIC
              src="/interface_pic.JPG"
              style={{ width: "39vw", height: "30vh" }}
              alt="Code Editor"
            />
            <br></br>
            <span id="page2_tutorial_text">
              {" "}
              You will write code in the interface above: a code editor equipped
              with an AI assistant that provides suggestion inline and a chat interface.
              <ul className="list-disc ml-5">
                <li>
                  {" "}
                  The AI automatically provides a suggestion whenever you stop
                  typing for more than 2 seconds.
                </li>
                <li>
                  {" "}
                  You can accept a suggestion by pressing the key [TAB] or reject
                  a suggestion by pressing [ESC].{" "}
                </li>
                <li>
                  {" "}
                  You can run your code by pressing the &quot;▶️&quot; button and
                  the output will be in the output box at the bottom in grey.{" "}
                </li>
                <li>
                  {" "}
                  <b>
                    Press the submit &quot;📤&quot; button to evaluate your code
                    for corectness. You can submit your code as many times as you
                    wish until the code is correct.{" "}
                  </b>{" "}
                </li>

              </ul>
              Note: please be aware that the AI assistant is not perfect and may
              provide incorrect suggestions. Moreover, the AI may generate
              potentially offensive suggestions especially if prompted with
              language that is offensive.
            </span>
            <br />
            <button onClick={() => setShowPopup(2)}>Close</button>
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
            isSpinning={isSpinning}
          ></TopPanel>
        </div>

        <div className="custom-container">
          <div className="mr-[5px] h-[70vh] w-[30vw]" id="taskDescription">
            <p>{(taskDescriptions[taskIndex] || "").replace(/\\n/g, "\n")}</p>
          </div>
          <div id="editor" className="h-[70vh] w-[40vw]">
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
            ></Editor>

          </div>
          {/*FIXME: Restyle component and re-add in logic. */}
          <div id="chat-container" className="h-[70vh] w-[40vw] ml-[5px]">
            <Chat
              theme={theme}
              code={code}
              setCode={setCode}
              inputValue={inputValue}
              setInputValue={setInputValue}
              awaitingResponse={awaitingResponse}
              setAwaitingResponse={setAwaitingResponse}
              taskId={taskId}
              setTaskId={setTaskId}
              responseId={responseId}
              setResponseId={setResponseId}
              expCondition={expCondition}
              setExpCondition={setExpCondition}
              workerId={workerId}
              setWorkerId={setWorkerId}
              model={model}
              chatHistory={chatHistory}
              max_tokens_task={64}
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
              // logprobs={null}
              // setLogprobs={null}
            ></Chat>
          </div>
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
          ></TaskBar>
        </div>
      </>
    );
  }
}
