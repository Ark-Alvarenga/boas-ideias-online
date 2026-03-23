import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { JsonLd } from "@/components/seo/json-ld";

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
  applicationName: "Boas Ideias Online",
  referrer: "origin-when-cross-origin",
  keywords: ["produtos digitais", "infoprodutos", "marketplace", "vender curso", "renda extra", "empreendedorismo"],
  authors: [{ name: "Boas Ideias Online" }],
  creator: "Boas Ideias Online",
  publisher: "Boas Ideias Online",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://boasideias.online",
    title: "Boas Ideias Online",
    description:
      "O marketplace onde criadores vendem cursos, guias e recursos digitais.",
    siteName: "Boas Ideias Online",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Boas Ideias Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Boas Ideias Online",
    description:
      "O marketplace onde criadores vendem cursos, guias e recursos digitais.",
    images: ["/og-image.png"],
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
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Boas Ideias Online",
    "url": "https://boasideias.online",
    "logo": "https://boasideias.online/images/logo.png",
    "sameAs": [
      "https://twitter.com/boasideiasonline",
      "https://instagram.com/boasideiasonline"
    ],
    "description": "Transforme conhecimento em renda. O marketplace onde criadores vendem cursos, guias e recursos digitais."
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Boas Ideias Online",
    "url": "https://boasideias.online",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://boasideias.online/marketplace?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <html lang="pt-BR">
      <body
        className={`${inter.variable} ${playfair.variable} font-sans antialiased`}
      >
        <JsonLd data={jsonLd} />
        <JsonLd data={websiteJsonLd} />
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
