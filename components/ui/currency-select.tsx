"use client";

import type React from "react";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { X, Search, Sparkles, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";

interface DataItem {
  id: string;
  value?: string;
  name: string;
  color?: string;
  category?: string;
}

interface SelectPillsProps {
  data: DataItem[];
  defaultValue?: string[];
  value?: string[];
  onValueChange?: (selectedValues: string[]) => void;
  placeholder?: string;
  maxHeight?: number;
}

export const SelectPills: React.FC<SelectPillsProps> = ({
  data,
  defaultValue = [],
  value,
  onValueChange,
  placeholder,
  maxHeight = 300,
}) => {
  const t = useTranslations("selectPills");

  const [inputValue, setInputValue] = useState<string>("");
  const [selectedPills, setSelectedPills] = useState<string[]>(
    value || defaultValue
  );
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [isAnimating, setIsAnimating] = useState<string | null>(null);
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
          setHighlightedIndex(0);
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen && filteredItems.length > 0) {
          setHighlightedIndex(filteredItems.length - 1);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredItems[highlightedIndex]) {
          handleItemSelect(filteredItems[highlightedIndex]);
        }
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
        const nextIndex = index < filteredItems.length - 1 ? index + 1 : 0;
        setHighlightedIndex(nextIndex);
        // Scroll into view
        const nextElement = radioGroupRef.current?.children[
          nextIndex
        ] as HTMLElement;
        nextElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        break;
      case "ArrowUp":
        e.preventDefault();
        const prevIndex = index > 0 ? index - 1 : filteredItems.length - 1;
        setHighlightedIndex(prevIndex);
        // Scroll into view
        const prevElement = radioGroupRef.current?.children[
          prevIndex
        ] as HTMLElement;
        prevElement?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        break;
      case "Enter":
        e.preventDefault();
        handleItemSelect(filteredItems[index]);
        inputRef.current?.focus();
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
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

    // Add selection animation
    setIsAnimating(item.id);
    setTimeout(() => setIsAnimating(null), 300);

    if (onValueChange) {
      onValueChange(newSelectedPills);
    }
  };

  const handlePillRemove = (pillToRemove: string) => {
    // Add removal animation
    setIsAnimating(pillToRemove);

    setTimeout(() => {
      const newSelectedPills = selectedPills.filter(
        (pill) => pill !== pillToRemove
      );
      setSelectedPills(newSelectedPills);
      setIsAnimating(null);
      if (onValueChange) {
        onValueChange(newSelectedPills);
      }
    }, 150);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const getItemName = (pillId: string) => {
    return data.find((item) => item.id === pillId)?.name || pillId;
  };

  const getItemColor = (pillId: string) => {
    return data.find((item) => item.id === pillId)?.color;
  };

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 dark:from-primary/30 dark:to-primary/20 rounded-full flex items-center justify-center mb-3 animate-pulse">
        <Search className="w-5 h-5 text-primary/60 dark:text-primary/70" />
      </div>
      <p className="text-sm text-muted-foreground">
        {inputValue ? t("messages.noResults") : "Start typing to search..."}
      </p>
    </div>
  );

  return (
    <div className="w-full">
      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <div className="relative group">
          {/* Main Container */}
          <div
            className={cn(
              "flex w-full flex-wrap gap-2 min-h-14 p-4 rounded-2xl transition-all duration-300 ease-in-out",
              // Light theme
              "bg-gradient-to-br from-background/80 to-background/40 ",
              "border border-border/50 shadow-lg hover:shadow-xl",
              // Dark theme
              "dark:bg-gradient-to-br dark:from-muted/50 dark:to-muted/30 ",
              "dark:border-border/30 dark:shadow-2xl dark:hover:shadow-2xl",
              // Focus states
              "ring-0 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50",
              "dark:focus-within:ring-primary/30 dark:focus-within:border-primary/60",
              isOpen &&
                "ring-2 ring-primary/20 border-primary/50 shadow-xl dark:ring-primary/30 dark:border-primary/60"
            )}
            role="group"
            aria-label={t("ariaLabels.selectedItems")}
          >
            {/* Selected Pills */}
            <div className="flex flex-wrap gap-2 items-center">
              {(value || selectedPills).map((pill, index) => {
                const itemName = getItemName(pill);
                const itemColor = getItemColor(pill);
                const isRemoving = isAnimating === pill;

                return (
                  <div
                    key={pill}
                    className={cn(
                      "transform transition-all duration-300 ease-out",
                      isRemoving
                        ? "scale-0 opacity-0"
                        : "scale-100 opacity-100",
                      "animate-in slide-in-from-left-2 fade-in-0"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Badge
                      variant="secondary"
                      className={cn(
                        "group/pill relative overflow-hidden px-3 py-1.5 rounded-full",
                        // Light theme
                        "bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/20 hover:to-primary/10",
                        "border border-primary/20 hover:border-primary/30",
                        "text-primary hover:text-primary/90",
                        // Dark theme
                        "dark:bg-gradient-to-r dark:from-primary/20 dark:to-primary/10 dark:hover:from-primary/30 dark:hover:to-primary/20",
                        "dark:border-primary/30 dark:hover:border-primary/40",
                        "dark:text-primary dark:hover:text-primary/90",
                        // Common styles
                        "cursor-pointer transition-all duration-200 ease-in-out",
                        "hover:scale-105 hover:shadow-md active:scale-95",
                        "focus:outline-none focus:ring-2 focus:ring-primary/30"
                      )}
                      style={
                        itemColor
                          ? {
                              background: `linear-gradient(135deg, ${itemColor}20, ${itemColor}10)`,
                              borderColor: `${itemColor}40`,
                              color: itemColor,
                            }
                          : {}
                      }
                      onClick={() => handlePillRemove(pill)}
                      role="button"
                      aria-label={t("ariaLabels.removePill", {
                        name: itemName,
                      })}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handlePillRemove(pill);
                        }
                      }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent -translate-x-full group-hover/pill:translate-x-full transition-transform duration-700 ease-in-out" />

                      <span className="relative flex items-center gap-1.5 font-medium text-sm">
                        {itemName}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handlePillRemove(pill);
                          }}
                          className={cn(
                            "flex items-center justify-center w-4 h-4 rounded-full",
                            "bg-primary/20 hover:bg-destructive/80 text-primary hover:text-destructive-foreground",
                            "dark:bg-primary/30 dark:hover:bg-destructive/90 dark:text-primary dark:hover:text-destructive-foreground",
                            "transition-all duration-200 ease-in-out hover:scale-110 active:scale-90"
                          )}
                          aria-label={t("actions.remove")}
                          tabIndex={-1}
                        >
                          <X size={10} className="stroke-[2.5]" />
                        </button>
                      </span>
                    </Badge>
                  </div>
                );
              })}
            </div>

            {/* Separator */}
            {(value || selectedPills).length > 0 && (
              <Separator
                orientation="vertical"
                className="h-6 bg-border/50 dark:bg-border/30"
              />
            )}

            {/* Search Input */}
            <div className="flex-1 min-w-[200px] relative">
              <PopoverTrigger asChild>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/60 dark:text-muted-foreground/70 pointer-events-none" />
                  <Input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder || t("placeholder")}
                    className={cn(
                      "border-0 bg-transparent pl-10 pr-4 py-2 rounded-full",
                      "placeholder:text-muted-foreground/60 dark:placeholder:text-muted-foreground/70",
                      "text-foreground dark:text-foreground",
                      "focus:outline-none focus:ring-0 focus-visible:ring-0",
                      "transition-all duration-200 ease-in-out"
                    )}
                    aria-label={t("ariaLabels.searchInput")}
                    role="combobox"
                    aria-expanded={isOpen}
                    aria-haspopup="listbox"
                  />
                  {inputValue && (
                    <button
                      onClick={() => setInputValue("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground/60 hover:text-foreground dark:text-muted-foreground/70 dark:hover:text-foreground transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </PopoverTrigger>
            </div>

            {/* Pills Counter */}
            {(value || selectedPills).length > 0 && (
              <div className="flex items-center">
                <Badge
                  variant="outline"
                  className="rounded-full text-xs bg-primary/5 border-primary/20 text-primary dark:bg-primary/10 dark:border-primary/30 dark:text-primary"
                >
                  {(value || selectedPills).length}
                </Badge>
              </div>
            )}
          </div>

          {/* Floating indicator */}
          {isOpen && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
          )}
        </div>

        {/* Dropdown Content */}
        <PopoverContent
          onFocusOutside={(e) => {
            if (e.target === inputRef.current) {
              e.preventDefault();
            }
          }}
          onInteractOutside={(e) => {
            if (e.target === inputRef.current) {
              e.preventDefault();
            }
          }}
          className={cn(
            "w-[--radix-popover-trigger-width] p-0 rounded-2xl border-0 shadow-2xl overflow-hidden",
            // Light theme
            "bg-gradient-to-br from-background/95 to-background/80 backdrop-blur-xl",
            // Dark theme
            "dark:bg-gradient-to-br dark:from-background/90 dark:to-background/70 dark:backdrop-blur-xl",
            "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200"
          )}
          sideOffset={8}
        >
          {/* Fixed Header */}
          {filteredItems.length > 0 && (
            <div className="sticky top-0 z-10 px-3 py-2 bg-background/80 dark:bg-background/60 backdrop-blur-sm border-b border-border/50 dark:border-border/30">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>{filteredItems.length} options</span>
                </div>
                <span>Press Enter to select</span>
              </div>
            </div>
          )}

          {/* Scrollable Content */}
          <div
            ref={radioGroupRef}
            role="listbox"
            aria-label={t("ariaLabels.pillOptions")}
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {filteredItems.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredItems.map((item, index) => (
                  <div
                    key={item.id || item.value || item.name}
                    className={cn(
                      "group relative flex w-full cursor-pointer select-none items-center gap-3",
                      "rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ease-in-out",
                      // Light theme
                      "hover:bg-primary/10 hover:text-primary hover:scale-[1.02]",
                      "focus:bg-primary/10 focus:text-primary focus:outline-none",
                      // Dark theme
                      "dark:hover:bg-primary/20 dark:hover:text-primary dark:hover:scale-[1.02]",
                      "dark:focus:bg-primary/20 dark:focus:text-primary",
                      // Active state
                      "active:scale-[0.98]",
                      highlightedIndex === index &&
                        "bg-primary/10 text-primary scale-[1.02] dark:bg-primary/20 dark:text-primary"
                    )}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onClick={() => handleItemSelect(item)}
                    onKeyDown={(e) => handleRadioKeyDown(e, index)}
                    tabIndex={highlightedIndex === index ? 0 : -1}
                  >
                    {/* Selection indicator */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-5 h-5 rounded-full border-2 transition-all duration-200",
                        "border-border group-hover:border-primary dark:border-border/50 dark:group-hover:border-primary",
                        highlightedIndex === index &&
                          "border-primary bg-primary text-primary-foreground dark:border-primary dark:bg-primary"
                      )}
                    >
                      {highlightedIndex === index && (
                        <Check size={12} className="stroke-[3]" />
                      )}
                    </div>

                    {/* Item content */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                      {item.color && (
                        <div
                          className="w-3 h-3 rounded-full border border-white/20 dark:border-black/20 shadow-sm flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="font-medium truncate">{item.name}</span>
                      {item.category && (
                        <Badge
                          variant="outline"
                          className="text-xs rounded-full bg-muted/50 dark:bg-muted/30 flex-shrink-0"
                        >
                          {item.category}
                        </Badge>
                      )}
                    </div>

                    {/* Hover effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-2">
                <EmptyState />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
