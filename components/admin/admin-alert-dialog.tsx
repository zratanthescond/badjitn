"use client";

import { useEffect, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  XCircle,
  UserCog,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: rgba(155, 155, 155, 0.7);
  }
`;

interface UserAlertDialogProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    joinDate: string;
    isBanned: boolean;
    publisherRequest?: {
      description: string;
      organizationName: string;
      organizationWebsite: string;
      status: "pending" | "approved" | "rejected";
    };
  };
  onBanUser?: (userId: string) => Promise<void>;
  onUnbanUser?: (userId: string) => Promise<void>;
  onApprovePublisherRequest?: (userId: string) => Promise<void>;
  onRejectPublisherRequest?: (userId: string) => Promise<void>;
  triggerClassName?: string;
  triggerText?: string;
}

export default function UserAlertDialog({
  onBanUser,
  onUnbanUser,
  onApprovePublisherRequest,
  onRejectPublisherRequest,
  triggerClassName = "",
  triggerText = "Manage User",
  user,
}: UserAlertDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [value, setvalue] = useState(user);

  const handleBanAction = async () => {
    setIsLoading(true);
    try {
      if (value.isBanned) {
        if (onUnbanUser) await onUnbanUser(value._id);
        setvalue((prev) => ({ ...prev, isBanned: false }));
      } else {
        if (onBanUser) await onBanUser(value._id);
        setvalue((prev) => ({ ...prev, isBanned: true }));
      }
    } catch (error) {
      console.error("Error updating user ban status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublisherRequest = async (approve: boolean) => {
    setIsLoading(true);
    try {
      if (approve) {
        if (onApprovePublisherRequest) {
          //  alert("Approved");
          await onApprovePublisherRequest(value._id);
          setvalue((prev) => ({ ...prev, publisher: "approved" }));
        }
      } else {
        if (onRejectPublisherRequest) await onRejectPublisherRequest(value._id);
        setvalue((prev) => ({ ...prev, publisher: "rejected" }));
      }
    } catch (error) {
      console.error("Error handling publisher request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  return (
    <>
      {" "}
      {value && (
        <>
          <style jsx global>
            {scrollbarStyles}
          </style>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={`flex items-center rounded-full gap-2 ${triggerClassName}`}
                onClick={() => setOpen(true)}
              >
                <UserCog className="h-4 w-4" />
                {triggerText}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-md max-h-[85vh] flex flex-col">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">
                  User Management
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Review user information and manage permissions.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="py-2 overflow-y-auto flex-1 pr-1 custom-scrollbar">
                <Card className="border-0 shadow-md bg-gradient-to-br from-background rounded-3xl to-muted">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-primary/10">
                          <AvatarImage
                            src={value.photo}
                            alt={value.firstName + " " + value.lastName}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {value?.firstName?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {value.firstName + " " + value.lastName}
                          </CardTitle>
                          <CardDescription className="text-sm opacity-90">
                            {value.email}
                          </CardDescription>
                        </div>
                      </div>
                      {value.isBanned && (
                        <Badge variant="destructive" className="animate-pulse">
                          Banned
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <p className="text-muted-foreground mb-4">
                      Member since: {formatDateTime(value.createdAt).dateTime}
                    </p>

                    <Button
                      variant={value.isBanned ? "outline" : "destructive"}
                      size="sm"
                      className={`mt-2 w-full transition-all duration-300 rounded-full ${
                        value.isBanned
                          ? "hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                          : "hover:bg-red-700"
                      }`}
                      onClick={handleBanAction}
                      disabled={isLoading}
                    >
                      <ShieldAlert
                        className={`mr-2 h-4 w-4 ${
                          isLoading ? "animate-spin" : ""
                        }`}
                      />
                      {value.isBanned ? "Unban User" : "Ban User"}
                    </Button>
                  </CardContent>
                </Card>

                {value.publisher !== "none" && (
                  <Card className="mt-4 border-0 shadow-md overflow-hidden rounded-3xl">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400"></div>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Publisher Request
                        </CardTitle>
                        <Badge className={`${getStatusColor(value.publisher)}`}>
                          {value?.publisher?.charAt(0).toUpperCase() +
                            value?.publisher?.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Organization
                        </p>
                        <p className="font-medium">{value.organisationName}</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Website
                        </p>
                        <a
                          href={value.organisationWebsite}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline font-medium"
                        >
                          {value.organisationWebsite}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="font-medium text-xs uppercase tracking-wider text-muted-foreground mb-1">
                          Description
                        </p>
                        <p className="text-muted-foreground max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
                          {value.organisationDescription}
                        </p>
                      </div>
                    </CardContent>
                    {value.publisher === "pending" && (
                      <CardFooter className="flex gap-2 p-4 bg-muted/30">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 rounded-full border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                          onClick={() => handlePublisherRequest(false)}
                          disabled={isLoading}
                        >
                          <XCircle
                            className={`mr-2 h-4 w-4 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                          Reject
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 rounded-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
                          onClick={() => handlePublisherRequest(true)}
                          disabled={isLoading}
                        >
                          <CheckCircle
                            className={`mr-2 h-4 w-4 ${
                              isLoading ? "animate-spin" : ""
                            }`}
                          />
                          Approve
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                )}
              </div>

              <AlertDialogFooter>
                <AlertDialogCancel
                  className="rounded-full"
                  onClick={() => setOpen(false)}
                >
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </>
  );
}
