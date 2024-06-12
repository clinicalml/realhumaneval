This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
install using 

Installation:
```
npm install next react react-dom
npm install firebase
npm install axios

```

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


# TODO

interface notes:

- local version

- if local is set 

- enter your own apsi keys

- telemetry logging
fix rejected, logprobs completion, message and suggestion index 
s

- tutorials

- clean up code and document 

- fix firebase database

- small autocomplete fixes:
when going to next line in writing, suggestion rejected
when scrolling, suggestion is regenerated

- AI stats tab: completions shown, accepted percentage, percentage of messages upvoted, downvoted

# Firebase

For firebase functionality, you need to enable it:
```
firebase experiments:enable webframeworks
```

Then you need to set the API keys one by one:

```
firebase functions:secrets:set OPENAI_KEY
firebase functions:secrets:set TOGETHER_KEY
firebase functions:secrets:set RAPIDAPI_KEY
```



# Roadmap of Features

- Adding multiple tabs to editor: currently it is easy to add tabs by setting the "useTabs" variable to true in Editor.tsx, however, you cannot import code from one tab to another. Moreover, you cannot choose which tab to execute. 

- Adding a console: currently you can only run the code in the editor, but you cannot use interactive input "input()".

- Moving beyond OneCompiler: it would be good to have a simple python environment as a console to allow for installing different packages and so on.

- Adding a file system: it would be good to have a file system to allow for saving and loading files.

- Module for when to show suggestion rather than every 2 seconds after pause of writing
