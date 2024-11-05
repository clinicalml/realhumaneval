// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYiGwwAou3hH7k-MgdTVfQp4FvFSLWhUs",
  authDomain: "codeinterface-85b5e.firebaseapp.com",
  projectId: "codeinterface-85b5e",
  storageBucket: "codeinterface-85b5e.appspot.com",
  messagingSenderId: "637838418708",
  appId: "1:637838418708:web:9b91375f4df25695885801",
  measurementId: "G-3XHVCW8K1N",
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var db = firebase.firestore();

const appCheck = firebase.appCheck();
appCheck.activate(
  new firebase.appCheck.ReCaptchaEnterpriseProvider(
    "6LcdzREpAAAAAMjdwSczmJAfGXx_ClJOBs9tJHlV"
  ),
  true // Set to true to allow auto-refresh.
);
console.log("user logged in", firebase.auth().currentUser);

// remove endTime and code from local storage to reset
localStorage.removeItem("endTime");
localStorage.removeItem("code");
localStorage.removeItem("telemetry_data");

var response_id;
var task_id;
var exp_condition;
var worker_id;

function hideAIQuestions() {
  document.getElementById("aihelpful").style.display = "none";
  document.getElementById("howaihelpful").style.display = "none";
  document.getElementById("howaiimproved").style.display = "none";
  document.getElementById("aiToolTypicalUsage").style.display = "none";
  // div form_control has _label hide and disable
  document.getElementById("aihelpful_label").style.display = "none";
  document.getElementById("howaihelpful_label").style.display = "none";
  document.getElementById("howaiimproved_label").style.display = "none";
  document.getElementById("aiToolTypicalUsage_label").style.display = "none";
  document.getElementById("aihelpful").disabled = true;
  document.getElementById("howaihelpful").disabled = true;
  document.getElementById("howaiimproved").disabled = true;
  document.getElementById("aiToolTypicalUsage").disabled = true;

  // change the values to defaults
  document.getElementById("aihelpful").value = 1;
  document.getElementById("howaihelpful").value = "none";
  document.getElementById("howaiimproved").value = "none";
  document.getElementById("aiToolTypicalUsage").value = "none";
}

function loadlocalstorage() {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);
  response_id = myData[0];
  task_id = myData[1];
  exp_condition = myData[2];
  worker_id = myData[3];

  if (task_id.includes("nomodel")) {
    console.log(task_id);
    hideAIQuestions();
  }
  // mark user entered
  mark_user_entered();
}

function mark_user_entered(){
  var time_now_string = new Date().toString();
  db.collection("responses")
    .doc(response_id)
    .update({
      entered_exit_survey: time_now_string,
    })
    .then(() => {
      console.log("Document successfully written!");
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

loadlocalstorage();

var form = document.getElementById("form");
form.addEventListener("submit", submit);

function submit(event) {
  // add post survey
  event.preventDefault();
  // Retrieve the value for the AI Tool Typical Usage
  var aiToolTypicalUsage = document.getElementById("aiToolTypicalUsage").value;
  // Retrieve the value for the Additional Comments
  var finalcomments = document.getElementById("finalcomments").value;
  var howaiimproved = document.getElementById("howaiimproved").value;
  var howaihelpful = document.getElementById("howaihelpful").value;
  var aihelpful = document.getElementById("aihelpful").value;
  // Retrieve the value for the Mental Demand
  var mentalDemand = document.getElementById("mentalDemand").value;
  // Retrieve the value for the Physical Demand
  var physicalDemand = document.getElementById("physicalDemand").value;
  // Retrieve the value for the Temporal Demand
  var temporalDemand = document.getElementById("temporalDemand").value;
  // Retrieve the value for the Performance
  var performance = document.getElementById("performance").value;
  // Retrieve the value for the Effort
  var effort = document.getElementById("effort").value;
  // Retrieve the value for the Frustration
  var frustration = document.getElementById("frustration").value;

  var time_now_string = new Date().toString();
  db.collection("responses")
    .doc(response_id)
    .update({
      completed_task: 1,
      completed_task_time: time_now_string,
      aiToolTypicalUsage: aiToolTypicalUsage,
      finalcomments: finalcomments,
      howaiimproved: howaiimproved,
      howaihelpful: howaihelpful,
      aihelpful: aihelpful,
      mentalDemand: mentalDemand,
      physicalDemand: physicalDemand,
      temporalDemand: temporalDemand,
      performance: performance,
      effort: effort,
      frustration: frustration,
    })
    .then(() => {
      // in db.collection("tasks") set task_completed to 1
      db.collection("tasks")
        .doc(task_id)
        .update({
          task_completed: 1,
        })
        .then(() => {
          console.log("Document successfully written!");

          document.getElementById("survey").style.display = "none";
          document.getElementById("end_task").style.display = "block";
          firebase
            .auth()
            .signOut()
            .then(() => {
              console.log("signed out");
            })
            .catch((error) => {
              console.log(error);
            });
          // clear all local storage
          localStorage.clear();
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });
}

// FOR THE SLIDERS
document.addEventListener("DOMContentLoaded", function () {
  var submitButton = document.getElementById("submitButton");
  var ranges = document.querySelectorAll('input[type="range"]');
  var interactedRanges = {};

  // Initialize interactedRanges with false for each range input
  ranges.forEach(function (range) {
    interactedRanges[range.id] = false;
    // check if not disabled
    if (range.disabled == true) {
      interactedRanges[range.id] = true;
    }
  });

  ranges.forEach(function (range) {
    range.addEventListener("change", function () {
      interactedRanges[this.id] = true;

      // Check if all ranges have been interacted with
      var allInteracted = Object.keys(interactedRanges).every(function (key) {
        return interactedRanges[key];
      });

      if (allInteracted) {
        // change background color of submit button
        submitButton.style.backgroundColor = "green";
        submitButton.disabled = false;
      }
    });
  });
});

// FOR THE SLIDERS
function updateSliderValue(slider) {
  var sliderValueDisplay = slider.parentElement.querySelector(".slider-value");
  sliderValueDisplay.textContent = slider.value;
}

// Set initial values
window.onload = function () {
  var sliders = document.querySelectorAll('input[type="range"]');
  sliders.forEach(function (slider) {
    updateSliderValue(slider);
  });
};
