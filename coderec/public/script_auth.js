
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAYiGwwAou3hH7k-MgdTVfQp4FvFSLWhUs",
  authDomain: "codeinterface-85b5e.firebaseapp.com",
  projectId: "codeinterface-85b5e",
  storageBucket: "codeinterface-85b5e.appspot.com",
  messagingSenderId: "637838418708",
  appId: "1:637838418708:web:9b91375f4df25695885801",
  measurementId: "G-3XHVCW8K1N"
};

firebase.initializeApp(firebaseConfig);
firebase.analytics();
var authen_token;

var is_valid = false;

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

  firebase
    .auth()
    .signInWithEmailAndPassword(email, token_user)
    .then((userCredential) => {
      location.href = "./interface.html";
          })
    .catch((error) => {
      var errorCode = error.code;
      var errorMessage = error.message;
      var error_answer = document.getElementById("message_highlighted");
      error_answer.innerHTML = "Invalid Token, please try again.";
    });
};

