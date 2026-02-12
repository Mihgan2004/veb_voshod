import type React from "react";

import { OrbitalDock } from "@/components/nav/OrbitalDock";
import { RouteScrollTop } from "@/components/site/RouteScrollTop";
import { Footer } from "@/components/site/Footer";

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-graphite font-sans text-gray-200 selection:bg-gold selection:text-black">
      <RouteScrollTop />
      <OrbitalDock />

      <main className="relative z-10">{children}</main>

      <Footer />
    </div>
  );
}
