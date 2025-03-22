"use server";

import mongoose from "mongoose";
import { Like, LikeableType } from "../database/models/like.model";
import { connectToDatabase } from "../database";
import Event from "../database/models/event.model";
import { revalidatePath } from "next/cache";
import { Comment } from "../database/models/comment.model";
import { useUser } from "./user.actions";
import { use } from "react";
// Toggle like on a post
export async function togglePostLike(postId: string) {
  try {
    await connectToDatabase();

    // Get the current user
    const session = await useUser();
    const userId = session?._id || "guest-user";

    // Convert string ID to ObjectId
    const objectPostId = new mongoose.Types.ObjectId(postId);

    // Check if the user already liked this post
    const existingLike = await Like.findOne({
      userId,
      likeableId: objectPostId,
      likeableType: LikeableType.POST,
    });

    // Find the post
    const post = await Event.findById(objectPostId);
    if (!post) {
      throw new Error("Post not found");
    }

    let liked = false;

    if (existingLike) {
      // Unlike: remove the like
      await Like.deleteOne({ _id: existingLike._id });

      // Decrement the post's like count
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
    } else {
      // Like: create a new like
      const newLike = new Like({
        userId,
        likeableId: objectPostId,
        likeableType: LikeableType.POST,
      });
      await newLike.save();

      // Increment the post's like count
      post.likesCount += 1;
      await post.save();

      liked = true;
    }

    // Revalidate the post page
    revalidatePath(`/posts/${postId}`);

    return {
      likesCount: post.likesCount,
      liked,
    };
  } catch (error) {
    console.error("Error toggling post like:", error);
    throw new Error("Failed to toggle post like");
  }
}

// Toggle like on a comment
export async function toggleCommentLike(commentId: string, postId: string) {
  try {
    await connectToDatabase();

    // Get the current user
    const session = await useUser();
    const userId = session?._id || "guest-user";

    // Convert string ID to ObjectId
    const objectCommentId = new mongoose.Types.ObjectId(commentId);

    // Check if the user already liked this comment
    const existingLike = await Like.findOne({
      userId,
      likeableId: objectCommentId,
      likeableType: LikeableType.COMMENT,
    });

    // Find the comment
    const comment = await Comment.findById(objectCommentId);
    if (!comment) {
      throw new Error("Comment not found");
    }

    let liked = false;

    if (existingLike) {
      // Unlike: remove the like
      await Like.deleteOne({ _id: existingLike._id });

      // Decrement the comment's like count
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await comment.save();
    } else {
      // Like: create a new like
      const newLike = new Like({
        userId,
        likeableId: objectCommentId,
        likeableType: LikeableType.COMMENT,
      });
      await newLike.save();

      // Increment the comment's like count
      comment.likesCount += 1;
      await comment.save();

      liked = true;
    }

    // Revalidate the post page
    revalidatePath(`/posts/${postId}`);

    return {
      id: comment._id.toString(),
      likesCount: comment.likesCount,
      liked,
    };
  } catch (error) {
    console.error("Error toggling comment like:", error);
    throw new Error("Failed to toggle comment like");
  }
}

// Check if a user has liked a post
export async function hasUserLikedPost(postId: string) {
  try {
    await connectToDatabase();

    // Get the current user
    const session = await useUser();
    const userId = session?._id || "guest-user";

    // Convert string ID to ObjectId
    const objectPostId = new mongoose.Types.ObjectId(postId);

    // Check if the user already liked this post
    const existingLike = await Like.findOne({
      userId,
      likeableId: objectPostId,
      likeableType: LikeableType.POST,
    });

    return !!existingLike;
  } catch (error) {
    console.error("Error checking if user liked post:", error);
    return false;
  }
}

// Check if a user has liked a comment
export async function hasUserLikedComment(commentId: string) {
  try {
    await connectToDatabase();

    // Get the current user
    const session = await useUser();
    const userId = session?._id || "guest-user";

    // Convert string ID to ObjectId
    const objectCommentId = new mongoose.Types.ObjectId(commentId);

    // Check if the user already liked this comment
    const existingLike = await Like.findOne({
      userId,
      likeableId: objectCommentId,
      likeableType: LikeableType.COMMENT,
    });

    return !!existingLike;
  } catch (error) {
    console.error("Error checking if user liked comment:", error);
    return false;
  }
}

// Get like counts for a post
export async function getPostLikesCount(postId: string) {
  try {
    await connectToDatabase();

    // Convert string ID to ObjectId
    const objectPostId = new mongoose.Types.ObjectId(postId);

    // Count likes for this post
    const likesCount = await Like.countDocuments({
      likeableId: objectPostId,
      likeableType: LikeableType.POST,
    });

    return likesCount;
  } catch (error) {
    console.error("Error getting post likes count:", error);
    return 0;
  }
}
