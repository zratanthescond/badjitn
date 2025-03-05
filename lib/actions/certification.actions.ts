"use server";
import { connectToDatabase } from "../database";
import Certificate from "../database/models/certification.model";
import { handleError } from "../utils";
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
