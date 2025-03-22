"use server";
import { revalidatePath } from "next/cache";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { connectToDatabase } from "../database";
import UserSponsor from "../database/models/userSponser.model";
import { tr } from "date-fns/locale";

export async function createSponsor(formData: FormData) {
  try {
    await connectToDatabase();

    const name = formData.get("name") as string;
    const tier = formData.get("tier") as
      | "gold"
      | "platinum"
      | "silver"
      | "bronze";
    const website = formData.get("website") as string;
    const creator = formData.get("creator") as string;
    const file = formData.get("logo") as File;

    if (!name || !tier || !file || !website || !creator) {
      throw new Error("All fields are required.");
    }

    // Save the file locally
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, buffer);

    // Create the sponsor entry
    const sponsor = new UserSponsor({
      name,
      tier,
      logo: `/uploads/${fileName}`, // Save relative path to DB
      website,
      creator,
    });

    await sponsor.save();

    revalidatePath("/profile");

    return { success: true, message: "Sponsor created successfully!" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
export async function getSponsors(
  eventId: string | null,
  userId: string | null
) {
  await connectToDatabase();
  try {
    const conditions: any = {};
    if (userId) {
    }
    if (eventId) {
      conditions.eventId = eventId;
    }

    const spronsors = await UserSponsor.find(conditions);
    return { success: true, data: JSON.parse(JSON.stringify(spronsors)) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function deleteSponsor({
  userId,
  sponsorId,
}: {
  userId: string;
  sponsorId: string;
}) {
  await connectToDatabase();
  try {
    const sponsor = await UserSponsor.findById(sponsorId);
    if (sponsor.creator.toHexString() !== userId)
      throw new Error("Unauthorized");
    await UserSponsor.findByIdAndDelete(sponsorId);
    if (!sponsor) throw new Error("Sponsor not found");
    revalidatePath("/profile");
    return { success: true, data: JSON.parse(JSON.stringify(sponsor)) };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}
export async function getSponsorByIds({
  sponsorIds,
}: {
  sponsorIds: string[];
}) {
  try {
    await connectToDatabase();
    const sponsors = await UserSponsor.find({ _id: { $in: sponsorIds } });
    return { success: true, data: JSON.parse(JSON.stringify(sponsors)) };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
