import React, { useState , useEffect } from 'react';
import './PromptModal.css';
import { default_prompts } from "./settings";

export interface PromptProp {
    system_prompt: string;
    chat_prompt: string;
    debug_prompt: string;
    integrate_prompt: string;
}  

const promptDisplayNames: { [key in keyof PromptProp]: string } = {
    system_prompt: "System Prompt",
    chat_prompt: "Regular Template",
    debug_prompt: "Debug Template",
    integrate_prompt: "Integrate Template",
};

const tabOrder: Array<keyof PromptProp> = ["system_prompt", "chat_prompt", "debug_prompt", "integrate_prompt"];

interface PromptModalProps {
    show: boolean;
    onClose: () => void;
    onSave: (prompts: PromptProp) => void;
    promptProp: PromptProp;
  }
  
  const PromptModal: React.FC<PromptModalProps> = ({ show, onClose, onSave, promptProp }) => {
    const [activePrompt, setActivePrompt] = useState<keyof PromptProp>("chat_prompt");
    const [prompts, setPrompts] = useState<PromptProp>(promptProp);

    useEffect(() => {
        if (show) {
          setPrompts(promptProp);
        }
      }, [show, promptProp]);
  
    const handleSave = () => {
      onSave(prompts);
      onClose();
    };
  
    const handleChange = (promptType: keyof PromptProp, value: string) => {
      setPrompts((prev) => ({ ...prev, [promptType]: value }));
    };

    const resetPrompts = () => {
      setPrompts(default_prompts);
    }
  
    if (!show) {
      return null;
    }
  
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>Edit Prompt</h2>
          <div className="tabs">
            {tabOrder.map((key) => (
              <div
                key={key}
                className={`tab ${activePrompt === key ? "active" : ""}`}
                onClick={() => setActivePrompt(key as keyof PromptProp)}
              >
                {promptDisplayNames[key as keyof PromptProp]}
              </div>
            ))}
          </div>
          <textarea className="modal-textarea"
            value={prompts[activePrompt]}
            onChange={(e) => handleChange(activePrompt, e.target.value)}
          />
          <div className="modal-buttons">
            <button onClick={resetPrompts}>Reset</button>
            <button onClick={onClose}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    );
  };

export default PromptModal;
