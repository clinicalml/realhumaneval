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
  new firebase.appCheck.ReCaptchaEnterpriseProvider("6LcdzREpAAAAAMjdwSczmJAfGXx_ClJOBs9tJHlV"  ),
  true // Set to true to allow auto-refresh.
);
console.log('user logged in', firebase.auth().currentUser);

var db = firebase.firestore();

/* 

document.getElementById("proceed_exp").onclick = function() {

    var quest1 = document.getElementById("quest1").value;
    var quest2 = document.getElementById("quest2").value;
  
    if (firebase.auth().currentUser){
      console.log("logged in");
    }
    if (quest1 != "" && quest2 != "") {
      db.collection("responses").doc(response_id).update({
          outake_quest1: quest1,
          outake_quest2: quest2,
          completed_task: 1
        })
        .then(() => {
          console.log("Document successfully written!");
          document.getElementById("body_end").style.display = "none";
          document.getElementById("header_end").innerHTML = "Please copy the code below into the Prolific stuy on the Prolific site and then you can close this window as the task is over.";
          document.getElementById("header_end").innerHTML += "<br> If you do not copy the code, your study will not be approved.";
          var worker_id = response_id.split("-");
          document.getElementById("worker_id_send").innerHTML = "C1I4M3L1";
  
          firebase.auth().signOut().then(() => {
            console.log("signed out");
          }).catch((error) => {
            console.log(error);
          });
  
  
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        });
    } else {
      document.getElementById("message_highlighted").innerHTML = "Please answer all questions";
    }
  };
  
   */

// FOR THE SLIDERS 
document.addEventListener('DOMContentLoaded', function() {
    var submitButton = document.getElementById('submitButton');
    var ranges = document.querySelectorAll('input[type="range"]');
    var interactedRanges = {};

    // Initialize interactedRanges with false for each range input
    ranges.forEach(function(range) {
        interactedRanges[range.id] = false;
    });

    ranges.forEach(function(range) {
        range.addEventListener('change', function() {
            interactedRanges[this.id] = true;

            // Check if all ranges have been interacted with
            var allInteracted = Object.keys(interactedRanges).every(function(key) {
                return interactedRanges[key];
            });

            if (allInteracted) {
                // change background color of submit button
                submitButton.style.backgroundColor = 'green';
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
