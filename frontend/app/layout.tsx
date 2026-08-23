import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ellevadz — Elle s'élève",
  description:
    "La plateforme algérienne qui accompagne les femmes entrepreneures : financement, business plan, mentorat et outils financiers.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;0,6..96,700;1,6..96,500&family=Manrope:wght@400;500;600;700;800&family=Mrs+Saint+Delafield&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}

