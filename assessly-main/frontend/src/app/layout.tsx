import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MoodleHeader from "@/components/layout/MoodleHeader";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Assessly | Academic Evaluation Platform",
  description: "Secure programming assignment evaluation integrated with Moodle style.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-[60px] bg-[var(--background)] font-sans">
        <MoodleHeader />
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
