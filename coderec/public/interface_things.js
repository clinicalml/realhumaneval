
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
  