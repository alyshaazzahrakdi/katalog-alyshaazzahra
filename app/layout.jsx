import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toko } from "@/lib/toko";
import RecoveryHashHandler from "@/app/auth/RecoveryHashHandler";
import { KeranjangProvider } from "@/components/Keranjang";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FavoritProvider } from "@/components/FavoritProvider";
import { TerakhirDilihatProvider } from "@/components/TerakhirDilihatProvider";
import { BandingkanProvider } from "@/components/BandingkanProvider";

export const metadata = {
  title: toko.nama,
  description: toko.tagline,
  manifest: "/manifest.webmanifest",
};

export const viewport = {
  themeColor: "#1f6b4f",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider>
          <FavoritProvider>
          <TerakhirDilihatProvider>
          <BandingkanProvider>
          <KeranjangProvider>
          <RecoveryHashHandler />
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
          <Footer />
          </KeranjangProvider>
          </BandingkanProvider>
          </TerakhirDilihatProvider>
          </FavoritProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
