import React, { useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type FieldType = "text" | "number" | "select" | "radio";

interface Field {
  id: number;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
}

const FormBuilder = () => {
  const [fields, setFields] = useState<Field[]>([]);

  const addField = (type: FieldType) => {
    setFields((prev) => [
      ...prev,
      {
        id: Date.now(),
        type,
        label: "",
        placeholder: type === "text" || type === "number" ? "" : undefined,
        options:
          type === "select" || type === "radio"
            ? ["Option 1", "Option 2"]
            : undefined,
      },
    ]);
  };

  const updateField = (id: number, key: keyof Field, value: any) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
  };

  const removeField = (id: number) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Form Builder</h2>

      <div className="flex space-x-2">
        <Button onClick={() => addField("text")}>Add Text Field</Button>
        <Button onClick={() => addField("number")}>Add Number Field</Button>
        <Button onClick={() => addField("select")}>Add Dropdown</Button>
        <Button onClick={() => addField("radio")}>Add Radio Buttons</Button>
      </div>

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="p-4 border rounded-lg space-y-2">
            <Label>Field Label</Label>
            <Input
              value={field.label}
              onChange={(e) => updateField(field.id, "label", e.target.value)}
              placeholder="Enter field label"
            />

            {(field.type === "select" || field.type === "radio") && (
              <>
                <Label>
                  {field.type === "select"
                    ? "Dropdown Options"
                    : "Radio Options"}
                </Label>
                <Textarea
                  value={field.options?.join(", ")}
                  onChange={(e) =>
                    updateField(
                      field.id,
                      "options",
                      e.target.value.split(",").map((opt) => opt.trim())
                    )
                  }
                  placeholder="Comma-separated options (e.g., Option 1, Option 2)"
                />
              </>
            )}

            {field.type !== "select" && field.type !== "radio" && (
              <>
                <Label>Placeholder</Label>
                <Input
                  value={field.placeholder}
                  onChange={(e) =>
                    updateField(field.id, "placeholder", e.target.value)
                  }
                  placeholder="Enter placeholder text"
                />
              </>
            )}

            <Button variant="destructive" onClick={() => removeField(field.id)}>
              Remove Field
            </Button>
          </div>
        ))}
      </div>

      <h3 className="text-lg font-semibold">Form Preview</h3>
      <form className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
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
                      id={`${field.id}-${idx}`}
                      name={`radio-${field.id}`}
                      value={option}
                      className="radio-input"
                    />
                    <Label htmlFor={`${field.id}-${idx}`}>{option}</Label>
                  </div>
                ))}
              </div>
            ) : (
              <Input type={field.type} placeholder={field.placeholder} />
            )}
          </div>
        ))}
      </form>

      <h3 className="text-lg font-semibold">Export Configuration</h3>
      <Textarea
        readOnly
        value={JSON.stringify(fields, null, 2)}
        className="w-full"
      />
    </div>
  );
};

export default FormBuilder;
