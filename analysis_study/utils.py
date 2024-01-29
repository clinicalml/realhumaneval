import dateutil.parser as dparser


def process_log(study_data):
    frustration = int(study_data["frustration"])
    performance = int(study_data["performance"])
    temporal_demand = int(study_data["temporalDemand"])
    physical_demand = int(study_data["physicalDemand"])
    effort = int(study_data["effort"])
    mental_demand = int(study_data["mentalDemand"])
    tlx_score = get_tlx_score(frustration, performance, temporal_demand, physical_demand, effort, mental_demand)
    print("TLX Score: ", tlx_score)

    ai_tool_typical_usage = study_data["aiToolTypicalUsage"]
    ai_tool_typical_usage_str = convert_tool_usage_to_str(ai_tool_typical_usage)
    print("AI Tool Typical Usage: ", ai_tool_typical_usage_str)

    completed_time = dparser.parse(study_data["completed_task_time"], fuzzy=True)
    date_performed = dparser.parse(study_data["date_performed"], fuzzy=True)
    study_completion = get_completion_time(date_performed, completed_time)
    print("Completion Time: ", study_completion)

    completed_pre_puzzle = dparser.parse(study_data["completed_pre_puzzle"], fuzzy=True)
    pre_puzzle_completion_time = get_completion_time(date_performed, completed_pre_puzzle)
    print("Pre-Puzzle Completion Time: ", pre_puzzle_completion_time)

    reason_task_completion = "Timeout" if "timeout_time" in study_data else "Finished"
    print("Reason Task Completion: ", reason_task_completion)

    acceptance_rate = get_suggestion_acceptance_rate(study_data["telemetry_data"])
    print("Suggestion Acceptance Rate: ", acceptance_rate)

    tasks_completed = get_tasks_completed(study_data["telemetry_data"])
    print("Tasks Completed: ", tasks_completed)

    tasks_attempted = get_tasks_attempted(study_data["telemetry_data"])
    print("Tasks Attempted: ", tasks_attempted)

    time_to_completion, avg_time_to_completion = get_time_to_completion(study_data["telemetry_data"])
    print("Time To Completion: ", time_to_completion)
    print("Average Time To Completion: ", avg_time_to_completion)

    tasks_skipped = get_tasks_skipped(study_data["telemetry_data"])
    print("Tasks Skipped: ", tasks_skipped)

    coding_time = get_coding_time(study_data["telemetry_data"])
    print("Coding Time: ", coding_time)

    time_spent_verifying = get_time_verifying_suggestion(study_data["telemetry_data"])
    print("Time Spent Verifying: ", time_spent_verifying)

    return (
        tlx_score,
        ai_tool_typical_usage_str,
        study_completion,
        pre_puzzle_completion_time,
        reason_task_completion,
        acceptance_rate,
        tasks_completed,
        tasks_attempted,
        time_to_completion,
        avg_time_to_completion,
        tasks_skipped,
        coding_time,
        time_spent_verifying,
    )


def get_tlx_score(frustration, performance, temporal_demand, physical_demand, effort, mental_demand):
    return (frustration + performance + temporal_demand + physical_demand + effort + mental_demand) * 5


def convert_tool_usage_to_str(tool_usage):
    if tool_usage == "1":
        return "Strongly Disagree"
    elif tool_usage == "2":
        return "Disagree"
    elif tool_usage == "3":
        return "Neutral"
    elif tool_usage == "4":
        return "Agree"
    elif tool_usage == "5":
        return "Strongly Agree"
    else:
        raise ValueError("Invalid tool usage")


def get_completion_time(start_time, end_time):
    return end_time - start_time


def get_suggestion_acceptance_rate(telemetry_data):
    num_accept = len([event for event in telemetry_data if event["event_type"] == "accept"])
    num_suggestion_shown = len([event for event in telemetry_data if event["event_type"] == "suggestion_shown"])

    return num_accept / num_suggestion_shown


def get_tasks_completed(telemetry_data):
    return len(
        [event for event in telemetry_data if event["event_type"] == "submit_code" and event["completed_task"] == 1]
    )


def get_tasks_attempted(telemetry_data):
    return len([event for event in telemetry_data if event["event_type"] == "load_task"])


def get_time_to_completion(telemetry_data):
    starts = [event["timestamp"] for event in telemetry_data if event["event_type"] == "load_task"]
    ends = [
        event["timestamp"]
        for event in telemetry_data
        if event["event_type"] == "submit_code" and event["completed_task"] == 1
    ]

    times = [(end - start) / 1000 for start, end in zip(starts, ends)]

    return times, sum(times) / len(times)


def get_coding_time(telemetry_data):
    # Get first load task
    start = [event["timestamp"] for event in telemetry_data if event["event_type"] == "load_task"][0]

    # Get last telemetry event
    end = telemetry_data[-1]["timestamp"]

    return (end - start) / 1000


def get_tasks_skipped(telemetry_data):
    return len([event for event in telemetry_data if event["event_type"] == "skip_task"])


def get_tasks_skipped(telemetry_data):
    return len([event for event in telemetry_data if event["event_type"] == "skip_task"])


def get_time_verifying_suggestion(telemetry_data):
    # Get suggestions
    suggestions_shown = [event for event in telemetry_data if event["event_type"] == "suggestion_shown"]

    suggestions_reviewed = [
        event for event in telemetry_data if event["event_type"] == "reject" or event["event_type"] == "accept"
    ]

    # Create a hashmap for suggestion reviews.
    reviewed_hashmap = {}
    for event in suggestions_reviewed:
        reviewed_hashmap[event["suggestion_id"]] = event["timestamp"]

    # Create a hashmap for times to completion
    time_spent_verifying = {}
    for event in suggestions_shown:
        if event["suggestion_id"] in reviewed_hashmap:
            time_spent_verifying[event["suggestion_id"]] = (
                reviewed_hashmap[event["suggestion_id"]] - event["timestamp"]
            ) / 1000
        else:
            print("No review found for suggestion: ", event["suggestion_id"])

    return time_spent_verifying
