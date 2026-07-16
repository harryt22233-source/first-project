import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Invoices",
  description: "Invoicing for landscaping jobs",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full`}>
      <body className="h-full min-h-screen bg-zinc-50 font-sans text-zinc-900 antialiased">
        <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white">{children}</div>
      </body>
    </html>
  );
}
