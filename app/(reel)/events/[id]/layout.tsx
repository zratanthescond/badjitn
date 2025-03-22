import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import { SessionProvider } from "next-auth/react";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" max-w-screen h-screen">
      <main className="">
        <ReactQueryProvider>
          <SessionProvider>{children}</SessionProvider>
        </ReactQueryProvider>
      </main>
    </div>
  );
}
