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
var task_id_rand;
var worker_id_rand = Math.floor(Math.random() * 10000000); // to pass to other pages
var rand_task;
var response_id;
var exp_condition = 0;

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
  })
  .catch(function (error) {
    console.log("Error getting documents: ", error);
  });

let inputs = document.querySelectorAll("input");
let selections = document.querySelectorAll("select");
let buttonSend = document.getElementById("button-send");
// submitButton
let submitButton = document.getElementById("submitButton");
let validator = {
  workerID: false,
  age: false,
  gender: false,
  education: false,
  emailAddress: false,
  programmingExperience: false,
  pythonProficiency: false,
  aiToolFrequency: false,
};

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


function submit(event) {
  event.preventDefault();

  var name_worker = document.getElementById("workerID").value;
  var email = document.getElementById("emailAddress").value;
  /* var age_worker =
    document.getElementById("age").options[
      document.getElementById("age").selectedIndex
    ].text;
  var gender_worker =
    document.getElementById("gender").options[
      document.getElementById("gender").selectedIndex
    ].text;
  var education_worker =
    document.getElementById("education").options[
      document.getElementById("education").selectedIndex
    ].text;
  var programmingExperience = document.getElementById("programmingExperience")
    .options[document.getElementById("programmingExperience").selectedIndex]
    .text;
  var pythonProficiency =
    document.getElementById("pythonProficiency").options[
      document.getElementById("pythonProficiency").selectedIndex
    ].text;
  var aiToolFrequency =
    document.getElementById("aiToolFrequency").options[
      document.getElementById("aiToolFrequency").selectedIndex
    ].text;
 */
    


  if (
    firebase.auth().currentUser &&
    name_worker != "" && email != ""  ) {
    // create new doc
    var worker_in_responses = true;
    response_id = task_id_rand.concat("-").concat(worker_id_rand.toString());
    // get time now in string format month day hour and minutes secs
    var date = new Date();
    var date_string = date
      .getMonth()
      .toString()
      .concat("-")
      .concat(date.getDate().toString())
      .concat("-")
      .concat(date.getHours().toString())
      .concat("-")
      .concat(date.getMinutes().toString())
      .concat("-")
      .concat(date.getSeconds().toString());
    console.log(date_string);
    db.collection("responses")
      .where("name", "==", name_worker)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.docs.length == 0) {
          // only if worker has not filled it out yet
          worker_in_responses = false;
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
/*               age_worker: age_worker,
              gender_worker: gender_worker,
              education_worker: education_worker,
              programmingExperience: programmingExperience,
              pythonProficiency: pythonProficiency,
              aiToolFrequency: aiToolFrequency, */
            })
            .then(() => {
              console.log("Document successfully written!");
              var myData = [response_id, task_id_rand, exp_condition];
              localStorage.setItem("objectToPass", JSON.stringify(myData));
              location.href = "./interface.html";
            })
            .catch((error) => {
              console.error("Error writing document: ", error);
            });
        } else {
          worker_in_responses = true;
          var error_answer = document.getElementById("message_highlighted");
          error_answer.innerHTML =
            "Already completed task, cannot perform task again.";
        }
      })
      .catch((error) => {
        worker_in_responses = true;
      });
  } else {
    console.log("error in filling out form");
    var error_answer = document.getElementById("message_highlighted");
    error_answer.innerHTML = "Not signed in or information missing";
  }
  return false;
}

var form = document.getElementById("form");
form.addEventListener("submit", submit);

function disableBeforeUnload() {
  window.onbeforeunload = null;
}

function enableBeforeUnload() {
  window.onbeforeunload = function (e) {
    return "Discard changes?";
  };
}
