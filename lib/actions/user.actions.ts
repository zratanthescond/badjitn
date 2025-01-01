"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import Order from "@/lib/database/models/order.model";
import Event from "@/lib/database/models/event.model";
import { handleError } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { CreateUserParams, UpdateUserParams } from "@/types";
export async function useUser() {
  try {
    await connectToDatabase();
    const clerkUser = await currentUser();

    console.log("clerkId", clerkUser?.id);
    //const clerkId = "user_2qjB11CRNqSQhU49dfemouaQJJ0";
    const clerkId = clerkUser?.id;
    const user = await User.findOne({ clerkId: clerkId });
    return user;
  } catch (error) {
    handleError(error);
  }
}
export async function createUser(user: CreateUserParams) {
  try {
    await connectToDatabase();
    console.log(user);
    const userMatchingEmail = await User.findOne({ email: user.email });
    if (userMatchingEmail) {
      return { error: `email ${user.email} already used` };
    }
    const userNameExists = await User.findOne({ username: user.username });
    if (userNameExists) {
      return { error: `email ${user.username} already used` };
    }

    const userMatchingPhoneNumber = await User.findOne({
      phoneNumber: user.phoneNumber,
    });
    if (userMatchingPhoneNumber) {
      /// return { error: `phone number ${user.phoneNumber} already used` };
      console.log(`phone number ${user.phoneNumber} already used`);
    }
    const newUser = await User.create(user);
    return JSON.parse(JSON.stringify(newUser));
  } catch (error) {
    handleError(error);
    return { error: (error as Error).message };
  }
}

export async function getUserById(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function updateUser(clerkId: string, user: UpdateUserParams) {
  try {
    await connectToDatabase();

    const updatedUser = await User.findOneAndUpdate({ clerkId }, user, {
      new: true,
    });

    if (!updatedUser) throw new Error("User update failed");
    return JSON.parse(JSON.stringify(updatedUser));
  } catch (error) {
    handleError(error);
  }
}

export async function deleteUser(clerkId: string) {
  try {
    await connectToDatabase();

    // Find user to delete
    const userToDelete = await User.findOne({ clerkId });

    if (!userToDelete) {
      throw new Error("User not found");
    }

    // Unlink relationships
    await Promise.all([
      // Update the 'events' collection to remove references to the user
      Event.updateMany(
        { _id: { $in: userToDelete.events } },
        { $pull: { organizer: userToDelete._id } }
      ),

      // Update the 'orders' collection to remove references to the user
      Order.updateMany(
        { _id: { $in: userToDelete.orders } },
        { $unset: { buyer: 1 } }
      ),
    ]);

    // Delete user
    const deletedUser = await User.findByIdAndDelete(userToDelete._id);
    revalidatePath("/");

    return deletedUser ? JSON.parse(JSON.stringify(deletedUser)) : null;
  } catch (error) {
    handleError(error);
  }
}
