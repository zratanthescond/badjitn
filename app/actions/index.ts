"use server";

import { revalidatePath } from "next/cache";
import { signIn, signOut } from "../auth";
import { createUser } from "@/lib/actions/user.actions";
import bcrypt from "bcryptjs";
import { CreateUserParams } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { Email } from "@clerk/nextjs/server";
import { sendVerificationEmail } from "@/lib/mail";
export async function doSocialLogin(formData: FormData) {
  const action = formData.get("action");
  console.log("action", action);
  if (action !== null) {
    await signIn(action?.toString(), { redirectTo: "/" });
  } else {
    console.error("Action is null");
  }
}

export async function doLogout() {
  await signOut({ redirectTo: "/" });
}

export async function doCredentialLogin(formData: FormData) {
  console.log("formData", formData);

  try {
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    revalidatePath("/");
    console.log("response", response);
    console.log(response);
    return response;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
export async function doRegister(formData: CreateUserParams) {
  const userData = {
    phoneNumber: formData.phoneNumber,
    password: await bcrypt.hash(formData.password, 10),
    firstName: formData.firstName,
    lastName: formData.lastName,
    photo: formData.photo,
    email: formData.email,
    username: formData.username,
    createdAt: new Date(),
    emailTocken: uuidv4(),
    isActive: false,
    new: true,
  };
  console.log("userData", userData);
  const response = await createUser(userData);
  console.log("response", response);
  if (response._id) {
    sendVerificationEmail(response.email, response.emailTocken);
  }
  return response;
}
