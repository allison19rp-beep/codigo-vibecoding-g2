import type { Metadata } from "next";
import { Geist, Geist_Mono, Lexend, Source_Sans_3 } from "next/font/google";
import { QueryProvider } from "@/providers/query-provider";
import { AuthHydrator } from "@/providers/auth-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const sourceSans3 = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Logistica Web — Logística inteligente para empresas",
  description:
    "Mueve más, gestiona menos. Tracking en tiempo real, dashboard de operaciones, rutas optimizadas con IA e integración con ERP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${lexend.variable} ${sourceSans3.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthHydrator>
            <TooltipProvider>{children}</TooltipProvider>
          </AuthHydrator>
        </QueryProvider>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
