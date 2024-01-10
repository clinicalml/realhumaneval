import React from 'react';
import classNames from 'classnames';
import {CopyBlock, nord} from 'react-code-blocks'

// import { dotPulse } from 'ldrs'

// dotPulse.register()

interface BubbleProps {
  text: string,
  sender: string,
}

export const md_regex_pattern: RegExp = /(```[\s\S]*?```)/g;

const Bubble: React.FC<BubbleProps> = ({ text, sender }) => {
  // Look through string to find markdown parts.

  return (
    <div className={classNames("m-2 py-2 px-3 rounded-lg justify-center items-center overflow-auto whitespace-pre-wrap")}>
      <b>{ sender === 'user'? "You\n": "Coding Assistant\n"}</b>
      {text.split(md_regex_pattern).map((txt, index) => 
      { 
        if (txt.length > 6 && txt.charAt(0) == '`' && txt.charAt(1) == '`' &&  txt.charAt(2) == '`' && txt.charAt(txt.length - 1) == '`' && txt.charAt(txt.length - 2) == '`' && txt.charAt(txt.length - 3) == '`')  {
          return <CopyBlock
          text={txt.slice(3, txt.length - 3)}
          language={"python"}
          showLineNumbers={true}
          theme={nord}
          codeBlock
          key={index}
        />;
        }
        else {
          return txt;
        }
      })}

    {/* {sender === "bot" && text === "Generating response " && 
      <l-dot-pulse
        size="40"
        speed="1.3" 
        color="black" 
      ></l-dot-pulse>}  FIX WEB COMPONENT LOADING IN. */ }

    </div>
  )
}

export default Bubble