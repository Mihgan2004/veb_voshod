import type { Metadata } from "next";
import "./globals.css";
import Main from "@/components/site/Main";

export const metadata: Metadata = {
  title: "VOSKHOD",
  description: "VOSKHOD — premium tactical merch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#070A0E] text-white antialiased">
        <Main>{children}</Main>
      </body>
    </html>
  );
}
