var currentTheme = "monokai";
var timer_minutes = 30;
document.getElementById("changeThemeButton").addEventListener("click", function() {
    // Switch between themes
    if (currentTheme === "monokai") {
        editor.setTheme("ace/theme/github");
        currentTheme = "github";
    } else {
        editor.setTheme("ace/theme/monokai");
        currentTheme = "monokai";
    }
});


document.getElementById('resetCodeButton').addEventListener('click', function() {
  // Show confirmation dialog
  var isConfirmed = confirm("Are you sure you want to reset your code to when the task was loaded? This deletes your current code.");

  if (isConfirmed) {
    telemetry_data.push({
      event_type: "code_reset",
      code: editor.getValue(),
      task_id: task_id,
      task_index: task_index,
      timestamp: Date.now(),
    });
    // User clicked 'OK', reset the editor's content
    editor.session.off("change", handleChange);
    if (task_index == -1) {
      editor.setValue(tutorial_function_signature.replace(/\\n/g, "\n"));
    } else {
    var newCode = function_signatures[task_index].replace(/\\n/g, "\n");
    editor.setValue(newCode);
    }
    editor.session.on("change", handleChange);
  }
});


document.getElementById("skipTaskButton").addEventListener("click", function() {
  telemetry_data.push({
    event_type: "skip_task",
    task_id: task_id,
    task_index: task_index,
    timestamp: Date.now(),
  });
  task_index++;
  loadCurrentTask();
});





/////////////////////////////////////////
// Popup
/////////////////////////////////////////

// POPUP FOR BUTTONS SHORTCUT
function showPopup() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}
// HIDE POPUP FOR BUTTONS SHORTCUT
function hidePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

// POPUP FOR TUTORIAL
function showPage(pageNumber) {
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "none";

  if (pageNumber === 1) {
    document.getElementById("page1").style.display = "block";
  } else if (pageNumber === 2) {
    document.getElementById("page2").style.display = "block";
  }
}

// POPUP FOR TUTORIAL
function closePopup() {
  document.getElementById("popup_tutorial").style.display = "none";
}
function showInstructions() {
  document.getElementById("popup_tutorial").style.display = "block";
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "block";
}


// POPUP for end
function proceed_timeout() {
  // NOT USED ANYMORE
  document.getElementById("timeout_popup").style.display = "none";
  window.location.href = "exit_survey.html";
}

/////////////////////////////////////////
// disable copy pasting in the editor unless what is being pasted is copied from the editor itself
/////////////////////////////////////////

// Variable to store the last copied text from the editor
var lastCopiedText = "";

// Event listener for copy event
editor.on("copy", function (e) {
  lastCopiedText = e.text; // Store the copied text
});
/* 
// Event listener for paste event
editor.on("paste", function (e) {
  if (e.text !== lastCopiedText) {
    // prevent pasting
    
    e.event.preventDefault(); // Prevent the default paste event
    // If the pasted text is not the same as the last copied text from the editor
    setTimeout(function () {
      alert("Pasting is only allowed from content copied within this editor.");
    }, 10);
    // throw an error
    throw new Error("Pasting is only allowed from content copied within this editor.");
  }
}); */

/////////////////////////////////////////
// end of diabling copy pasting
/////////////////////////////////////////
/* 
/////////////////////////////////////////
// RECORDING: works perfectly
/////////////////////////////////////////
// Variables for recording
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
} */

/////////////////////////////////////////
// Timer
/////////////////////////////////////////
function startTimer() {
  // Check if an end time is already stored
  var endTime = localStorage.getItem("endTime");

  if (!endTime) {
    // If not, set the end time to 30 minutes from now
    endTime = new Date().getTime() + timer_minutes * 60 * 1000;
    localStorage.setItem("endTime", endTime);
  }

  updateTimer(endTime);
}

function updateTimer(endTime) {
  var timer = document.getElementById("timer");
  var interval = setInterval(function () {
    var currentTime = new Date().getTime();
    var distance = endTime - currentTime;
    var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    var seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Display the result in the timer div
    timer.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

    // If the count down is over, display "Time is up"
    if (distance < 0) {
      clearInterval(interval);
      timer.textContent = "Time is up";
      // get the user out
      writeUserData();
      disableBeforeUnload();
      var myData = [response_id, task_id, exp_condition, worker_id];
      localStorage.setItem("objectToPass", JSON.stringify(myData));
      localStorage.setItem("code", "");
      var time_completed = new Date();
      var time_completed_string = time_completed.toString();
      db.collection("responses")
        .doc(response_id)
        .update({
          time_completed: time_completed_string,
          task_index: task_index,
        })
        .then(() => {
          console.log("Document successfully written!");
          // show popup timeout_popup
          alert("Time's Up! You have reached the end of the coding part of the study. ");
          window.location.href = "exit_survey.html";

          //document.getElementById("timeout_popup").style.display = "block";
        })
        .catch((error) => {
          console.error("Error writing document: ", error);
        }); 
    }
  }, 1000);
}

// Initialize the timer when the page loads
var progressbar_initialized = false;
function initializeProgressBar() {
  progressbar_initialized = true;
  var progress = document.getElementById("taskProgress");
  var progressText = document.getElementById("progressText");

  progress.max = task_descriptions.length; // Set the maximum value of the progress bar
  progressText.textContent = `0/${task_descriptions.length} tasks completed`; // Initialize the text
}

function updateProgress() {
  var progress = document.getElementById("taskProgress");
  var progressText = document.getElementById("progressText");

  progress.value = task_index; // Update the progress bar
  progressText.textContent = `${task_index}/${task_descriptions.length} tasks completed`; // Update the text
}

// Initialize the progress bar when the page loads

// prevent user from leaving page
function disableBeforeUnload() {
  window.onbeforeunload = null;
}

function enableBeforeUnload() {
  window.onbeforeunload = function (e) {
    return "Discard changes?";
  };
}

window.onload = function () {
  // check if task_index exists
  if (task_index == null || task_index == -1) {
    document.getElementById("popup_tutorial").style.display = "block";
  }
};

// make sure editor on refresh is saved and reloaded
window.onbeforeunload = function () {
  rejectSuggestion();

  localStorage.setItem("code", editor.getValue());
  // save task index
  localStorage.setItem("task_index", task_index);
  localStorage.setItem("telemetry_data", JSON.stringify(telemetry_data));
  return "Discard changes?";
};

function restoreAfterRefresh() {
  // also on start

  var code = localStorage.getItem("code");
  if (code) {
    editor.setValue(code, -1);
  }
  task_index = localStorage.getItem("task_index");
  if (task_index) {
    task_index = parseInt(task_index);
  }
  else{
    task_index = -1;
  }
  telemetry_data = localStorage.getItem("telemetry_data");
  if (telemetry_data) {
    telemetry_data = JSON.parse(telemetry_data);
  }
  else{
    telemetry_data = [];
  }
  // check if task_descriptions is defined and not empty
  // check if an object by the name of task_descriptions exists
  if (typeof task_descriptions !== "undefined" && task_descriptions.length > 0) {
    updateProgress();
  } 

}

// REMOVE AI from interface

function removeAIinterface() {
  // hide thinkingIcon
  document.getElementById("thinkingIcon").style.display = "none";
  // hide page2_tutorial_text and show page2_tutorial_text_nomodel
  document.getElementById("page2_tutorial_text").style.display = "none";
  document.getElementById("page2_tutorial_text_nomodel").style.display = "block";

}


// utilities

function randomGaussian(mean, stdDev) {
  let u = 0, v = 0;
  while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num * stdDev + mean; // Adjust for mean and std deviation
  return num;
}

function sampleGaussianTruncated(mean, stdDev, min, max) {
  let sample;
  do {
      sample = randomGaussian(mean, stdDev);
  } while (sample < min || sample > max);
  return Math.round(sample);
}



startTimer();
restoreAfterRefresh();
