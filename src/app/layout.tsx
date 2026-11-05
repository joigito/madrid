import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";

import { leerTema, leerTamano } from "@/lib/tema/config";
import { ESCALA_TAMANO } from "@/lib/tema/constantes";

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
    themeColor: tema === "oscuro" ? "#132334" : "#faf6ee",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tema = await leerTema();
  const tamano = await leerTamano();

  return (
    <html
      lang="es"
      style={{ fontSize: ESCALA_TAMANO[tamano] }}
      className={`${geistSans.variable} h-full antialiased${tema === "oscuro" ? " dark" : ""}`}
    >
      <body className="flex min-h-full flex-col bg-brand-50 text-brand-900 dark:bg-brand-950 dark:text-brand-100">
        {children}
      </body>
    </html>
  );
}
