

import { get_chat_together } from "./cloud_functions_helper";
import { get_openai_chat_response } from "./cloud_functions_helper";


export function randomGaussian(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    num = num * stdDev + mean; // Adjust for mean and std deviation
    return num;
  }

export function sampleGaussianTruncated(mean, stdDev, min, max) {
    let sample;
    do {
        sample = randomGaussian(mean, stdDev);
    } while (sample < min || sample > max);
    return Math.round(sample);
  }

export function getModelName(model_given){
    /*   <option value="gpt35">GPT-3.5</option>
      <option value="togethercomputer/CodeLlama-7b">CodeLlama-7b</option>
      <option value="togethercomputer/CodeLlama-13b">CodeLlama-13b</option>
      <option value="togethercomputer/CodeLlama-34b">CodeLlama-34b</option> */
      if (model_given == "gpt35") {
        return "gpt-3.5-turbo";
      }
      else if (model_given == "CodeLlama-7b") {
        return "CodeLlama-7b";
      }
      else if (model_given == "CodeLlama-13b") {
        return "CodeLlama-13b";
      }
      else if (model_given == "CodeLlama-34b") {
        return "CodeLlama-34b";
      }
      else {
        return "gpt-3.5-turbo";
      }
    
      
    }
    


export function getAIResponse(model, chatHistory, max_tokens_task) {
    switch (model) {
        case "gpt-3.5-turbo":
            return get_openai_chat_response("gpt-3.5-turbo", chatHistory, max_tokens_task);
        case "CodeLlama-34b":
            return get_chat_together("togethercomputer/CodeLlama-34b-Instruct", chatHistory, max_tokens_task);
        case "CodeLlama-7b":
          return get_chat_together("togethercomputer/CodeLlama-7b-Instruct", chatHistory, max_tokens_task);
        default:
          return get_chat_together("togethercomputer/CodeLlama-34b-Instruct", chatHistory, max_tokens_task);
        }
}


export const trackSuggestionAccept = async (accessor, editor, args) => {
  console.log("This is on suggestion acceptance");
  //FIXME: setTelemetry.
  setTelemetry((prev) => [
    ...prev,
    {
      event_type: "reject",
      task_index: taskIndex,
      suggestion_id: suggestionIdx,
      suggestion: completions,
      timestamp: Date.now(),
    },
  ]);
}
  
