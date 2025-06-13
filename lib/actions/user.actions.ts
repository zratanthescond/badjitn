"use server";

import { revalidatePath } from "next/cache";

import { connectToDatabase } from "@/lib/database";
import User from "@/lib/database/models/user.model";
import Order from "@/lib/database/models/order.model";
import Event from "@/lib/database/models/event.model";
import Report from "@/lib/database/models/report.model";
import { handleError } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs";
import { CreateUserParams, UpdateUserParams } from "@/types";
import EventWork from "../database/models/work.model";
import { redirect } from "next/navigation";
import Stripe from "stripe";
import { ObjectId } from "mongodb";
import { clerkClient } from "@clerk/nextjs/server";

export async function useUser() {
  try {
    await connectToDatabase();
    const clerkUser = await currentUser();

    //console.log("clerkId", clerkUser?.id);
    const clerkId = "user_2qjB11CRNqSQhU49dfemouaQJJ0";
    // const clerkId = clerkUser?.id;
    const user = await User.findOne({ clerkId: clerkId });
    return JSON.parse(JSON.stringify(user)) || null;
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
export async function reportEvent(
  eventId: string,
  cause: string,
  userId: string
) {
  try {
    await connectToDatabase();

    const event = await Event.findById(eventId);

    if (!event) throw new Error("Event not found");

    const report = new Report({
      userId: userId,
      eventId: eventId,
      cause: cause,
    });
    await report.save();

    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    handleError(error);
  }
}
export async function uploadWork({
  fileUrl,
  eventId,
  userId,
  note,
}: {
  fileUrl: string;
  eventId: string;
  userId: string;
  note: string;
}) {
  try {
    await connectToDatabase();
    const event = await Event.findById(eventId);

    if (!event) throw new Error("Event not found");
    const user = await User.findById(userId);

    if (!user) throw new Error("User not found");
    const work = await EventWork.findOne({ eventId: eventId, userId: userId });
    if (work) {
      if (fileUrl && fileUrl.length > 0) {
        work.fileUrls.push(fileUrl);
      }
      if (note && note.length > 0) {
        work.note = note;
      }

      await work.save();
    } else {
      const newWork = new EventWork({
        eventId: eventId,
        userId: userId,
        fileUrls: [fileUrl],
        note: note,
      });
      await newWork.save();
    }
  } catch (error) {
    handleError(error);
  }
}

export async function getUserWorkByEvent({
  eventId,
  userId,
}: {
  eventId: string;
  userId: string;
}) {
  try {
    await connectToDatabase();
    const works = await EventWork.findOne({ eventId: eventId, userId: userId });
    return JSON.parse(JSON.stringify(works));
  } catch (error) {
    handleError(error);
  }
}
export async function getUserWorkByEventId({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  try {
    await connectToDatabase();
    const eventObjectId = new ObjectId(eventId);
    if (!eventId) throw new Error("Event ID is required");
    const orders = await EventWork.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "event",
        },
      },
      {
        $unwind: "$event",
      },
      {
        $project: {
          _id: 1,

          createdAt: 1,
          eventTitle: "$event.title",
          eventId: "$event._id",
          buyer: {
            $concat: ["$buyer.firstName", " ", "$buyer.lastName"],
          },

          fileUrls: 1,
          note: 1,
        },
      },
      {
        $match: {
          $and: [
            { eventId: eventObjectId },
            { buyer: { $regex: RegExp(searchString, "i") } },
          ],
        },
      },
    ]);
    console.log(orders);
    return JSON.parse(JSON.stringify(orders));
  } catch (error) {
    handleError(error);
  }
}
export async function requestPublisherBadge(data: {
  userId: string;
  organisationName: string;
  organisationWebsite: string;
  organisationDescription: string;
}) {
  try {
    await connectToDatabase();
    const user = await User.findById(data.userId);
    if (!user) throw new Error("User not found");
    user.publisher = "pending";
    user.organisationName = data.organisationName;
    user.organisationWebsite = data.organisationWebsite;
    user.organisationDescription = data.organisationDescription;
    await user.save();
    revalidatePath("events/create");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
    return { error: (error as Error).message };
  }
}

export async function checkoutPublisherRequest(data: {
  userId: string;
  organisationName: string;
  organisationWebsite: string;
  organisationDescription: string;
}) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: 1000,
            product_data: {
              name: "publisher badge",
              metadata: { name: "dfdfdfdfdf", price: 200 },
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: data.userId,
        details: JSON.stringify(data),
      },
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/create`,
      cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/events/create`,
    });

    redirect(session.url!);
  } catch (error) {
    throw error;
  }
}
export async function admingetUsers() {
  try {
    await connectToDatabase();
    const users = await User.find({});
    return JSON.parse(JSON.stringify(users));
  } catch (error) {
    handleError(error);
  }
}
export async function approvePublisher(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    user.publisher = "approved";
    await user.save();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function rejectPublisher(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    user.publisher = "rejected";
    await user.save();
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}
export async function banUser(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId);
    user.isBanned = true;
    await user.save();
    revalidatePath("/cockpit");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}
export async function unbanUser(userId: string) {
  try {
    await connectToDatabase();
    const user = await User.findById(userId);
    user.isBanned = false;
    await user.save();
    revalidatePath("/cockpit");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    handleError(error);
  }
}

export async function admingetReports() {
  try {
    await connectToDatabase();
    const reports = await Report.find({})
      .populate({
        path: "userId",
        model: User,
        select: "_id firstName lastName",
      })
      .populate({
        path: "eventId",
        model: Event,
        select: "_id title ",
        populate: {
          path: "organizer",
          model: User,
          select: "_id firstName lastName",
        },
      });
    return JSON.parse(JSON.stringify(reports));
  } catch (error) {
    handleError(error);
  }
}
export async function adminDiscardReport(reportId: string) {
  try {
    await connectToDatabase();
    const report = await Report.findByIdAndUpdate(reportId, {
      status: "reviewed",
    });
    return JSON.parse(JSON.stringify(report));
  } catch (error) {
    handleError(error);
  }
}
