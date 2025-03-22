"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IField } from "@/lib/database/models/field.model";
import { getEventFields } from "@/lib/actions/field.action";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Info, Tag } from "lucide-react";

type discountType = {
  field: string;
  value: string; // Changed to string to match input values
  discount: number;
};
type discountInfoType = {
  field: string;
  label: string;
  fieldValue: string;
  type: string;
  value: string | number;
};
type RequiredUserInfoType = {
  label: string;
  field: string;
  type: string;
  value: string;
};
interface MyDialogProps {
  isOpen: boolean;
  onClose: () => void;
  discount: discountType;
  requiredInfo: string[];
  setRequiredUserInfo: React.Dispatch<
    React.SetStateAction<RequiredUserInfoType[]>
  >;
  setDiscountInfo: React.Dispatch<React.SetStateAction<discountInfoType>>;
}

export default function DiscountDialog({
  isOpen,
  onClose,
  requiredInfo,
  discount,
  setRequiredUserInfo,
  setDiscountInfo,
}: MyDialogProps) {
  const [fields, setFields] = useState<IField[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isDiscountApplied, setIsDiscountApplied] = useState(false);

  useEffect(() => {
    const loadFields = async () => {
      const fetchedFields = await getEventFields(requiredInfo);
      if (fetchedFields.success) {
        setFields(fetchedFields.data);

        // Initialize formData and errors state
        const initialFormData: { [key: string]: string } = {};
        const initialErrors: { [key: string]: string } = {};
        fetchedFields.data.forEach((field: IField) => {
          initialFormData[field._id] = "";
          initialErrors[field._id] = "";
        });
        setFormData(initialFormData);
        setErrors(initialErrors);
      }
    };

    loadFields();
  }, []);

  const handleChange = (id: string, value: string) => {
    setFormData((prev) => {
      const updatedData = { ...prev, [id]: value };

      // Check if discount applies
      if (id === discount.field) {
        // Check if the selected value matches the discount value

        value === discount.value
          ? setIsDiscountApplied(true)
          : setIsDiscountApplied(false);
      }

      return updatedData;
    });

    // Clear error when user types/selects a value
    if (value.trim() !== "") {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handleSubmit = () => {
    let newErrors: { [key: string]: string } = {};
    let isValid = true;

    fields.forEach((field) => {
      if (!formData[field._id]?.trim()) {
        newErrors[field._id] = `${field.label} is required.`;
        isValid = false;
      }
    });

    if (!isValid) {
      setErrors(newErrors);
      return;
    }
    const requiredUserInfo = fields.map((field) => ({
      field: field._id,
      label: field.label,
      type: field.type,
      value: formData[field._id],
    }));
    setRequiredUserInfo(requiredUserInfo);
    const discountValue = isDiscountApplied ? discount.discount : 0;
    const discountInfo = {
      field: discount.field,
      label: fields.find((f) => f._id === discount.field)?.label || "",
      type: "discount",
      value: discountValue,
      fieldValue: formData[discount.field],
    };
    setDiscountInfo(discountInfo);
    // console.log("Form Data Submitted:", formData);
    // console.log("Form Data Submitted:", requiredUserInfo);
    // console.log("Discount Information:", discountInfo);
    onClose(); // Close dialog after submission
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" w-full bg-card/70 border border-border dark:border-border/20 rounded-2xl shadow-lg dark:shadow-primary/5">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-2xl font-bold text-foreground">
            Additional Information
          </DialogTitle>
          <DialogDescription className="text-muted-foreground flex items-center gap-2">
            <Info className="h-4 w-4" />
            Please provide the following details to complete your registration
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 max-h-[80vh]">
          <ScrollArea className="p-4">
            {fields.map((field) => (
              <div key={field._id} className="space-y-2 mx-4 mb-6 group">
                <Label className="text-foreground font-medium flex items-center gap-1.5">
                  {field.label}
                  {field._id === discount.field && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                      Discount eligible
                    </span>
                  )}
                </Label>

                {field.type === "select" ? (
                  <>
                    <Select
                      onValueChange={(value) => handleChange(field._id, value)}
                    >
                      <SelectTrigger className="w-full bg-background border-input rounded-full  focus:ring-1 focus:ring-primary/30">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {field.options?.map((option, idx) => (
                          <SelectItem key={idx} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors[field._id] && (
                      <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                        <span className="h-1 w-1 rounded-full bg-destructive"></span>
                        {errors[field._id]}
                      </p>
                    )}
                  </>
                ) : field.type === "radio" ? (
                  <>
                    <div className="space-y-2 pt-1">
                      {field.options?.map((option, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 p-3 rounded-lg border border-input hover:border-primary/50 transition-colors cursor-pointer ${
                            formData[field._id] === option
                              ? "bg-primary/5 border-primary dark:bg-primary/10"
                              : "bg-background"
                          }`}
                          onClick={() => handleChange(field._id, option)}
                        >
                          <div
                            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${
                              formData[field._id] === option
                                ? "border-primary"
                                : "border-muted-foreground"
                            }`}
                          >
                            {formData[field._id] === option && (
                              <div className="h-2 w-2 rounded-full bg-primary" />
                            )}
                          </div>
                          <Label className="cursor-pointer text-foreground">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {errors[field._id] && (
                      <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                        <span className="h-1 w-1 rounded-full bg-destructive"></span>
                        {errors[field._id]}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <Input
                      type={
                        field?.label?.toLowerCase() === "email"
                          ? "mail"
                          : field.type
                      }
                      placeholder={field.placeholder}
                      className="bg-background border-input rounded-full focus:ring-1 focus:ring-primary/30"
                      value={formData[field._id]}
                      onChange={(e) => handleChange(field._id, e.target.value)}
                    />
                    {errors[field._id] && (
                      <p className="text-destructive text-sm flex items-center gap-1 mt-1">
                        <span className="h-1 w-1 rounded-full bg-destructive"></span>
                        {errors[field._id]}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}

            {/* Show Discount Only If The Condition is Met */}

            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
        {isDiscountApplied && (
          <div className="flex items-center justify-between mt-1 mb-1 p-4 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">
                Discount Applied
              </span>
            </div>
            <div className="px-3 py-1 rounded-full bg-primary text-primary-foreground font-bold text-sm">
              {discount.discount}% OFF
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-2 pt-2 border-t border-border dark:border-border/20">
          <Button variant="outline" className="rounded-lg" onClick={onClose}>
            Cancel
          </Button>
          <Button className="rounded-lg" onClick={handleSubmit}>
            Complete Registration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
