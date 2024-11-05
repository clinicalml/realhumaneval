"use client";
import { useState, Dispatch, SetStateAction } from "react";
import { API_URL } from "./constants";
// import Message from "./Message";
import { MessageData } from "./Message";
import "../style.css";
import ChatWindow from "./ChatWindow";
import { useEffect, useRef } from "react";
import TextInput from "./TextInput";
import { send } from "process";
import {
  get_openai_chat_response,
  get_chat_together,
} from "../functions/cloud_functions_helper";

import { loadlocalstorage, loadTaskData } from "../functions/task_logic";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { Message } from "postcss";
import { getAIResponse } from "../functions/chat_logic";

interface ChatProps {
  theme: string;
  code: string;
  setCode: (code: string) => void;
  awaitingResponse: boolean;
  setAwaitingResponse: (awaitingResponse: boolean) => void;
  taskId: string;
  setTaskId: (taskId: string) => void;
  responseId: string;
  setResponseId: (responseId: string) => void;
  expCondition: string;
  setExpCondition: (expCondition: string) => void;
  workerId: string;
  setWorkerId: (workerId: string) => void;
  inputValue: string;
  setInputValue: (inputValue: string) => void;
  model: string;
  // chatHistory: Array<Record<string, string>>;
  max_tokens_task: number;
  messages: MessageData[];
  setMessages: Dispatch<SetStateAction<MessageData[]>>;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  setChatHistory: Dispatch<SetStateAction<any[]>>;
  chatHistory: any[];
  messageAIIndex: number;
  setMessageAIIndex: Dispatch<SetStateAction<number>>;
  logprob: any;
  setChatLogProbs: Dispatch<SetStateAction<any>>;
  modelChat: string;
}

const Chat: React.FC<ChatProps> = ({
  theme,
  code,
  setCode,
  awaitingResponse,
  setAwaitingResponse,
  taskId,
  setTaskId,
  responseId,
  setResponseId,
  expCondition,
  setExpCondition,
  workerId,
  setWorkerId,
  inputValue,
  setInputValue,
  model,
  max_tokens_task,
  messages,
  setMessages,
  setTelemetry,
  task_index,
  setChatHistory,
  chatHistory,
  messageAIIndex,
  setMessageAIIndex,
  logprob,
  setChatLogProbs,
  modelChat,
}) => {
  // Use a ref to get the new value of awaitingResponse
  const awaitingRef = useRef(awaitingResponse);

  let interval_time_savecode = 20000;

  useEffect(() => {
    awaitingRef.current = awaitingResponse;
  }, [awaitingResponse]);

  // Function to handle change.

  async function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(event.target.value);
  }

  async function handleKeydown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  }

  async function submitMessage() {
    console.log("Submitting message");
    if (awaitingResponse) {
      setAwaitingResponse(false);

      setTelemetry((prevTelemetry: any[]) => {
        return [
          ...prevTelemetry,
          {
            event_type: "cancel_request",
            task_index: task_index,
            message: messages[messages.length - 1].text, // Last message text
            timestamp: Date.now(),
          },
        ];
      });
      return;
    }


    // make sure prevMessages is not empty

    setMessages((prevMessages: MessageData[]) => {
      return [
        ...prevMessages,
        { text: inputValue, sender: "user" } as MessageData,
      ]; // { text: inputValue, sender: "user" }];
    });

    setTelemetry((prevTelemetry: any[]) => {
      return [
        ...prevTelemetry,
        {
          event_type: "user_message",
          task_index: task_index,
          message: inputValue,
          timestamp: Date.now(),
        },
      ];
    });

    setChatHistory((prevChatHistory) => {
      return [...prevChatHistory, { role: "user", content: inputValue }];
    });

    setAwaitingResponse(true);
    awaitingRef.current = true;

    console.log(modelChat);
    let response = "";
    if (modelChat == "Off") {
      response = "Chat Model has been disabled.";
    }
    else if (modelChat == "gpt-3.5-turbo" || modelChat == "gpt-4-turbo") 
      {
        response = await get_openai_chat_response(modelChat,
          [...chatHistory, { role: "user", content: inputValue }],
          512,
          setChatLogProbs
        );
    }
    else {

      response = await get_chat_together(modelChat,
        [...chatHistory, { role: "user", content: inputValue }],
        512,
        setChatLogProbs
      );
    }
    setInputValue("");

    // Return "Dummy response for development ```def foo(bar): ```" after 5 seconds.

    //await new Promise((resolve) => setTimeout(resolve, 5000));
    //let response = "Dummy response for development ```def foo(bar): ```";

    if (response != null && awaitingRef.current) {
      setMessages((prevMessages) => {
        return [...prevMessages, { text: response, sender: "bot" }];
      });

      let currChatHistory: any = null;
      setChatHistory((prevChatHistory) => {
        currChatHistory = prevChatHistory;
        return [...prevChatHistory, { role: "assistant", content: response }];
      });

      setTelemetry((prevTelemetry) => {
        return [
          ...prevTelemetry,
          {
            event_type: "assistant_response",
            task_index: task_index,
            chatHistory: currChatHistory,
            response: response,
            logprob: logprob,
            timestamp: Date.now(),
            messageAIIndex: messageAIIndex,
          },
        ];
      });

      setMessageAIIndex((prevMessageAIIndex) => prevMessageAIIndex + 1);

      // Update AI response idx,
    }
    setAwaitingResponse(false);
  }

  async function clearChat() {
    setMessages([]);
    setChatHistory([{ role: "system", content: "Help with programming Python" }]);
    setAwaitingResponse(false);

    setTelemetry((prevTelemetry) => {
      return [
        ...prevTelemetry,
        {
          event_type: "clear_chat",
          task_index: task_index,
          timestamp: Date.now(),
        },
      ];
    });
  }

  return (
    <>
      <div className="flex flex-col h-full w-full">
        <ChatWindow
          messages={messages}
          awaitingResponse={awaitingResponse}
          clearChat={clearChat}
          setTelemetry={setTelemetry}
          task_index={task_index}
          messageAIIndex={messageAIIndex}
        />
        <TextInput
          onChange={handleChange}
          submitMessage={submitMessage}
          onKeyDown={handleKeydown}
          text_value={inputValue}
          awaitingResponse={awaitingResponse}
        />
      </div>
    </>
  );
};

export default Chat;
