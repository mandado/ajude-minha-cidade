import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/lib/providers";
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
  title: "Ajude Minha Cidade",
  description:
    "Ajude Minha Cidade é uma plataforma colaborativa e gratuita que exibe em tempo real pontos de apoio humanitário: abrigos, coleta e distribuição de doações, deslizamentos e soterramentos. Ajude sua comunidade em situações de emergência.",
  verification: {
    google: "4pp8NVI97QcmOCqVb11gJPmTKdzPuU1bwN4e8VPfUHI",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
