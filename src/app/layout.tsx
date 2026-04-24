import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ToastViewport } from "@/components/ui/Toast";
import { AuthHydrator } from "@/components/auth/AuthHydrator";

const amecaSans = Space_Grotesk({
  variable: "--font-ameca-sans",
  subsets: ["latin"],
  display: "swap",
});

const amecaMono = IBM_Plex_Mono({
  variable: "--font-ameca-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Plataforma AMECA",
  description: "Experiencia de administración y miembros para eventos AMECA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${amecaSans.variable} ${amecaMono.variable} antialiased`}
      >
        <AuthHydrator />
        {children}
        <ToastViewport />
      </body>
    </html>
  );
}
