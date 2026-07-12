import type { Metadata } from "next";
import { Hanken_Grotesk, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

// Tipografía real de la app: Hanken Grotesk (sans display + UI) y
// Cormorant Garamond itálica, reservada para la palabra enfatizada.
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "900"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stelar-app.com"),
  title: "Stelar — Haz visible lo invisible",
  description:
    "Stelar convierte tus registros diarios en evidencia visual para revelar los patrones que están construyendo tus resultados.",
  openGraph: {
    title: "Stelar — Haz visible lo invisible",
    description:
      "No puedes cambiar lo que no puedes ver. Stelar convierte tus registros en evidencia.",
    url: "https://stelar-app.com",
    siteName: "Stelar",
    locale: "es_MX",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Stelar — Haz visible lo invisible",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stelar — Haz visible lo invisible",
    description:
      "No puedes cambiar lo que no puedes ver. Stelar convierte tus registros en evidencia.",
    images: ["/og.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${hanken.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
