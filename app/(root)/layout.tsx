import AuthContext from "@/components/contexts/AuthContext";
import ReactQueryProvider from "@/components/contexts/ReactQueryProvider";
import Footer from "@/components/shared/Footer";
import Header from "@/components/shared/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full h-screen flex-col">
      <ReactQueryProvider>
        <AuthContext>
          <Header />
          <main className="flex-1 mt-20">{children}</main>
          <Footer />
        </AuthContext>
      </ReactQueryProvider>
    </div>
  );
}
