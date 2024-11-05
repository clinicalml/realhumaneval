import { collection, doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";
import { app } from "./initialize_firebase";
const timeout_time_skip = 600000; // 10 minutes
import { localVersion, OPENAI_API_KEY, RAPID_API_KEY, TOGETHER_API_KEY } from "./config";


let db = null;
if (!localVersion) {
console.log("not local version");
db = getFirestore(app);
}


export async function writeUserData(response_id, telemetry) {
  //console.log("Response id is" + response_id);
  //console.log("writing user data" + telemetry);
  if (localVersion){
    return;
  }
  let userDoc = doc(db, "responses", response_id);
  const newData = {telemetry_data: telemetry}
  const telemetry_data = await updateDoc(userDoc, newData);
}

export function loadlocalstorage(
  setResponseId,
  setTaskId,
  setExpCondition,
  setWorkerId
) {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);

  setResponseId(myData[0]);
  setTaskId(myData[1]);
  setExpCondition(myData[2]);
  setWorkerId(myData[3]);
}

export async function loadTaskData(
  task_id,
  setFunctionSignatures,
  setUnitTests,
  setTaskDescriptions,
  setModel,
  setMaxTokensTask,
  setExpCondition,
  editor,
  setMessages,
  exp_condition,
  task_index,
  response_id,
  worker_id,
  telemetry,
  setTelemetry
) {
  let taskDoc = doc(db, "tasks", task_id);

  const docSnap = await getDoc(taskDoc);
  if (!docSnap.exists()) {
    console.log("No such document!");
  }

  let query_snapshot = docSnap;
  console.log("Document data:", query_snapshot.data());
  let function_signatures = query_snapshot.data().function_signatures;
  setFunctionSignatures(query_snapshot.data().function_signatures);
  setUnitTests(query_snapshot.data().unit_tests);
  setTaskDescriptions(query_snapshot.data().task_descriptions);
  setExpCondition(query_snapshot.data().exp_condition);
 
  setModel(query_snapshot.data().model);
  setMaxTokensTask(query_snapshot.data().max_tokens);

  // Call these separately.
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
    );
}

// Have this run on task index change.
export async function loadCurrentTask(
  task_index,
  response_id,
  task_id,
  exp_condition,
  worker_id,
  editor,
  setMessages,
  function_signatures,
  telemetry,
  setTelemetry,) {
  let times_pressed_submit_task = 0;
  // Hide the skip button

  // check if task_index is more than the length of the function signatures
  if (task_index >= function_signatures.length) {
    localStorage.setItem("code", "");

    if (response_id != "") {
      var myData = [response_id, task_id, exp_condition, worker_id];
      localStorage.setItem("objectToPass", JSON.stringify(myData));
    }

    var time_completed = new Date();
    var time_completed_string = time_completed.toString();

    const docSnap = await updateDoc(doc(db, "responses", task_id), {
      skipped_time: time_completed_string,
      task_index: task_index,
    });

    if (!docSnap.exists()) {
      console.log("No such document!");
    }
  }


    // load editor with function signature
    editor.setValue(function_signatures[task_index].replace(/\\n/g, "\n"));
  

  setMessages([{ text: "How can I help you today?", sender: "bot" }]);

  let newTelemetry = null;
  setTelemetry((prev) => {
    newTelemetry = [
      ...prev,
      {
        event_type: "load_task",
        task_id: task_id,
        task_index: task_index,
        timestamp: Date.now(),
      },
    ];

    return newTelemetry;
  });
}

export function restoreAfterRefresh(setTaskIndex, setTelemetry) {
  // also on start

  let task_index = localStorage.getItem("task_index");
  if (task_index) {
    setTaskIndex(parseInt(task_index));
  } else {
    setTaskIndex(0);
  }

  let telemetry_data = localStorage.getItem("telemetry_data");
  if (telemetry_data) {
    setTelemetry(JSON.parse(telemetry_data));
  }
}
