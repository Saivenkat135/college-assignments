import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SHA-1 Message Digest Demo",
  description: "Sender/Receiver integrity check using SHA-1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
