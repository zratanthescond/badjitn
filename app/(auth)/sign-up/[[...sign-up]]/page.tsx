import SignUpForm from "@/components/auth/SignUpForm";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: "  wrapper p-8 flex item-center justify-center",
          card: "glass p-4",
          socialButtonsIconButton__x:
            "btn bg-gradient-to-tl gap-2 w-full  from-sky-500 to-indigo-500  text-white",
          socialButtonsIconButton__google:
            "btn bg-gradient-to-tr w-full gap-2 from-red-500 to-pink-500   text-white",
          socialButtonsIconButton__facebook:
            "btn bg-gradient-to-tr gap-2 w-full  from-pink-500 to-indigo-500  text-white",
          formButtonPrimary: "glass",
          headerTitle: "h3-bold text-center sm:text-left text-white",
          headerSubtitle: "h6-bold text-center sm:text-left text-white",
          formFieldLabel: "p-medium-16 text-white",
        },
      }}
    />
  );
}
