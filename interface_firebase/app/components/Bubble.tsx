import React, { useState, Dispatch, SetStateAction } from "react";
import classNames from "classnames";

import CodeBlock from "./CodeBlock";
import Markdown from "react-markdown";
import { CopyBlock, nord } from "react-code-blocks";
// import { dotPulse } from 'ldrs'

// dotPulse.register()

interface BubbleProps {
  text: string;
  sender: string;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIindex: number;
}

export const md_regex_pattern: RegExp = /(```[\s\S]*?```)/g;

const Bubble: React.FC<BubbleProps> = ({
  text,
  sender,
  setTelemetry,
  task_index,
  messageAIindex,
}) => {
  // Look through string to find markdown parts.
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(true);

  const handleFeedback = (type: string) => {
    console.log(`${type} feedback received`);
    // Update telemetry or perform other actions here
    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "chat_feedback",
        task_index: task_index,
        feedback: type,
        messageAIindex: messageAIindex,
        timestamp: Date.now(),
      },
    ]);
    // hide the buttons

    setShowFeedbackButtons(false);

  };

  const handleCopy = async (event: any) => {
    let copyText = await navigator.clipboard.readText();
    console.log(event);

    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "copy_code",
        task_index: task_index,
        copied_text: copyText,
        response: text, // FIXME:
        messageAIindex: messageAIindex,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div
      className={classNames(
        "py-2 pr-3 rounded-lg justify-center items-center overflow-auto whitespace-pre-wrap w-full"
      )}
    >
      <div className="flex flex-row ">
        <img
          id="sender_icon"
          src={sender === "user" ? "/user_icon.png" : "/chatbot_icon.png"}
          className="h-8 w-8 mr-3"
        ></img>

        <div>
          <b>{sender === "user" ? "You\n" : "Coding Assistant\n"}</b>
          {text.split(md_regex_pattern).map((txt, index) => {
            if (
              txt.length > 6 &&
              txt.charAt(0) == "`" &&
              txt.charAt(1) == "`" &&
              txt.charAt(2) == "`" &&
              txt.charAt(txt.length - 1) == "`" &&
              txt.charAt(txt.length - 2) == "`" &&
              txt.charAt(txt.length - 3) == "`"
            ) {
              return (
                <CopyBlock
                  text={txt.slice(3, txt.length - 3)}
                  language={"python"}
                  showLineNumbers={true}
                  theme={nord}
                  onCopy={handleCopy}
                  key={index}
                />
              );
            } else {
              return txt;
            }
          })}
        </div>
      </div>
      {sender === "bot" && showFeedbackButtons && (
        <div className="flex justify-end mt-2">
          <button onClick={() => handleFeedback("thumbs_up")} className="mr-2">
            👍
          </button>
          <button onClick={() => handleFeedback("thumbs_down")}>
            👎
          </button>
        </div>
      )}
      {/* {sender === "bot" && text === "Generating response " && 
      <l-dot-pulse
        size="40"
        speed="1.3" 
        color="black" 
      ></l-dot-pulse>}  FIX WEB COMPONENT LOADING IN. */}
    </div>
  );
};

export default Bubble;
