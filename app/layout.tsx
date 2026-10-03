import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import MaintenanceGuard from "@/components/common/MaintenanceGuard";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-devanagari",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.indianparamedicalboardofindia.com"),
  title: {
    default: "Indian Paramedical Board of India",
    template: "%s | Indian Paramedical Board of India",
  },
  description:
    "Indian Paramedical Board of India Official Portal. Empowering professionals, accrediting institutions, and ensuring the highest standards of paramedical care.",
  keywords: [
    "Indian Paramedical Board of India",
    "Indian Paramedical Board",
    "IPBI"
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-512.png", sizes: "512x512" },
    ],
    shortcut: "/favicon-32.png",
    apple: "/favicon-512.png",
  },
  openGraph: {
    title: "Indian Paramedical Board of India",
    description:
      "Indian Paramedical Board of India Official Portal. Empowering professionals, accrediting institutions, and ensuring the highest standards of paramedical care.",
    url: "https://www.indianparamedicalboardofindia.com",
    siteName: "Indian Paramedical Board of India",
    images: [
      {
        url: "/favicon-512.png",
        width: 512,
        height: 512,
        alt: "Indian Paramedical Board of India Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indian Paramedical Board of India",
    description:
      "Indian Paramedical Board of India Official Portal. Empowering professionals, accrediting institutions, and ensuring the highest standards of paramedical care.",
    images: ["/favicon-512.png"],
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://www.indianparamedicalboardofindia.com/#website",
      "url": "https://www.indianparamedicalboardofindia.com",
      "name": "Indian Paramedical Board of India",
      "alternateName": ["IPBI", "Indian Paramedical Board"],
      "description":
        "Indian Paramedical Board of India Official Portal. Empowering professionals, accrediting institutions, and ensuring the highest standards of paramedical care.",
      "publisher": {
        "@id": "https://www.indianparamedicalboardofindia.com/#organization",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://www.indianparamedicalboardofindia.com/#organization",
      "name": "Indian Paramedical Board of India",
      "alternateName": ["IPBI", "Indian Paramedical Board"],
      "url": "https://www.indianparamedicalboardofindia.com",
      "logo": "https://www.indianparamedicalboardofindia.com/favicon-512.png",
      "sameAs": [],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoDevanagari.variable} font-sans antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <MaintenanceGuard>
          {children}
        </MaintenanceGuard>
      </body>
    </html>
  );
}
