import type { Metadata, Viewport } from "next";
import { Navigation } from "@/components/layout/Navigation";
import { PWARegister } from "@/components/PWARegister";
import "./globals.css";

export const metadata: Metadata = {
  title: "FocusFrame",
  description: "集中するほど、名画が見えてくる。ドット絵リビール × ポモドーロタイマー PWA",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FocusFrame",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0F0F13",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="bg-[#0F0F13] text-gray-100 antialiased">
        {children}
        <Navigation />
        <PWARegister />
      </body>
    </html>
  );
}
