import SignUpForm from "@/components/auth/SignUpForm";
import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignUp
      appearance={{
        elements: {
          rootBox: " p-8 flex item-center justify-center",
          card: "glass p-4",
          socialButtonsIconButton__x:
            "btn bg-gradient-to-tl gap-2 w-full  from-sky-500/50 to-indigo-500 rounded-full text-white hover:bg-gradient-to-tr hover:from-sky-500 hover:to-indigo-500",
          socialButtonsIconButton__google:
            "btn bg-gradient-to-tr w-full gap-2 from-red-500/50 to-pink-500 rounded-full  text-white hover:bg-gradient-to-tl hover:from-red-500 hover:to-pink-500",
          socialButtonsIconButton__facebook:
            "btn bg-gradient-to-tr gap-2 w-full  from-pink-500/50 to-indigo-500 rounded-full text-white hover:bg-gradient-to-tl hover:from-pink-500 hover:to-indigo-500",
          formButtonPrimary:
            "glass rounded-full bg-primary text-primary-foreground hover:bg-primary/90  font-semibold text-white",
          headerTitle: "h3-bold text-center sm:text-left",
          headerSubtitle: "h6-bold text-center sm:text-left ",
          formFieldLabel: "p-medium-16 ",
          formFieldInput:
            "p-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500",
        },
      }}
    />
  );
}
