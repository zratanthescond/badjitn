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
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, { message: "Must be a valid number" }),
  discountType: z.enum(["percentage", "fixed"]).optional().default("percentage"),
  discountTarget: z.enum(["all", "inscription", "plan"]).optional().default("all"),
  discountPlanIds: z.array(z.string()).optional().default([]),
  requireProof: z.boolean().optional().default(false),
  proofDescription: z.string().optional(),
});
// export const eventFormSchema = z
//   .object({
//     title: z.string().min(3, "Title must be at least 3 characters"),
//     description: z.string().min(3, "Description must be at least 3 characters"),
//     location: z.union([locationSchema, z.null()]).optional(), //for goole maps integration fails
//     imageUrl: z.string(),
//     startDateTime: z.date(),
//     endDateTime: z.date(),
//     categoryId: z.string(),
//     price: z.string(),
//     isFree: z.boolean(),
//     isOnline: z.boolean().optional(),
//     url: z.string().url(),
//     sponsors: z.array(z.string()).optional(),
//     requiredInfo: z.array(z.string()).optional(),
//     country: z.string().optional(),
//     discount: z.union([discountSchema, z.null()]).optional(),
//     places: z.number().min(1, "At least one place is required").optional(),
//   })
//   .refine((data) => data.isOnline || data.location !== null, {
//     path: ["location"],
//     message: "Location is required when the event is not online.",
//   });
export const eventFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(3, "Description must be at least 3 characters"),
    // FIX: Use .nullable() and .optional()
    location: locationSchema.nullable().optional().default(null),
    imageUrl: z.string(),
    startDateTime: z.date(),
    endDateTime: z.date(),
    categoryId: z.string(),
    price: z.string(),
    isFree: z.boolean(),
    isOnline: z.boolean().default(false),
    url: z.string().url().or(z.literal("")).nullable().optional(),
    sponsors: z.array(z.string()).optional().default([]),
    requiredInfo: z.array(z.string()).optional(),
    country: z.string().optional(),
    discount: discountSchema.nullable().optional(),
    places: z.coerce
      .number()
      .min(1, "At least one place is required")
      .or(z.literal(0))
      .optional(),
    scanPoints: z.array(z.string()).optional().default([]),
    showWorkSubmissionPopup: z.boolean().optional().default(false),
    allowGuestRegistration: z.boolean().optional().default(true),
    disabledBaseFields: z.array(z.string()).optional().default([]),
    city: z.string().optional(),
    village: z.string().optional(),
    jobTitleLabel: z.string().optional(),
    selectedRepublic: z.string().optional(),
    customRegistrationFields: z.array(z.object({
      label: z.string(),
      isRequired: z.boolean().default(false)
    })).optional().default([]),
    showProfileButton: z.boolean().optional().default(true),
    showReturnButton: z.boolean().optional().default(true),
    organisationId: z.string().min(1, "Organisation is required"),
  })
  .refine(
    (data) => {
      // If it's NOT online, we MUST have a location object with a name
      if (!data.isOnline) {
        return !!data.location && !!data.location.name;
      }
      return true;
    },
    {
      path: ["location"],
      message: "Location is required when the event is not online.",
    },
  );
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
