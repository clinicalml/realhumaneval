
# RealHumanEval

<!-- Provide a quick summary of the dataset. -->

This dataset contains logs of participants study from the RealHumanEval study [paper](https://arxiv.org/abs/2404.02806). 

## Dataset Details

### Motivation

<!-- Provide a longer summary of what this dataset is. -->

The RealHumanEval study was conducted to measure the ability of different LLMs to support programmers in their tasks. We developed an online web app in which users interacted with one of six different LLMs integrated into an editor through either autocomplete support, akin to GitHub Copilot, or chat support, akin to ChatGPT, in addition to a condition with no LLM assistance. We measure user performance in terms of the speed and amount of tasks completed, as well as user satisfaction metrics of LLM helpfulness.

In total, we selected 7 LLMs for our study: 4 from the Code Llama family (CodeLlama-7b, CodeLlama-7b-instruct, CodeLlama-34b, CodeLlama-34b-instruct), along with three models from the GPT series (GPT-3.5-turbo and GPT-3.5-turbo-instruct, GPT-4o). To avoid confusion, we refer to the autocomplete conditions by the base name of the model: CodeLlama-7b, CodeLlama-34b and GPT-3.5 (refers to GPT-3.5-turbo-instruct); and the chat conditions by the base name of the model and adding chat: CodeLlama-7b (chat) (refers to CodeLlama-7b-instruct), CodeLlama-34b (chat) (refers to CodeLlama-34b-instruct), GPT-3.5 (chat) (refers to GPT-3.5-turbo) and GPT-4o (chat).


- **Created by:**  Hussein Mozannar, Valerie Chen, Mohammed Alsobay, Subhro Das, Sebastian Zhao, Dennis Wei, Manish Nagireddy, Prasanna Sattigeri, Ameet Talwalkar, and David Sontag
- **Funded by]:** MIT-IBM Watson AI Lab 
- **Language(s) (NLP):** English
- **License:** CC

### Dataset Sources 

<!-- Provide the basic links for the dataset. -->

- **Repository:** https://github.com/clinicalml/realhumaneval
- **Paper [optional]:** https://arxiv.org/abs/2404.02806

## Uses

### Direct Use

<!-- This section describes suitable use cases for the dataset. -->

The primary purpose of the dataset in our work was for analyzing and understanding programmer interactions with varying LLMs and forms of coding assistance. However, we also summarize participant suggestions on how coding assistants could be improved and recommend the future work consider leveraging the datasets of user interactions as signals of user preferences and behavior patterns. For more information on the analysis and future work, check out Section 5 and 6 of the [paper](https://arxiv.org/abs/2404.02806). 

### Out-of-Scope Use

<!-- This section addresses misuse, malicious use, and uses that the dataset will not work well for. -->

Due to the size and scope of the dataset, it should not be treated as comprehensive in terms of capturing all potential programmer behavioral patterns when interacting with LLMs. 

## Composition

<!-- This section provides a description of the dataset fields, and additional information about the dataset structure such as criteria used to create the splits, relationships between data points, etc. -->

The data released consists of four parts:

- chat (chat_data.csv): contains the 1055 chat logs of the conversations between the study participants and the LLMs. Note the programmer_id denotes which participant the chat message was sent from.

- autocomplete (autocomplete_data.csv): for all 5207 suggestion shown in the autocomplete conditions, we log whether it was accepted and the prompt of the LLM. Note the programmer_id denotes which participant the autocomplete interaction was from.

- tasks (task_data.csv): the 17 tasks that the participants were asked to complete.

- study (study_data.csv): a dataframe of processed information for all 213 participants (e.g., how many tasks they completed, their code history, how many suggestions they accepted). 

## Collection Process

### Source Data

<!-- This section describes the source data (e.g. news text and headlines, social media posts, translated sentences, ...). -->

#### Data Collection

<!-- This section describes the data collection and processing process such as data selection criteria, filtering and normalization methods, tools and libraries used, etc. -->

Using the RealHumanEval platform, we conducted a user study to evaluate (1) the impact of LLM assistance on programmer performance as a function of the LLM's performance on static benchmarks and (2) whether human preference metrics correlate with programmer productivity metrics. See Section 3 of [paper](https://arxiv.org/abs/2404.02806) for more information.

#### Who are the participants?

<!-- This section describes the people or systems who originally created the data. It should also include self-reported demographic or identity information for the source data creators if this information is available. -->

We recruited 263 total participants from university mailing lists and social media to capture a range of coding experiences. We verified that participants were above 18 years of age, resided in the United States, and correctly completed a simple Python screening question. Out of the 263 participants, we filtered out those who did not complete any task or did not write code for a period of 15 minutes during the study to arrive at 243 final participants. Participants were provided with a $15 Amazon gift card as compensation.  This study was approved by institutional IRB review.

## Dataset Preprocessing

The dataset was preprocessed by splitting participants who interacted with autocomplete and chat and then created additional columns for each form of interaction to provide summary statistics (e.g., acceptance or copy rate). Both first authors carefully checked the dataset for any potential messages or code snippets that would reveal participant personal information. However, since the coding tasks were pre-specified, the risk of revealing such information was minimized by-design. The authors bear all responsibility in case of violation of rights.


### Bias, Risks, and Limitations

<!-- This section is meant to convey both technical and sociotechnical limitations. -->

In terms of the study limitations, we acknowledge that a set of 17 coding tasks does not span the entire set of tasks a professional programmer might encounter in their work and may limit the generalizability of our evaluations of the 6 models. Additionally, the coding tasks we used are of short duration, while real-world programming tasks can take hours to months. This presents a trade-off in study design: short tasks allow us to evaluate with more participants and models in a shorter period but give us a less clear signal compared to longer-term tasks. 

While our evaluations focused on productivity metrics, there are additional metrics of interest that may be important to measure when studying programmer interactions with LLM support. 
On the programmer side, further evaluations are needed to understand whether programmers appropriately rely on LLM support and whether LLM support leads to potential de-skilling.  
Further, our metrics do not consider potential safety concerns, where LLMs may generate harmful or insecure code.


## Dataset Card Contact

Hussein Mozannar (hssein.mzannar@gmail.com) and Valerie Chen (valeriechen@cmu.edu).
