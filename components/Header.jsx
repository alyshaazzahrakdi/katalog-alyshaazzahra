import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header({ toko }) {
  return (
    <header className="border-b border-garis bg-latar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-extrabold tracking-tight text-utama">{toko.nama}</Link>
        <nav className="flex items-center gap-2 text-sm font-semibold">
          <Link href="/favorit" className="hidden hover:text-utama sm:inline">Favorit</Link>
          <Link href="/bandingkan" className="hidden hover:text-utama sm:inline">Bandingkan</Link>
          <Link href="/tentang" className="hidden hover:text-utama sm:inline">Tentang</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
