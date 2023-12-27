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






/////////////////////////////////////////
// disable copy pasting in the editor unless what is being pasted is copied from the editor itself
/////////////////////////////////////////


// Variable to store the last copied text from the editor
var lastCopiedText = "";

// Event listener for copy event
editor.on("copy", function(e) {
    lastCopiedText = e.text; // Store the copied text
});

// Event listener for paste event
editor.on("paste", function(e) {
  console.log(e);
  console.log(e.text);
    if (e.text !== lastCopiedText) {
        // If the pasted text is not the same as the last copied text from the editor
        e.event.preventDefault(); // Prevent the paste action

        alert("Pasting is only allowed from content copied within this editor.");
    }
});


/////////////////////////////////////////
// end of diabling copy pasting
/////////////////////////////////////////


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
  // Check if an end time is already stored
  var endTime = localStorage.getItem('endTime');

  if (!endTime) {
      // If not, set the end time to 30 minutes from now
      endTime = new Date().getTime() + (30 * 60 * 1000);
      localStorage.setItem('endTime', endTime);
  }

  updateTimer(endTime);
}

function updateTimer(endTime) {
  var timer = document.getElementById('timer');
  var interval = setInterval(function() {
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
      }
  }, 1000);
}

// Initialize the timer when the page loads


function initializeProgressBar() {
  var progress = document.getElementById('taskProgress');
  var progressText = document.getElementById('progressText');

  progress.max = task_descriptions.length; // Set the maximum value of the progress bar
  progressText.textContent = `0/${task_descriptions.length} tasks completed`; // Initialize the text
}

function updateProgress() {
  var progress = document.getElementById('taskProgress');
  var progressText = document.getElementById('progressText');
  
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
startTimer();
