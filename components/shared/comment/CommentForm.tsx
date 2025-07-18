"use client";

import type React from "react";

import { useState, useRef, type KeyboardEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";
import { MinimalTiptapEditor } from "@/components/minimal-tiptap";
import { Content } from "@tiptap/react";
import { useTranslations } from "next-intl";

interface CommentFormProps {
  onSubmit: (content: Content) => void;
  isReply?: boolean;
}

export function CommentForm({ onSubmit, isReply = false }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef(null);
  const t = useTranslations("comments");
  const handleSubmit = () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    // Strip HTML tags for plain text submission if needed
    const plainText = content.replace(/<[^>]*>/g, "");
    onSubmit(plainText);
    setContent("");
    setIsSubmitting(false);
    setIsFocused(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Handle clicks outside to unfocus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        //setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full transition-all duration-200 ${
        isFocused
          ? "bg-background border-none rounded-3xl shadow-sm"
          : "bg-muted rounded-full"
      } ${isReply ? "min-h-9" : "min-h-10"}`}
    >
      <div className="flex items-center pr-2 h-full">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={isReply ? t("writeReply") : t("writeComment")}
          className="flex-1 bg-transparent border-none resize-none outline-none py-2 px-4 text-sm h-full rounded-full"
          rows={1}
        />
        <Button
          size="icon"
          variant="ghost"
          onClick={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={`rounded-full h-7 w-7 ${
            content.trim() ? "text-blue-600" : "text-muted-foreground"
          }`}
        >
          <SendHorizontal className="h-4 w-4" />
          <span className="sr-only">{t("send")}</span>
        </Button>
      </div>
    </div>
  );
}
