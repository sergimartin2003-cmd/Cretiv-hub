import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import AuthModal from "@/components/AuthModal";

export const metadata: Metadata = {
  title: "CretivHub — Recursos para Creadores de Contenido",
  description: "La plataforma definitiva de recursos para creadores de contenido. Templates, LUTs, música, efectos, herramientas de IA y mucho más.",
  openGraph: {
    title: "CretivHub — Recursos para Creadores de Contenido",
    description: "Miles de recursos premium para llevar tu contenido al siguiente nivel.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "CretivHub — Recursos para Creadores",
    description: "Miles de recursos premium para llevar tu contenido al siguiente nivel.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d1117",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <AuthProvider>
            {children}
            <AuthModal />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
