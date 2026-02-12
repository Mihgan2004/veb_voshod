import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Main from "@/components/site/Main";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "VOSKHOD",
  description: "VOSKHOD — premium tactical merch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen bg-graphite font-sans text-gray-200 antialiased">
        <Main>{children}</Main>
      </body>
    </html>
  );
}
