import React, { useEffect, useState, useRef} from 'react'
import { md_regex_pattern} from "./Bubble.tsx";
import { TextareaAutosize } from '@mui/base/TextareaAutosize';



interface TextInputProps {
    text_value: string,
    onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    onKeyDown: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void,
}

const TextInput: React.FC<TextInputProps> = ({text_value, onChange, onKeyDown}) => {
    const textareaRef: React.RefObject<HTMLTextAreaElement> = useRef(null);
    const hiddentextRef: React.RefObject<HTMLTextAreaElement> = useRef(null);


    // // Resize text area
    useEffect(() => {
        if (textareaRef.current) {
            if (text_value.trim() === '') {
                // Reset to default height if text is empty
                textareaRef.current.style.height = "24px";
              } else {
                const newHeight = Math.max(24, textareaRef.current.scrollHeight);
                textareaRef.current.style.height = `${newHeight}px`;
              }

        }
    }, [text_value])

  return (
    <>
    <TextareaAutosize
    maxRows={6}
    aria-label="maximum height"
    placeholder="Send a message"
    className="p-2"
  />
    </>


  )
}

export default TextInput

