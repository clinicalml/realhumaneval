import React, { Dispatch, SetStateAction } from "react";
import Bubble from "./Bubble";

export interface MessageData {
  text: string;
  sender: "user" | "bot";
}

export interface MessageProps {
  text: string;
  sender: "user" | "bot";
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIIndex: number;
}

const Message: React.FC<MessageProps> = ({
  text,
  sender,
  setTelemetry,
  task_index,
  messageAIIndex,
}) => {
  // Add in a loading bubble conditionally.
  return (
    <div className="flex justify-start">
      <Bubble
        text={text}
        sender={sender}
        setTelemetry={setTelemetry}
        task_index={task_index}
        messageAIindex={messageAIIndex}
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
