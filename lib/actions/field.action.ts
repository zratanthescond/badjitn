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
}

export async function saveFields(fields: FieldInput[]) {
  try {
    await connectToDatabase();

    // Ensure all fields have a userId
    if (!fields.every((field) => field.userId)) {
      throw new Error("Each field must have a userId.");
    }

    // Insert fields into database
    await FieldModel.insertMany(fields);

    // Revalidate cache for updated fields
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
    const fields = await FieldModel.find(conditions);

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
