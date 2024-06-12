import React, { Dispatch, SetStateAction } from "react";
import { MessageData } from "./Message";
import Message from "./Message";
import { useEffect, useRef } from "react";

interface ChatWindowProps {
  messages: MessageData[];
  awaitingResponse: boolean;
  clearChat: () => void;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIIndex: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  awaitingResponse,
  clearChat,
  setTelemetry,
  task_index,
  messageAIIndex,
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Function to scroll the chat container to the bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (chatContainerRef.current != null && messages.length === 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.clientHeight;
      return;
    } else {
      scrollToBottom(); // Call the provided callback when messages change
    }
  }, [messages]);

  return (
    <>
      <button
        id="clear-chat"
        className="text-center items-center"
        onClick={clearChat}
      >
        Clear
      </button>
      <div
        className="h-full w-full flex flex-col px-3 overflow-auto"
        ref={chatContainerRef}
        onCopy={(event) => {
          const selection = window.getSelection();
          let selectedText: null | string = null;
          if (selection != null) {
            selectedText = selection.toString();
          }

          if (selectedText) {
            // Text is selected and copied
            // Push the data to telemetry
            setTelemetry((prev) => [
              ...prev,
              {
                event_type: "copy_from_chat",
                task_index: task_index,
                messageAIindex: messageAIIndex,
                copied_text: selectedText,
              },
            ]);
          }
        }}
        // Add in the copy here.
      >
        {messages.map((message, index) => (
          <Message
            key={index}
            text={message.text}
            sender={message.sender}
            setTelemetry={setTelemetry}
            task_index={task_index}
            messageAIIndex={messageAIIndex}
          />
        ))}
        {awaitingResponse ? "Awaiting chatbot response" : null}
      </div>
    </>
  );
};

export default ChatWindow;
