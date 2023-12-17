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

/* var task_description = "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. \
\n You may assume that each input would have exactly one solution, and you may not use the same element twice. \
\n You can return the answer in any order. \n \n  Required function signature: def twoSum(nums, target)"
var function_signature = "def twoSum(nums, target):"
var unit_tests = "assert twoSum([2,7,11,15], 9) == [0,1] \nassert twoSum([3,2,4], 6) == [1,2] \nassert twoSum([3,3], 6) == [0,1]"
document.getElementById("taskDescription").innerText = task_description;
 */
var task_descriptions = [];
var function_signatures = [];
var unit_tests = [];

/////////////////////////////////////////
// Task loading stuff
/////////////////////////////////////////
var db = firebase.firestore();
var response_id;
var task_id;
var exp_condition;
var task_index = 0;

function loadlocalstorage() {
  var myData = localStorage["objectToPass"];
  myData = JSON.parse(myData);
  response_id = myData[0];
  task_id = myData[1];
  exp_condition = myData[2];
  //showlocalstorage();
}

function loadTaskData() {
  db.collection("tasks")
    .doc(task_id)
    .get()
    .then(function (query_snapshot) {
      rand_task = query_snapshot;
      function_signatures = query_snapshot.data().function_signatures;
      unit_tests = query_snapshot.data().unit_tests;
      task_descriptions = query_snapshot.data().task_descriptions;
      exp_condition = query_snapshot.data().exp_condition;
      loadCurrentTask();
    })
    .catch(function (error) {
      console.log("Error getting documents: ", error);
    });
}

function loadCurrentTask() {
  document.getElementById("taskDescription").innerText = task_descriptions[task_index].replace(/\\n/g, "\n");;
}


function enableBeforeUnload() {
  window.onbeforeunload = function (e) {
    return "Discard changes?";
  };
}
function disableBeforeUnload() {
  window.onbeforeunload = null;
}

enableBeforeUnload();
loadlocalstorage();
loadTaskData();


/////////////////////////////////////////
/////////////////////////////////////////


// make sure editor on refresh is saved and reloaded
window.onbeforeunload = function () {
  rejectSuggestion();
  localStorage.setItem("code", editor.getValue());
};
var code = localStorage.getItem("code");
if (code) {
  editor.setValue(code, -1);
}



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
