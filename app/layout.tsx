import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://boasideias.online",
  ),
  title: {
    default: "Boas Ideias Online | Marketplace de Produtos Digitais",
    template: "%s | Boas Ideias Online",
  },
  description:
    "Transforme conhecimento em renda. O marketplace onde criadores vendem cursos, guias e recursos digitais para empreendedores.",
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    title: "Boas Ideias Online",
    description:
      "O marketplace onde criadores vendem cursos, guias e recursos digitais.",
    siteName: "Boas Ideias Online",
  },
  twitter: {
    card: "summary_large_image",
    title: "Boas Ideias Online",
    description:
      "O marketplace onde criadores vendem cursos, guias e recursos digitais.",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        {/* CONTENT */}
        <LayoutWrapper>
          <main>{children}</main>
        </LayoutWrapper>

        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
