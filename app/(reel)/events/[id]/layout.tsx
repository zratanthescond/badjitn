import { SessionProvider } from "next-auth/react";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className=" max-w-screen h-screen">
      <main className="">
        <SessionProvider>{children}</SessionProvider>
      </main>
    </div>
  );
}
