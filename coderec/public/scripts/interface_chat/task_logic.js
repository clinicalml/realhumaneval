var task_descriptions = [];
var function_signatures = [];
var unit_tests = [];
var tutorial_function_signature = "";
var tutorial_unit_test = "";
var tutorial_task_description = "";

// defaults
var model = "gpt-3.5-turbo";
var max_tokens_task = 64;
const timeout_time_skip = 600000; // 10 minutes
const interval_time_savecode = 15000; // 15 seconds
var db = firebase.firestore();
var response_id;
var task_id;
var worker_id;
var exp_condition;
var last_code_saved = "";
let hideButtonTimeout; // used for skip button

// loged data
// var telemetry_data = [];
// var task_index = -1;

function handleChange() {
  // THIS IS A TEMP THAT WILL BE OVERWRITTEN BY THE INTERFACE LOGIC
}

function writeUserData() {
  db.collection("responses")
    .doc(response_id)
    .update({
      telemetry_data: telemetry_data,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

function loadlocalstorage() {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);
  response_id = myData[0];
  task_id = myData[1];
  exp_condition = myData[2];
  worker_id = myData[3];
  console.log(task_id);
  //showlocalstorage();
}

function loadTaskData() {
  db.collection("tasks")
    .doc(task_id)
    .get()
    .then(function (query_snapshot) {
      rand_task = query_snapshot;
      function_signatures = query_snapshot.data().function_signatures;
      unit_tests = query_snapshot.data().unit_tests;
      task_descriptions = query_snapshot.data().task_descriptions;
      exp_condition = query_snapshot.data().exp_condition;
      tutorial_function_signature =
        query_snapshot.data().tutorial_function_signature;
      tutorial_unit_test = query_snapshot.data().tutorial_unit_test;
      tutorial_task_description =
        query_snapshot.data().tutorial_task_description;
      model = query_snapshot.data().model;
      max_tokens_task = query_snapshot.data().max_tokens;
      loadCurrentTask();
      initializeProgressBar();
      // COMMENTED DIFF FROM AUTOCOMPLETE
      /*       if (model != "none") {
        var script = document.createElement("script");
        script.src = "./scripts/interface/interface_logic.js";
        document.head.appendChild(script);
      } else {
        removeAIinterface();
      } */
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
}

function loadCurrentTask() {
  updateProgress();
  times_pressed_submit_task = 0;
  // Hide the skip button
  document.getElementById("skipTaskButton").style.display = "none";
  editor.session.off("change", handleChange);

  // check if task_index is more than the length of the function signatures
  if (task_index >= function_signatures.length) {
    writeUserData();
    disableBeforeUnload();
    var myData = [response_id, task_id, exp_condition, worker_id];
    localStorage.setItem("objectToPass", JSON.stringify(myData));
    localStorage.setItem("code", "");
    var time_completed = new Date();
    var time_completed_string = time_completed.toString();
    db.collection("responses")
      .doc(response_id)
      .update({
        skipped_time: time_completed_string,
        task_index: task_index,
      })
      .then(() => {
        console.log("Document successfully written!");
        // show popup timeout_popup
        alert("You have reached the end of the coding part of the study. ");
        window.location.href = "exit_survey.html";

        //document.getElementById("timeout_popup").style.display = "block";
      })
      .catch((error) => {
        console.error("Error writing document: ", error);
      });
  }

  if (task_index == -1) {
    document.getElementById("taskDescription").innerText =
      tutorial_task_description.replace(/\\n/g, "\n");
    // load editor with function signature and move cursor to line after function signature
    editor.setValue(tutorial_function_signature.replace(/\\n/g, "\n"));
    var lines = editor.getValue().split("\n");
    editor.gotoLine(lines.length + 1);
  } else {
    document.getElementById("taskDescription").innerText = task_descriptions[
      task_index
    ].replace(/\\n/g, "\n");
    // load editor with function signature
    editor.setValue(function_signatures[task_index].replace(/\\n/g, "\n"));
    var lines = editor.getValue().split("\n");
    editor.gotoLine(lines.length + 1);
    // can skip when not in tutorial

    if (hideButtonTimeout) {
      clearTimeout(hideButtonTimeout);
    }

    // Set a new timeout
    hideButtonTimeout = setTimeout(function () {
      document.getElementById("skipTaskButton").style.display = "block";
    }, timeout_time_skip);
  }
  editor.session.on("change", handleChange);

  telemetry_data.push({
    event_type: "load_task",
    task_id: task_id,
    task_index: task_index,
    timestamp: Date.now(),
  });

  writeUserData();
}

function repeatFunction() {
  if (last_code_saved != editor.getValue()) {
    telemetry_data.push({
      event_type: "save_code",
      task_index: task_index,
      code: editor.getValue(),
      timestamp: Date.now(),
    });
    last_code_saved = editor.getValue();
  } 
  writeUserData();
}

setInterval(repeatFunction, interval_time_savecode);
loadlocalstorage();
loadTaskData();
