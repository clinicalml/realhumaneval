var editor = ace.edit("editor");
editor.setTheme("ace/theme/github");
editor.session.setMode("ace/mode/python");
editor.setOption("showPrintMargin", false);
document.getElementById("editor").style.fontSize = "15px";
ace.require("ace/ext/language_tools");
var editor = ace.edit("editor");
//editor.setOptions({
//  enableBasicAutocompletion: true,
//  enableSnippets: true,
//  enableLiveAutocompletion: true
//});

const openAIapiUrl = "https://api.openai.com/v1/completions";


const openAIapiKey = "OPENAI KEY HERE";
const RapidAPIKey = "RAPID API KEY HERE";

let isAppending = false; // Flag to track if appendCustomString is in progress
var Range = ace.require("ace/range").Range;
let typingTimeout;

let customStringMarkerId; // This will hold the ID of the marker for our custom string
var customString = ""; // This will hold the custom string that we will append to the editor
var lastSuggestion = "";
var cursorString = "";
var codeAtlastReject = editor.getValue();
var suggestions_shown_count = 0;

function get_constant_response(prefix, suffix) {
  return new Promise((resolve, reject) => {
    var text_response =
      "abcdefj\nhjik";
    resolve(text_response);
  });
}

function get_openai_response(prefix, suffix) {
  return get_constant_response(prefix, suffix);
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openAIapiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo-instruct",
      prompt: prefix,
      suffix: suffix,
      temperature: 0,
    }),
  };

  return fetch(openAIapiUrl, requestOptions)
    .then((response) => response.json())
    .then((data) => {
      console.log("called openai");
      var text_response = data.choices[0].text;
      return text_response;
    })
    .catch((error) => {
      console.error("Error:", error);
      throw error;
    });
}

async function submitCode() {
  return false;
  // TODO: print exceptions
  const url = "https://onecompiler-apis.p.rapidapi.com/api/v1/run";
  const options = {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-RapidAPI-Key": RapidAPIKey,
      "X-RapidAPI-Host": "onecompiler-apis.p.rapidapi.com",
    },
    body: JSON.stringify({
      language: "python",
      //stdin: 'Peter',
      files: [
        {
          name: "index.py",
          content: editor.getValue(),
        },
      ],
    }),
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    console.log(result);
    document.getElementById("output").innerText = result.stdout;
  } catch (error) {
    console.error(error);
  }
}

// Add suggestion
function appendCustomString() {
  return new Promise((resolve, reject) => {
    let code = editor.getValue();
    let indexLastSugg = 0;

    // Iterating from the end of the code
    for (let i = code.length - 1; i >= 0; i--) {
      if (code.substring(i) === lastSuggestion.substring(0, code.length - i)) {
        // Match found
        indexLastSugg = code.length - i;
        break;
      }
    }

    // Return the remainder of the suggestion

    let remainderSuggestion = lastSuggestion.substring(indexLastSugg);

    if (customString == "") {
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

        get_openai_response(prefix_code, suffix_code)
          .then((response_string) => {
            customString = response_string;
            lastSuggestion = response_string;
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
          })
          .catch((error) => {
            console.log(error);
          });
      }
      resolve(); // Resolve the Promise when it's done
    } else {
      resolve();
    }
  });
}

editor.commands.on("exec", function (e) {
  if (customString != "") {
    if (e.command.name != "indent" && e.command.name != "insertstring") {
      // If the pressed key is not 'Tab', remove the custom string
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
    } else if (e.command.name == "indent") {
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
      e.preventDefault();
    } else if (e.command.name == "insertstring") {
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
          break;
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
    }
  }
});

// same as above just for Escape, afterExec doesn't work for Escape ...
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    if (customString != "") {
      editor.session.removeMarker(customStringMarkerId);
      // remove the custom string from the editor
      let row = cursorString.row;
      let column = cursorString.column;
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
      // add the key that was pressed
      customString = "";
    }
  }
});

// same for any mouse left or right clickl
document.addEventListener("click", function (event) {
  if (customString != "") {
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
  }
});

// check if programmer is actively typing or
editor.session.on("change", function () {
  clearTimeout(typingTimeout); // Clear previous timeout
  //document.getElementById("output").innerText = "user writing";
  // Set new timeout
  typingTimeout = setTimeout(function () {
    if (customString == "") {
      if (editor.getValue() != codeAtlastReject && !isAppending) {
        isAppending = true;
        codeAtlastReject = editor.getValue();
        //
        appendCustomString().then((response) => {
          isAppending = false;
          suggestions_shown_count += 1;
          console.log(suggestions_shown_count);
        });
      }
    }
    //document.getElementById("output").innerText = "user paused";
  }, 1000); // Wait for 1 second
});

// RECORDING: works perfectly

let mediaRecorder;
let recordedChunks = [];
let mediaStream;

async function startRecording() {
  try {
    mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always",
      },
      audio: true,
      preferCurrentTab: true,
    });

    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: "video/webm" });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunks.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style.display = "none";
      a.href = url;
      a.download = "recorded-tab.webm";
      a.click();
      window.URL.revokeObjectURL(url);
    };

    mediaRecorder.start();
  } catch (err) {
    console.error("Error:", err);
  }
}

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    mediaStream.getTracks().forEach((track) => track.stop()); // Stopping all tracks
  }
}
