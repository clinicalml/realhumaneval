import React, { useState, Dispatch, SetStateAction, useEffect, useCallback, useRef } from "react";
import classNames from "classnames";
import { ProactiveMessageData } from "./Message";

import CodeBlock from "./CodeBlock";
import Markdown from "react-markdown";
import { CopyBlock, nord, shadesOfPurple, atomOneDark } from "react-code-blocks";

import { trackProactiveInteraction } from "../functions/telemetry";
// import { dotPulse } from 'ldrs'

// dotPulse.register()

interface BubbleProps {
  msg: any;
  text: string;
  sender: string;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  task_index: number;
  messageAIindex: number;
  proactiveResponse: ProactiveMessageData[];
  chatRef: any;
  keep: boolean;
  notify: boolean;
  proactive_delete_time: number;
  chatWindowRef: any;
  actualEditorRef: any;
  proactive: boolean;
}

export const md_regex_pattern: RegExp = /(```[\s\S]*?```)/g;
const check_has_code = (text: string) => {
  return text.split(md_regex_pattern).length > 1;
}

const Bubble: React.FC<BubbleProps> = ({
  msg,
  text,
  sender,
  setTelemetry,
  task_index,
  messageAIindex,
  proactiveResponse,
  chatRef,
  keep,
  notify,
  proactive_delete_time,
  chatWindowRef,
  actualEditorRef,
  proactive
}) => {
  // Look through string to find markdown parts.
  const [showFeedbackButtons, setShowFeedbackButtons] = useState(true);
  const [showProactiveButtons, setShowProactiveButtons] = useState(proactiveResponse.length ? true : false);
  const [textString, setTextString] = useState(text);
  const [clickState, setClickState] = useState(Array(proactiveResponse.length).fill(false));
  const [isNew, setIsNew] = useState(notify);
  const [id, setID] = useState(messageAIindex);
  const [currOption, setCurrOption] = useState(0);
  const [isOpen, setIsOpen] = useState(Array(proactiveResponse.length).fill(false));
  const [previewButtonText, setPreviewButtonText] = useState("Preview");
  const [previewButtonTextRegular, setPreviewButtonTextRegular] = useState("Preview");

  var delete_timer: any = null;

  const setDelete = useCallback(() => {
    // if (delete_timer) {
    //     clearTimeout(delete_timer);
    //     delete_timer = null;
    // }
    if (msg.hash) {
      chatRef.current.deleteMessage(msg.hash, true, -1);
      console.log('deleting message', msg.hash);
    }
    actualEditorRef.current.clearDiffEditor();
  }, [msg.hash]);

  const startDeleteTimer = useCallback(() => {
    if (delete_timer) {
      clearTimeout(delete_timer);
    }
    delete_timer = setTimeout(setDelete, proactive_delete_time);
    console.log('Throttle started');
  }, [proactive_delete_time]);

  useEffect(() => {
    if (proactiveResponse.length > 0) {
      setShowProactiveButtons(true);
      setClickState(Array(proactiveResponse.length).fill(false));
      setIsOpen(Array(proactiveResponse.length).fill(false));
      setIsNew(notify);
      startDeleteTimer();
    } else {
      setShowProactiveButtons(false);
    }
  }, [proactiveResponse]);

  useEffect(() => {
    if (!proactiveResponse.length) {
      console.log("empty message");
      setTextString(msg.text);
    }
    setShowFeedbackButtons(!showFeedbackButtons);
  }, [msg]);

  useEffect(() => {
    setIsNew(!keep);
  }, [keep]);

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
    // let copyText = await navigator.clipboard.readText();
    console.log('copy outside');

    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "copy_code",
        task_index: task_index,
        message: text,
        timestamp: Date.now(),
      },
    ]);
  };

  const textBlock = (text: string, copy_fn: any = handleCopy) => {
    return (text.split(md_regex_pattern).map((txt, index) => {
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
          <div onCopy={copy_fn}>
            <CopyBlock
              text={txt.slice(3, txt.length - 3).replace(/^python\n/, '')}
              language={"python"}
              showLineNumbers={true}
              // theme={shadesOfPurple}
              // theme={a11yDark}
              theme={atomOneDark}
              onCopy={copy_fn}
              key={index}
              customStyle={{ overflowX: "auto", fontSize: "0.8em", lineHeight: "1em", margin: "1em 0" }}
            />
          </div>
        );
      } else {
        return <Markdown key={index}>{txt}</Markdown>;
      }
    }));
  }

  const handlePreviewRegular = async () => {
    console.log("Preview button clicked");
    actualEditorRef.current.clearDiffEditor();
    setPreviewButtonTextRegular("Preview Loading...");
    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "preview_code_integration",
        task_index: task_index,
        message: msg.text,
        // message_hash: msg.hash,
        timestamp: Date.now(),
      },
    ]);
    chatRef.current.cancelProactiveSuggestions();
    chatRef.current.startThrottle();
    try {
      await chatRef.current.previewMessage(msg.hash, -1, msg.text);
      setPreviewButtonTextRegular("Preview");
    } catch (error) {
      console.error("Error during preview:", error);
      setPreviewButtonTextRegular("Preview");
    }
  }

  const ProactiveSuggestions = () => {

    const handleButtonClick = (item: ProactiveMessageData, index: number) => {
      console.log(`Button ${index + 1} clicked: ${item}`);
      setIsNew(false);
      setShowProactiveButtons(false);
      setTextString(item.full_text);
      setCurrOption(index);
      setClickState(clickState.map((value, i) => i === index ? true : value));

      startDeleteTimer();
      chatRef.current.updateMessageKeep(msg.hash);
      chatRef.current.startThrottle();
    };

    const handleBackClick = () => {
      console.log("Back button clicked");
      setShowProactiveButtons(true);
      setTextString("");
      startDeleteTimer();
      chatRef.current.startThrottle();
    }

    const handleRefresh = async () => {
      console.log("Refreshing proactive suggestions", chatRef.current);
      setClickState(Array(proactiveResponse.length).fill(true));
      setIsNew(false);
      const suggestions = await chatRef.current.getProactiveSuggestions({ id: id, manual: true });
      console.log("done");
      setShowProactiveButtons(true);
      setClickState(Array(proactiveResponse.length).fill(false));
      setTextString("");
    }

    const handlePreview = async (index: number) => {
      console.log("Preview button clicked");
      actualEditorRef.current.clearDiffEditor();

      setPreviewButtonText("Preview Loading...");
      trackProactiveInteraction(setTelemetry, "preview", index, proactiveResponse[index], task_index, msg.hash);
      chatRef.current.cancelProactiveSuggestions();
      chatRef.current.startThrottle();
      startDeleteTimer();
      try {
        await  chatRef.current.previewMessage(msg.hash, index, proactiveResponse[index].full_text);
        setPreviewButtonText("Preview");
      } catch (error) {
        console.error("Error during preview:", error);
        setPreviewButtonText("Preview");
      }
    }

    const handleAccept = (index: number) => {
      console.log("Accept button clicked");
      trackProactiveInteraction(setTelemetry, "accept", index, proactiveResponse[index], task_index, msg.hash);
      chatRef.current.cancelProactiveSuggestions();
      chatRef.current.startThrottle();
      chatRef.current.acceptMessage(msg.hash, index, proactiveResponse[index].full_text);
      startDeleteTimer();
    }

    const handleDelete = (all: boolean, index: number) => {
      console.log("Delete button clicked");
      if (all) trackProactiveInteraction(setTelemetry, "clear all", null, null, task_index, msg.hash);
      else trackProactiveInteraction(setTelemetry, "delete", index, proactiveResponse[index], task_index, msg.hash);
      chatRef.current.startThrottle();
      chatRef.current.deleteMessage(msg.hash, all, index);
      chatRef.current.cancelProactiveSuggestions();
      actualEditorRef.current.clearDiffEditor();
      startDeleteTimer();
    }

    const handleProactiveCopy = (index: number) => {
      console.log("Copy button clicked");
      trackProactiveInteraction(setTelemetry, "copy", index, proactiveResponse[index], task_index, msg.hash);
      startDeleteTimer();
      chatRef.current.startThrottle();
      chatRef.current.cancelProactiveSuggestions();
    }

    const toggleCollapsible = (index: number) => {
      console.log("Collapsible clicked");
      trackProactiveInteraction(setTelemetry, "expand", index, proactiveResponse[index], task_index, msg.hash);
      setIsOpen(isOpen.map((value, i) => i === index ? !value : false));
      setIsNew(false);
      actualEditorRef.current.clearDiffEditor();

      startDeleteTimer();
      chatRef.current.startThrottle();
      chatRef.current.cancelProactiveSuggestions();
      chatRef.current.updateMessageKeep(msg.hash);

      // chatWindowRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      setTimeout(() => {
        // const element = document.getElementById("chat-window");
        // console.log(element)
        // if (element) {
        //     element.scrollIntoView({ behavior: 'smooth' });
        // }
        // chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        const element = document.getElementsByClassName("collapsible-button")[index];
        console.log(chatWindowRef.current.scrollHeight, chatWindowRef.current.offsetHeight, chatWindowRef.current.scrollTop,
          chatWindowRef.current.getBoundingClientRect(), element.getBoundingClientRect()
        );


        // const boundingRect = chatWindowRef.current.getBoundingClientRect();
        // // const scrollPosition = chatWindowRef.current.scrollHeight + boundingRect.top - boundingRect.height / 2;
        // const containerHeight = chatWindowRef.current.clientHeight;
        // const contentHeight = chatWindowRef.current.scrollHeight;
        // const scrollPosition = contentHeight - containerHeight / 2;
        // chatWindowRef.current.scrollTo({ top: scrollPosition, behavior: 'smooth' });

        chatWindowRef.current.scrollTo({ top: chatWindowRef.current.scrollHeight - chatWindowRef.current.clientHeight, behavior: 'smooth' });
      }, 50);
      // setTimeout(() => {contentRef.current.scrollIntoView({ behavior: 'smooth' });}, 300);
      // if (contentRef.current) {
      //   contentRef.current.scrollTop =
      //     contentRef.current.scrollHeight;
      // }

    };

    const collapsible = (item: any, index: number) => {
      const contentRef = useRef(null);

      return (
        <React.Fragment key={index} >
          <button
            id={clickState[index] ? "clicked" : "unclicked"}
            onClick={() => toggleCollapsible(index)}
            className="collapsible-button"
            ref={contentRef}
          >
            <span className={`triangle ${isOpen[index] ? 'open' : ''}`}>▶</span>
            <Markdown>{item.short_text}</Markdown>
          </button>
          <div
            className={`collapsible-content ${isOpen[index] ? 'open' : ''}`}
            // style={{ maxHeight: isOpen ? `${contentRef.current.scrollHeight}px` : '0px' }}
            style={{ maxHeight: isOpen[index] ? `100%` : '0px', }}
          >
            {textBlock(item.full_text, () => handleProactiveCopy(index))}
            <div className="flex justify-end mt-2">
              {check_has_code(item.full_text) && <button onClick={() => handlePreview(index)}>
                {previewButtonText}
              </button>}
              <button onClick={() => handleAccept(index)}>
                Accept
              </button>
              <button onClick={() => handleDelete(false, index)}>
                Delete
              </button>
            </div>
          </div>

        </React.Fragment>
      );

    }

    return (
      <div className="proactive-chat" style={{ overflowX: "hidden", borderRadius: "0" }}>
        <b>Suggestions</b>
        {isNew && <span id="notif">New</span>}
        {/* {isNew ? <p>Click on a suggestion to view the full response</p> : null} */}
        {proactiveResponse.map((item, index) => collapsible(item, index))}
        {/* {showProactiveButtons ? (proactiveResponse.map((item, index) => (
          <button id={clickState[index] ? "clicked" : "unclicked"} key={index} onClick={() => handleButtonClick(item, index)}>
            <Markdown>{item.short_text}</Markdown>
          </button>
          ))) : (<div> {textBlock(textString)}</div>)
        } */}
        {<div className="flex justify-end mt-2">
          {/* {!showProactiveButtons && <button onClick={() => handleAccept(currOption)}>
              ✅
            </button>} */}
          {isOpen.every(v => !v) && <button onClick={() => handleDelete(showProactiveButtons, currOption)}>
            Clear all
          </button>}
          {/* {!showProactiveButtons && <button onClick={() => handleBackClick()}>
              &#x2190;
            </button>} */}
          {/* <button onClick={() => handleRefresh()}>
              &#8635;
            </button> */}
          {/* <button onClick={() => handleFeedback("thumbs_up")} className="mr-2">
              👍
            </button>
            <button onClick={() => handleFeedback("thumbs_down")}>
              👎
            </button> */}
        </div>
        }
      </div>
    );
  };

  if (!proactiveResponse.length && textString.length === 0) {
    return null;
  }
  return (sender === "user" ? (
    <div
      className={classNames(
        "text-xs py-2 pl-10 pr-0 rounded-none justify-end float-right items-center whitespace-pre-wrap w-full"
      )}
    >
      <div
        className="flex flex-row mt-2 justify-end float-right">
        <div className="user-message">
          {/* <b  style={{lineHeight: "1.5em"}}>{"You\n"}</b> */}
          <Markdown>{textString}</Markdown></div>
        {/* <div > */}
        <img
          id="sender_icon"
          src="/user_icon.png"
          className="h-8 w-8 ml-3 invert"
        ></img>

      </div>
      {/* </div> */}
    </div>
  ) : (
    <div
      className={classNames(
        "text-xs py-2 pr-3 rounded-none justify-center items-center overflow-auto whitespace-pre-wrap w-full"
      )}
    >
      <div
        className="flex flex-row justify-stretch mt-2"
        id={isNew && proactiveResponse.length ? "new-message" : ""}
      >
        <img
          id="sender_icon"
          src={sender === "user" ? "/user_icon.png" : "/chatbot_icon.png"}
          className="h-8 w-8 mr-3 invert"
        ></img>
        {proactiveResponse.length ? (
          <ProactiveSuggestions
          />
        ) : (
          <div style={{ overflowX: "hidden", borderRadius: "0" }}>
            {/* <b>{sender === "user" ? "You\n" : "Coding Assistant\n"}</b> */}
            {textBlock(textString)}
            <div className="flex justify-end mt-2">
              {proactive && check_has_code(msg.text) && <button onClick={handlePreviewRegular}>
                {previewButtonTextRegular}
              </button>}
            </div>
            {/* {sender === "bot" && showFeedbackButtons && (
          <div className="flex justify-end mt-2">
            <button onClick={() => handleFeedback("thumbs_up")} className="mr-2">
              👍
            </button>
            <button onClick={() => handleFeedback("thumbs_down")}>
              👎
            </button>
          </div>
        )} */}
            {/* {sender === "bot" && text === "Generating response " && 
        <l-dot-pulse
          size="40"
          speed="1.3" 
          color="black" 
        ></l-dot-pulse>}  FIX WEB COMPONENT LOADING IN. */}
          </div>
        )}
      </div>
    </div>
  ));
};

export default Bubble;
