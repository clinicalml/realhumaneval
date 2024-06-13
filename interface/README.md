
# Getting Started

RealHumanEval is built as a React app using Google Firebase for hosting, data storage and API calling. However, it can be ran locally by configuring certain flags and inputting the API keys..

## Requirements


For the required packages:
```
npm install next react react-dom
npm install firebase
npm install axios

```
You will need API keys for the following services to run the app:

OpenAI: https://openai.com/api/
Together.ai: https://api.together.xyz/
One compiler: https://rapidapi.com/onecompiler-onecompiler-default/api/onecompiler-apis


### Firebase

To recreate the same functionality, you need to link your web app with a Firebase project.

Once you create your Firebase project, make sure to enable Cloud Firestore. In Firestore, create an empty collection called “responses”. Then create a collection called “tasks”, each entry in tasks must have three items: task_descriptions, function_signatures and unit_tests. Each of the three items are a list of strings. We include a copy of our tasks collection. 

In the Firebase console, under “Project Settings”, make sure to create an app, then copy the Firebase config to initialize_firebase.js in interface/app/functions.

Make sure to login to your firebase project under the folder of interface, following https://firebase.google.com/docs/web/setup.

Now in react, for firebase functionality, you need to enable it:
```
firebase experiments:enable webframeworks
```

Then you need to set the API keys one by one:

```
firebase functions:secrets:set OPENAI_KEY
firebase functions:secrets:set TOGETHER_KEY
firebase functions:secrets:set RAPIDAPI_KEY
```


### Deployment


First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

To deploy online using firebase:

```bash
 Firebase deploy
```




# Roadmap of Features

- Adding multiple tabs to editor: currently it is easy to add tabs by setting the "useTabs" variable to true in Editor.tsx, however, you cannot import code from one tab to another. Moreover, you cannot choose which tab to execute. 

- Adding a console: currently you can only run the code in the editor, but you cannot use interactive input "input()".

- Moving beyond OneCompiler: it would be good to have a simple python environment as a console to allow for installing different packages and so on.

- Adding a file system: it would be good to have a file system to allow for saving and loading files.

- Display online statistics about AI usage and participant performance (e.g., acceptance rate of suggestions, percentage of upvoted messages, …)











