import { Check } from "lucide-react";
import {
  AlertDialogTrigger,
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Badge } from "../ui/badge";

const OrderDetailsDialog = ({ value }: { value: any }) => {
  const totalAmount =
    parseFloat(value?.totalAmount) === 0
      ? (value.details &&
          value.details.length > 0 &&
          value?.details?.reduce(
            (sum, item) => sum + parseFloat(item.price),
            0
          )) ||
        0
      : parseFloat(value.totalAmount);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className=" rounded-full">
          View
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className=" glass !bg-card/10 gap-2 rounded-3xl">
        <AlertDialogTitle>Order Details</AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
        <ScrollArea className="h-96">
          <div className=" flex !min-w-full flex-col items-center justify-center gap-2">
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
                <CardDescription>availeble plans</CardDescription>
              </CardHeader>

              <CardContent className="rounded-3xl flex flex-col !w-full bg-card/10">
                {value?.details && value.details.length > 0 ? (
                  value?.details?.map((detail: any) => (
                    <div
                      key={detail._id}
                      className="flex justify-between items-center py-2"
                    >
                      <div className="flex items-start  gap-2">
                        <Check size={16} color="#22c55e" />
                        <span className="text-sm">{detail.name}</span>
                      </div>
                      <Badge variant="outline" className="text-sm font-medium">
                        {detail.price}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="flex justify-start items-center flex-row py-2">
                    <Check size={16} color="#22c55e" />
                    <span className="text-sm">
                      All event plans are available
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                {value?.type !== "hosted" ? (
                  <>
                    <div className="flex justify-between gap-2 items-center">
                      <span className="text-sm font-medium">Total Amount</span>
                      <Badge variant="outline" className="text-sm font-medium">
                        {totalAmount}
                      </Badge>
                    </div>
                    {value?.discountInfo && (
                      <>
                        <Badge
                          variant={"outline"}
                          className="text-sm mx-2 font-mono bg-pink-500 text-white"
                        >
                          Discount:{value.discountInfo.value}%
                        </Badge>
                        <Badge
                          variant={"outline"}
                          className="text-sm mx-2 font-mono bg-pink-500 text-white"
                        >
                          {value.type === "paid" ? "Cash payed" : "To pay"}{" "}
                          {(totalAmount / 100) * value.discountInfo.value}
                        </Badge>
                      </>
                    )}
                  </>
                ) : (
                  <span className="">this order is hosted by admin</span>
                )}
              </CardFooter>
            </Card>
            {value?.requiredUserInfo && value.requiredUserInfo.length > 0 && (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Buyer required Info</CardTitle>
                  <CardDescription>
                    data required from buyer by admin
                  </CardDescription>
                  <CardContent className="p-2 flex flex-col justify-between items-center !min-w-full gap-2">
                    {value.requiredUserInfo.map((info) => (
                      <div className="flex flex-row w-full items-center justify-between">
                        <span>
                          {info.label}:
                          {info.label === value.discountInfo.label && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary dark:bg-primary/20">
                              Discount eligible
                            </span>
                          )}
                        </span>
                        {info.value === value?.discountInfo?.fieldValue ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-pink-500 dark:bg-primary/20">
                            {info.value} {value.discountInfo.value}%
                          </span>
                        ) : (
                          <span>{info.value}</span>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </CardHeader>
              </Card>
            )}
          </div>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-full">Return</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default OrderDetailsDialog;
