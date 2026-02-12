import type React from "react";

import { OrbitalDock } from "@/components/nav/OrbitalDock";
import { RouteScrollTop } from "@/components/site/RouteScrollTop";
import { Footer } from "@/components/site/Footer";

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#06070A] text-[#EDE7DA]">
      <RouteScrollTop />
      <OrbitalDock />

      <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-16">
        {children}
      </main>

      <Footer />
    </div>
  );
}
