import './globals.css';
import { OrbitalDock } from '@/components/nav/OrbitalDock';
import { Footer } from '@/components/site/Footer';
import { StampOverlay } from '@/components/ui/StampOverlay';
import { RouteScrollTop } from '@/components/ui/RouteScrollTop';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-graphite text-white">
        <RouteScrollTop />
        <OrbitalDock />
        <main className="pt-24 sm:pt-28">{children}</main>
        <Footer />
        <StampOverlay />
      </body>
    </html>
  );
}
