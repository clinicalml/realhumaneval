var chatHistory = [];
var chatBox = document.getElementById("chat-box");
var messageAIindex = 0;


function getAIResponse(model, chatHistory, max_tokens_task) {
  switch (model) {
      case "gpt-3.5-turbo":
          return get_openai_chat_response("gpt-3.5-turbo", chatHistory, max_tokens_task);
      case "CodeLlama-34b":
          return get_chat_together("togethercomputer/CodeLlama-34b-Instruct", chatHistory, max_tokens_task);
      case "CodeLlama-7b":
        return get_chat_together("togethercomputer/CodeLlama-7b-Instruct", chatHistory, max_tokens_task);
      default:
        return get_chat_together("togethercomputer/CodeLlama-34b-Instruct", chatHistory, max_tokens_task);
      }
}


document.getElementById("send-button").addEventListener("click", function () {
  // TODO: MOVE SCROLL TO THE BOTTOM ON SUBMIT
  var button = document.getElementById("send-button");
  var userInput = document.getElementById("user-input");
  var message = userInput.value.trim();
  button.innerHTML = "📤";

  if (button.textContent === "✖") {
    clearTimeout(typingTimeout);
    removeAgentTyping();

    button.textContent = "📤";
  } else if (message) {
    userInput.value = "";
    displayUserMessage(message);

    // Track asking question
    telemetry_data.push({
      event_type: "user_message",
      task_index: task_index,
      message: message,
      timestamp: Date.now(),
    });

    chatHistory.push({ role: "user", content: message });
    // scroll to end of chat-box
    chatBox.scrollTop = chatBox.scrollHeight;
    // Display typing indicator
    displayAgentTyping();
    button.textContent = "✖";
    // REMOVE THESE TWO LINES LATER
    //model = "CodeLlama-34b-Instruct";
    //max_tokens_task = 200;

    getAIResponse(model, chatHistory, max_tokens_task)
      .then((response_string) => {
        if (button.textContent === "📤") {
          // user pressed cancel
          removeAgentTyping();
          button.textContent = "📤";
          // Track cancel
          telemetry_data.push({
            event_type: "cancel_request",
            task_index: task_index,
            message: message,
            timestamp: Date.now(),
          });

          return;
        }
        displayAgentMessage(response_string);
        chatHistory.push({ role: "assistant", content: response_string });

        // Track displaying/receiving msg
        telemetry_data.push({
          event_type: "assistant_response",
          task_index: task_index,
          chatHistory: chatHistory,
          response: response_string,
          logprobs: chat_logprobs,
          timestamp: Date.now(),
          messageAIindex: messageAIindex,
        });
        messageAIindex += 1;
        removeAgentTyping();
        button.textContent = "📤";
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

function clearChatFunction() {
  let chatBox = document.getElementById("chat-box");

  telemetry_data.push({
    event_type: "clear_chat",
    task_index: task_index,
    timestamp: Date.now(),
  });
  chatHistory = [];

  chatBox.innerHTML = "";
}
document.getElementById("clear-chat").addEventListener("click", clearChatFunction);


function displayUserMessage(message) {
  var chatBox = document.getElementById("chat-box");
  var msgElement = document.createElement("div");
  msgElement.classList.add("message");
  hljs.configure({
    decodeEntities: true,
    ignoreUnescapedHTML: true,
    languages: ["python"],
  });

  var headerElement = document.createElement("div");
  headerElement.style.display = "flex";
  headerElement.style.alignItems = "center";
  // Add in image.
  var imageElement = document.createElement("img");
  imageElement.src = "./static/user_icon.png";
  imageElement.style.width = "28px";
  imageElement.style.height = "28px";

  headerElement.appendChild(imageElement);

  // Add in name of agent
  var nameElement = document.createElement("div");
  nameElement.textContent = "User";
  nameElement.style.fontWeight = "bold";
  nameElement.style.paddingLeft = "5px";
  headerElement.appendChild(nameElement);

  msgElement.append(headerElement);

  var textElement = document.createElement("div");
  textElement.classList.add("text-elem");
  textElement.style.paddingLeft = "35px";
  textElement.style.paddingRight = "35px";
  textElement.style.whiteSpace = "normal";

  // Split message into code and non-code segments
  var segments = message.split(/(```)/);
  var inCodeBlock = false;

  segments.forEach((segment) => {
    if (segment === "```") {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        // Start a new code block
        var codeBlock = document.createElement("pre");
        codeBlock.classList.add("hljs");
        textElement.appendChild(codeBlock);
      }
    } else if (inCodeBlock) {
      // Inside a code block
      var codeContent = document.createElement("code");
      codeContent.textContent = segment;
      hljs.highlightElement(codeContent);
      textElement.lastChild.appendChild(codeContent);
    } else {
      // Regular text
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
  typingElement.textContent = "AI Chatbot is typing...";
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
  msgElement.style.backgroundColor = "#f0f0f0";
  // Make msgElement a flex row container.

  var headerElement = document.createElement("div");
  headerElement.style.display = "flex";
  headerElement.style.alignItems = "center";
  // Add in image.
  var imageElement = document.createElement("img");
  imageElement.src = "./static/chatbot_icon.png";
  imageElement.style.width = "30px";
  imageElement.style.height = "30px";

  headerElement.appendChild(imageElement);

  // Add in name of agent
  var nameElement = document.createElement("div");
  nameElement.textContent = "Chatbot";
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

  // Create a div for the actual text.

  var textElement = document.createElement("div");
  textElement.style.paddingLeft = "35px";
  textElement.style.paddingRight = "35px";
  textElement.style.whiteSpace = "normal";
  textElement.classList.add("text-elem");

  var segments = message.split(/(```)/);
  var inCodeBlock = false;

  segments.forEach((segment) => {
    if (segment === "```") {
      inCodeBlock = !inCodeBlock;
      if (inCodeBlock) {
        // Start a new code block
        var codeBlock = document.createElement("pre");
        codeBlock.classList.add("hljs");
        codeBlock.style.backgroundColor = "#f0f0f0";
        textElement.appendChild(codeBlock);
      }
    } else if (inCodeBlock) {
      // Inside a code block
      var codeContent = document.createElement("code");
      codeContent.style.backgroundColor = "white";
      // remove first line for gpt because it is the language of the segment
      if (model === "gpt-3.5-turbo") {
        var lines = segment.split('\n');
        lines.shift(); // Remove the first line
        segment = lines.join('\n');
      }
  

    
      codeContent.textContent = segment;
      hljs.highlightElement(codeContent);
      textElement.lastChild.appendChild(codeContent);
      addCopyButton(textElement.lastChild); // Assuming you have an addCopyButton function
    } else {
      // Regular text
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
  msgElement.scrollIntoView();
}

function addCopyButton(preElement) {
  const copyButton = document.createElement("button");
  copyButton.textContent = "Copy";
  copyButton.classList.add("copy-button");
  preElement.insertBefore(copyButton, preElement.firstChild);

  copyButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(preElement.querySelector("code").textContent)
      .then(() => {
        copyButton.textContent = "Copied!";
        // console.log(
        //   "Copied to clipboard: ",
        //   preElement.querySelector("code").textContent
        // );
        lastCopiedText = preElement.querySelector("code").textContent;
        // Track copy and what was copied
        telemetry_data.push({
          event_type: "copy_code",
          task_index: task_index,
          copied_text: preElement.querySelector("code").textContent,
          response: preElement.textContent,
          messageAIindex: messageAIindex,
          timestamp: Date.now(),
        });

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


const chatContainer = document.getElementById("chat-container");

chatContainer.addEventListener('copy', (event) => {
  const selection = window.getSelection();
  const selectedText = selection.toString();

  if (selectedText) {
      // Text is selected and copied
      // Push the data to telemetry
      telemetry_data.push({
          event_type: "copy_from_chat",
          task_index: task_index,
          messageAIindex: messageAIindex,
          copied_text: selectedText,
          timestamp: Date.now(),
      });
  }
});



/* chatContainer.addEventListener("copy", (event) => {
  // get the exact thing copied
  console.log(event);
  lastCopiedText =  event.target.textContent;
  console.log("Copied: ", lastCopiedText);
  telemetry_data.push({
    event_type: "copy_from_chat",
    task_index: task_index,
    messageAIindex: messageAIindex,
    copied_text: lastCopiedText,
    timestamp: Date.now(),
  });
});
 */
// on paste into editor log what was pasted
editor.on('paste', function(text) {
  telemetry_data.push({
    event_type: "paste_into_editor",
    task_index: task_index,
    messageAIindex: messageAIindex,
    copied_text: text.text,
    timestamp: Date.now(),
  });
}
);
