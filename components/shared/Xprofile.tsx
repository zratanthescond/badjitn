"use client";

import { useState } from "react";
import { Building2, CheckIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface XProfileCardProps {
  avatarUrl?: string;
  username: string;
  handle: string;
  organization?: string;
  isVerified?: boolean;
  bio?: string;
  initialFollowing?: boolean;
  className?: string;
  organizationUrl?: string;
}

export function XProfileCard({
  avatarUrl,
  username,
  handle,
  organization,
  isVerified = false,
  bio,
  initialFollowing = false,
  organizationUrl,
  className,
}: XProfileCardProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <div
      className={cn(
        " rounded-xl w-full dark:bg-card/30 bg-card-foreground/5  overflow-hidden",
        className
      )}
    >
      <div className="flex p-3 gap-3">
        {/* Avatar */}
        <Avatar
          className={`h-12 w-12 rounded-full border-4 ${
            isVerified ? "border-[#1d9bf0]" : "border-neutral-400"
          }`}
        >
          <AvatarImage
            src={avatarUrl || "/placeholder.svg?height=48&width=48"}
            alt={`${username}'s avatar`}
          />
          <AvatarFallback className="bg-zinc-800 text-white">
            {username.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 truncate pr-2">
              <span className="font-bold text-sm truncate">{username}</span>

              <div
                className={`${
                  isVerified ? " bg-[#1d9bf0]" : "bg-neutral-400"
                } rounded-full p-0.5 flex-shrink-0`}
              >
                <CheckIcon className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
            <Button
              onClick={toggleFollow}
              size="sm"
              variant={"outline"}
              className={cn(
                "rounded-full text-xs font-bold h-7 px-3",
                isFollowing
                  ? "bg-card/90 border border-zinc-700 hover:border-zinc-600 hover:bg-transparent "
                  : "bg-card-foreground/30 text-black hover:bg-zinc-200"
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
          </div>

          <div className="flex flex-col text-xs">
            <span className="text-zinc-500">@{handle}</span>
            {organization && (
              <a
                href={organizationUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 mt-0.5"
              >
                <Button
                  variant={"link"}
                  size={"sm"}
                  className=" text-sm flex flex-row !mx-0 !px-0"
                >
                  <Building2 className="mr-1 h-4 w-4" />
                  {organization}
                </Button>
              </a>
            )}
            {bio && (
              <p className="mt-1 text-zinc-300 line-clamp-2 text-xs">{bio}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
