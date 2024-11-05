/////////////////////////////////////////
// CLOUD FUNCTIONS CALLS
/////////////////////////////////////////


import {getFunctions, httpsCallable} from "firebase/functions";

import {initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
} from "firebase/app-check";
// import "firebase/auth"; // if you're using authentication
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import { loadCurrentTask } from "./task_logic";


const functions = getFunctions();
import { localVersion, OPENAI_API_KEY, RAPID_API_KEY, TOGETHER_API_KEY } from "./config";


// TODO: LOCAL_VERSION ADAPT API CALLS 

// Make API endpoints instead of js functions.
export function get_openai_chat_response(model, messages, max_tokens, setLogprobs) {
  return new Promise((resolve, reject) => {
    console.log(httpsCallable(functions, "get_openai_chat"));
    httpsCallable(functions, "get_openai_chat")({ model: model, messages: messages, max_tokens: max_tokens })
      .then((result) => {
        const text_response = result.data.data.choices[0].message.content;
        let chat_logprobs = result.data.data.choices[0].logprobs.content.map(item => item.logprob);
        //chat_logprobs = get_summary_statistics(chat_logprobs);
        setLogprobs(chat_logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}


export function get_chat_together(model, messages, max_tokens, setLogprobs) {
  return new Promise((resolve, reject) => {
      httpsCallable(functions, "get_together_chat")({ model: model, messages: messages, max_tokens: max_tokens })
      .then((result) => {
        console.log(result);
        const text_response = result.data.data.choices[0].message.content;
        let chat_logprobs = result.data.data.choices[0].logprobs.token_logprobs;
        //chat_logprobs = get_summary_statistics(chat_logprobs);
        setLogprobs(chat_logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the get_chat_together function:", error);
      });
    

  });
}



export function get_openai_response(prefix, suffix, max_tokens, setLogprobs) {
  return new Promise((resolve, reject) => {
    httpsCallable(functions, "getcompletion")({ prefix: prefix, suffix: suffix, max_tokens: max_tokens })
      .then((result) => {
        const text_response = result.data.data.choices[0].text;
        let logprobs = result.data.data.choices[0].logprobs.token_logprobs;
        //logprobs = get_summary_statistics(logprobs);
        setLogprobs(logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}


export function get_completion_together(model, prompt, max_tokens, setLogprobs) {
  return new Promise((resolve, reject) => {
    httpsCallable(functions, "get_together_completion")({
      model: model,
      prompt: prompt,
      max_tokens: max_tokens,
    })
      .then((result) => {
        const text_response = result.data.data.choices[0].text;
        let logprobs = result.data.data.choices[0].logprobs.token_logprobs;
        //logprobs = get_summary_statistics(logprobs);
        setLogprobs(logprobs);
        resolve(text_response);
      })
      .catch((error) => {
        console.error("Error calling the getcompletion function:", error);
      });
  });
}



export async function submitCode(editor, setOutput, setTelemetry, task_index) {
  console.log("submitting code");
  let runcode = httpsCallable(functions, "runcode");

  setOutput("Running...");

  runcode({ prompt: editor.getValue() })
    .then((result) => {
      // check if stderr is null, if so, hide the error message
      var log = "";
      console.log(result);
      if (result.data.data.stderr == null && result.data.data.exception == null) {
        log = result.data.data.stdout;
      } else {
        log =
          "Errors:" + result.data.data.stderr + "\n" + result.data.data.stdout + "\n" + result.data.data.exception;
      }
      setTelemetry((prev) => {
        return [
          ...prev,
          {
            event_type: "run_code",
            task_index: task_index,
            log: log,
            timestamp: Date.now(),
          },
        ];
      })

      console.log("Got response on runcode");
      setOutput(log);
    })
    .catch((error) => {
      console.error("Error calling the submit function:", error);
    });
}

export async function runCodeTest(editor, task_index,  unit_tests) {
  try {
    let runcode = httpsCallable(functions, "runcode");

    var currentUnitTests = unit_tests[task_index];

    // Replace '\n' in the unit tests string with actual newlines
    var formattedUnitTests = currentUnitTests.replace(/\\n/g, "\n");

    // Step 3: Append Unit Tests
    var python_ignore_warnings = "import warnings\nwarnings.filterwarnings('ignore')\n";
    var testCode =  python_ignore_warnings + "\n\n" + editor.getValue() + "\n\n" + formattedUnitTests;
    // Step 4: Call the API
    var result = await runcode({ prompt: testCode });

    // Step 5: Display Results
    // Return the result and let this be handled elsewhere.
    return result;

  } catch (error) {
    console.error("Error in runCodeTest function:", error);
    alert("Error running the code test.");
  }
}






function get_constant_response(prefix, suffix) {
  return new Promise((resolve, reject) => {
    var text_response =
      "if True:\n    x =1\n    y = 2\n    z = 3\n    if z == 3:\n        print('hello')\n    else:\n        print('world')\nelse:\n    print('hello world')\n";
    resolve(text_response);
  });
}


/////////////////////////////////////////
// END CLOUD FUNCTIONS CALLS
/////////////////////////////////////////


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





