"use client";
import React, { useState, useRef } from "react";

import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

import { X } from "lucide-react";
import { Separator } from "./separator";

interface DataItem {
  id: string;
  value?: string;
  name: string;
}

interface SelectPillsProps {
  data: DataItem[];
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (selectedValues: string[]) => void;
  placeholder?: string;
}

export const SelectPills: React.FC<SelectPillsProps> = ({
  data,
  defaultValue = [],
  value,
  onValueChange,
  placeholder = "Type to search...",
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedPills, setSelectedPills] = useState<string[]>(
    value || defaultValue
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const radioGroupRef = useRef<HTMLDivElement>(null);

  const filteredItems = data.filter(
    (item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedPills.includes(item.id)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setHighlightedIndex(-1);

    // Only open the popover if we have matching items that aren't already selected
    const hasUnselectedMatches = data.some(
      (item) =>
        item.name.toLowerCase().includes(newValue.toLowerCase()) &&
        !(value || selectedPills).includes(item.id)
    );

    setIsOpen(hasUnselectedMatches);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (isOpen && filteredItems.length > 0) {
          // Move focus to first radio button
          const firstRadio = radioGroupRef.current?.querySelector(
            'input[type="radio"]'
          ) as HTMLElement;
          firstRadio?.focus();
          setHighlightedIndex(0);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleRadioKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    index: number
  ) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (index < filteredItems.length - 1) {
          setHighlightedIndex(index + 1);
          const nextItem = radioGroupRef.current?.querySelector(
            `div:nth-child(${index + 2})`
          ) as HTMLElement;
          if (nextItem) {
            nextItem.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (index > 0) {
          setHighlightedIndex(index - 1);
          const prevItem = radioGroupRef.current?.querySelector(
            `div:nth-child(${index})`
          ) as HTMLElement;
          if (prevItem) {
            prevItem.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        } else {
          inputRef.current?.focus();
          setHighlightedIndex(-1);
        }
        break;
      case "Enter":
        e.preventDefault();
        handleItemSelect(filteredItems[index]);
        inputRef.current?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.focus();
        break;
    }
  };

  const handleItemSelect = (item: DataItem) => {
    const newSelectedPills = [...selectedPills, item.id];
    setSelectedPills(newSelectedPills);
    setInputValue("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    if (onValueChange) {
      onValueChange(newSelectedPills);
    }
  };

  const handlePillRemove = (pillToRemove: string) => {
    const newSelectedPills = selectedPills.filter(
      (pill) => pill !== pillToRemove
    );
    setSelectedPills(newSelectedPills);
    if (onValueChange) {
      onValueChange(newSelectedPills);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // Only allow external close events (like clicking outside)
    if (!open) {
      setIsOpen(false);
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div className="flex w-full flex-wrap gap-2 min-h-12 backdrop-blur-lg bg-white/30 p-5 rounded-3xl">
        {(value || selectedPills).map((pill) => (
          <Badge
            key={pill}
            variant="outline"
            onClick={() => handlePillRemove(pill)}
            className="hover:cursor-pointer gap-1 group p-2 "
          >
            {data.find((item) => item.id === pill)?.name || pill}
            <button
              onClick={() => handlePillRemove(pill)}
              className="appearance-none text-muted-foreground group-hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          </Badge>
        ))}
        <Separator className="my-2" />
        <PopoverTrigger asChild>
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="input-field dark:text-white glass "
          />
        </PopoverTrigger>
      </div>

      <PopoverContent
        onFocusOutside={(e) => {
          // Prevent closing if focus is in the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Prevent closing if interaction is with the input
          if (e.target === inputRef.current) {
            e.preventDefault();
          }
        }}
        className="w-[--radix-popover-trigger-width] backdrop-blur-lg bg-white/30 rounded-3xl"
      >
        <div
          ref={radioGroupRef}
          role="radiogroup"
          aria-label="Pill options"
          onKeyDown={(e) => handleRadioKeyDown(e, highlightedIndex)}
          className=" overflow-y-auto w-full"
        >
          {filteredItems.map((item, index) => (
            <div
              key={item.id || item.value || item.name}
              className={cn(
                "relative flex w-full cursor-default select-none  items-center gap-2 rounded-3xl px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent/70 focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
                highlightedIndex === index && "bg-accent"
              )}
            >
              <input
                type="radio"
                id={`pill-${item.name}`}
                name="pill-selection"
                value={item.name}
                className="sr-only input-field"
                checked={highlightedIndex === index}
                onChange={() => handleItemSelect(item)}
              />
              <label
                htmlFor={`pill-${item.name}`}
                className="flex items-center min-w-full cursor-pointer rounded-3xl"
              >
                {item.name}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
