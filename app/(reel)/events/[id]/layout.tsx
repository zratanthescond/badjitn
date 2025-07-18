import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import { SessionProvider } from "next-auth/react";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </ReactQueryProvider>
  );
}
