import React, {
  RefObject,
  useEffect,
  useRef,
  useState,
  Dispatch,
  SetStateAction,
  useImperativeHandle,
  forwardRef,
  useCallback,
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
import { get } from "http";

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
  proactive_refresh_time_inactive: number;
  chatRef: any;
}

const Editor: React.FC<EditorProps> = forwardRef(({
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
  proactive_refresh_time_inactive,
  chatRef,
}, ref) => {
  const [language, setLanguage] = useState("python");
  const useTabs = false; // Set to true to enable tabs 
  const [tabs, setTabs] = useState([{ id: "tab1", label: "Tab 1" }]);
  const [activeTab, setActiveTab] = useState("tab1");
  const [openTabs, setOpenTabs] = useState(["tab1"]);
  const editorRef: any = useRef(null);
  const monacoRef: any = useRef(null);
  const decorationsCollection: any = useRef(null);
  // Add state variables to manage the editor type and read-only state
  const [isDiffEditor, setIsDiffEditor] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [originalCode, setOriginalCode] = useState("");
  const [modifiedCode, setModifiedCode] = useState("");
  const [codeValue, setCodeValue] = useState("");
  // const [isNewTask, setIsNewTask] = useState(true);
  const newTaskRef = useRef(true);
  const taskIndexRef = useRef(taskIndex);
  const prevTaskIndexRef = useRef(-1);


  const handleAcceptChangesEditor = () => {
    // get current modfiied code from the diff editor not the regular editor
    editorRef.current.pushUndoStop();
    setCodeValue(getModifiedValue());
    setIsDiffEditor(false);

    setTelemetry((prevTelemetry: any[]) => {
      return [
        ...prevTelemetry,
        {
          event_type: "accept_edit",
          timestamp: Date.now(),
        },
      ];
    });

  };
  const handleDeclineChangesEditor = () => {
    setCodeValue(originalCode);
    setIsDiffEditor(false);
    setTelemetry((prevTelemetry: any[]) => {
      return [
        ...prevTelemetry,
        {
          event_type: "reject_edit",
          timestamp: Date.now(),
        },
      ];
    });
  }

  const diffEditorRef = useRef(null);

  const handleDiffEditorDidMount = useCallback((editor) => {
    diffEditorRef.current = editor;
  }, []);

  const getModifiedValue = useCallback(() => {
    if (diffEditorRef.current) {
      const modifiedEditor = diffEditorRef.current.getModifiedEditor();
      return modifiedEditor.getValue();
    }
    return null;
  }, []);

  useEffect(() => {
    newTaskRef.current = true;
    taskIndexRef.current = taskIndex;
  }, [taskIndex]);

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

  const provideProactiveSuggestions = (
    model: any,
    source: string,
  ) => {
    let code = model.getValue();
    if (code.length < 100 && code.split('\n').length < 5) {
      console.log("Code too short for proactive suggestions");
      return;
    }
    console.log(source);
    chatRef.current.getProactiveSuggestions({ source: source });
  }

  const manualProactiveSuggestions = () => {
    chatRef.current.getProactiveSuggestions({ manual: true });
    // highlightLine(editorRef.current.getPosition().lineNumber);
  }

  const provideInlineAutocompleteSuggestions = async (
    model: any,
    position: any,
    context: any,
    token: any
  ) => {
    // provideProactiveSuggestions(model, "active");

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

    let mean = 100,
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
    console.log("Model autocomplete", modelAutocompleteRef.current);
    if (modelAutocompleteRef.current === "gpt-3.5") {
      suggestion = await get_openai_response(
        prefix_code,
        suffix_code,
        mean,
        setLogprobsCompletion
      );
    } else {
      suggestion = await get_completion_together(
        modelAutocompleteRef.current,
        full_code,
        mean,
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

  var interval: any = null;
  function startInactiveSuggestions(editor: any) {
    if (interval) {
      clearInterval(interval);
    }
    interval = setTimeout(() => {
      console.log("Refreshing proactive suggestions inactive", proactive_refresh_time_inactive);
      provideProactiveSuggestions(editor, "inactive");
      // startInactiveSuggestions(editor);
    },
      proactive_refresh_time_inactive);
  }

  const highlightLine = (lineNumber: any) => {
    if (editorRef.current && monacoRef.current && decorationsCollection.current) {
      const new_decorations =
        [
          {
            range: new monacoRef.current.Range(lineNumber, 1, lineNumber, 1),
            options: {
              isWholeLine: true,
              className: 'myLineHighlight'
            }
          }
        ];
      decorationsCollection.current.set(new_decorations);
      editorRef.current.revealLineInCenter(lineNumber);
      console.log("highlighted line", lineNumber, new_decorations);
    } else {
      console.log("No editor ref or decoration collection", decorationsCollection.current);
    }
  };

  useEffect(() => {
    // proactive_refresh_time changed
    console.log("proactive_refresh_time_inactive changed", proactive_refresh_time_inactive);
    if (editorRef.current) {
      console.log("Clearing interval", editorRef);
      clearInterval(interval);
      startInactiveSuggestions(editorRef.current);
    } else {
      console.log("No editor ref");
    }
  }, [proactive_refresh_time_inactive]);

  function handleEditorDidMount(editor: any, monaco: any, activeTab: string) {
    editorRef.current = editor;
    monacoRef.current = monaco;
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
        manualProactiveSuggestions();
        //TODO: reject suggestion shown currently if any
        // comment this out if you dont want to show suggestions on every ctrl+enter
        console.log("Requesting suggestion");
        chatRef.current.getProactiveSuggestions();

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

    // editor.onDidChangeCursorPosition((e: any) => {
    editor.onDidChangeModelContent((e: any) => {

      if (interval) {
        clearInterval(interval);
      }
      chatRef.current.cancelProactiveSuggestions();

      if (newTaskRef.current) {
        console.log(taskIndexRef.current, "New task, not starting suggestions");
        newTaskRef.current = false;
        prevTaskIndexRef.current = taskIndexRef.current;
        return;
      }
      // const position = editor.getPosition();
      // console.log('Cursor Position:', position);
      console.log(taskIndexRef.current, newTaskRef.current, "Model content changed");
      startInactiveSuggestions(editor);
    });

    decorationsCollection.current = editor.createDecorationsCollection();

  }
  useImperativeHandle(ref, () => {
    return {

      setEditorType(isDiff: boolean, originalCode: string, newCode: string) {
        console.log(isDiff);
        if (isDiff) {
          console.log("Setting diff editor");
          console.log(newCode);
          setOriginalCode(originalCode);
          setModifiedCode(newCode);
          setIsDiffEditor(isDiff);

        }
        else {
          setIsDiffEditor(isDiff);
          setCodeValue(originalCode);

        }
      },

      setEditorReadOnly(isReadOnly: boolean) {
        setIsReadOnly(isReadOnly);
      },

      getCodeValue() {

        return editorRef.current.getValue();
      },

      clearDiffEditor() {
        setOriginalCode("");
        setModifiedCode("");
        setIsDiffEditor(false);
      }

    };

  }, [codeValue]);


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
      {isDiffEditor && (
        <div className="absolute w-full flex" style={{ top: '0px' }}>
          <div className="mr-2">
            <button
              onClick={handleAcceptChangesEditor}
              className="px-4 py-2 bg-green-600 text-white rounded"
            >
              Accept Changes
            </button>
          </div>
          <div>
            <button
              onClick={handleDeclineChangesEditor}
              className="px-4 py-2 bg-red-600 text-white rounded"
            >
              Hide Changes
            </button>
          </div>
        </div>
      )}

      <div className={isDiffEditor ? '' : 'hidden'}>
        <DiffEditor
          height="70vh"
          language={language}
          theme="vs-dark"
          original={originalCode}
          modified={modifiedCode}
          onMount={handleDiffEditorDidMount}
          options={{
            readOnly: isReadOnly, minimap: { enabled: false },
            enableSplitViewResizing: false,
            renderSideBySide: false
          }}
        />
      </div>
      <div className={isDiffEditor ? 'hidden' : ''}>
        <MonacoEditor
          height="70vh"
          language={language}
          value={codeValue}
          theme="vs-dark"
          onMount={(editor, monaco) => handleEditorDidMount(editor, monaco, activeTab)}
          defaultLanguage="python"
          path={activeTab}
          options={{ minimap: { enabled: false }, readOnly: isReadOnly }}
        />
      </div>
    </div>
  );
});

export default Editor;
