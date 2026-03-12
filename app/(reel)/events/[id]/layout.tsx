import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";


export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ReactQueryProvider>
      {children}
    </ReactQueryProvider>
  );
}
