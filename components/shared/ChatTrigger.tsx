"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import AIChatWindow from "./AIChatWindow";
import { useTranslations } from "next-intl";

const ChatTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Chat");

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {isOpen && (
        <AIChatWindow onClose={() => setIsOpen(false)} />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-600"
        aria-label={isOpen ? "Close Chat" : "Open Badgi Chat"}
      >
        {isOpen ? (
          <X className="h-7 w-7" />
        ) : (
          <MessageCircle className="h-7 w-7" />
        )}
      </button>
    </div>
  );
};

export default ChatTrigger;
