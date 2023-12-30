var task_descriptions = [];
var function_signatures = [];
var unit_tests = [];
var tutorial_function_signature = "";
var tutorial_unit_test = "";
var tutorial_task_description = "";
// defaults
var model = "togethercomputer/CodeLlama-7b";
var max_tokens = 20;
var db = firebase.firestore();
var response_id;
var task_id;
var exp_condition;
var last_code_saved = "";
// loged data
// var telemetry_data = [];
// var task_index = -1;


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
      max_tokens = query_snapshot.data().max_tokens;
      loadCurrentTask();
      initializeProgressBar();

    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
}

function loadCurrentTask() {
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
        
  }
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
  else{
    telemetry_data.push({
      event_type: "save_code",
      task_index: task_index,
      code: "!nochanges!",
      timestamp: Date.now(),
    });
  }
  writeUserData();
}


setInterval(repeatFunction, 30000);
loadlocalstorage();
loadTaskData();
