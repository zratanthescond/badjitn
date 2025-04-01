"use server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "../database";
import Certificate from "../database/models/certification.model";
import { handleError } from "../utils";
import { revalidate } from "@/app/api/contrebuters/route";
import { revalidatePath } from "next/cache";
type CreateCertificationParams = {
  userId: string;
  eventId: string;
};
export async function createCertification(
  certification: CreateCertificationParams
) {
  try {
    await connectToDatabase();
    const certificate = await Certificate.findOne({
      userId: certification.userId,
      eventId: certification.eventId,
    });
    if (certificate) return JSON.parse(JSON.stringify(certification));
    const newCertification = await Certificate.create(certification);
    return JSON.parse(JSON.stringify(newCertification));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
export async function getCertificationByUseridAndEventId({
  userId,
  eventId,
}: {
  userId: string;
  eventId: string;
}) {
  try {
    await connectToDatabase();
    const certificate = await Certificate.findOne({
      userId: userId,
      eventId: eventId,
    });
    return JSON.parse(JSON.stringify(certificate));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
export async function getCertificationByEventId({
  eventId,
  searchString,
}: {
  eventId: string;
  searchString: string;
}) {
  try {
    await connectToDatabase();

    if (!eventId) throw new Error("Event ID is required");
    const eventObjectId = new ObjectId(eventId);

    const orders = await Certificate.aggregate([
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
          status: 1,
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
export async function approveCertification(certificationId: string) {
  try {
    await connectToDatabase();
    const certificate = await Certificate.findOneAndUpdate(
      { _id: certificationId },
      { status: "approved" }
    );
    return JSON.parse(JSON.stringify(certificate));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
export async function rejectCertification(certificationId: string) {
  try {
    await connectToDatabase();
    const certificate = await Certificate.findOneAndUpdate(
      { _id: certificationId },
      { status: "rejected" }
    );
    revalidatePath("/orders?eventId=" + certificate.eventId);
    return JSON.parse(JSON.stringify(certificate));
  } catch (error) {
    console.log(error);
    handleError(error);
  }
}
