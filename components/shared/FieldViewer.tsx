"use client";

import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { fetchFields } from "@/lib/actions/field.action";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
// Import the server action

interface Field {
  _id: string;
  type: "text" | "number" | "select" | "radio";
  label: string;
  placeholder?: string;
  options?: string[];
}

const FieldViewer = ({ userId }: { userId: string }) => {
  const [fields, setFields] = useState<Field[]>([]);

  useEffect(() => {
    const loadFields = async () => {
      if (!userId) return;

      const fetchedFields = await fetchFields(userId);
      if (fetchedFields.success) {
        setFields(fetchedFields.data);
      }
    };

    loadFields();
  }, [userId]);

  if (!fields.length) {
    return (
      <div className="flex items-center justify-center flex-col gap-4">
        <Skeleton className="h-8 w-full bg-muted-foreground/10" />
        <Skeleton className="h-8 w-full bg-muted-foreground/10" />
        <Skeleton className="h-8 w-full bg-muted-foreground/10" />
        <Skeleton className="h-16 w-full bg-muted-foreground/10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="space-y-4 glass">
        <CardHeader>
          <CardTitle>
            <h2 className="text-xl font-bold">Form Preview</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field) => (
            <div key={field._id} className="space-y-2">
              <Label>{field.label}</Label>

              {field.type === "select" ? (
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option, idx) => (
                      <SelectItem key={idx} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "radio" ? (
                <div className="space-y-1">
                  {field.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={`${field._id}-${idx}`}
                        name={`radio-${field._id}`}
                        value={option}
                        className="radio-input"
                      />
                      <Label htmlFor={`${field._id}-${idx}`}>{option}</Label>
                    </div>
                  ))}
                </div>
              ) : (
                <Input type={field.type} placeholder={field.placeholder} />
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default FieldViewer;
