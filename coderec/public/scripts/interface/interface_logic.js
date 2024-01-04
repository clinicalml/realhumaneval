// PARAMETERS
const wait_time_for_sug = 1500; // in milliseconds
const context_length = 6000; // in characters, in theory should multiply context token length by 4 to get character limit
// VARIABLES used
let currentlyGenerating = false; // Flag to track if appendCustomString is in progress
var currentlyShown = false;
var Range = ace.require("ace/range").Range;
let typingTimeout;
let customStringMarkerId; // This will hold the ID of the marker for our custom string
var customString = ""; // This will hold the suggestion that we will append to the editor
var lastSuggestion = "";
var cursorSuggestion = "";
var codeAtlastReject = editor.getValue();
var suggestions_shown_count = 0;
var thinkingIcon = document.getElementById("thinkingIcon");
var suggestion_id = 0;

var undoManager = editor.session.getUndoManager();

/////////////////////////////////////////
// Handle Adding Suggestion to Editor
/////////////////////////////////////////

// check if programmer is actively typing

editor.session.on("change", handleChange);
// for any mouse click selection or left click
// same for any mouse left or right clickl
document.addEventListener("click", handleandReject);
document.addEventListener("contextmenu", handleandReject);
// same for selecting text
editor.selection.on("changeSelection", handleandReject);
// same for scrolling
// cursor change
editor.selection.on("changeCursor", handleandReject);

function handleandReject() {
  rejectSuggestion();
  handleChange();
}

function handleChange() {
  clearTimeout(typingTimeout); // Clear previous timeout
  var selectedText = editor.getSelectedText();
  typingTimeout = setTimeout(function () {
    if (!currentlyGenerating && !currentlyShown && selectedText == "") {
      if (editor.getValue() != codeAtlastReject) {
        appendCustomString().then((response) => {
          // do nothing
        });
      }
    }
  }, wait_time_for_sug); // Wait for wait_time_for_sug second
}

// Add suggestion
function appendCustomString() {
  return new Promise((resolve, reject) => {
    if (!currentlyGenerating && !currentlyShown) {
      currentlyGenerating = true;
      if (!thinkingIcon.classList.contains("spinning")) {
        thinkingIcon.classList.add("spinning");
      }
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
      suggestion_id += 1;

      telemetry_data.push({
        event_type: "before_shown",
        task_index: task_index,
        suggestion_id: suggestion_id,
        prefix_code: prefix_code,
        suffix_code: suffix_code,
        timestamp: Date.now(),
      });

      //max_tokens = parseInt(document.getElementById("maxTokens").value);
      //model = document.getElementById("modelSelector").value;
      // prepend to prefix code "# this code is in Python" - to tell LLM that the code is in Python
      prefix_code = "# this code is in Python\n" + prefix_code;
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
          prompt = " ";
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
  customString = response_string; // suggestion to display
  lastSuggestion = response_string;
  if (currentlyGenerating == true) {
    currentlyGenerating = false;
    // TODO: can we get the suggestion probability?
    // remove spinning AI
    thinkingIcon.classList.remove("spinning");
    // how much the custom string will add to the row and column
    let string_added_column = customString.length;
    let string_added_row = customString.split("\n").length - 1;
    var cursor = editor.getCursorPosition();
    let row = cursor.row;
    let column = cursor.column;
    // get the all the text from the editor
    // Append the custom string to the editor at cursor location
    editor.session.insert({ row: row, column: column }, customString);
    cursorSuggestion = cursor;
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
    currentlyShown = true;
    telemetry_data.push({
      event_type: "suggestion_shown",
      task_index: task_index,
      suggestion_id: suggestion_id,
      suggestion: response_string,
      timestamp: Date.now(),
    });
  }
}

// If CNTRL+ENTER is pressed, show the next suggestion
editor.commands.addCommand({
  name: "showNextSuggestion",
  bindKey: { win: "Ctrl-Enter", mac: "Command-Enter" },
  exec: function (editor) {
    currentlyGenerating = false; // stop previous generation
    thinkingIcon.classList.remove("spinning");
    telemetry_data.push({
      event_type: "request_suggestion",
      suggestion_id: suggestion_id,
      task_index: task_index,
      timestamp: Date.now(),
    });
    if (currentlyShown) {
      rejectSuggestion();
    }
    appendCustomString().then((response) => {});
  },
});

/////////////////////////////////////////
// End of Handle Adding Suggestion to Editor
/////////////////////////////////////////

/////////////////////////////////////////
// Handle Accept and Reject of Suggestions
/////////////////////////////////////////

editor.commands.on("exec", function (e) {
  if (!currentlyShown) {
    if (currentlyGenerating) {
      currentlyGenerating = false; // stop suggestion from being displayed as user typed
      thinkingIcon.classList.remove("spinning");
    }
    return;
  }
  // a suggestion is being shown
  if (e.command.name != "indent" && e.command.name != "insertstring") {
    // user pressed key that is not tab and not a letter
    rejectSuggestion();
  } else if (e.command.name == "insertstring" && e.command.name != "indent") {
    rejectSuggestion();

/*     currentlyGenerating = true;
    const key_pressed = e.args;
    // REMOVE SUGGESTION - reject suggestion
    editor.session.removeMarker(customStringMarkerId);
    let row = cursorSuggestion.row;
    let column = cursorSuggestion.column;
    var string_added_column = customString.length;
    var string_added_row = customString.split("\n").length - 1;
    var endRow = row + string_added_row;
    var endColumn;
    if (string_added_row === 0) {
      endColumn = column + customString.length;
    } else {
      var lastLineLength = customString.split("\n").pop().length;
      endColumn = lastLineLength;
    }

    var rangeToRemove = new Range(row, column, endRow, endColumn);
    editor.session.replace(rangeToRemove, "");
    e.command.exec(e.editor, e.args);
    e.preventDefault();
    // END REMOVE SUGGESTION
    console.log(key_pressed);
    if (key_pressed == customString.charAt(0)) {

      // new suggestion
      customString = customString.substring(1);

      // update cursor
      cursorSuggestion = editor.getCursorPosition();
      // is this the last character of the suggestion?
      if (customString.length == 0) {
        // OFFICIAL ACCEPT
        currentlyShown = false;
      } else {
        // highlight new suggestion
        let row = cursorSuggestion.row;
        let column = cursorSuggestion.column;
        let string_added_column = customString.length;
        let string_added_row = customString.split("\n").length - 1;
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
      }
      currentlyGenerating = false;
    } else {
      // OFFICIAL REJECT
      currentlyShown = false;
      currentlyGenerating = false;
      console.log("rejecting suggestion");
      telemetry_data.push({
        event_type: "reject",
        task_index: task_index,
        suggestion_id: suggestion_id,
        suggestion: customString,
        timestamp: Date.now(),
      });
      codeAtlastReject = editor.getValue(); */
    
  } else if (e.command.name == "indent") {
    // Programmer Accepted Suggestion by pressing tab
    acceptSuggestion();
    e.preventDefault();
  }
});

// same as above just for Escape, afterExec doesn't work for Escape ...
document.addEventListener("keydown", function (event) {
  if (
    event.key === "Escape" &&
    (currentlyShown == true || currentlyGenerating == true)
  ) {
    rejectSuggestion();
  }
});

function acceptSuggestion() {
  if (currentlyShown == false) {
    return;
  }
  currentlyShown = false;
  console.log("accepting suggestion");
  telemetry_data.push({
    event_type: "accept",
    task_index: task_index,
    suggestion_id: suggestion_id,
    suggestion: customString,
    timestamp: Date.now(),
  });
  editor.session.removeMarker(customStringMarkerId);
  let row = cursorSuggestion.row;
  let column = cursorSuggestion.column;
  editor.gotoLine(
    row + 1 + customString.split("\n").length - 1,
    column + customString.length
  );
  handleChange();
}

function rejectSuggestion() {
  if (currentlyGenerating == true && currentlyShown == false) {
    currentlyGenerating = false;
    thinkingIcon.classList.remove("spinning");
    return;
  } else if (currentlyShown == false) {
    return;
  } else {
    currentlyShown = false;
    editor.session.removeMarker(customStringMarkerId);
    // remove the custom string from the editor
    let row = cursorSuggestion.row;
    let column = cursorSuggestion.column;
    // undoManager.undo(editor.session);
    var string_added_column = customString.length;
    var string_added_row = customString.split("\n").length - 1;
    var endRow = row + string_added_row;
    var endColumn;
    if (string_added_row === 0) {
      // Custom string and the following text are on the same line
      endColumn = column + customString.length;
    } else {
      // Custom string spans multiple lines
      // Find the length of the custom string on the last line
      var lastLineLength = customString.split("\n").pop().length;
      endColumn = lastLineLength;
    }

    var rangeToRemove = new Range(row, column, endRow, endColumn);
    editor.session.replace(rangeToRemove, "");

    console.log("rejecting suggestion");
    telemetry_data.push({
      event_type: "reject",
      task_index: task_index,
      suggestion_id: suggestion_id,
      suggestion: customString,
      timestamp: Date.now(),
    });

    // add the key that was pressed
    codeAtlastReject = editor.getValue();
  }
}

/////////////////////////////////////////
// End of Accept and Reject of Suggestions
/////////////////////////////////////////
