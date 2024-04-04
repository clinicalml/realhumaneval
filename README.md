# The RealHumanEval

Associated code, data and interface for the paper ["The Real HumanEval: Evaluating Large Language Models’ Abilities to Support Programmers"](https://arxiv.org/abs/2404.02806), to appear at the CHI TREW 2024 workshop.


<img src="./static/fig1.jpg" alt="Overview of RealHumanEval" width="50%"/>


# What is it?


This repository introduces an interface for evaluating humans writing code with large language models (LLMs) "RealHumanEval". Users can interact with LLMs integrated into an editor through either autocomplete support, akin to GitHub Copilot, or chat support, akin to ChatGPT.


Using this interface, we ran  a user study (N=213) to measure the ability of different LLMs to support programmers in their tasks. 
We measure user performance in terms of the speed and amount of tasks completed, as well as user satisfaction metrics of LLM helpfulness.
While we find general correspondence between benchmark performance and user performance (i.e., less performant models tended to slow users down and reduce the number of tasks completed), the gaps in benchmark performance are not proportional to gaps in human performance metrics.

In this repository, you can find the data of participants study sessions as well as code to analyze that data.



![Results of RealHumanEval](./static/study_results.JPG)



# Data

You can find our data on Huggingface hub at [realhumaneval](https://huggingface.co/datasets/hsseinmz/realhumaneval), or for a direct download link you can find in [./data](./data).


The data released consists of four parts (can also be found in the folder [./data](./data)):

- chat (chat_data.csv): contains the chat logs of the conversations between the study participants and the LLMs

- autocomplete (autocomplete_data.csv): for each suggestion shown in the autocomplete conditions, we log whether it was accepted and the prompt of the LLM

- tasks (task_data.csv): the tasks that the participants were asked to complete

- study (study_data.csv and study_data.pkl): a dataframe of processed information for each participant (e.g., how many tasks they completed, their code history, how many suggestions they accepted ...). Use the pickle version of this file for the most accurate representation of the data.


# Installation

Analysis code is in Python, you will need the following packages: pandas, numpy, matplotlib, seaborn, sklearn, statsmodels, datasets (huggingface).

# Organization

This repository is organized as follows:


- [analysis](analysis) should contain the final analysis notebooks

- [data](data) should contain the raw data used for analysis

- [interface](interface) (COMING SOON)


# Paper Reproducibility 

To reproduce figures and results from the paper, you can run the following notebooks:

- Main paper analyses  [./analysis/main_analysis.ipynb](./analysis/main_analysis.ipynb)

- Appendix analyses  [./analysis/appendix_analysis.ipynb](./analysis/appendix_analysis.ipynb)

# Citation

```
@misc{mozannar2024realhumaneval,
      title={The RealHumanEval: Evaluating Large Language Models' Abilities to Support Programmers}, 
      author={Hussein Mozannar and Valerie Chen and Mohammed Alsobay and Subhro Das and Sebastian Zhao and Dennis Wei and Manish Nagireddy and Prasanna Sattigeri and Ameet Talwalkar and David Sontag},
      year={2024},
      eprint={2404.02806},
      archivePrefix={arXiv},
      primaryClass={cs.SE}
}
```

# Acknowledgements

This work is partially funded by the MIT-IBM Watson AI Lab.

