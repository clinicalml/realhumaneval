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
import { writeUserData } from "../functions/task_logic";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { app } from "../functions/initialize_firebase";

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
}) => {
  const [output, setOutput] = useState(
    "Output will be shown here when Run or Submit is pressed."
  );

  const skipTime = 600000;

  let skipTimer = setTimeout(() => setShowTimer(true), skipTime);
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
        setTelemetry
      );
    }

    clearTimeout(skipTimer);
    skipTimer = setTimeout(() => setShowTimer(true), skipTime);
    setShowTimer(false);
  }, [task_index]);

  async function runCode(
    editor: any,
    task_index: number,
    unit_tests: string[]
  ) {
    let res = await runCodeTest(
      editor,
      task_index,
      unit_tests
    );

    console.log("Finished run code");
    displayResult(res);
  }

  function displayResult(result: any) {
    // result.data.data.stderr
    // check if stderr is null, if so, say code is correct

    // FIXME: Only thing left in this file to be implemented
    var log = "";

    if (result.data.data.stderr == null && result.data.data.exception == null) {
      log = "Code is correct! \n Next Task will now be displayed!";
      // clear editor
      editor.setValue("");
      localStorage.setItem("code", "");
      setTelemetry((prev) => {
        return [
          ...prev,
          {
            event_type: "submit_code",
            task_index: task_index,
            completed_task: 1,
            log: "correct code",
            timestamp: Date.now(),
          },
        ];
      });

      // update task index
      if (task_index < function_signatures.length - 1) {
        setTaskIndex((prevTaskIndex) => {
          return prevTaskIndex + 1;
        });

        alert(log);
      } else {
        //writeUserData(response_id, telemetry);

        localStorage.setItem("code", "");
        alert("You have completed all the tasks!");
        // next two lines probably not needed
        var myData = [response_id, task_id, exp_condition, worker_id];
        localStorage.setItem("objectToPass", JSON.stringify(myData));
      }
    } else {
      log =
        "Code is incorrect.\n" +
        "Error:" +
        result.data.data.stderr +
        "\n" +
        result.data.data.stdout +
        "\n" +
        result.data.data.exception;

      setTelemetry((prev) => {
        return [
          ...prev,
          {
            event_type: "submit_code",
            task_index: task_index,
            completed_task: 0,
            log: log,
            timestamp: Date.now(),
          },
        ];
      });

      alert(log);
    }
  }

  return (
    <>
      <div className="custom-container justify-center items-center">
        <button
          onClick={() =>
            submitCode(editor, setOutput, setTelemetry, task_index)
          }
          className="font-bold"
        >
          ▶️
          <i />
          Run
        </button>
        <button
          id="runCodeTest"
          className="bg-blue-700 font-bold"
          onClick={() => {
            runCode(editor, task_index, unit_tests);
          }}
        >
          📤
          <i />
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
          Cant solve it? Skip Task
        </button>
      </div>
      <div className="custom-container flex justify-center items-start">
  <div className="left-column flex-1 flex flex-col justify-start items-start">
    <div id="output" className="terminal">
      <span className="terminal-label">Output of Run/Submit:</span>
      <div className="terminal-content">
        {output}
      </div>
    </div>
  </div>
</div>



    </>
  );
};

export default TaskBar;
