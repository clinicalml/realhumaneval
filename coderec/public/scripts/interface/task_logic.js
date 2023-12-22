var task_descriptions = [];
var function_signatures = [];
var unit_tests = [];
var tutorial_function_signature = "";
var tutorial_unit_test = "";
var tutorial_task_description = "";

var db = firebase.firestore();
var response_id;
var task_id;
var exp_condition;
var task_index = -1;

function loadlocalstorage() {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);
  response_id = myData[0];
  task_id = myData[1];
  exp_condition = myData[2];
  //showlocalstorage();
}
loadlocalstorage();

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
  } else {
    document.getElementById("taskDescription").innerText = task_descriptions[
      task_index
    ].replace(/\\n/g, "\n");
  }
}

loadTaskData();
