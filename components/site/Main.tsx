import type React from "react";

import { Preloader } from "@/components/site/Preloader";
import { OrbitalDock } from "@/components/nav/OrbitalDock";
import { RouteScrollTop } from "@/components/site/RouteScrollTop";
import { Footer } from "@/components/site/Footer";

export default function Main({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen vx-page-ambient font-sans text-gray-200 selection:bg-gold selection:text-black">
      <Preloader />
      <div className="relative z-10">
        <RouteScrollTop />
        <OrbitalDock />

        <main>{children}</main>

        <Footer />
      </div>
    </div>
  );
}
