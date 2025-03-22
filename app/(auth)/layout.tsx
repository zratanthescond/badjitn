import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import { ClerkProvider } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";

const AuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <ReactQueryProvider>
      <div className="flex-center min-h-screen w-full  bg-dotted-pattern bg-cover bg-fixed bg-center">
        {children}
      </div>
    </ReactQueryProvider>
  );
};

export default AuthLayout;
