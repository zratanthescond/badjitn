import LoginForm from "@/components/auth/LoginForm";
import SignUpForm from "@/components/auth/SignUpForm";
import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return <LoginForm />;
}
