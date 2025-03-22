"use client";
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
import {
  FaPlus,
  FaRegEdit,
  FaTrashAlt,
  FaListAlt,
  FaDotCircle,
} from "react-icons/fa";
import { set } from "mongoose";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Pencil, X } from "lucide-react";

import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { saveFields } from "@/lib/actions/field.action";

type FieldType = "text" | "number" | "select" | "radio";

interface Field {
  id: number;
  type: FieldType;
  label: string;
  placeholder?: string;
  options?: string[];
  isEditing: boolean; // Added to track editing state
}

const FormBuilder = ({ userId }: { userId: string }) => {
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedField, SetSelectedField] = useState<Field | null>(null);
  const [error, setError] = useState<string>("");
  const addField = (type: FieldType) => {
    const fieldId = Date.now();
    const newField: Field = {
      id: fieldId,
      type,
      label: "",
      placeholder: type === "text" || type === "number" ? "" : undefined,
      options:
        type === "select" || type === "radio"
          ? ["Option 1", "Option 2"]
          : undefined,
      isEditing: true, // New field is in editing mode by default
    };
    setFields((prev) => [...prev, newField]);

    // Set the newly added field as the selected field
    SetSelectedField(newField);
  };

  const updateField = (id: number, key: keyof Field, value: any) => {
    if (key === "options") {
      if (value.length === 0) {
        return;
      }
    }
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, [key]: value } : field
      )
    );
    SetSelectedField((prev) => ({ ...prev, [key]: value }));
  };

  const removeField = (id: number) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
    SetSelectedField(null);
  };

  const finishEditing = (id: number) => {
    setFields((prev) =>
      prev.map((field) =>
        field.id === id ? { ...field, isEditing: false } : field
      )
    );
    SetSelectedField(null);
  };
  const saveForm = async () => {
    setError("");
    // Implement form saving logic here
    const emptyLabel = fields.some((field) => {
      return (
        field.label === "" || field.label === undefined || field.label === null
      );
    });
    if (emptyLabel === true) {
      alert(emptyLabel);
      setError("Please fill in all the fields labels");
      return;
    }
    const formattedFields = fields.map(({ id, ...rest }) => ({
      ...rest,
      userId,
    })); // Exclude local `id`

    const response = await saveFields(formattedFields);

    if (response.success) {
      alert("Form saved successfully!");
      setFields([]); // Clear form after saving
    } else {
      alert("Error: " + response.message);
    }
  };
  return (
    <div className="space-y-6 max-w-4xl mx-auto max-h-screen py-4 ">
      <ScrollArea className="h-screen">
        <h2 className="text-2xl font-bold text-center">Custom Form Builder</h2>

        <div className="flex justify-center flex-col md:flex-row space-x-4 mb-4">
          <Button variant={"outline"} onClick={() => addField("text")}>
            <FaRegEdit className="mr-2" />
            Text Field
          </Button>
          <Button variant={"outline"} onClick={() => addField("number")}>
            <FaListAlt className="mr-2" />
            Number Field
          </Button>
          <Button variant={"outline"} onClick={() => addField("select")}>
            <FaPlus className="mr-2" />
            Dropdown
          </Button>
          <Button variant={"outline"} onClick={() => addField("radio")}>
            <FaDotCircle className="mr-2" />
            Radio Buttons
          </Button>
        </div>

        <div className="space-y-4">
          {selectedField && (
            <div className="p-4 border rounded-lg space-y-3 shadow-md">
              <Label>Field Label</Label>
              {selectedField.isEditing ? (
                <Input
                  value={selectedField.label}
                  onChange={(e) =>
                    updateField(selectedField.id, "label", e.target.value)
                  }
                  placeholder="Enter field label"
                  className="w-full"
                />
              ) : (
                <div className="text-lg font-semibold">
                  {selectedField.label}
                </div>
              )}

              {(selectedField.type === "select" ||
                selectedField.type === "radio") && (
                <>
                  <Label>
                    {selectedField.type === "select"
                      ? "Dropdown Options"
                      : "Radio Options"}
                  </Label>
                  {selectedField.isEditing ? (
                    <Textarea
                      value={selectedField.options?.join(", ")}
                      onChange={(e) =>
                        updateField(
                          selectedField.id,
                          "options",
                          e.target.value.split(",").map((opt) => opt.trim())
                        )
                      }
                      placeholder="Comma-separated options (e.g., Option 1, Option 2)"
                      className="w-full"
                    />
                  ) : (
                    <div>
                      {selectedField.options?.map((opt, idx) => (
                        <span key={idx} className="text-sm block">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}

              {selectedField.type !== "select" &&
                selectedField.type !== "radio" && (
                  <>
                    <Label>Placeholder</Label>
                    {selectedField.isEditing ? (
                      <Input
                        value={selectedField.placeholder}
                        onChange={(e) =>
                          updateField(
                            selectedField.id,
                            "placeholder",
                            e.target.value
                          )
                        }
                        placeholder="Enter placeholder text"
                        className="w-full"
                      />
                    ) : (
                      <div className="text-sm">{selectedField.placeholder}</div>
                    )}
                  </>
                )}

              <div className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  onClick={() => removeField(selectedField.id)}
                >
                  <FaTrashAlt className="mr-2" />
                  Remove Field
                </Button>
                {selectedField.isEditing ? (
                  <Button
                    onClick={() => finishEditing(selectedField.id)}
                    className="bg-blue-500 text-white"
                  >
                    Finish Editing
                  </Button>
                ) : (
                  <div className="text-xs text-gray-500">
                    ID: {selectedField.id}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Card className="glass mt-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Form Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.length > 0 ? (
                fields.map((field) => (
                  <div
                    key={field.id}
                    className="space-y-2 border- border-muted-foreground "
                  >
                    <div className=" flex flex-row justify-end gap-2 self-end">
                      <Button
                        variant={"destructive"}
                        size={"icon"}
                        onClick={() => removeField(field.id)}
                      >
                        <X />
                      </Button>
                      <Button
                        variant={"outline"}
                        size={"icon"}
                        onClick={() =>
                          SetSelectedField({ ...field, isEditing: true })
                        }
                      >
                        <Pencil />
                      </Button>
                    </div>
                    <Label>{field.label}</Label>
                    {field.type === "select" ? (
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option, idx) => (
                            <SelectItem
                              key={idx}
                              value={option || `option-${idx}`}
                            >
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "radio" ? (
                      <div className="space-y-1">
                        {field.options?.map((option, idx) => (
                          <div
                            key={idx}
                            className="flex items-center space-x-2"
                          >
                            <input
                              type="radio"
                              id={`${field.id}-${idx}`}
                              name={`radio-${field.id}`}
                              value={option}
                              className="radio-input"
                            />
                            <Label htmlFor={`${field.id}-${idx}`}>
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : field.type === "number" || field.type === "text" ? (
                      <Input
                        type={field.type}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="flex p-5 rounded-lg w-full h-full items-center justify-center backdrop:blur-2xl backdrop-brightness-150">
                  <p>no fields added yet</p>
                </div>
              )}
            </div>
            {error.length > 0 && (
              <div className="flex items-center justify-end space-x-2 pt-6">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-row items-center justify-between">
            <p>
              <small>
                this form is used when you want a custom data from the user
              </small>
            </p>
            <Button size={"lg"} variant={"outline"} onClick={() => saveForm()}>
              Update Form
            </Button>
          </CardFooter>
        </Card>

        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};

export default FormBuilder;
