import * as z from "zod";
const locationSchema = z.object({
  name: z.string().min(1, "Location name is required").trim(),
  lon: z.number().min(-180).max(180, "Longitude must be between -180 and 180"),
  lat: z.number().min(-90).max(90, "Latitude must be between -90 and 90"),
});
const discountSchema = z.object({
  field: z.string(),
  value: z.string(),
  discount: z
    .string()
    .refine((val) => !isNaN(Number(val)), {
      message: "Must be a valid number",
    })
    .transform((val) => Number(val)),
});
export const eventFormSchema = z
  .object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    location: z.union([locationSchema, z.null()]),
    imageUrl: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    categoryId: z.string(),
    price: z.string(),
    isFree: z.boolean(),
    isOnline: z.boolean().optional(),
    url: z.string().url(),
    sponsors: z.array(z.string()).optional(),
    requiredInfo: z.array(z.string()).optional(),
    country: z.string().optional(),
    discount: z.union([discountSchema, z.null()]).optional(),
    places: z.number().min(1, "At least one place is required").optional(),
  })
  .refine((data) => data.isOnline || data.location !== null, {
    path: ["location"],
    message: "Location is required when the event is not online.",
  });

export const signUpFormSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email")
      .min(10, "Email must be at least 10 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    username: z.string().min(5, "Username must be at least 8 characters"),
    phoneNumber: z
      .string()
      .min(8, "Phone number must be at least 8 characters"),
  })
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmPassword"],
      });
    }
  });
