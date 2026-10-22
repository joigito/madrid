import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { leerTema } from "@/lib/tema/config";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Madrid Gestión de Comercio Internacional",
  description:
    "Expedientes de importación para el operador de comercio internacional: etapas, organismos y vencimientos en un solo lugar.",
  appleWebApp: {
    capable: true,
    title: "Madrid",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export async function generateViewport(): Promise<Viewport> {
  const tema = await leerTema();

  return {
    colorScheme: tema === "oscuro" ? "dark" : "light",
    themeColor: tema === "oscuro" ? "#0f172a" : "#f8fafc",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tema = await leerTema();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} h-full antialiased${tema === "oscuro" ? " dark" : ""}`}
    >
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
