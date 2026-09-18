import type { Metadata, Viewport } from "next";
import { Geist_Mono, Mulish } from "next/font/google";
import { WalletProvider } from "@/components/WalletProvider";
import "./globals.css";

const mulish = Mulish({
  variable: "--font-mulish",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Payrun",
  description: "Pay people by name. Not by address.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${mulish.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-[100dvh] bg-bone font-sans text-ink">
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
