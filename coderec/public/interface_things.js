
/////////////////////////////////////////
// Popup
/////////////////////////////////////////

function showPopup() {
    document.getElementById('popup').style.display = 'block';
    document.getElementById('overlay').style.display = 'block';
}

function hidePopup() {
    document.getElementById('popup').style.display = 'none';
    document.getElementById('overlay').style.display = 'none';
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

  function startTimer(duration, display) {
    var timer = duration, minutes, seconds;
    var countdown = setInterval(function () {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;

        display.textContent = "Time Left: " +  minutes + ":" + seconds;

        if (--timer < 0) {
            clearInterval(countdown);
            display.textContent = "Time's up!";
            // Additional actions when timer ends
        }
    }, 1000);
}

window.onload = function () {
    var thirtyMinutes = 60 * 30,
        display = document.querySelector('#timer');
    startTimer(thirtyMinutes, display);
};


// prevent user from leaving page
function disableBeforeUnload() {
  window.onbeforeunload = null;
}

function enableBeforeUnload() {
  window.onbeforeunload = function (e) {
    return "Discard changes?";
  };
}
