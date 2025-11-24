"use client";
import { Highlight, themes } from "prism-react-renderer";
import React from "react";

type Props = {
  code: string;
  language?: string;
};

export const CodeBlock: React.FC<Props> = ({ code, language = "" }) => {
  if (!code) return null;

  return (
    <Highlight
      code={code}
      language={language}
      theme={themes.vsDark}
    >
      {({ getLineProps, getTokenProps, tokens }) =>
        tokens.map((line, i) => (
          <div key={i} {...getLineProps({ className: "table-row", line })}>
            <span className="table-cell select-none text-right text-white/25">
              {i + 1}
            </span>
            <span className="table-cell pl-4">
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token })} />
              ))}
            </span>
          </div>
        ))
      }
    </Highlight>
  );
};
