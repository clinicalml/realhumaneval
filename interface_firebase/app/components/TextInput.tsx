import React, { useEffect, useState, useRef } from "react";
import { md_regex_pattern } from "./Bubble";
import { CopyBlock, nord } from "react-code-blocks";
import { text } from "stream/consumers";

interface TextInputProps {
  text_value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  // Submit code is a button press
  submitMessage: () => void;
  awaitingResponse: boolean;
}

const TextInput: React.FC<TextInputProps> = ({
  text_value,
  onChange,
  onKeyDown,
  submitMessage,
  awaitingResponse,
}) => {
  const textareaRef: React.RefObject<HTMLTextAreaElement> = useRef(null);

  const maxTextareaHeight = 120;
  // Resize text area
  useEffect(() => {
    if (textareaRef.current) {
      if (text_value.trim() === "") {
        // Reset to default height if text is empty
        textareaRef.current.style.height = "40px";
      } else {
        const newHeight = Math.min(
          maxTextareaHeight,
          textareaRef.current.scrollHeight
        );
        textareaRef.current.style.height = `${newHeight}px`;
      }
    }
  }, [text_value]);

  return (
    <div className="flex flex-row w-full justify-around items-center">
      <textarea
        placeholder={"Send a message..."}
        value={text_value}
        ref={textareaRef}
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="p-2 m-2 text-sm overflow-y-auto resize-none border border-black flex-grow"
      ></textarea>
      <button
        className={awaitingResponse ? "h-10 w-20 bg-red-600" : "h-10 w-20"}
        onClick={submitMessage}
      >
        {awaitingResponse ? "✖" : "📤"}
      </button>
    </div>
  );
};

export default TextInput;
