/////////////////////////////////////////
// Popup
/////////////////////////////////////////

function showPopup() {
  document.getElementById("popup").style.display = "block";
  document.getElementById("overlay").style.display = "block";
}

function hidePopup() {
  document.getElementById("popup").style.display = "none";
  document.getElementById("overlay").style.display = "none";
}

function showPage(pageNumber) {
  document.getElementById("page1").style.display = "none";
  document.getElementById("page2").style.display = "none";

  if (pageNumber === 1) {
    document.getElementById("page1").style.display = "block";
  } else if (pageNumber === 2) {
    document.getElementById("page2").style.display = "block";
  }
}

function closePopup() {
  document.getElementById("popup_tutorial").style.display = "none";
}

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
}

/////////////////////////////////////////
// Timer
/////////////////////////////////////////

function startTimer() {
  var duration = 60 * 30; // 30 mins in seconds
  var timerStart = localStorage.getItem("timerStart");
  var currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

  if (!timerStart) {
    // If the timer hasn't started before, set the start time
    localStorage.setItem("timerStart", currentTime);
    timerStart = currentTime;
  }

  var timeElapsed = currentTime - parseInt(timerStart, 10);
  var timeRemaining = duration - timeElapsed;

  if (timeRemaining <= 0) {
    // If the timer has already completed
    displayTimer(0);
    return;
  }

  var display = document.querySelector("#timer");
  var countdown = setInterval(function () {
    var minutes = parseInt(timeRemaining / 60, 10);
    var seconds = parseInt(timeRemaining % 60, 10);

    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    display.textContent = "Time Left: " + minutes + ":" + seconds;

    if (--timeRemaining < 0) {
      clearInterval(countdown);
      display.textContent = "Time's up!";
      localStorage.removeItem("timerStart"); // Clear start time from storage
      // Additional actions when timer ends
    }
  }, 1000);
}

function displayTimer(timeRemaining) {
  var minutes = parseInt(timeRemaining / 60, 10);
  var seconds = parseInt(timeRemaining % 60, 10);

  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;

  var display = document.querySelector("#timer");
  display.textContent = timeRemaining > 0 ? "Time Left: " + minutes + ":" + seconds : "Time's up!";
}


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
  if (!task_index || task_index == -1) {
    document.getElementById("popup_tutorial").style.display = "block";
  }
};

// make sure editor on refresh is saved and reloaded
window.onbeforeunload = function () {
  rejectSuggestion();
  localStorage.setItem("code", editor.getValue());
  // save task index
  localStorage.setItem("task_index", task_index);
  return "Discard changes?";
};


function restoreAfterRefresh() {
  var code = localStorage.getItem("code");
  if (code) {
    editor.setValue(code, -1);
  }
  var task_index = localStorage.getItem("task_index");
  if (task_index) {
    task_index = parseInt(task_index);
  }
  
}
restoreAfterRefresh();