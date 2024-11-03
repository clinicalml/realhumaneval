import React, {
  useEffect,
  RefObject,
  useRef,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import { MessageData } from "./Message";
import { loadTaskData, loadCurrentTask } from "../functions/task_logic";
import { submitCode, runCodeTest } from "../functions/cloud_functions_helper";
import { trackSubmitCode } from "../functions/telemetry";

export interface TaskBarProps {
  setTaskDescriptions: Dispatch<SetStateAction<string[]>>;
  setFunctionSignatures: Dispatch<SetStateAction<string[]>>;
  setUnitTests: Dispatch<SetStateAction<string[]>>;
  setExpCondition: Dispatch<SetStateAction<string>>;
  setModel: Dispatch<SetStateAction<string>>;
  setMaxTokensTask: Dispatch<SetStateAction<number>>;
  editor: any;
  task_index: number;
  unit_tests: string[];
  setMessages: Dispatch<SetStateAction<MessageData[]>>;
  exp_condition: string;
  response_id: string;
  worker_id: string;
  setTaskIndex: Dispatch<SetStateAction<number>>;
  function_signatures: string[];
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_id: string;
  telemetry: any[];
  chatRef: any;
  skipTime: any;
  actualEditorRef: RefObject<any>;
}

const TaskBar: React.FC<TaskBarProps> = ({
  setTaskDescriptions,
  setFunctionSignatures,
  setUnitTests,
  setExpCondition,
  setModel,
  setMaxTokensTask,
  editor,
  task_index,
  unit_tests,
  setMessages,
  exp_condition,
  response_id,
  worker_id,
  setTaskIndex,
  function_signatures,
  setTelemetry,
  task_id,
  telemetry,
  chatRef,
  skipTime,
  actualEditorRef,
}) => {
  const [output, setOutput] = useState(
    "Output will be shown here when Run is pressed."
  );

  // const skipTime = 0;

  // let skipTimer = setTimeout(() => setShowTimer(true), skipTime);
  let skipTimer: any;
  const [showTimer, setShowTimer] = useState(false);

  useEffect(() => {
    // FIXME: Pass in anything useful.
    if (task_index != -1) {
      loadCurrentTask(
        task_index,
        response_id,
        task_id,
        exp_condition,
        worker_id,
        editor,
        setMessages,
        function_signatures,
        telemetry,
        setTelemetry,
        actualEditorRef,
      );
    }

    if (true) {
      setOutput("Output will be shown here when Run is pressed.");
      console.log('skiptime', task_index, skipTime);
      skipTimer = setTimeout(() => setShowTimer(true), skipTime);
      setShowTimer(false);
      chatRef.current.clearThrottle();

      return () => clearTimeout(skipTimer);
    }
  }, [task_index]);

  async function runCode(
    editor: any,
    task_index: number,
    unit_tests: string[],
    submit: boolean = false
  ) {
    let res: any;

    if (!submit) {
      res = await submitCode(editor, setOutput, setTelemetry, task_index);
    } else {
      // res = await runCodeTest(
      //   editor,
      //   task_index,
      //   unit_tests
      // );

      // disabling unit tests for now
      res = await submitCode(editor, setOutput, setTelemetry, task_index);

      console.log("Finished run code");
      displayResult(res); // this also updates the task index
    }

    if (res.data.stderr != null || res.data.exception != null) {
      console.log('run code output', res.data);
      chatRef.current.getProactiveDebuggingSuggestions(res?.data);
    }
  }

  function displayResult(result: any) {
    // result.data.stderr
    // check if stderr is null, if so, say code is correct

    // FIXME: Only thing left in this file to be implemented
    var log = "";
    if (result.data.stderr == null && result.data.exception == null) {
      log = result.data.stdout || "No output";
    } else {
      log = result.data.stdout || "";
      log += result.data.stderr || result.data.exception;
    }
    setOutput(log);

    var alertMessage = "";

    if (result.data.stderr == null && result.data.exception == null) {
      alertMessage = "Code is correct! \n Next Task will now be displayed!";
      alertMessage = "Thanks for submitting! \n Next Task will now be displayed!";

      trackSubmitCode(setTelemetry, task_index, "correct code", true, editor);

      // clear editor
      // editor.setValue("");
      localStorage.setItem("code", "");

      // update task index
      if (task_index < function_signatures.length - 1) {
        setTaskIndex((prevTaskIndex) => {
          return prevTaskIndex + 1;
        });

        alert(alertMessage);
      } else {
        // Placeholder for Firebase function
        // writeUserData(response_id, telemetry);

        localStorage.setItem("code", "");
        alert("You have completed all the tasks!");
        setTimeout(() => {
          setTaskIndex((prevTaskIndex) => {
            return prevTaskIndex + 1;
          });
        }, 1000);
        // next two lines probably not needed
        var myData = [response_id, task_id, exp_condition, worker_id];
        localStorage.setItem("objectToPass", JSON.stringify(myData));
      }
    } else {
      alertMessage = "Code is incorrect. Please try again.";

      // console.log("task_index", task_index, editor.getValue());
      trackSubmitCode(setTelemetry, task_index, log, false, editor);

      alert(alertMessage);
    }
  }

  return (
    <>
      <div className="custom-container justify-center items-center mb-0">
        <button
          onClick={() => {
            runCode(editor, task_index, [], false);
          }}
          className="font-bold"
        >
          {/* ▶️
          <i /> */}
          Run
        </button>
        <button
          id="runCodeTest"
          className="bg-blue-700 font-bold"
          onClick={() => {
            // runCode(editor, task_index, unit_tests, true);
            runCode(editor, task_index, [], true);
          }}
        >
          {/* 📤
          <i /> */}
          Submit
        </button>
        <button
          id="skipTaskButton"
          className={
            showTimer
              ? " bg-gray-800 font-bold"
              : "hidden bg-gray-800 font-bold"
          }
          onClick={() => {
            setTelemetry((prev) => {
              return [
                ...prev,
                {
                  event_type: "skip_task",
                  task_id: task_id,
                  task_index: task_index,
                  timestamp: Date.now(),
                },
              ];
            });
            setTaskIndex((task_index) => task_index + 1);
          }}
        >
          Can't solve it? Skip Task
        </button>
      </div>
      <div className="left-column flex-1 flex flex-col justify-center items-center mt-0">
        <div id="output" className="terminal">
          <span className="terminal-label">Output of Run:</span>
          <div className="terminal-content">
            {output}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskBar;
