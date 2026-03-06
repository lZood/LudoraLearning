import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import ScrollToTop from "@/components/ScrollToTop";
import PageTransition from "@/components/PageTransition";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LudoraLearning",
  description: "Aprende inglés construyendo en Minecraft",
  icons: {
    icon: [
      {
        url: "/cuadradosincirculo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/cuadradosincirculo.png",
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
      <body className={`${inter.className} text-[#1a1a1a] antialiased bg-[#fbfbf0]`}>
        <ScrollToTop />
        <Header />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  );
}
