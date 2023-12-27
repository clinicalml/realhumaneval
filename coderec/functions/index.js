// The Cloud Functions for Firebase SDK to create Cloud Functions and triggers.
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// The Firebase Admin SDK to access Firestore.
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
// Dependencies for callable functions.
const {
  onCall,
  HttpsError,
  onRequest,
} = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions/v2");
const { defineSecret } = require("firebase-functions/params");
const openai_key = defineSecret("OPENAI_KEY");
const rapidapi_key = defineSecret("RAPIDAPI_KEY");
const together_key = defineSecret("TOGETHER_KEY");
const https = require("https"); // Native HTTPS module
const cors = require("cors")({ origin: true });
var axios = require("axios");

// Dependencies for the addMessage function.
const { getDatabase } = require("firebase-admin/database");
initializeApp();

// Example usage:
// runCode('your_rapidapi_key', 'print("Hello, world!")').then(stdout => console.log(stdout));

// https://codewithandrea.com/articles/api-keys-2ndgen-cloud-functions-firebase/
// , enforceAppCheck: true
exports.runcode = onCall({ secrets: [openai_key, rapidapi_key]}, (request) => {
  if (!request.auth) {
    throw new HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const postData = {
    language: "python",
    files: [
      {
        name: "index.py",
        content: request.data.prompt,
      },
    ],
  };

  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";
  const options = {
    method: "post",
    url: url,
    headers: {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": rapidapi_key.value(),
      "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
    },
    data: postData,
  };
  // Perform the API request
  return axios(options)
    .then((response) => {
      // Handle success
      return { data: response.data };
    })
    .catch((error) => {
      // Handle error
      throw new functions.https.HttpsError(
        "unknown",
        "Error calling the API",
        error
      );
    });
});


exports.get_together_completion = onCall(
  { secrets: [ together_key] },
  (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }
/*     curl -X POST "$ENDPOINT_URL" \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"model": "togethercomputer/RedPajama-INCITE-7B-Instruct", "prompt": "Q: The capital of France is?\nA:", "temperature": 0.8, "top_p": 0.7, "top_k": 50, "max_tokens": 1, "repetition_penalty": 1}'
 */
    const apiUrl = "https://api.together.xyz/inference";
    const options = {
      method: "POST",
      url: apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${together_key.value()}`,
      },
      data: {
        model: request.data.model,
        prompt: request.data.prompt,
        temperature: 0.1,
        top_p: 0.7,
        top_k: 50,
        max_tokens: request.data.max_tokens,
        repetition_penalty: 1,
      },
    };

    // Perform the API request
    return axios(options)
      .then((response) => {
        // Handle success
        return { data: response.data };
      })
      .catch((error) => {
        // Handle error
        throw new functions.https.HttpsError(
          "unknown",
          "Error calling the API",
          error
        );
      });
  }
);




exports.getcompletion = onCall(
  { secrets: [openai_key, rapidapi_key] },
  (request) => {
    if (!request.auth) {
      throw new HttpsError(
        "failed-precondition",
        "The function must be called while authenticated."
      );
    }

    const apiUrl = "https://api.openai.com/v1/completions";

    const options = {
      method: "POST",
      url: apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openai_key.value()}`,
      },
      data: {
        model: "gpt-3.5-turbo-instruct",
        prompt: request.data.prefix,
        suffix: request.data.suffix,
        max_tokens: request.data.max_tokens,
        temperature: 0,
      },
    };

    // Perform the API request
    return axios(options)
      .then((response) => {
        // Handle success
        return { data: response.data };
      })
      .catch((error) => {
        // Handle error
        throw new functions.https.HttpsError(
          "unknown",
          "Error calling the API",
          error
        );
      });
  }
);
