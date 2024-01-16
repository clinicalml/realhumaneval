/* TODO:
cancel button doesnt work right now
add telemetry tracking
- when send is pressed: track what got sent
- when message is received: track what got received
- when clear chat is pressed: track that
- when copy is pressed: track that
example of telemetry tracking:
    telemetry_data.push({
      event_type: "suggestion_shown",
      task_index: task_index,
      suggestion_id: suggestion_id,
      suggestion: response_string,
      timestamp: Date.now(),
    });

keep track of chat history in array with each element 'sender' agent/user and 'message'

any bugs and visual fixes?
make sure horizontal resizing works
 */
var chatBox = document.getElementById("chat-box");

document.getElementById("send-button").addEventListener("click", function () {
  // TODO: MOVE SCROLL TO THE BOTTOM ON SUBMIT
  var button = document.getElementById("send-button");
  var userInput = document.getElementById("user-input");
  var message = userInput.value.trim();
  button.innerHTML = '📤';

  if (button.textContent === "✖") {
    clearTimeout(typingTimeout);
    removeAgentTyping();
    button.textContent = '📤';
  } else if (message) {
    userInput.value = "";
    displayUserMessage(message);
    // scroll to end of chat-box
    chatBox.scrollTop = chatBox.scrollHeight;
    // Display typing indicator
    displayAgentTyping();
    button.textContent = "✖";
    get_completion_together("togethercomputer/CodeLlama-34b-Instruct", message, 258)
    .then((response_string) => {
      if (button.textContent === "📤") {
        // user pressed cancel
        removeAgentTyping();
        button.textContent = '📤';
        return;
      }
      displayAgentMessage(response_string);
      removeAgentTyping();
      button.textContent = '📤';
    })
    .catch((error) => {
      console.log(error);
    });

  }
});


document.getElementById("clear-chat").addEventListener("click", function () {
  let chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
});


function displayUserMessage(message) {
  var chatBox = document.getElementById("chat-box");
  var msgElement = document.createElement("div");
  msgElement.classList.add("message");
  hljs.configure({
    decodeEntities: true,
    ignoreUnescapedHTML: true,
    languages: ["python"],
  });

  var headerElement = document.createElement('div');
  headerElement.style.display = "flex";
  headerElement.style.alignItems = "center";
  // Add in image.
  var imageElement = document.createElement('img');
  imageElement.src = './static/user_icon.png';
  imageElement.style.width = "28px";
  imageElement.style.height = "28px";

  headerElement.appendChild(imageElement);

  // Add in name of agent
  var nameElement = document.createElement('div');
  nameElement.textContent = 'User';
  nameElement.style.fontWeight = "bold";
  nameElement.style.paddingLeft = "5px";
  headerElement.appendChild(nameElement);

  msgElement.append(headerElement);

  var textElement = document.createElement('div');
  textElement.classList.add("text-elem");
  textElement.style.paddingLeft = "35px";
  textElement.style.paddingRight = "35px";
  textElement.style.whiteSpace = "normal";

  // Split message into code and non-code segments
  var segments = message.split(/(\\begin\{code\}|\\end\{code\})/);
  var inCodeBlock = false;

  segments.forEach((segment) => {
    if (segment === "\\begin{code}") {
      inCodeBlock = true;
      var codeBlock = document.createElement("pre");
      codeBlock.classList.add("hljs");
      textElement.appendChild(codeBlock);
    } else if (segment === "\\end{code}") {
      inCodeBlock = false;
    } else if (inCodeBlock) {
      var codeContent = document.createElement("code");
      codeContent.textContent = segment;
      hljs.highlightElement(codeContent);
      textElement.lastChild.appendChild(codeContent);
    } else {
      var processedText = segment
        .replace(/\n/g, "<br>")
        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/ /g, "&nbsp;");
      var textNode = document.createElement("span");
      textNode.innerHTML = processedText;
      textElement.appendChild(textNode);
    }
  });

  msgElement.appendChild(textElement);
  chatBox.appendChild(msgElement);
  // scroll to start of msgElement in chat-box
  msgElement.scrollIntoView();

}

function displayAgentTyping() {
  var chatBox = document.getElementById("chat-box");
  var typingElement = document.createElement("div");
  typingElement.classList.add("typing-indicator");
  typingElement.textContent = "Agent is typing...";
  typingElement.id = "typing-indicator";
  chatBox.appendChild(typingElement);
  // scroll to beginning of typingElement in chat-box
  typingElement.scrollIntoView();
}

function removeAgentTyping() {
  var typingIndicator = document.getElementById("typing-indicator");
  if (typingIndicator) {
    typingIndicator.remove();
  }
}


function displayAgentMessage(message) {
  var chatBox = document.getElementById("chat-box");
  var msgElement = document.createElement("div");
  msgElement.classList.add("message");
  msgElement.style.backgroundColor = '#f0f0f0';
  // Make msgElement a flex row container.

  var headerElement = document.createElement('div');
  headerElement.style.display = "flex";
  headerElement.style.alignItems = "center";
  // Add in image.
  var imageElement = document.createElement('img');
  imageElement.src = './static/chatbot_icon.png';
  imageElement.style.width = "30px";
  imageElement.style.height = "30px";

  headerElement.appendChild(imageElement);

  // Add in name of agent
  var nameElement = document.createElement('div');
  nameElement.textContent = 'Chatbot';
  nameElement.style.fontWeight = "bold";
  nameElement.style.paddingLeft = "3px";
  headerElement.appendChild(nameElement);

  msgElement.append(headerElement);

  hljs.configure({
    decodeEntities: true,
    ignoreUnescapedHTML: true,
    languages: ["python"],
  });
  // Split message into code and non-code segments
  var segments = message.split(/(\\begin\{code\}|\\end\{code\})/);
  var inCodeBlock = false;

  // Create a div for the actual text.

  var textElement = document.createElement('div');
  textElement.style.paddingLeft = "35px";
  textElement.style.paddingRight = "35px";
  textElement.style.whiteSpace = "normal";
  textElement.classList.add("text-elem");

  segments.forEach((segment) => {
    if (segment === "\\begin{code}") {
      inCodeBlock = true;
      var codeBlock = document.createElement("pre");
      codeBlock.classList.add("hljs");
      codeBlock.style.backgroundColor = '#f0f0f0';
      textElement.appendChild(codeBlock);
    } else if (segment === "\\end{code}") {
      inCodeBlock = false;
    } else if (inCodeBlock) {
      var codeContent = document.createElement("code");
      codeContent.style.backgroundColor = "white";
      codeContent.textContent = segment;
      hljs.highlightElement(codeContent);
      textElement.lastChild.appendChild(codeContent);
      addCopyButton(textElement.lastChild);
    } else {
      var processedText = segment
        .replace(/\n/g, "<br>")
        .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
        .replace(/ /g, "&nbsp;");
      var textNode = document.createElement("span");
      textNode.innerHTML = processedText;
      textElement.appendChild(textNode);
    }
  });

  msgElement.appendChild(textElement);

  chatBox.appendChild(msgElement);
}

function addCopyButton(preElement) {
  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.classList.add("copy-button");
  preElement.insertBefore(copyButton, preElement.firstChild);

  copyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(preElement.querySelector("code").textContent + "​")
      .then(() => {
        copyButton.textContent = "Copied!";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1000);
      })
      .catch((err) => console.error("Failed to copy text: ", err));
  });
}

var userInput = document.getElementById("user-input");

userInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    document.getElementById("send-button").click();
  }
});

userInput.addEventListener("paste", (e) => {
  var clipboardData = e.clipboardData || window.clipboardData;
  var pastedData = clipboardData.getData('Text');
/*   if (pastedData.slice(-1) != "​") {
    alert("Do not paste data from outside of the application.");
    e.preventDefault();
  } */
})


