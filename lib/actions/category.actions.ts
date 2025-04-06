"use server";

import { CreateCategoryParams } from "@/types";
import { handleError } from "../utils";
import { connectToDatabase } from "../database";
import Category from "../database/models/category.model";
import Event from "../database/models/event.model";
export const createCategory = async ({
  categoryName,
}: CreateCategoryParams) => {
  try {
    await connectToDatabase();

    const newCategory = await Category.create({ name: categoryName });

    return JSON.parse(JSON.stringify(newCategory));
  } catch (error) {
    handleError(error);
  }
};

export const getAllCategories = async () => {
  try {
    await connectToDatabase();

    const categories = await Category.find();

    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
};

export async function getCategotiesWithEventsCount() {
  try {
    await connectToDatabase();
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "category",
          as: "events",
        },
      },
      { $addFields: { eventCount: { $size: "$events" } } },
    ]);
    return JSON.parse(JSON.stringify(categories));
  } catch (error) {
    handleError(error);
  }
}

export const deleteCategory = async (categoryId: string) => {
  try {
    await connectToDatabase();

    await Event.updateMany(
      { category: categoryId },
      { $set: { category: null } }
    );

    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    return JSON.parse(JSON.stringify(deletedCategory));
  } catch (error) {
    handleError(error);
  }
};
export async function updateCategory({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  try {
    await connectToDatabase();
    const category = await Category.findByIdAndUpdate(id, { name });
    return JSON.parse(JSON.stringify(category));
  } catch (error) {
    handleError(error);
  }
}
