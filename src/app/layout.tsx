import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LudoraLearning",
  description: "Aprende inglés construyendo en Minecraft",
  icons: {
    icon: [
      {
        url: "/favicon-green-new.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/favicon-green-new.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} text-[#1a1a1a] antialiased bg-black`}>
        <ScrollToTop />
        <Header />
        {children}
      </body>
    </html>
  );
}
