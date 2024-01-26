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

// check if user is logged in
console.log('user logged in', firebase.auth().currentUser);

const runcode = firebase.functions().httpsCallable("runcode");
const getcompletion = firebase.functions().httpsCallable("getcompletion");
const get_together_completion = firebase.functions().httpsCallable("get_together_completion");
const get_openai_chat = firebase.functions().httpsCallable("get_openai_chat");
const get_together_chat = firebase.functions().httpsCallable("get_together_chat");

/////////////////////////////////////////
// CLOUD FUNCTIONS CALLS
/////////////////////////////////////////


var chat_response = "";
var chat_logprobs;

function get_openai_chat_response(model, messages, max_tokens) {
  return new Promise((resolve, reject) => {
    get_openai_chat({ model: model, messages: messages, max_tokens: max_tokens })
      .then((result) => {
        const text_response = result.data.data.choices[0].message.content;
        chat_response = text_response;
        chat_logprobs = result.data.data.choices[0].logprobs.content.map(item => item.logprob);
        chat_logprobs = get_summary_statistics(chat_logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}


function get_chat_together(model, messages, max_tokens) {
  return new Promise((resolve, reject) => {
    get_together_chat({
      model: model,
      messages: messages,
      max_tokens: max_tokens,
    })
      .then((result) => {
        const text_response = result.data.data.choices[0].message.content;
        chat_response = text_response;
        chat_logprobs = result.data.data.choices[0].logprobs.token_logprobs;
        chat_logprobs = get_summary_statistics(chat_logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the get_chat_together function:", error);
      });
  });
}



function get_openai_response(prefix, suffix, max_tokens) {
  return new Promise((resolve, reject) => {
    getcompletion({ prefix: prefix, suffix: suffix, max_tokens: max_tokens })
      .then((result) => {
        const text_response = result.data.data.choices[0].text;
        logprobs = result.data.data.choices[0].logprobs.token_logprobs;
        logprobs = get_summary_statistics(logprobs);
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
      if (result.data.data.stderr == null && result.data.data.exception == null) {
        log = result.data.data.stdout;
      } else {
        log =
          "Errors:" + result.data.data.stderr + "\n" + result.data.data.stdout + "\n" + result.data.data.exception;
      }
      telemetry_data.push({
        event_type: "run_code",
        task_index: task_index,
        log: log,
        timestamp: Date.now(),
      });

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
    rejectSuggestion();

/*     // Step 2: Analyze the Code
    if (!isValidFunction(editorCode)) {
      telemetry_data.push({
        event_type: "submit_code",
        task_index: task_index,
        completed_task: 0,
        log: "wrong function signature",
        timestamp: Date.now(),
      });

      alert(
        "The code does not follow the required function signature or contains extra code."
      );
      return;
    } */
    // Step 3: Append Unit Tests
    // Fetch the unit tests for the current task
    if (task_index == -1) {
      var currentUnitTests = tutorial_unit_test;
    } else {
      var currentUnitTests = unit_tests[task_index];
    }
    // Replace '\n' in the unit tests string with actual newlines
    var formattedUnitTests = currentUnitTests.replace(/\\n/g, "\n");

    // Step 3: Append Unit Tests
    var python_ignore_warnings = "import warnings\nwarnings.filterwarnings('ignore')\n";
    var testCode =  python_ignore_warnings + "\n\n" + editorCode + "\n\n" + formattedUnitTests;
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
  // not used
  // Check if the code contains the required function signature
  if (task_index == -1) {
    if (!code.includes(tutorial_function_signature)) {
      return false;
    }
  } else {
    if (!code.includes(function_signatures[task_index])) {
      return false;
    }
  }

  return true;
}

function displayResult(result) {
  // result.data.data.stderr
  // check if stderr is null, if so, say code is correct
  var log = "";

  if (result.data.data.stderr == null && result.data.data.exception == null) {
    log = "Code is correct! \n Next Task will now be displayed!";
    // clear editor
    editor.setValue("");
    localStorage.setItem("code", "");
    telemetry_data.push({
      event_type: "submit_code",
      task_index: task_index,
      completed_task: 1,
      log: "correct code",
      timestamp: Date.now(),
    });

    // update task index
    if (task_index < function_signatures.length - 1) {
      task_index += 1;
      // update the task
      updateProgress(); // update progress bar
      loadCurrentTask();
      alert(log);
    } else {
      writeUserData();
      disableBeforeUnload();

      localStorage.setItem("code", "");
      alert("You have completed all the tasks!");
      // next two lines probably not needed
      var myData = [response_id, task_id, exp_condition, worker_id];
      localStorage.setItem("objectToPass", JSON.stringify(myData));
      window.location.href = "./exit_survey.html";
    }
  } else {
    log =
      "Code is incorrect.\n" +
      "Error:" +
      result.data.data.stderr +
      "\n" +
      result.data.data.stdout +
      "\n" +
      result.data.data.exception
      ;


      telemetry_data.push({
        event_type: "submit_code",
        task_index: task_index,
        completed_task: 0,
        log: log,
        timestamp: Date.now(),
      });

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
        logprobs = result.data.data.output.choices[0].token_logprobs;
        logprobs = get_summary_statistics(logprobs);
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
  //const model = document.getElementById("modelSelector").value;
  //var max_tokens = parseInt(document.getElementById("maxTokens").value);
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


// util

function get_summary_statistics(data) {
  if (!Array.isArray(data) || data.length === 0) {
      return {};
  }

  // Sorting the array for median calculation
  const sortedData = data.slice().sort((a, b) => a - b);
  const n = sortedData.length;
  const middleIndex = Math.floor(n / 2);

  // Calculating mean
  const sum = sortedData.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;

  // Calculating median
  const median = n % 2 === 0 ? (sortedData[middleIndex - 1] + sortedData[middleIndex]) / 2 : sortedData[middleIndex];

  // Calculating standard deviation
  const meanDiffSquaredSum = sortedData.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const std = Math.sqrt(meanDiffSquaredSum / n);

  return {
      min: sortedData[0],
      max: sortedData[n - 1],
      mean: mean,
      median: median,
      std: std,
      firstElement: data[0],
      middleElement: sortedData[middleIndex],
      lastElement: data[n - 1]
  };
}
