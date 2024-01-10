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

var authen_token;
var db = firebase.firestore();
var task_id_rand;
var worker_id_rand = Math.floor(Math.random() * 10000000); // to pass to other pages
var rand_task;
var response_id;
var exp_condition = 0;

firebase
  .auth()
  .signOut()
  .then(() => {
    console.log("signed out");
  })
  .catch((error) => {
    console.log(error);
  });

let inputs = document.querySelectorAll("input");
let selections = document.querySelectorAll("select");
let buttonSend = document.getElementById("button-send");
let submitButton = document.getElementById("submitButton");

let workerID_input = document.getElementById("workerID");

function isNotEmpty(input) {
  // Check if the input value is empty or not
  if (input.value.length == 0) {
    // If empty, return false and show an error message
    alert("Please fill in this field");
    return false;
  }
  // If not empty, return true
  return true;
}

var form = document.getElementById("form");
form.addEventListener("submit", submit);

function submit(event) {
  event.preventDefault();
  var name_worker = document.getElementById("workerID").value;
  var email = document.getElementById("emailAddress").value;
  var token_user = document.getElementById("authen_token").value;
  var email_signin = "user@gmail.com";

  firebase
    .auth()
    .signInWithEmailAndPassword(email_signin, token_user)
    .then((userCredential) => {
      // we retreive task from database here add conditions
      db.collection("tasks")
        //.where("exp_condition", "==", exp_condition)
        .get()
        .then(function (query_snapshot) {
          rand_task =
            query_snapshot.docs[
              Math.floor(Math.random() * query_snapshot.docs.length)
            ];
          task_id_rand = rand_task.id;
          exp_condition = rand_task.data().exp_condition;

          // create new doc
          var worker_in_responses = true;
          response_id = task_id_rand
            .concat("-")
            .concat(worker_id_rand.toString());
          // get time now in string format month day hour and minutes secs
          var date = new Date();
          var date_string = date.toString();

          db.collection("responses")
            .doc(response_id)
            .set({
              worker_id: worker_id_rand,
              task_id: task_id_rand,
              name: name_worker,
              email: email,
              date_performed: date_string,
              completed_task: 0,
              exp_condition: exp_condition,
            })
            .then(() => {
              console.log("Document successfully written!");
              var myData = [
                response_id,
                task_id_rand,
                exp_condition,
                worker_id_rand,
              ];
              localStorage.setItem("objectToPass", JSON.stringify(myData));
              // change src of iframe puzzle_frame
              var puzzle_frame = document.getElementById("puzzle_frame");
              puzzle_frame.src = "https://ccl.meteorapp.com/?worker_id=" + worker_id_rand;
              // make div id survey hidden and div id puzzle visible
              document.getElementById("survey").style.display = "none";
              document.getElementById("puzzle").style.display = "block";
            })
            .catch((error) => {
              console.error("Error writing document: ", error);
            });
        })
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });
    })
    .catch(function (error) {
      var error_answer = document.getElementById("message_highlighted");
      error_answer.innerHTML = "Not signed in or information missing";
      console.log("Error getting documents: ", error);
    });
  return false;
}



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
        completed_pre_puzzle: time_now_string,
      })
      .then(() => {
        location.href = "./interface.html";
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

// remove endTime and code from local storage to reset
localStorage.removeItem("endTime");
localStorage.removeItem("code");
localStorage.removeItem("task_index");