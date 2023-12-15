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
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/python");
editor.setOption("showPrintMargin", false);
document.getElementById("editor").style.fontSize = "15px";
ace.require("ace/ext/language_tools");
editor.setOption("behavioursEnabled", false);
//editor.setOptions({
//  enableBasicAutocompletion: true,
//  enableSnippets: true,
//  enableLiveAutocompletion: true
//});

// PARAMETERS
const wait_time_for_sug = 1000; // in milliseconds
const context_length = 6000; // in characters, in theory should multiply context token length by 4 to get character limit
// VARIABLES used
let isAppending = false; // Flag to track if appendCustomString is in progress
var Range = ace.require("ace/range").Range;
let typingTimeout;
let customStringMarkerId; // This will hold the ID of the marker for our custom string
var customString = ""; // This will hold the custom string that we will append to the editor
var lastSuggestion = "";
var cursorString = "";
var codeAtlastReject = editor.getValue();
var suggestions_shown_count = 0;
// Variables for recording
let mediaRecorder;
let recordedChunks = [];
let mediaStream;

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
  rejectSuggestion();
  document.getElementById("output").innerText = "Running...";
  var editor_value = editor.getValue();
  var editor_value_string = editor_value.toString();
  runcode({ prompt: editor_value_string })
    .then((result) => {
      const log =
        "Errors:" + result.data.data.stderr + "\n" + result.data.data.stdout;
      document.getElementById("output").innerText = log;
    })
    .catch((error) => {
      console.error("Error calling the submit function:", error);
    });
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

/////////////////////////////////////////
// Handle Adding Suggestion to Editor
/////////////////////////////////////////

// check if programmer is actively typing
editor.session.on("change", handleChange);

function handleChange() {
  console.log(isAppending);
  clearTimeout(typingTimeout); // Clear previous timeout
  // Set new timeout
  typingTimeout = setTimeout(function () {
    if (customString == "") {
      if (editor.getValue() != codeAtlastReject && !isAppending) {
        isAppending = true;
        appendCustomString().then((response) => {
          if (isAppending == true) {
            suggestions_shown_count += 1;
            console.log(suggestions_shown_count);
          }
        });
      }
    }
  }, wait_time_for_sug); // Wait for wait_time_for_sug second
}

// Add suggestion
function appendCustomString() {
  return new Promise((resolve, reject) => {
    if (customString == "") {
      var prefix_code = editor.getValue();
      var suffix_code = "";
      var cursor = editor.getCursorPosition();
      prefix_code = prefix_code.substring(
        0,
        editor.session.doc.positionToIndex(cursor)
      );
      suffix_code = editor
        .getValue()
        .substring(editor.session.doc.positionToIndex(cursor));
      // need to trim prefix and suffix to context length
      // 2/3 of the context length for the prefix and 1/3 for the suffix
      var maxPrefixLength = Math.floor((context_length * 2) / 3);
      var maxSuffixLength = context_length - maxPrefixLength;

      // Adjust lengths if either is shorter than its maximum allowed length
      if (prefix_code.length < maxPrefixLength) {
        maxSuffixLength += maxPrefixLength - prefix_code.length;
        maxPrefixLength = prefix_code.length;
      } else if (suffix_code.length < maxSuffixLength) {
        maxPrefixLength += maxSuffixLength - suffix_code.length;
        maxSuffixLength = suffix_code.length;
      }

      // Trim the prefix and suffix
      if (prefix_code.length > maxPrefixLength) {
        prefix_code = prefix_code.substring(
          prefix_code.length - maxPrefixLength
        );
      }

      if (suffix_code.length > maxSuffixLength) {
        suffix_code = suffix_code.substring(0, maxSuffixLength);
      }
      // get maxtokens from input maxTokens in html
      var max_tokens = parseInt(document.getElementById("maxTokens").value);

      // get model from modelSelector
      var model = document.getElementById("modelSelector").value;
      var response_string = "";
      // get suggestion according to model
      if (model == "gpt35") {
        get_openai_response(prefix_code, suffix_code, max_tokens)
          .then((response_string) => {
            addSuggestion(response_string);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        var prompt = "";
        if (suffix_code.length > 0) {
          // <PRE> {prefix} <SUF>{suffix} <MID>
          prompt = "<PRE> " + prefix_code + " <SUF> " + suffix_code + " <MID>";
        } else {
          prompt = prefix_code;
        }
        if (prompt.length == 0) {
          prompt =" ";
        }
        get_completion_together(model, prompt, max_tokens)
          .then((response_string) => {
            addSuggestion(response_string);
          })
          .catch((error) => {
            console.log(error);
          });
      }

      console.log("getting new suggestion");
    
      resolve(); // Resolve the Promise when it's done
    } else {
      resolve();
    }
  });
}

function addSuggestion(response_string) {
  customString = response_string;
      lastSuggestion = response_string;
      if (isAppending == true) {
        // how much the custom string will add to the row and column
        let string_added_column = customString.length;
        let string_added_row = customString.split("\n").length - 1;
        var cursor = editor.getCursorPosition();
        let row = cursor.row;
        let column = cursor.column;
        // get the all the text from the editor
        // Append the custom string to the editor at cursor location
        editor.session.insert({ row: row, column: column }, customString);
        cursorString = cursor;
        // keep cursor at location before the string was appended
        editor.gotoLine(row + 1, column);
        // Highlight the appended string
        customStringMarkerId = editor.session.addMarker(
          new Range(
            row,
            column,
            row + string_added_row,
            column + string_added_column
          ),
          "errorHighlight",
          "text"
        );
        console.log(customStringMarkerId);
        isAppending = false;
      }
  }

// If CNTRL+ENTER is pressed, show the next suggestion
editor.commands.addCommand({
  name: "showNextSuggestion",
  bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
  exec: function (editor) {
    rejectSuggestion();
    isAppending = true;
    appendCustomString().then((response) => {
      if (isAppending == true) {
        suggestions_shown_count += 1;
        console.log(suggestions_shown_count);
      }
    });
  },
});

/////////////////////////////////////////
// End of Handle Adding Suggestion to Editor
/////////////////////////////////////////

/////////////////////////////////////////
// Handle Accept and Reject of Suggestions
/////////////////////////////////////////

editor.commands.on("exec", function (e) {
  if (customString != "") {
    if (e.command.name != "indent" && e.command.name != "insertstring") {
      rejectSuggestion();
    } else if (e.command.name == "insertstring" && e.command.name != "indent") {
      rejectSuggestion();
      // add the key that was pressed
      e.command.exec(e.editor, e.args);
      // prevent the default action of the key
      e.preventDefault();

      // check if there is a substring of the codewritten that matches the first character of the last suggestion
      let code = editor.getValue();
      let indexLastSugg = 0;

      // Iterating from the end of the code
      for (let i = code.length - 1; i >= 0; i--) {
        if (
          code.substring(i) === lastSuggestion.substring(0, code.length - i)
        ) {
          // Match found
          indexLastSugg = code.length - i;
        }
      }
      // Return the remainder of the suggestion

      let remainderSuggestion = lastSuggestion.substring(indexLastSugg);

      if (indexLastSugg != 0) {
        customString = remainderSuggestion;
        let string_added_column = remainderSuggestion.length;
        let string_added_row = remainderSuggestion.split("\n").length - 1;
        var cursor = editor.getCursorPosition();
        let row = cursor.row;
        let column = cursor.column;
        // get the all the text from the editor
        // Append the custom string to the editor at cursor location
        editor.session.insert(
          { row: row, column: column },
          remainderSuggestion
        );
        cursorString = cursor;
        // keep cursor at location before the string was appended
        editor.gotoLine(row + 1, column);
        // Highlight the appended string
        customStringMarkerId = editor.session.addMarker(
          new Range(
            row,
            column,
            row + string_added_row,
            column + string_added_column
          ),
          "errorHighlight",
          "text"
        );
      } else {
        customString = "";
      }
    } else if (e.command.name == "indent") {
      // Programmer Accepted Suggestion
      acceptSuggestion();
      e.preventDefault();
    }
  }
});

// same as above just for Escape, afterExec doesn't work for Escape ...
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    rejectSuggestion();
  }
});

// same for any mouse left or right clickl
document.addEventListener("click", rejectSuggestion);

function acceptSuggestion() {
  console.log("accepting suggestion");
  editor.session.removeMarker(customStringMarkerId);
  let cursor = editor.getCursorPosition();
  let row = cursorString.row;
  let column = cursorString.column;
  editor.gotoLine(
    row + 1 + customString.split("\n").length - 1,
    column + customString.length
  );
  customString = "";
  // move cursor to the end of the custom string
  // don't execute the tab
  // Triger a change event to show the next suggestion
  lastSuggestion = "";
  handleChange();
}

function rejectSuggestion() {
  isAppending = false;
  if (customString != "") {
    console.log("rejecting suggestion");
    editor.session.removeMarker(customStringMarkerId);
    // remove the custom string from the editor
    let row = cursorString.row;
    let column = cursorString.column;
    editor.session.remove(
      new Range(
        row,
        column,
        row + customString.split("\n").length - 1,
        column + customString.length
      )
    );
    // add the key that was pressed
    customString = "";
    codeAtlastReject = editor.getValue();
  }
}

/////////////////////////////////////////
// End of Accept and Reject of Suggestions
/////////////////////////////////////////
