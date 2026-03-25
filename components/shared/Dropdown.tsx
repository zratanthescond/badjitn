import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ICategory } from "@/lib/database/models/category.model";
import { startTransition, useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "../ui/input";
import {
  createCategory,
  getAllCategories,
} from "@/lib/actions/category.actions";
import { useTranslations } from "next-intl";

type DropdownProps = {
  value?: string;
  onChangeHandler?: () => void;
};

const Dropdown = ({ value, onChangeHandler }: DropdownProps) => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [open, setOpen] = useState(false);
  const t = useTranslations("category");
  useEffect(() => {
    const getCategories = async () => {
      const categoryList = await getAllCategories();

      if (categoryList) {
        const sortedList = (categoryList as ICategory[]).sort((a, b) => {
          const nameA = t.has(a.name) ? t(a.name) : a.name;
          const nameB = t.has(b.name) ? t(b.name) : b.name;
          return nameA.localeCompare(nameB);
        });
        setCategories(sortedList);
      }
    };

    getCategories();
  }, [t]);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="select-field">
        <SelectValue placeholder={t.has("category") ? t("category") : "Category"} />
      </SelectTrigger>
      <SelectContent>
        {categories.length > 0 &&
          categories.map((category) => (
            <SelectItem
              key={category._id}
              value={category._id}
              className="select-item p-regular-14"
            >
              {t.has(category.name) ? t(category.name) : category.name}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
