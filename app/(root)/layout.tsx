
import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import RedirectComponent from "@/components/RedirectComponent";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";
import ChatTrigger from "@/components/shared/ChatTrigger";
import ScrollToTop from "@/components/shared/ScrollToTop";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-h-screen flex-col">
      <ReactQueryProvider>
          <Header />
          <main className="flex-1 mt-20">{children}</main>
          <Footer />
          <ChatTrigger />
          <ScrollToTop />
      </ReactQueryProvider>
    </div>
  );
}
