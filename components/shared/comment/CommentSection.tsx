"use client";

import { useState, useEffect } from "react";
import { CommentList } from "../comment/CommentList";
import { CommentForm } from "../comment/CommentForm";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useToast } from "@/hooks/use-toast";
import {
  addComment,
  addReply,
  CommentType,
  getComments,
} from "@/lib/actions/comment.action";
import {
  getPostLikesCount,
  hasUserLikedPost,
} from "@/lib/actions/like.actions";
import { Content } from "@tiptap/react";
import { useUser } from "@/lib/actions/user.actions";
import { Skeleton } from "@/components/ui/skeleton";
import { IUser } from "@/lib/database/models/user.model";
import { useTranslations } from "next-intl";
//import { PostLikeButton } from "./post-like-button";

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postLikes, setPostLikes] = useState(0);
  const [hasLikedPost, setHasLikedPost] = useState(false);
  const { toast } = useToast();
  const [user, setUser] = useState<IUser | null>(null);
  const t = useTranslations("comments");
  // Fetch comments and post likes on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch comments
        const fetchedComments = await getComments(postId);
        setComments(fetchedComments);

        // Fetch post likes
        const likesCount = await getPostLikesCount(postId);
        setPostLikes(likesCount);

        // Check if user has liked the post
        const liked = await hasUserLikedPost(postId);
        setHasLikedPost(liked);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        const session = await useUser();
        setUser(session);
      }
    };

    fetchData();
  }, [postId, toast]);

  // Add a new comment
  const handleAddComment = async (content: Content) => {
    try {
      const newComment = await addComment(postId, content);
      setComments((prev) => [newComment, ...prev]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  // Add a reply to a comment
  const handleAddReply = async (parentId: string, content: string) => {
    try {
      await addReply(postId, parentId, content);

      // Refresh comments to get the updated structure with new reply
      const updatedComments = await getComments(postId);
      setComments(updatedComments);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add reply",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col w-full gap-4 space-y-4">
        <div className="flex flex-row gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="w-full h-8 rounded-full" />
        </div>
        <div className="flex flex-row gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="w-full h-20 rounded-2xl" />
        </div>
        <div className="flex flex-row gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="w-full h-8 rounded-full" />
        </div>
        <div className="flex flex-row gap-4">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="w-full h-20 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* <div className="flex items-center justify-between border-b pb-2">
        <div className="text-sm text-muted-foreground">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </div>
        <PostLikeButton
          postId={postId}
          initialLikesCount={postLikes}
          initialLiked={hasLikedPost}
        />
      </div> */}

      <div className="flex items-start gap-2">
        {user ? (
          <Avatar className="h-8 w-8 mt-1 border-2 border-card-foreground">
            <AvatarImage src={user.photo} alt="Current User" />
            <AvatarFallback>{user.firstName.slice(0, 2)}</AvatarFallback>
          </Avatar>
        ) : (
          <Skeleton className="h-8 w-8 rounded-full" />
        )}

        <div className="flex-1">
          <CommentForm onSubmit={handleAddComment} />
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="py-4 text-center text-muted-foreground">
          {t("noComments")}
        </div>
      ) : (
        <div className="mt-4">
          <CommentList
            comments={comments}
            postId={postId}
            onAddReply={handleAddReply}
            currentUser={user}
          />
        </div>
      )}
    </div>
  );
}
