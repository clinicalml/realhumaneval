# Task Structure


Task structure in Firebase
```
'function_signatures': list of strings,

'task_descriptions': list of strings,

'tutorial_function_signature': string,

'model': string 

'tutorial_task_description': string,

'unit_tests': list of strings,

'exp_condition': string,

'max_tokens': int,

'tutorial_unit_test': string,

'id': string,
```

Reference for model option:

```
"gpt35": GPT-3.5
"togethercomputer/CodeLlama-7b": CodeLlama-7b
"togethercomputer/CodeLlama-13b": CodeLlama-13b
"togethercomputer/CodeLlama-34b": CodeLlama-34b
"none": No AI
```


Individual coding task structure and example:
```
{
    "function_signature": "def average(nums)",

    "task_description": "Write a Python function named average that calculates and returns the average of a list of numbers. The function should take one argument, nums, which is a list of numerical values. The average should be calculated as the sum of all elements in the list divided by the number of elements. If the list is empty, the function should return 0. \n\n The function signature should be: def average(nums)",
    "name": "average",
    "unit_test": "assert average([1, 2.5, 3, 4.5]) == 2.75\nassert average([-10, -20, -30]) == -20\nassert average([]) == 0"
}
```

For max_tokens, we are using 64 per https://huggingface.co/blog/personal-copilot

40 here https://github.com/bigcode-project/jupytercoder/blob/main/src/api.js (openai)

https://github.com/LucienShui/huggingface-vscode-endpoint-server 64

https://thakkarparth007.github.io/copilot-explorer/codeviz/templates/code-viz.html#m9334&pos=1:1 - single line 
# STUDY TASKS


We pick 4 common types of settings we think programmers would benefit from LLM support.


##  Python interview problems → LLM would be helpful in getting logic

### HumanEval/91 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/91.md 
```python
def is_bored(S):
    """
    You'll be given a string of words, and your task is to count the number
    of boredoms. A boredom is a sentence that starts with the word "I".
    Sentences are delimited by '.', '?' or '!'.
   
    For example:
    >>> is_bored("Hello world")
    0
    >>> is_bored("The sky is blue. The sun is shining. I love this weather")
    1
    """
```

```python
def check(candidate):

    # Check some simple cases
    assert candidate("Hello world") == 0, "Test 1"
    assert candidate("Is the sky blue?") == 0, "Test 2"
    assert candidate("I love It !") == 1, "Test 3"
    assert candidate("bIt") == 0, "Test 4"
    assert candidate("I feel good today. I will be productive. will kill It") == 2, "Test 5"
    assert candidate("You and I are going for a walk") == 0, "Test 6"

    # Check some edge cases that are easy to work out by hand.
    assert True, "This prints if this assert fails 2 (also good for debugging!)"
```

### HumanEval/75 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/75.md

```python
def is_multiply_prime(a):
    """Write a function that returns true if the given number is the multiplication of 3 prime numbers
    and false otherwise.
    Knowing that (a) is less then 100. 
    Example:
    is_multiply_prime(30) == True
    30 = 2 * 3 * 5
    """
```

```python
def check(candidate):

    assert candidate(5) == False
    assert candidate(30) == True
    assert candidate(8) == True
    assert candidate(10) == False
    assert candidate(125) == True
    assert candidate(3 * 5 * 7) == True
    assert candidate(3 * 6 * 7) == False
    assert candidate(9 * 9 * 9) == False
    assert candidate(11 * 9 * 9) == False
    assert candidate(11 * 13 * 7) == True
```



### HumanEval/93 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/93.md
```python
def encode(message):
    """
    Write a function that takes a message, and encodes in such a 
    way that it swaps case of all letters, replaces all vowels in 
    the message with the letter that appears 2 places ahead of that 
    vowel in the english alphabet. 
    Assume only letters. 
    
    Examples:
    >>> encode('test')
    'TGST'
    >>> encode('This is a message')
    'tHKS KS C MGSSCGG'
    """
```


```python
def check(candidate):

    # Check some simple cases
    assert candidate('TEST') == 'tgst', "This prints if this assert fails 1 (good for debugging!)"
    assert candidate('Mudasir') == 'mWDCSKR', "This prints if this assert fails 2 (good for debugging!)"
    assert candidate('YES') == 'ygs', "This prints if this assert fails 3 (good for debugging!)"
    
    # Check some edge cases that are easy to work out by hand.
    assert candidate('This is a message') == 'tHKS KS C MGSSCGG', "This prints if this assert fails 2 (also good for debugging!)"
    assert candidate("I DoNt KnOw WhAt tO WrItE") == 'k dQnT kNqW wHcT Tq wRkTg', "This prints if this assert fails 2 (also good for debugging!)"
```


### HumanEval/108 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/108.md

```python
def count_nums(arr):
    """
    Write a function count_nums which takes an array of integers and returns
    the number of elements which has a sum of digits > 0.
    If a number is negative, then its first signed digit will be negative:
    e.g. -123 has signed digits -1, 2, and 3.
    >>> count_nums([]) == 0
    >>> count_nums([-1, 11, -11]) == 1
    >>> count_nums([1, 1, 2]) == 3
    """
```

```python
def check(candidate):

    # Check some simple cases
    assert candidate([]) == 0
    assert candidate([-1, -2, 0]) == 0
    assert candidate([1, 1, 2, -2, 3, 4, 5]) == 6
    assert candidate([1, 6, 9, -6, 0, 1, 5]) == 5
    assert candidate([1, 100, 98, -7, 1, -1]) == 4
    assert candidate([12, 23, 34, -45, -56, 0]) == 5
    assert candidate([-0, 1**0]) == 1
    assert candidate([1]) == 1

    # Check some edge cases that are easy to work out by hand.
    assert True, "This prints if this assert fails 2 (also good for debugging!)"
```


### HumanEval/145 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/145.md

```python
def order_by_points(nums):
    """
    Write a function which sorts the given list of integers
    in ascending order according to the sum of their digits.
    Note: if there are several items with similar sum of their digits,
    order them based on their index in original list.

    For example:
    >>> order_by_points([1, 11, -1, -11, -12]) == [-1, -11, 1, -12, 11]
    >>> order_by_points([]) == []
    """
```

```python
def check(candidate):

    # Check some simple cases
    assert candidate([1, 11, -1, -11, -12]) == [-1, -11, 1, -12, 11]
    assert candidate([1234,423,463,145,2,423,423,53,6,37,3457,3,56,0,46]) == [0, 2, 3, 6, 53, 423, 423, 423, 1234, 145, 37, 46, 56, 463, 3457]
    assert candidate([]) == []
    assert candidate([1, -11, -32, 43, 54, -98, 2, -3]) == [-3, -32, -98, -11, 1, 2, 43, 54]
    assert candidate([1,2,3,4,5,6,7,8,9,10,11]) == [1, 10, 2, 11, 3, 4, 5, 6, 7, 8, 9]
    assert candidate([0,6,6,-76,-21,23,4]) == [-76, -21, 0, 4, 23, 6, 6]

    # Check some edge cases that are easy to work out by hand.
    assert True, "This prints if this assert fails 2 (also good for debugging!)"
```


### HumanEval/155 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/155.md

```python
def even_odd_count(num):
    """Given an integer. return a tuple that has the number of even and odd digits respectively.

     Example:
        even_odd_count(-12) ==> (1, 1)
        even_odd_count(123) ==> (1, 2)
    """
```

```python
def check(candidate):

    # Check some simple cases
    assert candidate(7) == (0, 1)
    assert candidate(-78) == (1, 1)
    assert candidate(3452) == (2, 2)
    assert candidate(346211) == (3, 3)
    assert candidate(-345821) == (3, 3)
    assert candidate(-2) == (1, 0)
    assert candidate(-45347) == (2, 3)
    assert candidate(0) == (1, 0)


    # Check some edge cases that are easy to work out by hand.
    assert True
```

### HumanEval/8 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/8.md

```python
def sum_product(numbers):
    """ For a given list of integers, return a tuple consisting of a sum and a product of all the integers in a list.
    Empty sum should be equal to 0 and empty product should be equal to 1.
    >>> sum_product([])
    (0, 1)
    >>> sum_product([1, 2, 3, 4])
    (10, 24)
    """
```

```python
def check(candidate):
    assert candidate([]) == (0, 1)
    assert candidate([1, 1, 1]) == (3, 1)
    assert candidate([100, 0]) == (100, 0)
    assert candidate([3, 5, 7]) == (3 + 5 + 7, 3 * 5 * 7)
    assert candidate([10]) == (10, 10)
```

### HumanEval/40 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/40.md

```python
def triples_sum_to_zero(l):
    """
    triples_sum_to_zero takes a list of integers as an input.
    it returns True if there are three distinct elements in the list that
    sum to zero, and False otherwise.

    >>> triples_sum_to_zero([1, 3, 5, 0])
    False
    >>> triples_sum_to_zero([1, 3, -2, 1])
    True
    >>> triples_sum_to_zero([1, 2, 3, 7])
    False
    >>> triples_sum_to_zero([2, 4, -5, 3, 9, 7])
    True
    >>> triples_sum_to_zero([1])
    False
    """
```


```python
def check(candidate):
    assert candidate([1, 3, 5, 0]) == False
    assert candidate([1, 3, 5, -1]) == False
    assert candidate([1, 3, -2, 1]) == True
    assert candidate([1, 2, 3, 7]) == False
    assert candidate([1, 2, 5, 7]) == False
    assert candidate([2, 4, -5, 3, 9, 7]) == True
    assert candidate([1]) == False
    assert candidate([1, 3, 5, -100]) == False
    assert candidate([100, 3, 5, -100]) == False
```

## Data manipulation tasks → LLM would be helpful in remembering syntax

### Transform input pandas dataframe to output dataframe (Valerie problem, solved by gpt-4)

Task description:
```python
+----+-------+---------+---------------------+----------+
|    |   age | color   | dates               |   height |
|----+-------+---------+---------------------+----------|
|  0 |     1 | blue    | 2019-03-06 00:00:00 |  2.72656 |
|  1 |     4 | blue    | 2019-03-05 00:00:00 |  4.77665 |
|  2 |     4 | green   | 2019-03-10 00:00:00 |  8.12169 |
|  3 |    10 | brown   | 2019-03-07 00:00:00 |  4.79977 |
|  4 |    20 | green   | 2019-03-01 00:00:00 |  3.92785 |
+----+-------+---------+---------------------+----------+


This is a pandas dataframe provided to you above as input.

You need to transform it exactly to the following output dataframe:

+----+----------+--------+---------+---------+---------+-------+----------+
|    | age      |   blue |   brown |   green |   month |   day |   height |
|----+----------+--------+---------+---------+---------+-------+----------|
|  0 | Under 18 |      1 |       0 |       0 |       3 |     6 |        3 |
|  1 | Under 18 |      1 |       0 |       0 |       3 |     5 |        5 |
|  2 | Under 18 |      0 |       0 |       1 |       3 |    10 |        8 |
|  3 | Under 18 |      0 |       1 |       0 |       3 |     7 |        5 |
|  4 | 18-25    |      0 |       0 |       1 |       3 |     1 |        4 |
+----+----------+--------+---------+---------+---------+-------+----------+

Your code should be placed inside a function called transform_df that takes as input a dataframe and returns the transformed dataframe
```

Code provided (function signature)

```python
import pandas as pd
from io import StringIO

# Original dataset
data = """
age,color,dates,height
1,blue,2019-03-06,2.72656
4,blue,2019-03-05,4.77665
4,green,2019-03-10,8.12169
10,brown,2019-03-07,4.79977
20,green,2019-03-01,3.92785
"""

# Read the dataset into a DataFrame
df = pd.read_csv(StringIO(data))

def transform_df(df):
    # Your code here

print(transform_df(df))

```

Testing code:

```python

data = """
age,color,dates,height
1,blue,2019-03-06,2.72656
4,blue,2019-03-05,4.77665
4,green,2019-03-10,8.12169
10,brown,2019-03-07,4.79977
20,green,2019-03-01,3.92785
"""
df = pd.read_csv(StringIO(data))
new_data_testing = """
age,blue,brown,green,month,day,height
Under 18,1,0,0,3,6,3
Under 18,1,0,0,3,5,5
Under 18,0,0,1,3,10,8
Under 18,0,1,0,3,7,5
18-25,0,0,1,3,1,4
"""
def evaluate_correctness(target_df, input_df):
    target_df.reset_index(drop=True, inplace=True)
    input_df.reset_index(drop=True, inplace=True)
    score = 0
    for col in target_df.columns:
        if col not in input_df.columns:
            score -=1 
        else:
            if np.all(target_df[col] != input_df[col]):
                score-=1
    for col in input_df.columns:
        if col not in target_df.columns:
            score -=1
    return score
new_data_df_testing = pd.read_csv(StringIO(new_data_testing))
assert evaluate_correctness(new_data_df_testing, transform_df(df)) == 0
```

solution code:

```python
import pandas as pd
from io import StringIO

def transform_df(df):
    # Process the dataset to match the desired format
    # 1. Convert 'age' to categorical data
    df['age'] = pd.cut(df['age'], bins=[0, 18, 25, 100], labels=["Under 18", "18-25", "Over 25"], right=False)

    # 2. Convert 'color' to one-hot encoding
    color_dummies = pd.get_dummies(df['color'])
    df = pd.concat([df, color_dummies], axis=1)

    # 3. Extract 'month' and 'day' from 'dates'
    df['dates'] = pd.to_datetime(df['dates'])
    df['month'] = df['dates'].dt.month
    df['day'] = df['dates'].dt.day

    # 4. Round 'height' to nearest integer
    df['height'] = df['height'].round().astype(int)

    # 5. Drop the original 'color' and 'dates' columns
    df.drop(['color', 'dates'], axis=1, inplace=True)

    # Rearrange columns to match the desired format
    df = df[['age', 'blue', 'brown', 'green', 'month', 'day', 'height']]
    return df
```

### Unstructured input to output transformation First one


Task description (gpt-4 fails)
```python
+----+--------+--------+---------+--------+--------+
|    |   col1 |   col2 |    col3 |   col4 |   col5 |
|----+--------+--------+---------+--------+--------|
|  0 |      6 |      4 | 0.56713 |     10 |      4 |
|  1 |      1 |      6 | 2.72656 |      9 |      6 |
|  2 |      4 |      3 | 4.77665 |     10 |      1 |
|  3 |      4 |      5 | 8.12169 |      5 |      3 |
|  4 |      8 |      8 | 4.79977 |      4 |      4 |
|  5 |     10 |      7 | 3.92785 |      1 |      9 |
+----+--------+--------+---------+--------+--------+

This is a pandas dataframe provided to you above as input.

You need to transform it exactly to the following output dataframe:

+----+--------+--------+---------+--------+
|    |   col1 |   col2 |    col3 |   col4 |
|----+--------+--------+---------+--------|
|  0 |     60 |      0 | 0.56713 |   1000 |
|  1 |      9 |      2 | 2.72656 |    900 |
|  2 |     40 |      4 | 4.77665 |   1000 |
|  3 |     20 |      8 | 8.12169 |    500 |
|  4 |     32 |      4 | 4.79977 |    400 |
|  5 |     10 |      3 | 3.92785 |    100 |
+----+--------+--------+---------+--------+

Your code should be placed inside a function called transform_df that takes as input a dataframe and returns the transformed dataframe. There are patterns that you have to discover.
```

Code provided (function signature)

```python
import pandas as pd
from io import StringIO

# Original dataset
data = """
col1,col2,col3,col4,col5
6,4,0.5671297731744318,10,4
1,6,2.726562945801132,9,6
4,3,4.776651173213499,10,1
4,5,8.121687287754932,5,3
8,8,4.799771723750573,4,4
10,7,3.9278479610082973,1,9
"""

# Read the dataset into a DataFrame
df = pd.read_csv(StringIO(data))

def transform_df(df):
    # Your code here

print(transform_df(df))

```



Testing code

```python
data = """
col1,col2,col3,col4,col5
6,4,0.5671297731744318,10,4
1,6,2.726562945801132,9,6
4,3,4.776651173213499,10,1
4,5,8.121687287754932,5,3
8,8,4.799771723750573,4,4
10,7,3.9278479610082973,1,9
"""
df = pd.read_csv(StringIO(data))
new_data_testing = """
col1,col2,col3,col4
60,0,0.5671297731744318,1000
9,2,2.726562945801132,900
40,4,4.776651173213499,1000
20,8,8.121687287754932,500
32,4,4.799771723750573,400
10,3,3.9278479610082973,100
"""
def evaluate_correctness(target_df, input_df):
    # drop index column from both
    target_df.reset_index(drop=True, inplace=True)
    input_df.reset_index(drop=True, inplace=True)
    score = 0
    for col in target_df.columns:
        if col not in input_df.columns:
            score -=1 
        else:
            if np.all(target_df[col] != input_df[col]):
                score-=1
    for col in input_df.columns:
        if col not in target_df.columns:
            score -=1
    return score
new_data_df_testing = pd.read_csv(StringIO(new_data_testing))
assert evaluate_correctness(new_data_df_testing, transform_df(df)) == 0
```


Solution code

```python
import pandas as pd
from io import StringIO
def transform_df(df):
    df_transformed = df.copy()

    # col1 as the multiplication of col1 and col4
    df_transformed['col1'] = df['col1'] * df['col4']

    # col2 as col3 truncated to the nearest integer
    df_transformed['col2'] = df['col3'].astype(int)

    # col4 multiplied by 100
    df_transformed['col4'] = df['col4'] * 100

    # Remove col5
    df_transformed.drop('col5', axis=1, inplace=True)
    return df_transformed

```

### Unstructured input to output transformation Second one

Task description:
```python
+----+--------+--------+---------+--------+--------+
|    |   col1 |   col2 |    col3 |   col4 |   col5 |
|----+--------+--------+---------+--------+--------|
|  0 |      6 |      1 | 5.38817 |      3 |      2 |
|  1 |      9 |      2 | 4.19195 |      5 |      8 |
|  2 |     10 |      8 | 6.8522  |      8 |      1 |
|  3 |      6 |      7 | 2.04452 |      8 |      7 |
|  4 |      1 |     10 | 8.78117 |     10 |     10 |
+----+--------+--------+---------+--------+--------+

This is a pandas dataframe provided to you above as input.

You need to transform it exactly to the following output dataframe by recognizing the relationship between the input and output dataframes.

+----+--------+--------+----------+
|    |   col1 |   col2 |     col3 |
|----+--------+--------+----------|
|  0 |      6 |      2 |  8.38817 |
|  1 |     15 |      3 |  9.19195 |
|  2 |     25 |      9 | 14.8522  |
|  3 |     31 |      8 | 10.0445  |
|  4 |     32 |     11 | 18.7812  |
|  0 |      0 |      0 |  0       |
|  0 |      0 |      0 |  0       |
+----+--------+--------+----------+

Your code should be placed inside a function called transform_df that takes as input a dataframe and returns the transformed dataframe. There are patterns that you have to discover.
```

Code provided (function signature)

```python
import pandas as pd
from io import StringIO

# Original dataset
data = """
col1,col2,col3,col4,col5
6,1,5.3881673400335695,3,2
9,2,4.191945144032948,5,8
10,8,6.852195003967595,8,1
6,7,2.0445224973151745,8,7
1,10,8.781174363909454,10,10
"""

# Read the dataset into a DataFrame
df = pd.read_csv(StringIO(data))

def transform_df(df):
    # Your code here

print(transform_df(df))

```



Testing code

```python
data = """
col1,col2,col3,col4,col5
6,1,5.3881673400335695,3,2
9,2,4.191945144032948,5,8
10,8,6.852195003967595,8,1
6,7,2.0445224973151745,8,7
1,10,8.781174363909454,10,10
"""
df = pd.read_csv(StringIO(data))
new_data_testing = """
col1,col2,col3
6,2,8.388167340033569
15,3,9.191945144032948
25,9,14.852195003967594
31,8,10.044522497315175
32,11,18.781174363909454
0,0,0.0
0,0,0.0
"""
def evaluate_correctness(target_df, input_df):
    # drop index column from both
    target_df.reset_index(drop=True, inplace=True)
    input_df.reset_index(drop=True, inplace=True)
    score = 0
    for col in target_df.columns:
        if col not in input_df.columns:
            score -=1 
        else:
            if np.all(target_df[col] != input_df[col]):
                score-=1
    for col in input_df.columns:
        if col not in target_df.columns:
            score -=1
    return score
new_data_df_testing = pd.read_csv(StringIO(new_data_testing))
assert evaluate_correctness(new_data_df_testing, transform_df(df)) == 0
```


Solution code

```python
import pandas as pd
from io import StringIO
def transform_df(df):
    df_transformed_requested = df.copy()
    df_transformed_requested['col1'] = df['col1'].cumsum()

    # col2 + 1
    df_transformed_requested['col2'] = df['col2'] + 1

    # col3 plus col4
    df_transformed_requested['col3'] = df['col3'] + df['col4']

    # Remove col4 and col5
    df_transformed_requested.drop(['col4', 'col5'], axis=1, inplace=True)

    # add two extra rows that are all zeros to the df
    df_transformed_requested = df_transformed_requested.append(pd.DataFrame([[0,0,0]], columns=df_transformed_requested.columns))
    df_transformed_requested = df_transformed_requested.append(pd.DataFrame([[0,0,0]], columns=df_transformed_requested.columns))
    return df_transformed_requested

```


## Editing and Augmenting Existing Code → LLM would be helpful as it can quickly digest existing code 


### Calculator

Task description:

```
This is a special calculator that keeps track of the previous operations performed.
Note that the operations like add are not the standard ones and this is on purpose

Your job is to fix some remaining bugs in the calculator class:

- you should not modify the behavior add, subtract, multiply, divide methods in terms of the calculation

- make sure that the add, subtract, multiply, divide methods only execute if the input is valid, if the input is not valid, the method should return WITHOUT doing anything or raising any errors.

- fix the implementation of undo_last_operation by relying on the previous_operations list. 

```

Function signature:

```python
class Calculator:
    def __init__(self):
        # the calculator only keeps track of the current number
        self.current_number = 0
        # stores the previous operations performed
        self.previous_operations = []
    def add(self, a):
        '''
        a: real number
        '''
        # the two lines below should not be changed
        self.previous_operations.append((a, "add"))
        self.current_number += a + 20
    
    def subtract(self, a):
        '''
        a: real number
        '''

        # the two lines below should not be changed
        self.previous_operations.append((a, "subtract"))
        self.current_number =  self.current_number - a/10

    def multiply(self, a):
        '''
        a: real number
        '''

        # the two lines below should not be changed
        self.previous_operations.append((a, "multiply"))
        self.current_number =  (self.current_number ** a ) / a

    def divide(self, a):
        '''
        a: positive integer
        '''

        # the two lines below should not be changed
        self.previous_operations.append((a, "divide"))
        self.current_number =  self.current_number / a * 2

    def undo_last_operation(self):
        '''
        undoes the last operation performed and restors current_number to the value before the last operation
        '''
        # fix this code
        last_operation = self.previous_operations.pop()
    
    def undo_last_k_operations(self, k):
        ''' 
        undoes the last k operations performed and restores current_number to the value before the last k operations
        Args:
            k (int): number of operations to undo
        '''
        for i in range(k):
            self.undo_last_operation()

```

unit tests:

```python
calc = Calculator()
calc.add(5)
assert calc.current_number == 25
calc.add('a')
assert calc.current_number == 25
calc.subtract(2.2)
assert calc.current_number == 24.78
calc.multiply(0)
assert calc.current_number == 24.78
calc.multiply(2)
assert calc.current_number == 307.0242
calc.divide(-1)
assert calc.current_number == 307.0242
calc.undo_last_operation()
assert calc.current_number == 24.78
calc.undo_last_k_operations(2)
assert calc.current_number == 0.0
```

solution:
```python

class Calculator:
    def __init__(self):
        # the calculator only keeps track of the current number
        self.current_number = 0
        # stores the previous operations performed
        self.previous_operations = []


    def add(self, a):
        '''
        a: real number
        '''
        if not isinstance(a, (int, float)):
            return
        # two lines below should not be changed
        self.previous_operations.append((a, "add"))
        self.current_number += a + 20
    
    def subtract(self, a):
        '''
        a: real number
        '''
        if not isinstance(a, (int, float)):
            return
        # two lines below should not be changed
        self.previous_operations.append((a, "subtract"))
        self.current_number =  self.current_number - a/10

    def multiply(self, a):
        '''
        a: real number
        '''
        if not isinstance(a, (int, float)) or a == 0:
            return
        # two lines below should not be changed
        self.previous_operations.append((a, "multiply"))
        self.current_number =  (self.current_number ** a ) / a

    def divide(self, a):
        '''
        a: positive integer
        '''
        if not isinstance(a, (int)) or a <= 0:
            return
        # two lines below should not be changed
        self.previous_operations.append((a, "divide"))
        self.current_number =  self.current_number / a * 2

    def undo_last_operation(self):
        '''
        undoes the last operation performed and restors current_number to the value before the last operation
        '''
        last_operation = self.previous_operations.pop()
        if last_operation[1] == "add":
            self.current_number -= last_operation[0] + 20
        elif last_operation[1] == "subtract":
            self.current_number += last_operation[0]/10
        elif last_operation[1] == "multiply":
            self.current_number =  (self.current_number * last_operation[0] ) ** (1/last_operation[0])
        elif last_operation[1] == "divide":
            self.current_number =  self.current_number * last_operation[0] / 2
        
    def undo_last_k_operations(self, k):
        ''' 
        undoes the last k operations performed and restores current_number to the value before the last k operations
        Args:
            k (int): number of operations to undo
        '''
        for i in range(k):
            self.undo_last_operation()
          
```


### Tokenizer

Task description:
```
In the code shown in the editor, is a class that implements a tokenizer. A tokenizer maps a set of individual words to a number. 

We have implemented a majority of the code but have not yet implemented the core functionality that creates the dictionary that maps words to ids, and ids to words.


```


function signature:
```python
from collections import Counter

class Tokenizer:
    def __init__(self, max_vocab_size=200):
        self.max_vocab_size = max_vocab_size
        self.word_to_id = {}
        self.id_to_word = {}

    def tokenize(self, text):
        # do not change
        # Split text into words by spaces
        return text.lower().split()

    def build_vocabulary(self, corpus):
        # to be implemented
        # write your code here
    

    def get_word_id(self, word):
        # do not change
        # Retrieve the ID of a word, return None if the word is not in the vocabulary
        return self.word_to_id.get(word)

    def get_word_by_id(self, word_id):
        # do not change
        # Retrieve a word by its ID, return None if the ID is not in the vocabulary
        return self.id_to_word.get(word_id)

```


look at problems in swebench

take an existing function in pandas, and change it

- edit existing code


class tokenizer


- fix code

class Login

class SurveyAnalysis

- augment only

class Retreiver

class DataLoader 
 split by different conditions
 balancing 




### Task one
[ create task inspired by my prior work]

 Given the following class, this class is a Retreiver which given a set of numerical vectors and a paramter k, can return the k-nearest neighbors of a given vector.

 Perform the following edits to the code:

 -  write a method that returns the least similar k vectors
 -  write a method that given a set of query vectors, returns the top k vectors for each of the query vectors
 -  create a method to append new vectors to the already vectors in Retreiver
 -  create a new distance function that instead of norm we make it a weighted distance as follows:

    Compute maximum scale of each feature on the training set:

    $$ scales = [\max_{i}(X_{1,i}), \cdots, \max_{i}(X_{d,i}),] $$

    Then let the distance function be:

    $$ dist(x,z) = \sum_i \frac{1}{scales[i]} * (x_i - z_i)^2 $$
- create a method to change k to user specified value


```python
import numpy as np
class Retreiver:
    def __init__(self, vectors, k):
        self.vectors = vectors
        self.k = k
    
    def distance(self, query):
        ''' 
        query: single numpy arrray
        return: inverse l2 distances from query to the vectors
        '''
        distances = np.linalg.norm(self.vectors - query, axis=1)
        return distances
    

    def get_top_k_similar_vectors(self, query):
        '''
        query: single numpy array
        return: top k similar vectors
        '''
        scores = self.distance(query)
        # np.argsort sorts in ascending order
        indices_top = np.argsort(scores)
        top_k_indices = indices_top[:self.k]
        return self.vectors[top_k_indices]
```


- two more

## Repetative Coding Tasks -> LLM suggestions can help in typing speed


see https://chat.openai.com/share/28873ded-f820-4ebe-a225-d327a051b876

todo list

employee

event scheduler

classroom




- Graph 


Define a class for a graph (call it Node) that has as attribute a list of nodes.

Create a method that appends an element to the list of nodes.

Create a method that calculates the total time for all the nodes in the Graph. 
  
Create a method that prints the name of all the nodes in the graph.


- Three more tasks

classroom 