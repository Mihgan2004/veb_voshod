import type { Metadata } from "next";
import { Inter, Onest } from "next/font/google";
import "./globals.css";
import Main from "@/components/site/Main";
import { LenisProvider } from "@/components/providers/LenisProvider";

const onest = Onest({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-onest",
});

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "РАССВЕТ",
  description: "РАССВЕТ — тактикул мерч",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${onest.variable} ${inter.variable}`}>
      <body className="min-h-screen bg-graphite font-sans text-gray-200 antialiased">
        <LenisProvider>
          <Main>{children}</Main>
        </LenisProvider>
      </body>
    </html>
  );
}
