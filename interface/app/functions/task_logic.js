// Mock database handling
const mockDb = {
  responses: {},
  tasks: {
    // Add default task data here if needed
    "default_task": {
      function_signatures: ["def plus_one(x):"],
      unit_tests: ["assert plus_one(1) == 2"],
      task_descriptions: ["Write a function that adds one to the input."],
      exp_condition: "default"
    }
  },
  settings: [{
    prompts: {
      system_prompt: "default system prompt",
      prompt: "default chat prompt",
      debug_prompt: "default debug prompt"
    },
    model_settings: {
      chat_model: "Off",
      autocomplete_model: "Off",
      max_tokens: 512,
      active_refresh_time_seconds: 30,
      inactive_refresh_time_seconds: 30,
      suggestion_max_options: 3,
      insert_cursor: false,
      proactive_delete_time_seconds: 60
    },
    task_settings: {
      duration_minutes: 60,
      proactive_available_start: null,
      proactive_switch_minutes: 20,
      show_ai_settings: false,
      tasks_id: "default_task",
      skip_task_minutes: 1
    }
  }]
};

export async function writeUserData(response_id, telemetry) {
  mockDb.responses[response_id] = { telemetry_data: telemetry };
}

export function loadlocalstorage(setResponseId, setTaskId, setExpCondition, setWorkerId) {
  const myData = JSON.parse(localStorage["objectToPass"] || "[]");
  setResponseId(myData[0] || "");
  setTaskId(myData[1] || "");
  setExpCondition(myData[2] || "");
  setWorkerId(myData[3] || "");
}

export async function loadTaskData(
  task_id,
  setFunctionSignatures,
  setUnitTests,
  setTaskDescriptions,
  setModel,
  setMaxTokensTask,
  setExpCondition,
  editor,
  setMessages,
  exp_condition,
  task_index,
  response_id,
  worker_id,
  telemetry,
  setTelemetry
) {
  const taskData = mockDb.tasks[task_id] || mockDb.tasks.default_task;
  
  setFunctionSignatures(taskData.function_signatures);
  setUnitTests(taskData.unit_tests);
  setTaskDescriptions(taskData.task_descriptions);
  setExpCondition(taskData.exp_condition);

  loadCurrentTask(
    task_index,
    response_id,
    task_id,
    exp_condition,
    worker_id,
    editor,
    setMessages,
    taskData.function_signatures,
    telemetry,
    setTelemetry
  );
}

export async function loadSettings(
  setTaskId,
  setModelChat,
  setModelAutocomplete,
  setProactive,
  setMaxTokensTask,
  setPrompts,
  setProactiveRefreshTimeActive,
  setProactiveRefreshTimeInactive,
  setDurationMinutes,
  setProactiveAvailableStart,
  setProactiveSwitchMinutes,
  setShowAIOptions,
  setSuggestionMaxOptions,
  setInsertCursor,
  setProactiveDeleteTime,
  setSkipTime,
) {
  const settings = mockDb.settings[0];
  const { model_settings, task_settings, prompts } = settings;

  setTaskId(task_settings.tasks_id || "default_task");
  setDurationMinutes(task_settings.duration_minutes);
  
  const proactiveStart = task_settings.proactive_available_start === null 
    ? Math.random() < 0.5 
    : task_settings.proactive_available_start;
  
  setProactiveAvailableStart(proactiveStart);
  setProactive(proactiveStart);
  
  setProactiveSwitchMinutes(task_settings.proactive_switch_minutes);
  setShowAIOptions(task_settings.show_ai_settings);
  setSkipTime(task_settings.skip_task_minutes * 60_000 || 0);

  setModelChat(model_settings.chat_model);
  setModelAutocomplete(model_settings.autocomplete_model);
  setMaxTokensTask(model_settings.max_tokens);
  setProactiveRefreshTimeActive(model_settings.active_refresh_time_seconds * 1000);
  setProactiveRefreshTimeInactive(model_settings.inactive_refresh_time_seconds * 1000);
  setSuggestionMaxOptions(model_settings.suggestion_max_options);
  setInsertCursor(model_settings.insert_cursor);
  setProactiveDeleteTime(model_settings.proactive_delete_time_seconds * 1000);

  setPrompts(prev => ({
    ...prev,
    system_prompt: prompts.system_prompt,
    chat_prompt: prompts.prompt,
    debug_prompt: prompts.debug_prompt,
  }));

  return "mock_settings_id";
}

export async function loadCurrentTask(
  task_index,
  response_id,
  task_id,
  exp_condition,
  worker_id,
  editor,
  setMessages,
  function_signatures,
  telemetry,
  setTelemetry,
  actualEditorRef
) {
  if (task_index >= function_signatures.length) {
    localStorage.setItem("code", "");
    if (response_id) {
      localStorage.setItem("objectToPass", JSON.stringify([response_id, task_id, exp_condition, worker_id]));
    }
    return;
  }

  if (actualEditorRef) actualEditorRef.current.clearDiffEditor();
  editor.setValue(function_signatures[task_index].replace(/\\n/g, "\n"));

  setMessages([{ text: "How can I help you today?", sender: "bot" }]);

  setTelemetry(prev => [...prev, {
    event_type: "load_task",
    task_id: task_id,
    task_index: task_index,
    timestamp: Date.now(),
  }]);
}

export function restoreAfterRefresh(setTaskIndex, setTelemetry) {
  const task_index = localStorage.getItem("task_index");
  setTaskIndex(task_index ? parseInt(task_index) : 0);

  const telemetry_data = localStorage.getItem("telemetry_data");
  if (telemetry_data) {
    setTelemetry(JSON.parse(telemetry_data));
  }
}
