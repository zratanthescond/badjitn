"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  role: string;
  content: string;
}

const ChatMessage = ({ role, content }: ChatMessageProps) => {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex w-full gap-4 p-6 ${isAssistant ? "bg-slate-100/50 dark:bg-slate-800/50" : ""}`}>
      <div className={`flex h-10 w-10 shrink-0 select-none items-center justify-center rounded-lg shadow-sm ${
        isAssistant ? "bg-primary text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      }`}>
        {isAssistant ? <Bot size={20} /> : <User size={20} />}
      </div>
      
      <div className="flex-1 space-y-2 overflow-hidden px-1">
        <div className="prose prose-slate dark:prose-invert max-w-none break-words leading-7">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              code: ({ node, ...props }) => (
                <code className="rounded bg-slate-200 dark:bg-slate-800 px-1 py-0.5 font-mono text-sm" {...props} />
              ),
              pre: ({ children }) => (
                <pre className="overflow-x-auto rounded-xl bg-slate-900 p-4 text-slate-50">{children}</pre>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
