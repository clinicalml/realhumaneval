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
var authen_token;
var db = firebase.firestore();
var is_valid = false;
var task_id_rand;
var worker_id_rand = Math.floor(Math.random() * 10000000); // to pass to other pages
var rand_task;
var response_id;
var exp_condition = 0;

// we retreive task from database here add conditions

firebase
  .auth()
  .signOut()
  .then(() => {
    console.log("signed out");
  })
  .catch((error) => {
    console.log(error);
  });

document.getElementById("submit_token").onclick = function () {
  var token_user = document.getElementById("authen_token").value;
  var email = "user@gmail.com";
  var study_mode = document.getElementById("checkbox_studymode").checked;

  firebase
    .auth()
    .signInWithEmailAndPassword(email, token_user)
    .then((userCredential) => {
      if (!study_mode) {
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
        // get random task
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
            console.log("taskdata" + rand_task.data().unit_tests);

            db.collection("responses")
              .doc("test00")
              .set({
                worker_id: "test",
                task_id: task_id_rand,
                date_performed: date_string,
                completed_task: 0,
                exp_condition: exp_condition,
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
          })
          .catch(function (error) {
            console.log("Error getting documents: ", error);
          });
        // creat response
        console.log("before writing response");

        //location.href = "./interface.html";
      } else {
        // TODO
        location.href = "./pretask_survey.html";
      }
    })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      var error_answer = document.getElementById("message_highlighted");
      error_answer.innerHTML = "Invalid Token, please try again.";
    });
};
