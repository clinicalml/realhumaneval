export const toPersist = true;
export const OPENAI_API_KEY = "";
export const TOGETHER_API_KEY = "1";
export const RAPID_API_KEY = "";
export const wait_time_autocomplete_suggestion = 1500;
export const settings = {
  taskSettings: {
    durationMinutes: 40,
    skipTaskMinutes: 10,
    proactiveAvailableStart: null, // empty = random
    proactiveSwitchMinutes: 20,
    showAiSettings: false,
    tasksId: null // empty = random
  },
  modelSettings: {
    // api: 'openai',
    chatModel: 'gpt-4o',
    autocompleteModel: 'gpt-3.5',
    maxTokens: 1024,
    temperature: 0.5, // not used for now
    topP: 0.5, // not used for now
    activeRefreshTimeSeconds: 20,
    inactiveRefreshTimeSeconds: 5,
    proactiveDeleteTimeSeconds: 60,
    numOptions: 3,
    insertCursor: false
  },
  prompts: {
    prompt: `
    \`\`\`
    \${code}
    \`\`\`
    Provide suggestions based on above code context. Include \`function name\` in suggestion title if it is mentioned in the suggestion. Use one of the following formats depending on suggestion type, provide 3 suggestions:
    1. {suggestion type: short title}
    {explaining provided code or brainstorming high-level ideas}
    OR
    1. {suggestion type: short title}
    \`\`\`
    {one or more suggested code snippets, do not include \`python\`}
    \`\`\`
    {clear and detailed explanation for each code snippet in bullet point format. if code is very straightforward then don't explain}
    "suggestion type" can be one of (Code Explanation, Code Improvement, Brainstorming Idea, Testing, Bug Fix, Syntax Hint) or something else. If there are multiple functions or classes in the code, provide references to the specific function or class that the suggestion pertains to in the explanation.
    `,
    debugPrompt: `
    \`\`\`
    \${code}
    \`\`\`
    I need help identifying and fixing the issues in the code. Here are some relevant details:
    stdout: \${err.stdout}
    stderr: \${err.stderr}
    Suggest 1 to 2 solutions to fix the issues. Use the following format for your response:
    1. {short title}
    {explanation on what went wrong and how to fix it}
    \`\`\`
    {code snippet addressing the problem}
    \`\`\`
    `,
    systemPrompt: `
    You are a helpful programming assistant.
    You can predict what the user wants to do next and provide suggestions.
    You never make mistakes in your code.
    Consider things such as explaining existing code, brainstorming new ideas, providing
    syntax hints and links to external documentations, identifying and fixing bugs,
    adding unit tests, completing unfinished code, 
    improving code efficiency and modularity, etc.
    Do not include suggestions only adding docstrings.
    Do not include suggestions involving packages outside of vanilla python and numpy.
    `
  }
};


export const API_URL = "http://localhost:8000/v1";

const chat_prompt = `\`\`\`
\${code}
\`\`\`
Identify ways to improve the code. Use the following format, provide 4 suggestions:
1. {Suggestion 1 abstract}
\`\`\`
{Suggestion 1 code}
\`\`\`
{Suggestion 1 explanation}`;

const systemPrompt = `You are a helpful programming assistant.
You can predict what the user wants to do next and provide suggestions.
You never make mistakes in your code.
Consider things such as explaining existing code,
syntax hints, completing unfinished code, fixing bugs,
improving code performance and readability,
adding comments or docstring, etc.
You can also provide suggestions on what to do next.
Prioritize suggestions that are most likely to be helpful to the user.`;

const rank_prompt = "Rank your suggestions based on significance, clarity, compatibility, correctness, performance, and creativity.";

export const proactive_tutorial2 = () => {
  return <>
    <h2>Proactive Coding Assistant Tutorial</h2>
    <p>You have access to the Proactive Coding Assistant. Unlike the regular chat function, it is designed to actively provide you with suggestions. The assistant does not have access to the problems, but it has access to your code editor and can provide context-aware suggestions based on your code and cursor position.</p>
    <h3>Features</h3>
    <ul>
      <li>
        <strong>Proactive Suggestions:</strong>{" "}
        the assistant will occasionally provide suggestions when you are stuck. These suggestions could range from explaining code and brainstorming ideas to implementation and optimization.</li>
      <li>
        <strong>Debugging Assistance:</strong>{" "}
        after running your code, the assistant analyzes the output or error messages and offers debugging suggestions.</li>
      <li>
        <strong>Requesting Suggestions:</strong>{" "}
        you can manually request suggestions by clicking on the “Suggest” button at the top of the chat window, or using the shortcut [Ctrl + Enter] (Windows) or [Cmd + Enter] (Mac) in the code editor.</li>
    </ul>
    <h3>Interacting with Suggestions</h3>
    <ul>
      <li>
        <strong>Viewing:</strong>{" "}
        suggestions appear in the chat window. Click on a suggestion title to expand it for more details. Click on it again to collapse the suggestion. Use the {" "}
        <svg viewBox="0 0 384 512" width="20" height="20" fill="white" className="inline"><path d="M280 240H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0 96H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zM112 232c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zM336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 48c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm144 408c0 4.4-3.6 8-8 8H56c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8h40v32c0 8.8 7.2 16 16 16h160c8.8 0 16-7.2 16-16v-32h40c4.4 0 8 3.6 8 8v336z" /></svg>
        {" "} icon to copy the code to your clipboard.</li>
      <img
        id="test_icon"
        src="/test.png"
        className="h-1/3 w-1/3"
      ></img>
      <ul>
        <li>[TODO: this should be a gif including chat + editor, showing expanding, accepting, and follow up.]</li>
      </ul>
      <li>
        <strong>Accepting:</strong>{" "}
        click “Accept” to add the expanded suggestion to the chat window, where it will remain throughout each task. You can ask follow-up questions about accepted suggestions in the chat.</li>

      <li>
        <strong>Deleting:</strong>{" "}
        click “Clear all” to remove all current suggestions. Use “Delete” to remove a single expanded suggestion.</li>
    </ul>
    <h3>Notes</h3>
    <ul>
      <li>
        <strong>Review Carefully:</strong>{" "}
        suggestions are not always perfect, and the code provided may be inaccurate. Always review suggestions thoroughly before integrating them into your code.</li>
      <li>
        <strong>Normal Chat Functionality:</strong>{" "}
        you can continue to use the normal chat function as usual, alongside the proactive suggestions.</li>
    </ul>
    < br />
    You can review this tutorial again by clicking on the “Show Instructions” button at the top of the page, then clicking "Next".
    < br />
  </>
}

export const tutorial_wait_time = 1000;

export const proactive_tutorial = () => {
  return <>
    <h2>Proactive Coding Assistant Tutorial</h2>
    <p>You have access to the Proactive Coding Assistant. In addition to the regular chatbot functionality, the assistant will occasionally provide suggestions when you are stuck!
    Please try to use it in the study if the suggestions seem helpful. Here’s how:</p>
    < br />



    <p>Click on a suggestion title for the following options:</p>
    <div className="container">
      <div className="text-column">
        {/* <h3>Features</h3>
      <ul>
        <li>
          <strong>Proactive Suggestions:</strong>{" "}
          the assistant will occasionally provide suggestions when you are stuck. These suggestions could range from explaining code and brainstorming ideas to implementation and optimization.
        </li>
        <li>
          <strong>Debugging Assistance:</strong>{" "}
          after running your code, the assistant analyzes the output or error messages and offers debugging suggestions.
        </li>
        <li>
          <strong>Requesting Suggestions:</strong>{" "}
          you can manually request suggestions by clicking on the “Suggest” button at the top of the chat window, or using the shortcut [Ctrl + Enter] (Windows) or [Cmd + Enter] (Mac) in the code editor.
        </li>
      </ul> */}
        {/* <h3>Proactive Suggestions</h3>
      The assistant will occasionally provide suggestions when you are stuck. These suggestions could range from explaining code and brainstorming ideas to implementation and optimization. */}
  
        <ul>
          <li>
            <strong>Previewing:</strong>{" "}
            Click "Preview" to see how the proactive assistant incorporates the suggestion into your code, which can then accept or hide the changes. Use the{" "}
            <svg viewBox="0 0 384 512" width="20" height="20" fill="white" className="inline"><path d="M280 240H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zm0 96H168c-4.4 0-8 3.6-8 8v16c0 4.4 3.6 8 8 8h112c4.4 0 8-3.6 8-8v-16c0-4.4-3.6-8-8-8zM112 232c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zm0 96c-13.3 0-24 10.7-24 24s10.7 24 24 24 24-10.7 24-24-10.7-24-24-24zM336 64h-80c0-35.3-28.7-64-64-64s-64 28.7-64 64H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM192 48c8.8 0 16 7.2 16 16s-7.2 16-16 16-16-7.2-16-16 7.2-16 16-16zm144 408c0 4.4-3.6 8-8 8H56c-4.4 0-8-3.6-8-8V120c0-4.4 3.6-8 8-8h40v32c0 8.8 7.2 16 16 16h160c8.8 0 16-7.2 16-16v-32h40c4.4 0 8 3.6 8 8v336z" /></svg>
            {" "}icon to copy the code to your clipboard.
          </li>
          <li>
            <strong>Accepting:</strong>{" "}
            click “Accept” to add the expanded suggestion to the chat window and ask follow-up questions.
          </li>
          <li>
            <strong>Deleting:</strong>{" "}
            click “Clear all” to remove all current suggestions. Use “Delete” to remove a single expanded suggestion.
          </li>
          {/* <li>
            You can <strong>request</strong> suggestions by clicking on the “Suggest” button at the top of the chat window, or using the shortcut [Ctrl + Enter] (Windows) or [Cmd + Enter] (Mac) in the code editor.
          </li>
          <li>
            After running your code, the assistant analyzes the output or error messages and offers debugging suggestions. You can interact with these suggestions in the same way.
          </li> */}
        </ul>

        <br></br>

        <p>Other features:</p>
        <ul>
          <li>
            If a regular chat message contains code, you can also have the proactive assistant help you incorporate into your code.
          </li>
          <li>
            You can <strong>request</strong> suggestions by clicking on the “Suggest” button at the top of the chat window, or using the shortcut [Ctrl + Enter] (Windows) or [Cmd + Enter] (Mac) in the code editor.
          </li>
          <li>
            After running your code, the assistant analyzes the output or error messages and offers debugging suggestions. You can interact with these suggestions in the same way.
          </li>
        </ul>
        <br></br>
        

        {/* <h3>Debugging Assistance</h3>
    After running your code, the assistant analyzes the output or error messages and offers debugging suggestions. You can interact with these suggestions in the same way. */}
       
        {/* <h3>Notes</h3>
    <ul>
      <li>
        <strong>Review Carefully:</strong>{" "}
        suggestions are not always perfect, and the code provided may be inaccurate. Always review suggestions thoroughly before integrating them into your code.
      </li>
      <li>
        <strong>Normal Chat Functionality:</strong>{" "}
        you can continue to use the normal chat function as usual, alongside the proactive suggestions.
      </li>
    </ul> */}
      </div>
      <div className="image-column">

      <img
          id="test_icon"
          src="/integrate_proactive1.gif"
          // className="h-1/3 w-1/3"
          className="w-max"
        ></img>
      
      </div>
    </div>

    < br />
        <strong>Warning:</strong> the assistant does not have access to the task description, but it has access to your code editor and can provide context-aware suggestions based on your code and cursor position.
        Suggestions are not always perfect, and the code provided may be inaccurate. In addition the suggestions may use packages that we do not support (we only support numpy). Always review suggestions thoroughly before integrating them into your code.
          <br></br>

    <br />
    You can review this tutorial again by clicking on the “Show Instructions” button at the top of the page, then clicking "Next".
    <br />
  </>
}


export const integrate_suggestion_into_code = `
We have the following ORIGINAL code:
\${code}
\n
A suggestion has been provided:
\${suggestion}
\n
INSTRUCTION:
- If the suggestion contains no code or potential modifications to the code, return 0 and nothing else. Only zero

- If the suggestions contains code, integrate the suggestion into the ORIGINAL code. Make minimal changes to the ORIGINAL code. Return the changed code only with nothing else.
`;


export const default_prompts = {
  chat_prompt: `\`\`\`
\${code}
\`\`\`
Identify ways to improve the code. Focus on suggestions around the cursor if possible. Use the following format, provide 3 suggestions:
1. {short title}
\`\`\`
{suggested code}
\`\`\`
{clear and detailed explanation}`,
  debug_prompt: `\`\`\`
\${code}
\`\`\`
I need help identifying and fixing the issues in the code. Here are some relevant details:
stdout: \${err.stdout}
stderr: \${err.stderr}
Suggest 1 to 2 solutions to fix the issues. Use the following format for your response:
1. {short title}
{explanation on what went wrong and how to fix it}
\`\`\`
{code snippet addressing the problem}
\`\`\``,
  system_prompt: `You are a helpful programming assistant. You can predict what the user wants to do next and provide suggestions. You never make mistakes in your code. Consider things such as explaining existing code, syntax hints, completing unfinished code, fixing bugs, improving code performance and readability, adding comments or docstring, etc. You can also provide suggestions on what to do next. Prioritize suggestions that are most likely to be helpful to the user.`,
  integrate_prompt: integrate_suggestion_into_code
}