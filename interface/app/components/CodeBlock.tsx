import React from "react";

interface CodeBlockProps {
  code: String;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code }) => {
  // Black background, add in syntax highlighting. Search through string
  return <div className="bg-black text-white">{code}</div>;
};

export default CodeBlock;
