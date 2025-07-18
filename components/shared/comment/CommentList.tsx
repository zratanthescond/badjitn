"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useToast } from "@/hooks/use-toast";
import { toggleCommentLike } from "@/lib/actions/like.actions";
import { CommentType } from "@/lib/actions/comment.action";
import { CommentForm } from "./CommentForm";
import { Content } from "@tiptap/react";
import { IUser } from "@/lib/database/models/user.model";
import { useTranslations } from "next-intl";

interface CommentListProps {
  comments: CommentType[];
  postId: string;
  onAddReply: (parentId: string, content: string) => void;
  isNested?: boolean;
  currentUser: IUser;
}

export function CommentList({
  comments,
  postId,
  onAddReply,
  isNested = false,
  currentUser,
}: CommentListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [localComments, setLocalComments] = useState<CommentType[]>(comments);
  const { toast } = useToast();
  console.log(comments);
  const handleReply = (parentId: string, content: Content) => {
    onAddReply(parentId, content);
    setReplyingTo(null);
  };
  const t = useTranslations("comments");
  const handleToggleLike = async (commentId: string) => {
    try {
      // Find the comment to update
      const commentToUpdate = findCommentById(localComments, commentId);

      if (!commentToUpdate) return;

      // Optimistically update UI
      const updatedComments = updateCommentLike(
        localComments,
        commentId,
        !commentToUpdate.liked,
        commentToUpdate.liked
          ? commentToUpdate.likesCount - 1
          : commentToUpdate.likesCount + 1
      );
      setLocalComments(updatedComments);

      // Call server action
      const result = await toggleCommentLike(commentId, postId);

      // Update with actual server result
      const finalComments = updateCommentLike(
        localComments,
        commentId,
        result.liked,
        result.likesCount
      );
      setLocalComments(finalComments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like",
        variant: "destructive",
      });

      // Revert to original comments on error
      setLocalComments(comments);
    }
  };

  // Helper function to find a comment by ID (including in nested replies)
  const findCommentById = (
    comments: CommentType[],
    id: string
  ): CommentType | null => {
    for (const comment of comments) {
      if (comment.id === id) {
        return comment;
      }

      if (comment.replies && comment.replies.length > 0) {
        const found = findCommentById(comment.replies, id);
        if (found) return found;
      }
    }

    return null;
  };

  // Helper function to update a comment's like status
  const updateCommentLike = (
    comments: CommentType[],
    id: string,
    liked: boolean,
    likesCount: number
  ): CommentType[] => {
    return comments.map((comment) => {
      if (comment.id === id) {
        return { ...comment, liked, likesCount };
      }

      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentLike(comment.replies, id, liked, likesCount),
        };
      }

      return comment;
    });
  };

  return (
    <div className={`space-y-3 ${isNested ? "ml-2 mt-2" : ""}`}>
      {localComments.map((comment) => (
        <div key={comment.id} className="group">
          <div className="flex gap-2">
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage
                src={comment.author.photo}
                alt={comment.author.firstName}
              />
              <AvatarFallback>
                {comment.author.lastName && comment.author.lastName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="bg-muted rounded-2xl px-3 py-2">
                <div className="font-semibold text-sm">
                  {/* {comment.author.name} */}
                </div>
                <div className="text-sm">{comment.content}</div>
              </div>
              <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                <button
                  className={`font-medium ${
                    comment.liked ? "text-blue-600" : ""
                  }`}
                  onClick={() => handleToggleLike(comment.id)}
                >
                  {t("like")}
                </button>
                <button
                  className="font-medium"
                  onClick={() =>
                    setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  }
                >
                  {t("reply")}
                </button>
                <span>
                  {formatDistanceToNow(new Date(comment.createdAt), {
                    addSuffix: true,
                  })}
                </span>
                {comment.likesCount > 0 && (
                  <div className="flex items-center gap-1 ml-auto">
                    <div className="bg-blue-500 rounded-full p-1 flex items-center justify-center h-4 w-4">
                      <Heart className="h-2 w-2 text-white" fill="white" />
                    </div>
                    <span>{comment.likesCount}</span>
                  </div>
                )}
              </div>

              {replyingTo === comment.id &&
                (currentUser ? (
                  <div className="mt-2 flex items-start gap-2">
                    <Avatar className="h-6 w-6 mt-1 border-2 border-card-foreground">
                      <AvatarImage
                        src={currentUser.photo}
                        alt={currentUser.username}
                      />
                      <AvatarFallback>
                        {currentUser.username.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CommentForm
                        onSubmit={(content) => handleReply(comment.id, content)}
                        isReply={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {t("loginToReply")}
                    </span>
                  </div>
                ))}

              {comment.replies && comment.replies.length > 0 && (
                <CommentList
                  comments={comment.replies}
                  postId={postId}
                  onAddReply={onAddReply}
                  isNested={true}
                  currentUser={currentUser}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
