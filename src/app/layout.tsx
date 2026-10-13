import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BrandingProvider } from "@/context/BrandingContext";

export const metadata: Metadata = {
  title: "Recharge Pro — Mobile Recharge, DTH & Bill Payments",
  description:
    "India's premier digital payment platform for Mobile Recharge, DTH Recharge, and BBPS Utility Bill Payments.",
  manifest: "/manifest.json",
  icons: {
    icon: "/images/rechargepro-logo.png",
    apple: "/images/rechargepro-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <BrandingProvider>
          {children}
        </BrandingProvider>
      </body>
    </html>
  );
}

