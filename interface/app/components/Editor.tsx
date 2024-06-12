import React, {
  RefObject,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import {
  get_completion_together,
  get_openai_response,
} from "../functions/cloud_functions_helper";
import "../style.css";
import { CursorPos } from "readline";

import MonacoEditor, {
  DiffEditor,
  useMonaco,
  loader,
} from "@monaco-editor/react";

interface EditorProps {
  onEditorMount: (editor: any, monaco: any) => void;
  contextLength: number;
  wait_time_for_sug: number;
  setSuggestionIdx: Dispatch<SetStateAction<number>>;
  setTelemetry: Dispatch<SetStateAction<any[]>>;
  modelAutocomplete: string;
  taskIndex: number;
  setLogprobsCompletion: Dispatch<SetStateAction<any>>;
  logProbs: any;
  suggestionIdx: number;
  messageAIIndex: number;
  setIsSpinning: Dispatch<SetStateAction<boolean>>;
}

const Editor: React.FC<EditorProps> = ({
  onEditorMount,
  contextLength,
  wait_time_for_sug,
  setSuggestionIdx,
  setTelemetry,
  modelAutocomplete,
  taskIndex,
  setLogprobsCompletion,
  logProbs,
  suggestionIdx,
  messageAIIndex,
  setIsSpinning,
}) => {
  const [language, setLanguage] = useState("python");
  const useTabs = false; // Set to true to enable tabs 
  const [tabs, setTabs] = useState([{ id: "tab1", label: "Tab 1" }]);
  const [activeTab, setActiveTab] = useState("tab1");
  const [openTabs, setOpenTabs] = useState(["tab1"]);

  const handleAddTab = () => {
    const newTabId = `tab${tabs.length + 1}`;
    const newTab = { id: newTabId, label: `Tab ${tabs.length + 1}` };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
    setOpenTabs([...openTabs, newTabId]);
  };

  const handleDeleteTab = (tabId: string) => {
    if (tabId === "tab1") return; // Prevent deleting the first tab
    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(filteredTabs);
    if (activeTab === tabId) {
      setActiveTab("tab1");
      setOpenTabs(openTabs.filter(t => t !== tabId));
    }
  };

  const selectTab = (tabId: React.SetStateAction<string>) => {
    setActiveTab(tabId);
  };



  const modelAutocompleteRef = useRef(modelAutocomplete);
  modelAutocompleteRef.current = modelAutocomplete;

  const provideInlineAutocompleteSuggestions = async (
    model: any,
    position: any,
    context: any,
    token: any
  ) => {
    if (modelAutocompleteRef.current === "Off") {
      return Promise.resolve({ items: [] });
    }
    // Get code input up to the current cursor position
    let prefix_code = model.getValueInRange({
      startLineNumber: 1,
      startColumn: 1,
      endLineNumber: position.lineNumber,
      endColumn: position.column,
    });

    // Get all code after the current cursor position
    let suffix_code = model.getValueInRange({
      startLineNumber: position.lineNumber,
      startColumn: position.column + 1,
      endLineNumber: model.getLineCount(),
      endColumn: model.getLineLength(model.getLineCount()) + 1,
    });

    let maxPrefixLength = Math.floor((contextLength * 2) / 3);
    let maxSuffixLength = contextLength - maxPrefixLength;

    if (prefix_code.length < maxPrefixLength) {
      maxSuffixLength += maxPrefixLength - prefix_code.length;
      maxPrefixLength = prefix_code.length;
    } else if (suffix_code.length < maxSuffixLength) {
      maxPrefixLength += maxSuffixLength - suffix_code.length;
      maxSuffixLength = suffix_code.length;
    }

    if (prefix_code.length > maxPrefixLength) {
      prefix_code = prefix_code.substring(prefix_code.length - maxPrefixLength);
    }

    if (suffix_code.length > maxSuffixLength) {
      suffix_code = suffix_code.substring(0, maxSuffixLength);
    }

    let mean = 64,
      stdDev = 15,
      min = 10,
      max = 120;
    //var actual_max_tokens = sampleGaussianTruncated(mean, stdDev, min, max);

    prefix_code =
      "# file is main.py, ONLY CODE IN PYTHON IN THIS FILE\n" + prefix_code;

    let full_code = prefix_code;

    // Wait 2 seconds
    await new Promise((resolve) => setTimeout(resolve, wait_time_for_sug));

    if (token.isCancellationRequested) {
      return Promise.resolve({ items: [] });
    }

    console.log("Calling api");
    // Replace with tabs.
    full_code = full_code.replace(new RegExp(" ".repeat(4), "g"), "\t");

    let newSuggIdx: any = null;
    setSuggestionIdx((prev) => {
      newSuggIdx = prev + 1;
      return newSuggIdx;
    });

    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "before_shown",
        task_index: taskIndex,
        suggestion_id: newSuggIdx,
        prefix_code: prefix_code,
        suffix_code: suffix_code,
        timestamp: Date.now(),
      },
    ]);

    setIsSpinning(true);

    let suggestion = "";
    if (modelAutocompleteRef.current === "gpt-3.5") {
      suggestion = await get_openai_response(
        prefix_code,
        suffix_code,
        64,
        setLogprobsCompletion
      );
    } else {
      suggestion = await get_completion_together(
        modelAutocompleteRef.current,
        full_code,
        64,
        setLogprobsCompletion
      );
    }
    setIsSpinning(false);

    console.log("Got suggestion");
    console.log(suggestion);
    // Split full_code into each word/whitesapce

    // Clean up suggestion, leading spaces if new line
    if (full_code[full_code.length - 1] === "\t") {
      suggestion = suggestion.replace(/^ +/, "");
    }

    setTelemetry((prev) => [
      ...prev,
      {
        event_type: "shown",
        task_index: taskIndex,
        suggestion_id: newSuggIdx,
        suggestion: suggestion,
        logprobs: logProbs,
        timestamp: Date.now(),
      },
    ]);

    return Promise.resolve({
      items: [
        {
          insertText: suggestion,
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          command: {
            id: "trackSuggestionAccept",
            title: "Suggestion Accepted",
            arguments: [suggestion, newSuggIdx, taskIndex],
          },
        },
      ],
    });
  };

  function handleEditorDidMount(editor: any, monaco: any, activeTab: string) {
    onEditorMount(editor, monaco); // Pass the editor and monaco instances back to the parent if needed
    editor.updateOptions({
      renderIndentGuides: true, // Show indentation guides
      roundedSelection: false,
      cursorStyle: "line",
      automaticLayout: true,
    });

    monaco.languages.registerInlineCompletionsProvider("python", {
      provideInlineCompletions: provideInlineAutocompleteSuggestions,
      freeInlineCompletions: (completions: any) => { },
    });

    monaco.editor.addCommand({
      id: "trackSuggestionAccept",
      run: (_: any, suggestion: any, suggestion_id: any, task_index: any) => {
        setTelemetry((prev) => [
          ...prev,
          {
            event_type: "accept",
            task_index: task_index,
            suggestion_id: suggestion_id,
            suggestion: suggestion,
            timestamp: Date.now(),
          },
        ]);
        console.log("accepted suggestion");
      },
    });

    editor.addAction({
      id: "requestSuggestion",
      label: "Request Suggestion",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: async () => {
        // TODO: reject suggestion shown currently if any

        setTelemetry((prev) => [
          ...prev,
          {
            event_type: "request_suggestion",
            task_index: taskIndex,
            suggestion_id: suggestionIdx,
            timestamp: Date.now(),
          },
        ]);

        const position = editor.getPosition();
        if (position) {
          const model = editor.getModel();
          const token = new monaco.CancellationTokenSource();
          const context = {};

          if (model) {
            const suggestions = await provideInlineAutocompleteSuggestions(
              model,
              position,
              context,
              token.token
            );
          }
        }
      },
    });

    editor.onDidPaste((e: any) => {
      setTelemetry((prevState) => {
        return [
          ...prevState,
          {
            event_type: "paste_into_editor",
            task_index: taskIndex,
            messageAIindex: messageAIIndex,
            copied_text: editor.getModel().getValueInRange(e.range),
            timestamp: Date.now(),
          },
        ];
      });
    });
  }

  return (

    <div className="">
      {useTabs &&
        <div className="tabs">
          {tabs.map(tab => (
            <button style={{ height: "4vh" }} key={tab.id} onClick={() => selectTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
              {tab.label}
              {tab.id !== "tab1" && (
                <button onClick={() => handleDeleteTab(tab.id)}>x</button>
              )}
            </button>
          ))}
          <button onClick={handleAddTab}>+</button>
        </div>}
      <MonacoEditor
        height="90vh"
        language={language}
        theme="vs-dark"
        onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, activeTab)}
        defaultLanguage="python"
        path={activeTab}

      />
      ;
    </div>
  );
};

export default Editor;
