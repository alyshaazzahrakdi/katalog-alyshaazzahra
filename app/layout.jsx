import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ambilPengaturanToko } from "@/lib/toko-server";
import { KeranjangProvider } from "@/components/Keranjang";
import { ThemeProvider } from "@/components/ThemeProvider";
import { FavoritProvider } from "@/components/FavoritProvider";
import { TerakhirDilihatProvider } from "@/components/TerakhirDilihatProvider";
import { BandingkanProvider } from "@/components/BandingkanProvider";

export async function generateMetadata() {
  const toko = await ambilPengaturanToko();
  return { title: toko.nama, description: toko.tagline, manifest: "/manifest.webmanifest" };
}

export const viewport = {
  themeColor: "#1f6b4f",
};

export default async function RootLayout({ children }) {
  const toko = await ambilPengaturanToko();
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=optional"
        />
      </head>
      <body className="flex min-h-screen flex-col font-sans antialiased">
        <ThemeProvider>
          <FavoritProvider>
          <TerakhirDilihatProvider>
          <BandingkanProvider>
          <KeranjangProvider toko={toko}>
          <Header toko={toko} />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4">{children}</main>
          <Footer toko={toko} />
          </KeranjangProvider>
          </BandingkanProvider>
          </TerakhirDilihatProvider>
          </FavoritProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
