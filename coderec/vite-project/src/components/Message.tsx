import React from 'react'
import Bubble from './Bubble.tsx'

export interface MessageProps {
    text: string;
    sender: 'user' | 'bot';
  }

const Message: React.FC<MessageProps> = ({text, sender}) => {
  // Add in a loading bubble conditionally.
  return (
    <div className="flex justify-start">
       <Bubble text={text} sender={sender}/>
       
    </div>
  )
}

export default Message


{/* <div className={sender === 'user' ? "flex justify-end" : "flex justify-start"}>
<Bubble text={text} sender={sender}/>

</div> */}