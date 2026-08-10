import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ExperienceProviders } from "@/components/motion/ExperienceProviders";
import { SiteHeader } from "@/components/layout/SiteHeader";
import "./globals.css";

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL("https://" + process.env.VERCEL_PROJECT_PRODUCTION_URL)
    : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: "Abdullah — Creative Developer",
  description:
    "Immersive e-commerce, AI-powered and business websites designed and developed from frontend to backend.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <ExperienceProviders>
          <SiteHeader />
          {children}
        </ExperienceProviders>
      </body>
    </html>
  );
}