import React from 'react'
import { MessageProps } from "./Message.tsx";
import Message from './Message.tsx';
import { useEffect, useRef} from 'react';

interface ChatWindowProps {
    messages: MessageProps[],
}

const ChatWindow: React.FC<ChatWindowProps> = ({messages}) => {
    const chatContainerRef = useRef<HTMLDivElement>(null);
    // Function to scroll the chat container to the bottom
    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    useEffect(() => {
        scrollToBottom(); // Call the provided callback when messages change
      }, [messages]);


  return (
    <div className="h-full w-full flex flex-col p-3 overflow-auto" ref={chatContainerRef}>
        {messages.map((message, index) => (
        <Message
            key={index}
            text={message.text}
            sender={message.sender}
        />
        ))}
    </div>
  )
}

export default ChatWindow