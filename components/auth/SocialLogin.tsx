import React from "react";
import { doSocialLogin } from "@/app/actions";
import { FaGoogle } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FaFacebook, FaUser, FaPhone } from "react-icons/fa";
import { Button } from "../ui/button";
import { Form } from "../ui/form";

export default function SocialLogin(): JSX.Element {
  return (
    <Form>
      <form action={doSocialLogin}>
        <div className="card-actions flex  flex-col justify-around sm:flex-row items-center gap-4 ">
          <Button
            type="submit"
            name="action"
            className="btn bg-gradient-to-tr w-full gap-2 sm:w-1/6 from-red-500 to-pink-500   text-white"
            value="google"
          >
            <FaGoogle />
            Google
          </Button>
          <Button
            type="submit"
            name="action"
            className="btn bg-gradient-to-tr gap-2 w-full sm:w-1/6 from-pink-500 to-indigo-500  text-white"
            value={"facebook"}
          >
            <FaFacebook />
            FaceBook
          </Button>
          <Button
            type="submit"
            name="action"
            value={"twitter"}
            className="btn bg-gradient-to-tl gap-2 w-full sm:w-1/6 from-sky-500 to-indigo-500  text-white"
          >
            <FaXTwitter />
            X.com
          </Button>
        </div>
      </form>
    </Form>
  );
}
