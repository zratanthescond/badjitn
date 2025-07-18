"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Search,
  Users,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Check,
  X,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Event } from "@/types";

interface User {
  _id: string;
  firstName: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

interface ContributorProps {
  event: Event;
}

const fetchContributors = async (query: string) => {
  const response = await axios.get("/api/contrebuters", { params: { query } });
  return response.data;
};

const ContributorSelection: React.FC<ContributorProps> = ({ event }) => {
  const t = useTranslations("contributorSelection");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedContributor, setSelectedContributor] = useState<User | null>(
    null
  );
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [checkedPlan, setCheckedPlan] = useState<number[]>([]);
  const [contributors, setContributors] = useState<User[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch contributors based on search query
  const { data, isFetching, error } = useQuery({
    queryKey: ["contributors", searchQuery],
    queryFn: () => fetchContributors(searchQuery),
    enabled: !!searchQuery && searchQuery.length >= 2,
  });

  // Mutation to host a contributor
  const mutationFn = (contributorId: string) =>
    axios.post("/api/hostcontributor", {
      event,
      contributorId,
      checkPlan: checkedPlan,
    });

  const mutation = useMutation({
    mutationFn: () => mutationFn(selectedContributor!._id),
    onSuccess: () => {
      setMessage(t("messages.success"));
      setMessageType("success");
      setSelectedContributor(null);
      setCheckedPlan([]);
      setSearchQuery("");
      setInputValue("");
      setShowDropdown(false);
    },
    onError: () => {
      setMessage(t("messages.error"));
      setMessageType("error");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedContributor) {
      setMessage(t("messages.selectContributor"));
      setMessageType("error");
      return;
    }
    mutation.mutate();
  };

  useEffect(() => {
    if (data && data.contributors) {
      setContributors(data.contributors);
    }
  }, [data]);

  useEffect(() => {
    // Update search query when input value changes
    const timeoutId = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddPlan = (planIndex: number) => {
    setCheckedPlan((prevNumbers) => {
      if (prevNumbers.includes(planIndex)) {
        return prevNumbers.filter((n) => n !== planIndex);
      } else {
        return [...prevNumbers, planIndex];
      }
    });
  };

  const handleSelectContributor = (contributor: User) => {
    setSelectedContributor(contributor);
    setInputValue(
      `${contributor.firstName} ${contributor.lastName || ""}`.trim()
    );
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedContributor(null);
    setInputValue("");
    setSearchQuery("");
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setShowDropdown(true);

    // Clear selection if user types something different
    if (
      selectedContributor &&
      value !==
        `${selectedContributor.firstName} ${
          selectedContributor.lastName || ""
        }`.trim()
    ) {
      setSelectedContributor(null);
    }
  };

  const filteredContributors = contributors.filter((contributor) =>
    `${contributor.firstName} ${contributor.lastName || ""} ${
      contributor.email
    }`
      .toLowerCase()
      .includes(inputValue.toLowerCase())
  );

  return (
    <div className={`w-full max-w-2xl mx-auto ${isRTL ? "rtl" : "ltr"}`}>
      <Card className="glass backdrop-blur-md bg-white/10 border border-white/20 shadow-xl">
        <CardHeader className="space-y-4">
          <div
            className={`flex items-center gap-3 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <CardTitle
              className={`text-2xl font-bold ${isRTL ? "font-arabic" : ""}`}
            >
              {t("title")}
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price Plan Selection */}
          {event.pricePlan && event.pricePlan.length > 0 && (
            <Card className="glass bg-white/5 border border-white/10">
              <CardHeader>
                <CardTitle
                  className={`flex items-center gap-2 text-lg ${
                    isRTL ? "flex-row-reverse font-arabic" : ""
                  }`}
                >
                  <DollarSign className="h-5 w-5 text-primary" />
                  {t("choosePlan")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {event.pricePlan.map((plan, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg glass bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 ${
                      isRTL ? "flex-row-reverse" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 ${
                        isRTL ? "flex-row-reverse" : ""
                      }`}
                    >
                      <Checkbox
                        className="h-5 w-5"
                        checked={checkedPlan.includes(index)}
                        onCheckedChange={() => handleAddPlan(index)}
                      />
                      <span
                        className={`font-medium ${isRTL ? "font-arabic" : ""}`}
                      >
                        {plan.name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-primary/20 text-primary"
                    >
                      ${plan.price}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Search and Select Input */}
          <div className="space-y-3 relative">
            <Label
              className={`text-sm font-medium ${isRTL ? "font-arabic" : ""}`}
            >
              {t("searchAndSelectLabel")}
            </Label>

            <div className="relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder={t("searchAndSelectPlaceholder")}
                className={`glass bg-white/10 border-white/20 hover:bg-white/15 focus:bg-white/15 transition-all duration-200 ${
                  isRTL ? "pr-20 font-arabic text-right" : "pl-10 pr-10"
                }`}
              />

              <Search
                className={`absolute top-3 h-4 w-4 text-muted-foreground pointer-events-none ${
                  isRTL ? "right-3" : "left-3"
                }`}
              />

              {selectedContributor && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={`absolute top-1 h-8 w-8 p-0 hover:bg-white/20 ${
                    isRTL ? "left-2" : "right-2"
                  }`}
                  onClick={handleClearSelection}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Dropdown */}
            {showDropdown &&
              (inputValue.length >= 2 || contributors.length > 0) && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1  bg-card/90 border border-white/20 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {isFetching && (
                    <div className="p-4">
                      <div
                        className={`flex items-center gap-2 ${
                          isRTL ? "flex-row-reverse" : ""
                        }`}
                      >
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span
                          className={`text-sm text-muted-foreground ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("searching")}
                        </span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4">
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <AlertDescription
                          className={isRTL ? "font-arabic" : ""}
                        >
                          {t("messages.fetchError")}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {!isFetching &&
                    !error &&
                    inputValue.length > 0 &&
                    inputValue.length < 2 && (
                      <div className="p-4">
                        <p
                          className={`text-sm text-muted-foreground ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("searchMinLength")}
                        </p>
                      </div>
                    )}

                  {!isFetching &&
                    !error &&
                    filteredContributors.length === 0 &&
                    inputValue.length >= 2 && (
                      <div className="p-4 text-center">
                        <p
                          className={`text-sm text-muted-foreground ${
                            isRTL ? "font-arabic" : ""
                          }`}
                        >
                          {t("noContributorsFound")}
                        </p>
                      </div>
                    )}

                  {filteredContributors.length > 0 && (
                    <div className="py-1">
                      {filteredContributors.map((contributor) => (
                        <button
                          key={contributor._id}
                          onClick={() => handleSelectContributor(contributor)}
                          className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors duration-150 focus:bg-white/10 focus:outline-none"
                        >
                          <div
                            className={`flex items-center gap-3 ${
                              isRTL ? "flex-row-reverse" : ""
                            }`}
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium">
                                {contributor.firstName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div
                              className={`flex-1 min-w-0 ${
                                isRTL ? "text-right" : ""
                              }`}
                            >
                              <p
                                className={`font-medium truncate ${
                                  isRTL ? "font-arabic" : ""
                                }`}
                              >
                                {contributor.firstName} {contributor.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {contributor.email}
                              </p>
                            </div>
                            {selectedContributor?._id === contributor._id && (
                              <Check className="h-4 w-4 text-primary flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>

          {/* Selected Contributor Display */}
          {selectedContributor && (
            <Card className="glass bg-green-500/10 border border-green-500/20">
              <CardContent className="p-4">
                <div
                  className={`flex items-center gap-3 ${
                    isRTL ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-green-400">
                      {selectedContributor.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className={`flex-1 ${isRTL ? "text-right" : ""}`}>
                    <p
                      className={`font-medium text-green-400 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {t("selectedContributor")}
                    </p>
                    <p
                      className={`text-sm text-green-300 ${
                        isRTL ? "font-arabic" : ""
                      }`}
                    >
                      {selectedContributor.firstName}{" "}
                      {selectedContributor.lastName}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message Display */}
          {message && (
            <Alert
              className={`${
                messageType === "success"
                  ? "border-green-500/20 bg-green-500/10"
                  : "border-red-500/20 bg-red-500/10"
              }`}
            >
              {messageType === "success" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              <AlertDescription
                className={`${
                  messageType === "success" ? "text-green-700" : "text-red-700"
                } ${isRTL ? "font-arabic" : ""}`}
              >
                {message}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            className={`w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200 ${
              isRTL ? "font-arabic" : ""
            }`}
            disabled={mutation.isPending || !selectedContributor}
            size="lg"
          >
            {mutation.isPending ? (
              <div
                className={`flex items-center gap-2 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("hosting")}
              </div>
            ) : (
              t("hostButton")
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContributorSelection;
