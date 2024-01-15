/* TODO:
button to clear chat. at the top of chat container
styling: no horizontal seperators for messages
add Agent and user icons to left of message at the start of message
overflow text horizontally should wrap around for text
grey background color - change user and agent color a bit
input textarea resize to max height after entering new line
align send button with input text area (use symbol instead of text for send and cancel)
only enable pasting to text area if from editor or from previous chats
enable selection in messages to copy
make chat container resizable horizontally
 */
document.getElementById("send-button").addEventListener("click", function () {
  // TODO: MOVE SCROLL TO THE BOTTOM ON SUBMIT
  var button = document.getElementById("send-button");
  var userInput = document.getElementById("user-input");
  var message = userInput.value.trim();
  button.innerHTML = '📤 Send';

  if (button.textContent === "Cancel") {
    clearTimeout(typingTimeout);
    removeAgentTyping();
    userInput.disabled = false;
    button.textContent = '📤 Send';
  } else if (message) {
    userInput.value = "";
    userInput.disabled = false;
    displayUserMessage(message);

    // Display typing indicator
    displayAgentTyping();
    button.textContent = "✖ Cancel";

    typingTimeout = setTimeout(function () {
      displayAgentMessage(message);
      userInput.disabled = false;
      removeAgentTyping();
      button.textContent = '📤 Send';
    }, 2000); // Adjusted back to 2000ms for a realistic delay
  }
});

document.getElementById("clear-chat").addEventListener("click", function () {
  let chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";
});

/* function displayUserMessage(message) {
  var chatBox = document.getElementById("chat-box");
  var msgElement = document.createElement("div");
  msgElement.classList.add("message");
  msgElement.textContent = message;
  var formattedMessage = message.replace(/\n/g, "<br>");
  // also handle tabs
  formattedMessage = formattedMessage.replace(
    /\t/g,
    "&nbsp;&nbsp;&nbsp;&nbsp;"
  );
  formattedMessage = formattedMessage.replace(/ /g, "&nbsp;");
  msgElement.innerHTML = formattedMessage;
  //msgElement.innerHTML = marked.parse(formattedMessage);

  chatBox.appendChild(msgElement);
} */

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
  imageElement.src = './user_icon.png';
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
}

function displayAgentTyping() {
  var chatBox = document.getElementById("chat-box");
  var typingElement = document.createElement("div");
  typingElement.classList.add("typing-indicator");
  typingElement.textContent = "Agent is typing...";
  typingElement.id = "typing-indicator";
  chatBox.appendChild(typingElement);
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
  imageElement.src = './chatbot_icon.png';
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
  if (pastedData.slice(-1) != "​") {
    alert("Do not paste data from outside of the application.");
    e.preventDefault();
  }
})


