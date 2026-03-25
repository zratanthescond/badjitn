"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../database";
import FieldModel from "../database/models/field.model";

interface FieldInput {
  userId: string;
  type: "text" | "number" | "select" | "radio";
  label: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
  order: number;
}

export async function saveFields(userId: string, fields: FieldInput[]) {
  try {
    await connectToDatabase();

    if (!userId) {
      throw new Error("userId is required.");
    }

    // Delete existing fields for this user to replace them with the new list
    await FieldModel.deleteMany({ userId });

    // Insert new fields
    if (fields.length > 0) {
      // Ensure all fields have the correct userId
      const fieldsWithUser = fields.map(f => ({ ...f, userId }));
      await FieldModel.insertMany(fieldsWithUser);
    }

    // Revalidate cache
    revalidatePath("/profile");

    return { success: true, message: "Fields saved successfully" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function fetchFields(userId: string) {
  try {
    await connectToDatabase();
    const conditions: any = {};
    if (userId !== null && userId !== "") {
      conditions.userId = userId;
    }
    // Sort by order ascending
    const fields = await FieldModel.find(conditions).sort({ order: 1 });

    return { success: true, data: JSON.parse(JSON.stringify(fields)) };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function getFieldById(fieldId: string) {
  try {
    await connectToDatabase();
    const field = await FieldModel.findById(fieldId);
    return { success: true, data: JSON.parse(JSON.stringify(field)) };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
export async function getEventFields(fields: string[]) {
  try {
    await connectToDatabase();
    if (fields.length === 0) {
      return { success: true, data: [] };
    }
    const eventFields = await FieldModel.find({ _id: { $in: fields } });
    return { success: true, data: JSON.parse(JSON.stringify(eventFields)) };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
