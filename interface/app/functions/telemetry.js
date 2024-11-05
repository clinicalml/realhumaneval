
export function trackProactiveSuggestion(
    setTelemetry,
    proactiveSuggestion,
    source,
    model,
    task_index,
    prompt,
    hash
    ) {
    // source: manual / active / inactive / debug
    let newTelemetry = {
        event_type: "proactive_suggestion",
        source: source,
        task_index: task_index,
        proactiveSuggestions: proactiveSuggestion,
        message_hash: hash,
        prompt: prompt,
        model: model,
        timestamp: Date.now(),
      };
    setTelemetry((prevTelemetry) => [...prevTelemetry, newTelemetry]);
    }

export function trackProactiveInteraction (
    setTelemetry,
    interaction,
    suggestion_index,
    suggestion,
    task_index,
    hash
    ) {
    // interaction: expand / copy / accept / delete / clear all
    let newTelemetry = {
        event_type: "proactive_interaction",
        interaction: interaction,
        task_index: task_index,
        suggestion_index: suggestion_index,
        suggestion: suggestion,
        message_hash: hash,
        timestamp: Date.now(),
      };
    setTelemetry((prevTelemetry) => [...prevTelemetry, newTelemetry]);
    }

export function trackProactiveTurnedOnOff (
    setTelemetry,
    isProactiveOn,
    task_index,
    ) {
    let newTelemetry = {
        event_type: isProactiveOn ? "proactive_on" : "proactive_off",
        task_index: task_index,
        timestamp: Date.now(),
      };
    setTelemetry((prevTelemetry) => [...prevTelemetry, newTelemetry]);
    }

export function trackSubmitCode (
    setTelemetry,
    task_index,
    log,
    completed_task,
    editor,
    ) {
    if (editor == null) {
      console.log("editor is null");
      return;
    }
    console.log("submitting code", editor.getValue());
    let newTelemetry = {
        event_type: "submit_code",
        task_index: task_index,
        completed_task: completed_task,
        log: log,
        code: editor.getValue(),
        timestamp: Date.now(),
      };
    setTelemetry((prevTelemetry) => [...prevTelemetry, newTelemetry]);
    }