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


var response_id;
var task_id;
var exp_condition;
var worker_id;
function loadlocalstorage() {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);
  response_id = myData[0];
  task_id = myData[1];
  exp_condition = myData[2];
  worker_id = myData[3];
  // set next puzzle location
  var puzzle_frame = document.getElementById("puzzle_frame");
  puzzle_frame.src = "https://ccl-post.meteorapp.com/?worker_id=" + worker_id;
  //showlocalstorage();
}
loadlocalstorage();


var db = firebase.firestore();

// when puzzleSubmitButton is clicked
var puzzleSubmitButton = document.getElementById("puzzleSubmitButton");
puzzleSubmitButton.addEventListener("click", puzzleSubmit);

function puzzleSubmit(event) {
  var puzzle_code = document.getElementById("puzzle_token").value;
  if (puzzle_code == "puzzle") {
    
    var time_now = new Date();
    var time_now_string = time_now.toString();
    db.collection("responses")
    .doc(response_id)
    .update({
      completed_post_puzzle: time_now_string,
    })
    .then(() => {
      console.log("Document successfully written!");
      document.getElementById("survey").style.display = "block";
      document.getElementById("puzzle").style.display = "none";
    })
    .catch((error) => {
      console.error("Error writing document: ", error);
    });


  } else {
    var error_answer = document.getElementById("message_highlighted_puzzle");
    error_answer.innerHTML = "incorrect puzzle code";
  }
  return false;
}

var form = document.getElementById("form");
form.addEventListener("submit", submit);


function submit(event) {
  // add post survey
  event.preventDefault();
  // Retrieve the value for the AI Tool Typical Usage
  var aiToolTypicalUsage = document.getElementById("aiToolTypicalUsage").value;
  // Retrieve the value for the Additional Comments
  var aiToolFreeForm = document.getElementById("aiToolFreeForm").value;
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
      aiToolFreeForm: aiToolFreeForm,
      mentalDemand: mentalDemand,
      physicalDemand: physicalDemand,
      temporalDemand: temporalDemand,
      performance: performance,
      effort: effort,
      frustration: frustration,
    })
    .then(() => {
      document.getElementById("survey").style.display = "none";
      document.getElementById("puzzle").style.display = "none";
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
  
}





// FOR THE SLIDERS
document.addEventListener("DOMContentLoaded", function () {
  var submitButton = document.getElementById("submitButton");
  var ranges = document.querySelectorAll('input[type="range"]');
  var interactedRanges = {};

  // Initialize interactedRanges with false for each range input
  ranges.forEach(function (range) {
    interactedRanges[range.id] = false;
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
