import pandas as pd 
pd.set_option('display.max_columns', None)
import pickle
import numpy as np 
import matplotlib.pyplot as plt 
import seaborn as sns 
import statsmodels.formula.api as smf 
from IPython.display import display, Markdown
from sklearn.preprocessing import StandardScaler
from datasets import load_dataset, DatasetDict
import json
import pandas as pd

ORDERED_LIST_PROG = ['0 to 2 years professional programming experience', '3 to 5 years professional programming experience', '6 to 10 years professional programming experience', '11 to 15 years professional programming experience','More than 16 years professional programming experience']
ORDERED_LIST_PYTHON = ['Beginner – I can write a correct implementation for a simple function',  'Intermediate – I can design and implement whole programs', 'Advanced – I can design and implement a complex system architecture']
ORDERED_LIST_AI = ['Never','Rarely (once a month)','Sometimes (once a week)','Often (multiple times a week)','Always (daily)']



def load_dataset_realhumaneval(subset="all"):
    """
    Loads the RealHumanEval dataset according to the specified subset.
    Parameters:
    - subset (str): Specifies the subset of the dataset to load. Options are "all", "chat", 
      "autocomplete", "study", "tasks". Default is "all".
    Returns:
    - A dictionary of datasets (if subset is "all") or a single dataset for the specified subset.
    """
    valid_subsets = ["all", "chat", "autocomplete", "study", "tasks"]
    if subset not in valid_subsets:
        raise ValueError(f"subset must be one of {valid_subsets}")
    data_files_paths = {
        "autocomplete": "autocomplete/autocomplete_data.csv",
        "chat": "chat/chat_data.csv",
        "tasks": "tasks/tasks_data.csv",
        "study": "study/study_data.csv",
    }
    
    datasets_loaded = {
        key: load_dataset("hsseinmz/realhumaneval", data_files=path)['train']
        for key, path in data_files_paths.items()
    }
    datasets_loaded["autocomplete"] = datasets_loaded["autocomplete"].map(
        lambda x: {'logprobs': eval(x['logprobs'])}
    )
    datasets_loaded["chat"] = datasets_loaded["chat"].map(
        lambda x: {'logprobs': eval(x['logprobs']), 'copy_events': eval(x['copy_events'])}
    )
    datasets_loaded["study"] = datasets_loaded["study"].map(
        lambda x: {
            'code_history': pd.read_json(x['code_history']),
            'task_data': json.loads(x['task_data']),
            'task_completion_durations': eval(x['task_completion_durations'])
        }
    )
    dataset_hf = DatasetDict(datasets_loaded) if subset == "all" else datasets_loaded[subset]
    return dataset_hf


def get_dataframe():
	df = pd.read_csv("../data/study_data.csv")
	df["model_size"] = [x.split("_")[1] if x != "nomodel" else "nomodel" for x in df["model"]]

	df["prog_experience"] = pd.Categorical(df["prog_experience"], ordered=True, categories=ORDERED_LIST_PROG)
	df["python_experience"] = pd.Categorical(df["python_experience"], ordered=True, categories=ORDERED_LIST_PYTHON)
	df["ai_experience"] = pd.Categorical(df["ai_experience"], ordered=True, categories=ORDERED_LIST_AI)

	outcome_cols = ["n_tasks_completed", "mean_task_duration", "TLX_frustration", "TLX_mental_demand", "TLX_effort"]

	mean_values = df[(df["model"] == "nomodel")]["mean_task_duration"].mean(skipna=True)
	mean_values1 = df[(df["model"] == "nomodel")]["n_tasks_completed"].mean(skipna=True)
	df["zscore_mean_task_duration"] = df["mean_task_duration"] - mean_values
	df["zscore_n_tasks_completed"] = df["n_tasks_completed"] - mean_values1

	model_name_mapping = {
	    'nomodel': 'No LLM',  
	    'chat_gpt35': 'GPT-3.5 (chat)',
	    'autocomplete_gpt35': 'GPT-3.5',
	    'autocomplete_llama34': 'CodeLlama34b',
	    'chat_llama7': 'CodeLlama7b (chat)',
	    'autocomplete_llama7': 'CodeLlama7b',
	    'chat_llama34': 'CodeLlama34b (chat)'
	}

	df['model_clean_name'] = df['model'].map(model_name_mapping)
	return df


