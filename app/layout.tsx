import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ProfileProvider } from "@/context/ProfileContext";
import { ToastProvider } from "@/components/shared/ToastProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bid — Federal contracts, finally accessible",
  description:
    "Plain-English access to $180B in federal contracts set aside for small businesses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-bg text-ink antialiased">
        <ProfileProvider>
          <ToastProvider>{children}</ToastProvider>
        </ProfileProvider>
      </body>
    </html>
  );
}
