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

https://github.com/facebookresearch/codellama/issues/89 - codellama doesnt know when to stop
# STUDY TASKS


We pick 4 common types of settings we think programmers would benefit from LLM support.


##  Python interview problems → LLM would be helpful in getting logic

### HumanEval/91 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/91.md 

name: is_bored

task description:

```
You'll be given a string of words, and your task is to count the number
of boredoms. A boredom is a sentence that starts with the word "I".
Sentences are delimited by '.', '?' or '!'.

For example:
>>> is_bored("Hello world")
0
>>> is_bored("The sky is blue. The sun is shining. I love this weather")
1
```

function signature:
```python
def is_bored(S):
```

tests

```python
# Check some simple cases
assert is_bored("Hello world") == 0, "Test 1"
assert is_bored("Is the sky blue?") == 0, "Test 2"
assert is_bored("I love It !") == 1, "Test 3"
assert is_bored("bIt") == 0, "Test 4"
assert is_bored("I feel good today. I will be productive. will kill It") == 2, "Test 5"
assert is_bored("You and I are going for a walk") == 0, "Test 6"
```

solution:

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
    import re
    sentences = re.split(r'[.?!]\s*', S)
    return sum(sentence[0:2] == 'I ' for sentence in sentences)
```

### HumanEval/75 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/75.md


name: is_multiply_prime

task description:

```
Write a function that returns true if the given number is the multiplication of 3 prime numbers
    and false otherwise.
    Knowing that (a) is less then 100. 
    Example:
    is_multiply_prime(30) == True
    30 = 2 * 3 * 5
```


function signature:

```python
def is_multiply_prime(a):
```


unit tests:

```python

assert is_multiply_prime(5) == False
assert is_multiply_prime(30) == True
assert is_multiply_prime(8) == True
assert is_multiply_prime(10) == False
assert is_multiply_prime(125) == True
assert is_multiply_prime(3 * 5 * 7) == True
assert is_multiply_prime(3 * 6 * 7) == False
assert is_multiply_prime(9 * 9 * 9) == False
assert is_multiply_prime(11 * 9 * 9) == False
assert is_multiply_prime(11 * 13 * 7) == True
```

solution:

```python
def is_multiply_prime(a):
    """Write a function that returns true if the given number is the multiplication of 3 prime numbers
    and false otherwise.
    Knowing that (a) is less then 100. 
    Example:
    is_multiply_prime(30) == True
    30 = 2 * 3 * 5
    """
    def is_prime(n):
        for j in range(2,n):
            if n%j == 0:
                return False
        return True

    for i in range(2,101):
        if not is_prime(i): continue
        for j in range(2,101):
            if not is_prime(j): continue
            for k in range(2,101):
                if not is_prime(k): continue
                if i*j*k == a: return True
    return False
```


### HumanEval/93 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/93.md

name: encode_message

task description:

```
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
```


function signature:


```python
def encode(message):
```


unit tests:
```python
# Check some simple cases
assert encode('TEST') == 'tgst', "This prints if this assert fails 1 (good for debugging!)"
assert encode('Mudasir') == 'mWDCSKR', "This prints if this assert fails 2 (good for debugging!)"
assert encode('YES') == 'ygs', "This prints if this assert fails 3 (good for debugging!)"

# Check some edge cases that are easy to work out by hand.
assert encode('This is a message') == 'tHKS KS C MGSSCGG', "This prints if this assert fails 2 (also good for debugging!)"
assert encode("I DoNt KnOw WhAt tO WrItE") == 'k dQnT kNqW wHcT Tq wRkTg', "This prints if this assert fails 2 (also good for debugging!)"
```

solution:
    
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
    vowels = "aeiouAEIOU"
    vowels_replace = dict([(i, chr(ord(i) + 2)) for i in vowels])
    message = message.swapcase()
    return ''.join([vowels_replace[i] if i in vowels else i for i in message])
```





### HumanEval/108 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/108.md

name: count_nums

task description:

```
Write a function count_nums which takes an array of integers and returns
the number of elements which has a sum of digits > 0.
If a number is negative, then its first signed digit will be negative:
e.g. -123 has signed digits -1, 2, and 3.
>>> count_nums([]) == 0
>>> count_nums([-1, 11, -11]) == 1
>>> count_nums([1, 1, 2]) == 3
```

signature:

```python
def count_nums(arr):

```

unit tests:

```python

# Check some simple cases
assert count_nums([]) == 0
assert count_nums([-1, -2, 0]) == 0
assert count_nums([1, 1, 2, -2, 3, 4, 5]) == 6
assert count_nums([1, 6, 9, -6, 0, 1, 5]) == 5
assert count_nums([1, 100, 98, -7, 1, -1]) == 4
assert count_nums([12, 23, 34, -45, -56, 0]) == 5
assert count_nums([-0, 1**0]) == 1
assert count_nums([1]) == 1

```

solution
    
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
    def digits_sum(n):
        neg = 1
        if n < 0: n, neg = -1 * n, -1 
        n = [int(i) for i in str(n)]
        n[0] = n[0] * neg
        return sum(n)
    return len(list(filter(lambda x: x > 0, [digits_sum(i) for i in arr])))
```


### HumanEval/145 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/145.md

name: order_by_points

task description:

```
Write a function which sorts the given list of integers
in ascending order according to the sum of their digits.
Note: if there are several items with similar sum of their digits,
order them based on their index in original list.

For example:
>>> order_by_points([1, 11, -1, -11, -12]) == [-1, -11, 1, -12, 11]
>>> order_by_points([]) == []

```

function signature:


```python
def order_by_points(nums):

```

unit tests:

```python

# Check some simple cases
assert order_by_points([1, 11, -1, -11, -12]) == [-1, -11, 1, -12, 11]
assert order_by_points([1234,423,463,145,2,423,423,53,6,37,3457,3,56,0,46]) == [0, 2, 3, 6, 53, 423, 423, 423, 1234, 145, 37, 46, 56, 463, 3457]
assert order_by_points([]) == []
assert order_by_points([1, -11, -32, 43, 54, -98, 2, -3]) == [-3, -32, -98, -11, 1, 2, 43, 54]
assert order_by_points([1,2,3,4,5,6,7,8,9,10,11]) == [1, 10, 2, 11, 3, 4, 5, 6, 7, 8, 9]
assert order_by_points([0,6,6,-76,-21,23,4]) == [-76, -21, 0, 4, 23, 6, 6]

```

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
    def digits_sum(n):
        neg = 1
        if n < 0: n, neg = -1 * n, -1 
        n = [int(i) for i in str(n)]
        n[0] = n[0] * neg
        return sum(n)
    return sorted(nums, key=digits_sum)
```

### HumanEval/155 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/155.md


name: even_odd_count

task description:

```
Given an integer. return a tuple that has the number of even and odd digits respectively.
Example:
even_odd_count(-12) ==> (1, 1)
even_odd_count(123) ==> (1, 2)
```


function signature:

```python
def even_odd_count(num):
```

```python
# Check some simple cases
assert even_odd_count(7) == (0, 1)
assert even_odd_count(-78) == (1, 1)
assert even_odd_count(3452) == (2, 2)
assert even_odd_count(346211) == (3, 3)
assert even_odd_count(-345821) == (3, 3)
assert even_odd_count(-2) == (1, 0)
assert even_odd_count(-45347) == (2, 3)
assert even_odd_count(0) == (1, 0)

```

solution:
```python
def even_odd_count(num):
    """Given an integer. return a tuple that has the number of even and odd digits respectively.

     Example:
        even_odd_count(-12) ==> (1, 1)
        even_odd_count(123) ==> (1, 2)
    """
    even_count = 0
    odd_count = 0
    for i in str(abs(num)):
        if int(i)%2==0:
            even_count +=1
        else:
            odd_count +=1
    return (even_count, odd_count)
```



### HumanEval/8 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/8.md

name: sum_product

task description:

```
For a given list of integers, return a tuple consisting of a sum and a product of all the integers in a list.
Empty sum should be equal to 0 and empty product should be equal to 1. >>> sum_product([]) (0, 1) >>> sum_product([1, 2, 3, 4]) (10, 24)
```
function signature:

```python
def sum_product(numbers):
```

unit tests:


```python
assert sum_product([]) == (0, 1)
assert sum_product([1, 1, 1]) == (3, 1)
assert sum_product([100, 0]) == (100, 0)
assert sum_product([3, 5, 7]) == (3 + 5 + 7, 3 * 5 * 7)
assert sum_product([10]) == (10, 10)
```

solution:
```python
from typing import List, Tuple


def sum_product(numbers: List[int]) -> Tuple[int, int]:
    """ For a given list of integers, return a tuple consisting of a sum and a product of all the integers in a list.
    Empty sum should be equal to 0 and empty product should be equal to 1.
    >>> sum_product([])
    (0, 1)
    >>> sum_product([1, 2, 3, 4])
    (10, 24)
    """
    sum_value = 0
    prod_value = 1

    for n in numbers:
        sum_value += n
        prod_value *= n
    return sum_value, prod_value
```

### HumanEval/40 https://github.com/jamesmurdza/humaneval-results/blob/main/gpt-3.5-turbo/40.md

name: triple_sum_to_zero

task description:

```
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
```

signature:
```python
def triples_sum_to_zero(l):

```

unit tests:
```python
assert triples_sum_to_zero([1, 3, 5, 0]) == False
assert triples_sum_to_zero([1, 3, 5, -1]) == False
assert triples_sum_to_zero([1, 3, -2, 1]) == True
assert triples_sum_to_zero([1, 2, 3, 7]) == False
assert triples_sum_to_zero([1, 2, 5, 7]) == False
assert triples_sum_to_zero([2, 4, -5, 3, 9, 7]) == True
assert triples_sum_to_zero([1]) == False
assert triples_sum_to_zero([1, 3, 5, -100]) == False
assert triples_sum_to_zero([100, 3, 5, -100]) == False
```


solution:
```python
def triples_sum_to_zero(l: list):
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
    for i in range(len(l)):
        for j in range(i + 1, len(l)):
            for k in range(j + 1, len(l)):
                if l[i] + l[j] + l[k] == 0:
                    return True
    return False
```

### event scheduler

name: event_scheduler

Task description:
```
Problem Description:

Input:

You have a list of events.
Each event is represented as a tuple (start, end, score).
start: The starting hour of the event (an integer between 0 and 10).
end: The ending hour of the event (an integer between start and 10).
score: The importance score of the event (a positive integer).
Constraints:

The events can only be scheduled between the hours of 0:00 and 10:00.
No two events can overlap. An event with an end time of X cannot overlap with another event with a start time of X.
Each event can be scheduled only once.
Objective:

Your goal is to schedule the events in such a way that the total importance score is maximized.
The algorithm should return the maximum total importance score that can be achieved with the given set of events.

Example:

Suppose you have the following list of events:

Event 1: (1, 3, 5)
Event 2: (1, 2, 3)
Event 3: (2, 3, 4)

Best schedule would be to pick Event 2 and Event 3, which would give a total importance score of 7.

The algorithm should determine the best way to schedule these events between 0:00 and 10:00 to achieve the highest total importance score, without any overlapping of events.

Output: The algorithm should return a single integer, which is the highest total importance score achievable under the given constraints.
```


function signature:
```python
test_events = [(1, 2, 10), (2,3,5), (1,3,14)]

def schedule_events(events):
    '''
    events is a list of tuples of the form (start_time, end_time, score)
    '''
    score = 0
    # write your code here

    return score

print(schedule_events(test_events))
```

unit tests:
```python

# Test Case 1: Single event
events = [(0, 2, 10)]
assert schedule_events(events) == 10, "Test Case 1 Failed"

# Test Case 2: Two non-overlapping events
events = [(0, 2, 10), (2, 4, 15)]
assert schedule_events(events) == 25, "Test Case 2 Failed"

# Test Case 3: Two overlapping events, one with higher score
events = [(0, 3, 10), (2, 5, 20)]
assert schedule_events(events) == 20, "Test Case 3 Failed"

# Test Case 4: Multiple events, some overlapping
events = [(0, 3, 10), (2, 5, 15), (5, 7, 20)]
assert schedule_events(events) == 35, "Test Case 4 Failed"

# Test Case 5: Events with the same time
events = [(1, 4, 10), (1, 4, 15)]
assert schedule_events(events) == 15, "Test Case 5 Failed"

# Test Case 6: Events spread throughout the day
events = [(0, 2, 10), (3, 5, 15), (6, 8, 20), (9, 10, 25)]
assert schedule_events(events) == 70, "Test Case 6 Failed"

# Test Case 7: Non-overlapping events with equal score
events = [(0, 2, 10), (2, 4, 10), (4, 6, 10)]
assert schedule_events(events) == 30, "Test Case 7 Failed"

# Test Case 8: Overlapping events with varying scores
events = [(0, 4, 20), (3, 5, 30), (5, 7, 25)]
assert schedule_events(events) == 55, "Test Case 8 Failed"

# Test Case 9: All events overlapping
events = [(1, 3, 10), (2, 4, 15), (2, 5, 20)]
assert schedule_events(events) == 20, "Test Case 9 Failed"


print("All test cases passed!")
```

solution:
```python
#event scheduler

def binary_search(events, index):
    lo, hi = 0, index - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if events[mid][1] <= events[index][0]:
            if events[mid + 1][1] <= events[index][0]:
                lo = mid + 1
            else:
                return mid
        else:
            hi = mid - 1
    return -1

def schedule_events(events):
    # Sort the events based on their end time
    events.sort(key=lambda x: x[1])

    n = len(events)
    dp = [0] * n
    dp[0] = events[0][2]

    for i in range(1, n):
        incl_prof = events[i][2]
        l = binary_search(events, i)
        if l != -1:
            incl_prof += dp[l]

        dp[i] = max(incl_prof, dp[i - 1])

    return dp[n-1]

```



## Data manipulation tasks → LLM would be helpful in remembering syntax and ideation

### Transform input pandas dataframe to output dataframe (Valerie problem, solved by gpt-4)

name: table_transform_named

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
import numpy as np
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

name: table_transform_unnamed1

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

name: table_transform_unnamed2

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


### T test

name: t_test

Task description:
```
Your goal is to complete the function simplified_t_test. This function takes as input two arrays of numbers and will return a float value called t_test. 

The simplified_t_test is a statistical test that is used to compare the means of two populations. The value is computed as follows:

t_test =  abs ( (mean1 - mean2) / sqrt((variance1 / n1) + (variance2 / n2))  )

where mean1 and mean2 are the means of the two populations, variance1 and variance2 are the variances of the two populations with a modified denominator:
variance1 = sum((x - mean1)^2) / (n1 - 2)
variance2 = sum((x - mean2)^2) / (n2 - 2)

, and n1 and n2 are the number of samples in each population. Note this is not the ordinary t-test, but a simplified version of it.
```

function signature:
```python

# function signature
def simplified_t_test(sample1, sample2):
    """
    :param sample1: List or array of sample data (sample 1)
    :param sample2: List or array of sample data (sample 2)
    :return: simplified t-test statistic
    """
    t_test = 0
    # write your code here
    return t_test
```

unit tests:
```python
import numpy as np

# Test with known values
sample1 = [10, 20, 30, 40, 50]
sample2 = [30, 40, 50, 60, 70]
expected_t_stat = 1.7320508075688774  # This value should be pre-calculated
print(simplified_t_test(sample1, sample2))
assert np.isclose(simplified_t_test(sample1, sample2), expected_t_stat, atol=1e-3), "Test with known values failed"

# Test with identical samples
identical_sample = [1, 2, 3, 4, 5]
assert simplified_t_test(identical_sample, identical_sample) == 0, "Test with identical samples failed"


sample1 = [1,2,-1,3,4]
sample2 = [2,3,-2,4,5]
expected_t_stat = 0.35032452487268523
print(simplified_t_test(sample1, sample2))
assert np.isclose(simplified_t_test(sample1, sample2), expected_t_stat, atol=1e-3), "Test with known values failed"
```

solution:
```python

# function signature
import numpy as np

def simplified_t_test(sample1, sample2):
    """
    :param sample1: List or array of sample data (sample 1)
    :param sample2: List or array of sample data (sample 2)
    :return: simplified t-test statistic
    """
    t_test = 0
    # write your code here
    mean1 = np.mean(sample1)
    mean2 = np.mean(sample2)
    # variance with modified denominator
    variance1 = np.var(sample1, ddof=2)
    variance2 = np.var(sample2, ddof=2)
    n1 = len(sample1)
    n2 = len(sample2)
    t_test = (mean1 - mean2) / np.sqrt(variance1/n1 + variance2/n2)
    return abs(t_test)
```



## Editing and Augmenting Existing Code → LLM would be helpful as it can quickly digest existing code 


### Calculator

name: calculator

Task description:

```
This is a special calculator that keeps track of the previous operations performed.
Note that operations like add or sutract are not the standard ones---this is on purpose.

Your job is to fix the following remaining bugs in the Calculator class:

- You should not modify the two lines of code in the add, subtract, multiply, and divide methods.

- Ensure that the add, subtract, multiply, and divide methods only execute if the input is valid. If the input is not valid, the method should return WITHOUT doing anything or raising any errors.

- Fix the implementation of undo_last_operation by using the previous_operations list. 

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

name: tokenizer

Task description:
```
Your goal is to implement the build_vocabulary method in the provided Tokenizer class. 
A tokenizer is an object that converts words to numerical IDs.

The objective of the build_vocabulary method is as follows:

- The method's primary goal is to create two dictionaries: self.word_to_id and self.id_to_word.

- self.word_to_id should map each unique word in your corpus to a unique numerical identifier (ID).

- self.id_to_word is the reverse mapping, where each unique ID corresponds to a word.

- The method should only consider the most frequent words in the corpus, up to a limit specified by max_vocab_size.


```


function signature:
```python
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
        '''
        corpus: a list of strings (string denotes a sentence composed of words seperated by spaces)
        '''
        # WRITE CODE HERE
        return 
    
    def get_word_id(self, word):
        # do not change
        # Retrieve the ID of a word, return None if the word is not in the vocabulary
        return self.word_to_id.get(word)

    def get_word_by_id(self, word_id):
        # do not change
        # Retrieve a word by its ID, return None if the ID is not in the vocabulary
        return self.id_to_word.get(word_id)

```

unit tests:
```python
def test_tokenize():
    tokenizer = Tokenizer()
    assert tokenizer.tokenize("Hello world") == ["hello", "world"], "Tokenization failed"

def test_build_vocabulary_and_get_word_id():
    tokenizer = Tokenizer(max_vocab_size=2)
    corpus = ["hello world", "hello python", "hello world"]
    tokenizer.build_vocabulary(corpus)
    
    assert tokenizer.get_word_id("hello") is not None, "'hello' should be in the vocabulary"
    assert tokenizer.get_word_id("world") is not None, "'world' should be in the vocabulary"
    assert tokenizer.get_word_id("python") is None, "'python' should not be in the vocabulary due to max_vocab_size limit"

def test_get_word_by_id():
    tokenizer = Tokenizer(max_vocab_size=2)
    corpus = ["apple orange", "banana apple", "cherry banana"]
    tokenizer.build_vocabulary(corpus)
    
    apple_id = tokenizer.get_word_id("apple")
    assert tokenizer.get_word_by_id(apple_id) == "apple", "ID lookup for 'apple' failed"

    # Assuming 'cherry' is not in the top 2 words and therefore has no ID
    cherry_id = tokenizer.get_word_id("cherry")
    assert cherry_id is None, "'cherry' should not have an ID"
    assert tokenizer.get_word_by_id(cherry_id) is None, "ID lookup for a non-existent word should return None"

# Run the tests
test_tokenize()
test_build_vocabulary_and_get_word_id()
test_get_word_by_id()
```

solution:
```python
from collections import Counter

class Tokenizer:
    def __init__(self, max_vocab_size=200):
        self.max_vocab_size = max_vocab_size
        self.word_to_id = {}
        self.id_to_word = {}

    def tokenize(self, text):
        # Split text into words by spaces
        return text.lower().split()

    def build_vocabulary(self, corpus):
        # to be implemented
        # Flatten the list of sentences into a list of words
        all_words = [word for sentence in corpus for word in self.tokenize(sentence)]

        # Count the frequency of each word
        word_freq = Counter(all_words)

        # Select the top 'max_vocab_size' words
        most_common_words = word_freq.most_common(self.max_vocab_size)

        # Assign an ID to each word
        self.word_to_id = {word: idx for idx, (word, _) in enumerate(most_common_words)}
        self.id_to_word = {idx: word for word, idx in self.word_to_id.items()}

    def get_word_id(self, word):
        # Retrieve the ID of a word, return None if the word is not in the vocabulary
        return self.word_to_id.get(word)

    def get_word_by_id(self, word_id):
        # Retrieve a word by its ID, return None if the ID is not in the vocabulary
        return self.id_to_word.get(word_id)
```


## Lengthy Code → LLM would be helpful as it can quickly digest existing code and faster writing speed

### Login Authentication

name: login_authenticator


Task description:
```
Your goal is to implement the LoginAuthenticator class. This class will be used to authenticate users of a system. 

You will implement the following methods in the LoginAuthenticator class:

_hash_password (Private Method):

Purpose: To create a hash of a given password.
Parameters: password (string).
Process: use any hashing tehnique you like
Return: The hashed password 

add_user Method:

Purpose: To add a new user to the system with a username and a password.
Parameters: username (string), password (string).
Process:
- Check if the username already exists in self.user_credentials.
- If it does, return False to indicate the username is already taken.
- If not, hash the password using _hash_password method and store the username and hashed password in self.user_credentials.
Return: True if the user was successfully added, otherwise False.

remove_user Method:

Purpose: To remove a user from the system.
Parameters: username (string).
Process:
- Check if the username exists in self.user_credentials.
- If it does, delete the username entry from self.user_credentials.
Return: True if the user was successfully removed, otherwise False.


change_password Method:

Purpose: To change a user's password.
Parameters: username (string), old_password (string), new_password (string).
Process:
- First, authenticate the user using the authenticate_user method with username and old_password.
- If authentication is successful, hash the new_password and update the self.user_credentials with the new hashed password.
Return: True if the password was successfully changed, otherwise False.
```

function signature:
```python

class LoginAuthenticator:
    def __init__(self):
        # DO NOT CHANGE
        self.user_credentials = {}  # dictionary for username: hashed_password

    def _hash_password(self, password):
        # WRITE CODE HERE
        return

    def add_user(self, username, password):
        # WRITE CODE HERE
        return

    def authenticate_user(self, username, password):
        # DO NOT CHANGE
        #Checks if the given username and password are valid
        if username not in self.user_credentials:
            return False
        return self.user_credentials[username] == self._hash_password(password)

    def remove_user(self, username):
        # WRITE CODE HERE
        return

    def change_password(self, username, old_password, new_password):
        # WRITE CODE HERE
        return
```

unit tests:
```python
# Assuming the LoginAuthenticator class is defined as previously provided

# Create an instance of the LoginAuthenticator
authenticator = LoginAuthenticator()

# Test adding new users
assert authenticator.add_user("user1", "password1") == True  # Should succeed
assert authenticator.add_user("user2", "password2") == True  # Should succeed
assert authenticator.add_user("user1", "new_password") == False  # Should fail, user1 already exists

# Test authenticating users
assert authenticator.authenticate_user("user1", "password1") == True  # Correct credentials
assert authenticator.authenticate_user("user1", "wrong_password") == False  # Wrong password
assert authenticator.authenticate_user("user3", "password") == False  # Non-existent user

# Test removing users
assert authenticator.remove_user("user1") == True  # Should succeed in removing user1
assert authenticator.remove_user("user1") == False  # user1 no longer exists
assert authenticator.remove_user("user3") == False  # user3 does not exist

# Test changing passwords
assert authenticator.change_password("user2", "password2", "newpass2") == True  # Should succeed
assert authenticator.authenticate_user("user2", "newpass2") == True  # New password should work
assert authenticator.change_password("user2", "password2", "anothernewpass") == False  # Old password no longer valid
assert authenticator.change_password("nonexistent_user", "pass", "newpass") == False  # Non-existent user

print("All tests passed!")
```

solution:
```python
import hashlib

class LoginAuthenticator:
    def __init__(self):
        self.user_credentials = {}  # dictionary for username: hashed_password

    def _hash_password(self, password):
        #Helper method to hash a password.
        return hashlib.sha256(password.encode()).hexdigest()

    def add_user(self, username, password):
        #Adds a new user if the username doesn't already exist.
        if username in self.user_credentials:
            return False  # Username already exists
        self.user_credentials[username] = self._hash_password(password)
        return True

    def authenticate_user(self, username, password):
        #Checks if the given username and password are valid.
        if username not in self.user_credentials:
            return False
        return self.user_credentials[username] == self._hash_password(password)

    def remove_user(self, username):
        #Removes a user from the system.
        if username in self.user_credentials:
            del self.user_credentials[username]
            return True
        return False

    def change_password(self, username, old_password, new_password):
        #Changes the password for a user if the old password is correct.
        if self.authenticate_user(username, old_password):
            self.user_credentials[username] = self._hash_password(new_password)
            return True
        return False
```


### Retriever

name: retriever

Task description:
```
Your task is to create a class called Retriever. This class will be used to retrieve similar vectors from a collection of vectors. You should follow the instructions below to complete this task.


Create an instance of the Retriever class by providing two arguments:
vectors: A numpy array of vectors you want to analyze.
k: An integer indicating the number of top similar vectors you want to retrieve.
Example:

from numpy import array
vectors = array([[1, 2], [3, 4], [5, 6]])
k = 2
retriever = Retriever(vectors, k)


Setting 'k' Value:

Use the set_k method to update the value of k (number of top vectors to retrieve).
This method takes a single integer argument.
The value of k should be between 1 and the total number of vectors. If not, then the method should do nothing (do not raise an error).
Example:
retriever.set_k(3)

Adding New Vectors:

Add additional vectors to your existing collection using the add_vectors method.
This method accepts a numpy array of new vectors to be added.
Example:

new_vectors = array([[7, 8], [9, 10]])
retriever.add_vectors(new_vectors)


Calculating Distances:

To calculate the distance between a query vector and all stored vectors, use the distance method.
This method takes a single numpy array representing the query vector.
It returns a numpy array of distances.
Example:


query_vector = array([1, 2])
distances = retriever.distance(query_vector)


Retrieving Top 'k' Similar Vectors:

Use the get_top_k_similar_vectors method to find the top 'k' vectors most similar to a given query vector.
This method takes a single numpy array as the query vector.
It returns a numpy array of the top 'k' similar vectors.

Example:

top_vectors = retriever.get_top_k_similar_vectors(query_vector)

Generating a Similarity Matrix:

To create a similarity matrix between multiple queries and the stored vectors, use the get_similarity_matrix method.
This method accepts a numpy array of query vectors.
It returns a 2D numpy array where each row corresponds to the distances between a query vector and all stored vectors.

Example:

query_vectors = array([[1, 2], [3, 4]])
similarity_matrix = retriever.get_similarity_matrix(query_vectors)
```

function signature:
```python
class Retriever:
```

unit tests:
```python
import numpy as np

# Test Initialization
vectors = np.array([[1, 2], [3, 4], [5, 6]])
k = 2
retriever = Retriever(vectors, k)
assert (retriever.vectors == vectors).all() and retriever.k == k, "Initialization Failed"

# Test set_k Method
retriever.set_k(1)
assert retriever.k == 1, "set_k Method Failed"
retriever.set_k(0)  # Edge case
assert retriever.k == 1, "set_k Method Failed on Edge Case"

# Test add_vectors Method
new_vectors = np.array([[7, 8], [9, 10]])
retriever.add_vectors(new_vectors)
assert (retriever.vectors == np.array([[1, 2], [3, 4], [5, 6], [7, 8], [9, 10]])).all(), "add_vectors Method Failed"

# Test distance Method
query = np.array([1, 2])
distances = retriever.distance(query)
ground_truth_distances = np.array([0, 2.82842712, 5.65685425, 8.48528137, 11.3137085])
assert np.allclose(distances, ground_truth_distances, atol=1e-3), "distance Method Failed"
assert len(distances) == len(retriever.vectors), "distance Method Failed"

# Test get_top_k_similar_vectors Method
top_vectors = retriever.get_top_k_similar_vectors(query)
ground_truth_top_vectors = np.array([[1, 2]])
assert (top_vectors == ground_truth_top_vectors).all(), "get_top_k_similar_vectors Method Failed"
assert len(top_vectors) == retriever.k, "get_top_k_similar_vectors Method Failed"

# Test get_similarity_matrix Method
query_vectors = np.array([[1, 2], [3, 4]])
similarity_matrix = retriever.get_similarity_matrix(query_vectors)

assert similarity_matrix.shape == (len(query_vectors), len(retriever.vectors)), "get_similarity_matrix Method Failed"
```

solution:
```python

import numpy as np
class Retriever:
    def __init__(self, vectors, k):
        self.vectors = vectors
        self.k = k

    def set_k(self, k):
        if k > len(self.vectors) or k < 1:
            return
        self.k = k

    def add_vectors(self, new_vectors):
        self.vectors = np.concatenate((self.vectors, new_vectors))
        
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
    
    def get_similarity_matrix(self, queries):
        '''
        queries: numpy array of query vectors
        return: similarity matrix of size (len(queries), len(self.vectors))
        '''
        similarity_matrix = []
        for query in queries:
            similarity_matrix.append(self.distance(query))
        return np.array(similarity_matrix)
```


