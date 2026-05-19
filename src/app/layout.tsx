import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
export const metadata: Metadata = {
  title: "Password Generator — Strong Random Passwords Instantly",
  description: "Generate cryptographically strong random passwords. Customize length, characters, and quantity. Free, no ads, works offline."
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="h-full"><body className="h-full bg-white text-zinc-900">{children}<Analytics /></body></html>;
}
