"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

import { connectToDatabase } from "../database";
import { Comment } from "../database/models/comment.model";
import { hasUserLikedComment } from "./like.actions";
import { useUser } from "./user.actions";
import { use } from "react";
import User from "../database/models/user.model";

// Type for client-side comment representation
export type CommentType = {
  id: string;
  author: {
    firstName: string;
    lastName: string;
    photo: string;
    id: string;
  };
  content: string;
  createdAt: Date;
  updatedAt: Date;
  likesCount: number;
  liked: boolean;
  replies: CommentType[];
};

// Convert Mongoose comment to client-side format
async function convertComment(comment: any): Promise<CommentType> {
  // Get the current user
  const session = await useUser();
  const userId = session?._id || "guest-user";

  // Check if the user has liked this comment
  const liked = await hasUserLikedComment(comment._id.toString());

  // If this comment has replies, convert them too
  const replies = comment.replies
    ? await Promise.all(
        comment.replies.map((reply: any) => convertComment(reply))
      )
    : [];

  return {
    id: comment._id.toString(),
    author: JSON.parse(JSON.stringify(comment.author)),
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    likesCount: comment.likesCount,
    liked,
    replies,
  };
}

// Get all comments for a post
// export async function getComments(postId: string): Promise<CommentType[]> {
//   try {
//     await connectToDatabase();

//     // Convert string ID to ObjectId
//     const objectPostId = new mongoose.Types.ObjectId(postId);

//     // Get top-level comments
//     const comments = await Comment.find({
//       eventId: objectPostId,
//       parentId: null,
//     })
//       .populate({
//         path: "author",
//         model: User,
//         select: "photo firstName lastName",
//       })
//       .sort({ createdAt: -1 });
//     console.log(comments);

//     // Get replies for each comment
//     const commentsWithReplies = await Promise.all(
//       comments.map(async (comment) => {
//         const replies = await Comment.find({
//           parentId: comment._id,
//         })
//           .populate({
//             path: "author",
//             model: User,
//             select: "photo firstName lastName",
//           })
//           .sort({ createdAt: 1 });

//         return {
//           ...comment.toObject(),
//           replies: replies.map((reply) => reply.toObject()),
//         };
//       })
//     );

//     // Convert to client format
//     return Promise.all(
//       commentsWithReplies.map((comment) => convertComment(comment))
//     );
//   } catch (error) {
//     console.error("Error fetching comments:", error);
//     throw new Error("Failed to fetch comments");
//   }
// }
export async function getComments(postId: string): Promise<CommentType[]> {
  try {
    await connectToDatabase();

    const objectPostId = new mongoose.Types.ObjectId(postId);

    // Recursive function to fetch replies
    const fetchReplies = async (
      parentId: mongoose.Types.ObjectId
    ): Promise<CommentType[]> => {
      const replies = await Comment.find({ parentId })
        .populate({
          path: "author",
          model: User,
          select: "photo firstName lastName",
        })
        .sort({ createdAt: 1 });

      return await Promise.all(
        replies.map(async (reply) => ({
          ...reply.toObject(),
          replies: await fetchReplies(reply._id), // Recursively get replies
        }))
      );
    };

    // Fetch top-level comments
    const comments = await Comment.find({
      eventId: objectPostId,
      parentId: null,
    })
      .populate({
        path: "author",
        model: User,
        select: "photo firstName lastName",
      })
      .sort({ createdAt: -1 });

    // Attach nested replies
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => ({
        ...comment.toObject(),
        replies: await fetchReplies(comment._id),
      }))
    );

    return Promise.all(
      commentsWithReplies.map((comment) => convertComment(comment))
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

// Add a new comment
export async function addComment(postId: string, content: string) {
  try {
    await connectToDatabase();

    // Get the current user (or use default for demo)
    const session = await useUser();
    const user = session?._id || {
      id: "guest-user",
      name: "Guest User",
      image: "/placeholder.svg?height=40&width=40",
    };

    // Convert string ID to ObjectId
    const objectPostId = new mongoose.Types.ObjectId(postId);

    const newComment = new Comment({
      author: user,
      content,
      eventId: objectPostId,
      parentId: null,
      likesCount: 0,
    });

    await newComment.save();
    revalidatePath(`/events/${postId}`);

    return await convertComment(newComment.toObject());
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment");
  }
}

// Add a reply to a comment
export async function addReply(
  postId: string,
  parentId: string,
  content: string
) {
  try {
    await connectToDatabase();

    // Get the current user (or use default for demo)
    const session = await useUser();
    const user = session?._id || {
      id: "guest-user",
      name: "Guest User",
      image: "/placeholder.svg?height=40&width=40",
    };

    // Convert string IDs to ObjectIds
    const objectPostId = new mongoose.Types.ObjectId(postId);
    const objectParentId = new mongoose.Types.ObjectId(parentId);

    const newReply = new Comment({
      author: user,
      content,
      eventId: objectPostId,
      parentId: objectParentId,
      likesCount: 0,
    });

    await newReply.save();
    revalidatePath(`/events/${postId}`);

    return await convertComment(newReply.toObject());
  } catch (error) {
    console.error("Error adding reply:", error);
    throw new Error("Failed to add reply");
  }
}
