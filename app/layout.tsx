import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { SidebarNav } from "@/components/SidebarNav";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nikke Character List",
  description: "Character list page powered by prydwen character JSON data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NuqsAdapter>
          <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="flex min-h-screen">
              <SidebarNav />
              <div className="min-h-screen flex-1 overflow-x-hidden pb-16 lg:pb-0 lg:pl-60">
                {children}
              </div>
            </div>
            <MobileNav />
          </div>
        </NuqsAdapter>
      </body>
    </html>
  );
}
