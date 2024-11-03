import React, { Dispatch, SetStateAction } from "react";
import { MessageData, ProactiveMessageData } from "./Message";
import Message from "./Message";
import { useEffect, useRef } from "react";

import { useState, useCallback } from 'react'


interface ChatWindowProps {
  messages: MessageData[];
  awaitingResponse: boolean;
  clearChat: () => void;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIIndex: number;
  proactive: boolean;
  proactive_delete_time: number;
  chatRef: any;
  awaitingSuggestions: boolean
  actualEditorRef: any
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  awaitingResponse,
  clearChat,
  setTelemetry,
  task_index,
  messageAIIndex,
  proactive,
  proactive_delete_time,
  chatRef,
  awaitingSuggestions,
  actualEditorRef
}) => {
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Function to scroll the chat container to the bottom
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  const [messageLen, setMessageLen] = useState(0);
  
  useEffect(() => {
    if (chatContainerRef.current != null && messages.length === 0) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.clientHeight;
    } else if (messages.length <= messageLen) {
      console.log("message deleted, not scroll", messageLen, messages.length);
    }
    else {
      scrollToBottom(); 
    }
    setMessageLen(messages.length);
  }, [messages]);

  const textCopy = useCallback(async (event: any) => {
    const selection = window.getSelection();
    let selectedText: null | string = null;
    if (selection != null) {
      selectedText = selection.toString();
    }

    if (selectedText) {
      // Text is selected and copied
      // navigator.clipboard.writeText(selectedText);
      // Push the data to telemetry
      console.log('ho', selectedText);
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

  }, []);

  return (
    <>
      <div className="flex text-center items-center align-middle">
        <button
          id="clear-chat"
          onClick={clearChat}
        >
          Clear
        </button>
        {proactive && <button
          id="get-suggestion"
          onClick={() => chatRef.current.getProactiveSuggestions({manual: true})}
        >
          Suggest
        </button>}
      </div>
      <div
        className="h-full flex flex-col px-3 overflow-auto"
        ref={chatContainerRef}
        // onCopy={textCopy}
      >
        {messages.map((message, index) => (
          <Message
            // key={index}
            msg={message}
            text={message.text}
            sender={message.sender}
            setTelemetry={setTelemetry}
            task_index={task_index}
            messageAIIndex={messageAIIndex}
            proactiveResponse={message.proactiveResponse || []}
            chatRef={chatRef}
            keep={message.keep || false}
            notify={message.notify || false}
            proactive_delete_time={proactive_delete_time}
            chatWindowRef={chatContainerRef}
            actualEditorRef={actualEditorRef}
            proactive={proactive}
          />
        ))}
        {awaitingResponse ? <div className="text-xs">Awaiting chatbot response</div> : null}
        {awaitingSuggestions ? <div className="text-xs">Awaiting agent suggestions</div> : null}
      </div>
    </>
  );
};

export default ChatWindow;
