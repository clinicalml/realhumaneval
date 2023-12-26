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


const runcode = firebase.functions().httpsCallable("runcode");
const getcompletion = firebase.functions().httpsCallable("getcompletion");
const get_together_completion = firebase
  .functions()
  .httpsCallable("get_together_completion");

/////////////////////////////////////////
// CLOUD FUNCTIONS CALLS
/////////////////////////////////////////
function get_openai_response(prefix, suffix, max_tokens) {
  return new Promise((resolve, reject) => {
    getcompletion({ prefix: prefix, suffix: suffix, max_tokens: max_tokens })
      .then((result) => {
        const text_response = result.data.data.choices[0].text;
        console.log(text_response);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}

async function submitCode() {
  console.log("submitting code");
  // check if suggestion is currently displayed

  rejectSuggestion();
  document.getElementById("output").innerText = "Running...";
  var editor_value = editor.getValue();
  var editor_value_string = editor_value.toString();
  runcode({ prompt: editor_value_string })
    .then((result) => {
      // check if stderr is null, if so, hide the error message
      var log = "";
      if (result.data.data.stderr == null) {
        log = result.data.data.stdout;
      } else {
        log =
          "Errors:" + result.data.data.stderr + "\n" + result.data.data.stdout;
      }
      document.getElementById("output").innerText = log;
    })
    .catch((error) => {
      console.error("Error calling the submit function:", error);
    });
}

async function runCodeTest() {
  try {
    // Step 1: Extract Code from Editor
    var editorCode = editor.getValue();

    // Step 2: Analyze the Code
    if (!isValidFunction(editorCode)) {
      alert(
        "The code does not follow the required function signature or contains extra code."
      );
      return;
    }
    // Step 3: Append Unit Tests
    // Fetch the unit tests for the current task
    if (task_index == -1)
    {
      var currentUnitTests = tutorial_unit_test;
    }
    else{
    var currentUnitTests = unit_tests[task_index];
  }
    // Replace '\n' in the unit tests string with actual newlines
    var formattedUnitTests = currentUnitTests.replace(/\\n/g, "\n");

    // Step 3: Append Unit Tests
    var testCode = editorCode + "\n\n" + formattedUnitTests;
    // Step 4: Call the API
    var result = await runcode({ prompt: testCode });

    // Step 5: Display Results
    displayResult(result);
  } catch (error) {
    console.error("Error in runCodeTest function:", error);
    alert("Error running the code test.");
  }
}

function isValidFunction(code) {
  // Check if the code contains the required function signature
  if (task_index == -1)
  {
    if (!code.includes(tutorial_function_signature)) {
      return false;
    }
  }
  else{
  if (!code.includes(function_signatures[task_index])) {
    return false;
  }
}
  // Check for only one function definition (basic check)
  let functionCount = (code.match(/def /g) || []).length;
  if (functionCount !== 1) {
    return false;
  }
  return true;
}

function displayResult(result) {
  // result.data.data.stderr
  // check if stderr is null, if so, say code is correct
  var log = "";
  if (result.data.data.stderr == null) {
    log = "Code is correct! \n Next Task will now be displayed!";
    // clear editor
    editor.setValue("");
    localStorage.setItem("code", "");
    // update task index
    if (task_index < function_signatures.length - 1)
    {
    task_index += 1;
    // update the task
    updateProgress(); // update progress bar
    loadCurrentTask();
    // start timer  for 30mins
    if (task_index == 0)
    {
      startTimer();
    }
    alert(log);

    }
    else{
      localStorage.setItem("code", "");
      alert("You have completed all the tasks!");
      disableBeforeUnload();
      window.location.href = "./exit_survey.html";
    }


    
  } else {
    log =
      "Code is incorrect.\n" +
      "Error:" +
      result.data.data.stderr +
      "\n" +
      result.data.data.stdout;
      alert(log);

  }
}

function get_constant_response(prefix, suffix) {
  return new Promise((resolve, reject) => {
    var text_response =
      "if True:\n    x =1\n    y = 2\n    z = 3\n    if z == 3:\n        print('hello')\n    else:\n        print('world')\nelse:\n    print('hello world')\n";
    resolve(text_response);
  });
}

function get_completion_together(model, prompt, max_tokens) {
  return new Promise((resolve, reject) => {
    get_together_completion({
      model: model,
      prompt: prompt,
      max_tokens: max_tokens,
    })
      .then((result) => {
        const text_response = result.data.data.output.choices[0].text;
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}

function calltogether() {
  var editor_value = editor.getValue();
  var editor_value_string = editor_value.toString();
  const model = document.getElementById("modelSelector").value;
  var max_tokens = parseInt(document.getElementById("maxTokens").value);
  // max tokens should be an int
  console.log(max_tokens);
  console.log(model);
  get_completion_together(model, editor_value_string, max_tokens)
    .then((result) => {
      console.log(result);
    })
    .catch((error) => {
      console.error("Error calling the getcompletion function:", error);
    });
}

/////////////////////////////////////////
// END CLOUD FUNCTIONS CALLS
/////////////////////////////////////////