import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Bubble from "./Bubble";


export interface ProactiveMessageData {
  short_text: string;
  full_text: string;
}

export interface MessageData {
  text: string;
  sender: "user" | "bot";
  proactiveResponse?: ProactiveMessageData[];
  messageAIIndex?: number;
  keep?: boolean;
  notify?: boolean;
  hash?: string;
}

export interface MessageProps {
  msg: MessageData;
  text: string;
  sender: "user" | "bot";
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIIndex: number;
  proactiveResponse: ProactiveMessageData[];
  chatRef: any;
  keep: boolean;
  notify: boolean;
  proactive_delete_time: number;
  chatWindowRef: any;
  actualEditorRef: any;
  proactive: boolean;
}

const Message: React.FC<MessageProps> = ({
  msg,
  text,
  sender,
  setTelemetry,
  task_index,
  messageAIIndex,
  proactiveResponse,
  chatRef,
  keep,
  notify,
  proactive_delete_time,
  chatWindowRef,
  actualEditorRef,
  proactive
}) => {
  // Add in a loading bubble conditionally.
  return (
    <div className="flex justify-start">
      <Bubble
        msg={msg}
        text={text}
        sender={sender}
        setTelemetry={setTelemetry}
        task_index={task_index}
        messageAIindex={messageAIIndex}
        proactiveResponse={proactiveResponse}
        chatRef={chatRef}
        keep={keep}
        notify={notify}
        proactive_delete_time={proactive_delete_time}
        chatWindowRef={chatWindowRef}
        actualEditorRef={actualEditorRef}
        proactive={proactive}
      />
    </div>
  );
};

export default Message;

{
  /* <div className={sender === 'user' ? "flex justify-end" : "flex justify-start"}>
<Bubble text={text} sender={sender}/>

</div> */
}
