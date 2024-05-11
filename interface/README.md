
Detailed Instructions coming soon!

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started
install using 

Installation:
```
npm install next react react-dom
npm install firebase
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
- exit survey - do first 

- telemetry logging
fix rejected, logprobs completion, message and suggestion index 

- Module for when to show suggestion and proactively show chat

- local version

- multiple files

- when going to next line: suggestion is rejected , fix

- tutorials

- clean up code and document 

- fix firebase database

nice to have later:
- Console / user input in terminal

- Optional: Config file, Autocomplete / chat / both

- on refresh save everything to local storage


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


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
