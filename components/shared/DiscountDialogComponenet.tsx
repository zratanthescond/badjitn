import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  FormField,
  FormControl,
  FormDescription,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import FieldModel from "@/lib/database/models/field.model";
import { connectToDatabase } from "@/lib/database";
import { getFieldById } from "@/lib/actions/field.action";

interface DiscountDialogProps {
  form: any; // use appropriate type for your form object
  fields: any[]; // use appropriate type for fields
}

const DiscountDialog: React.FC<DiscountDialogProps> = ({ form, fields }) => {
  const [fieldSelected, setFieldSelected] = React.useState<any>(null);
  const getSingleField = async (fieldId: string) => {
    const field = await getFieldById(fieldId);
    setFieldSelected(field.data);
  };

  return (
    <div className="flex flex-col">
      <FormField
        control={form.control}
        name="discount"
        render={({ field }) => (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size={"lg"}
                className="rounded-full self-end bg-pink-500 text-white hover:text-white hover:bg-pink-950"
              >
                Apply discount
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card rounded-3xl">
              <DialogHeader>
                <DialogTitle>Apply discount by profile</DialogTitle>
                <DialogDescription>
                  add your discount condition by fields
                </DialogDescription>
              </DialogHeader>
              <FormItem>
                <FormDescription>choose a field and a value</FormDescription>
                <FormControl>
                  {form.getValues("requiredInfo")?.length > 0 ? (
                    <div className="flex flex-col items-center justify-between gap-4 px-4 py-2">
                      <div className="flex flex-row items-center justify-between gap-4">
                        <Select
                          onValueChange={(value) => {
                            field.onChange({
                              ...field.value,
                              field: value,
                            });
                            getSingleField(value);
                          }}
                          value={field.value?.field}
                          defaultValue={field.value?.field}
                        >
                          <SelectTrigger className="glass rounded-full w-1/2">
                            <SelectValue placeholder="Select a field" />
                          </SelectTrigger>
                          <SelectContent className="glass w-full">
                            {form
                              .getValues("requiredInfo")!
                              .map((fl: string) => (
                                <SelectItem key={fl} value={fl}>
                                  {fields.find((f) => f.id === fl)?.name ?? (
                                    <span>
                                      {fl}{" "}
                                      <span className="text-muted-foreground glass">
                                        (Field not found)
                                      </span>
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        {field.value?.field ? (
                          <>
                            {fieldSelected?.type === "select" ? (
                              <Select
                                onValueChange={(value) => {
                                  field.onChange({
                                    ...field.value,
                                    value,
                                  });
                                }}
                                value={field.value?.value}
                              >
                                <SelectTrigger className="glass rounded-full">
                                  <SelectValue placeholder="Value" />
                                </SelectTrigger>
                                <SelectContent className="glass">
                                  {fieldSelected?.options?.map(
                                    (option: string) => (
                                      <SelectItem key={option} value={option}>
                                        {option}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Input
                                onChange={(e) =>
                                  field.onChange({
                                    ...field.value,
                                    value: e.target.value,
                                  })
                                }
                                value={field.value?.value}
                                placeholder="Value"
                                className="glass rounded-full w-full"
                              />
                            )}
                          </>
                        ) : (
                          <span className="text-muted-foreground glass w-full rounded-full h-10 text-center content-center p-1">
                            Select a field
                          </span>
                        )}
                      </div>
                      <Separator className="my-4" />
                      <FormDescription>
                        Select a discount percentage
                      </FormDescription>

                      <Select
                        onValueChange={(value) => {
                          field.onChange({
                            ...field.value,
                            discount: value,
                          });
                        }}
                        value={field.value?.discount || "0"}
                      >
                        <SelectTrigger className="glass rounded-full">
                          <SelectValue placeholder="Select a discount" />
                        </SelectTrigger>
                        <SelectContent className="glass">
                          {Array.from({ length: 9 }, (_, i) => (
                            <SelectItem key={i} value={`${(i + 1) * 10}`}>
                              {(i + 1) * 10}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <div className="flex-center h-[54px] w-full overflow-hidden rounded-full glass px-4 py-2">
                      <p>No required info selected</p>
                    </div>
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    variant={"outline"}
                    size={"lg"}
                    type="submit"
                    className="rounded-full self-end bg-pink-500 text-white hover:text-white hover:bg-pink-950"
                  >
                    Save changes
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      />
    </div>
  );
};
export default DiscountDialog;
