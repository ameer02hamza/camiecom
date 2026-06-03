import type { Metadata } from "next";

import ReduxProvider from "@/providers/ReduxProvider";
import Navbar from "@/shared/components/Navbar";
import Footer from "@/shared/components/Footer";
import CartDrawer from "@/shared/components/CartDrawer";
import ToastContainer from "@/shared/components/ToastContainer";
import MobileMenu from "@/shared/components/MobileMenu";
import SearchOverlay from "@/shared/components/SearchOverlay";

// @ts-ignore: CSS import without type declarations
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Camiecom — Dress with Intention",
    template: "%s | Camiecom",
  },
  description:
    "A premium fashion brand. Considered pieces for a considered wardrobe.",
  keywords: ["fashion", "premium", "clothing", "sustainable", "minimalist"],
  openGraph: { siteName: "Camiecom", type: "website", locale: "en_US" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-bg-light dark:bg-bg-dark text-ink-1 dark:text-ink-dk1 font-sans antialiased min-h-screen flex flex-col">
        <ReduxProvider>
          <Navbar />
          <MobileMenu />
          <SearchOverlay />
          <CartDrawer />
          <ToastContainer />
          <main className="flex-1">{children}</main>
          <Footer />
        </ReduxProvider>
      </body>
    </html>
  );
}
