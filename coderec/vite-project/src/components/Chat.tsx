import { useState } from "react";
import { API_URL } from "./constants.tsx";
import { MessageProps } from "./Message.tsx";
import ChatWindow from './ChatWindow.tsx';
import TextInput from './TextInput.tsx';
import React from 'react';

const Chat: React.FC = () => {
    const [messages, setMessages] = useState<MessageProps[]>([{text: "How can I help you today?", sender: "bot"}]);
    // const [messages, setMessages] = useState<MessageProps[]>([{text: "This is pi. ```3.14159``` This is a function. ```def foo(bar): \n\treturn 'Hello world'``` This is another function. ```def double(x): \n\treturn x * 2```", sender: "bot"}]);
    const [inputValue, setInputValue] = useState('');
    const [awaitingResponse, setAwaitingResponse] = useState(false);

    async function sendMessage(message: string) {
      setAwaitingResponse(true);
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: 'user', text: message },
        {sender: 'bot', text: 'Generating response '},
      ]);
      setInputValue('');
      const res = await getResponse(message); // FIXME: Need to handle errors as well.
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1),
        { sender: 'bot', text: res["text"] },
      ]);
      setAwaitingResponse(false);
    }

    async function getResponse(query: string) {
        // Disable enter while this is occuring.
        console.log(`${API_URL}/response`);
        const res = await fetch(`${API_URL}/response`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: query,
          }),
        });
    
        const resData = await res.json();
        return resData;
    }

    // Function to handle change.

    async function handleChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
        setInputValue(event.target.value);
    }

    async function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey && awaitingResponse == false) { // FIXME: Disables pressing enter, but can also make it type and generate response later.
            event.preventDefault();
            sendMessage(inputValue);
        } 
    }
    
    // FIXME: Trim whitespace from beginning and end, add User and Chatbot icon.
    return (

      <div className="bg-gray-100 flex flex-col h-[70vh]"> {/*FIXME: This should be relative sizing. */}

          <ChatWindow messages={messages}/> 
          
          <TextInput onChange={handleChange} onKeyDown={handleKeyDown} text_value={inputValue}/>

      </div>


    );

}

export default Chat;


{/* FIXME: make a new component cuz it's kind of different. 
* Need way of viewing copy pasted code
* Size generally expanding but max size.
* Different behavior on shift_enter 
* Prevent submit while asknig for answer.
*/}



{/* <div className="w-full p-2">
  <TextInput
  placeholder="Type a message"
  value={inputValue}
  onChange={(event) => setInputValue(event.target.value)}
  onKeyDown={(event) => {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default behavior of the Enter key
      sendMessage(inputValue); // Prevent sending another message while this hasn't finished yet. 
    }
  }}
  />
</div> */}