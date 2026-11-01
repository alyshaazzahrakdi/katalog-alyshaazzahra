export default function AuthLayout({ eyebrow, title, description, children, footer }) {
  return (
    <div className="mx-auto w-full max-w-5xl py-8 sm:py-12">
      <div className="grid overflow-hidden rounded-[2rem] border border-garis bg-latar shadow-[0_24px_80px_rgba(27,36,32,0.12)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative isolate overflow-hidden bg-[#123f30] px-7 py-9 text-white sm:px-10 sm:py-12 lg:min-h-[560px] lg:px-12 lg:py-14">
          <div className="absolute -right-20 -top-20 -z-10 h-64 w-64 rounded-full border-[28px] border-white/10" />
          <div className="absolute -bottom-28 -left-20 -z-10 h-72 w-72 rounded-full bg-[#1f6b4f] opacity-70" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7eadf] text-lg font-extrabold text-[#123f30]">
                A
              </span>
              <span className="text-sm font-bold tracking-wide text-white/90">Katalog admin</span>
            </div>
            <div className="mt-14 max-w-xs lg:mt-auto">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#b8d7c6]">
                Aman dan sederhana
              </p>
              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Kelola toko dengan lebih tenang.
              </h1>
              <p className="mt-5 text-sm leading-7 text-white/70">
                Satu tempat untuk menjaga katalog produk tetap rapi, aktual, dan siap dibagikan kepada pelanggan.
              </p>
            </div>
            <div className="mt-10 hidden gap-3 text-xs text-white/70 sm:flex lg:mt-12">
              <span className="rounded-full border border-white/15 px-3 py-2">Terproteksi</span>
              <span className="rounded-full border border-white/15 px-3 py-2">Mudah digunakan</span>
            </div>
          </div>
        </aside>
        <section className="flex flex-col justify-center px-7 py-9 sm:px-12 sm:py-12 lg:px-16">
          <div className="max-w-md">
            <p className="text-sm font-semibold text-utama">{eyebrow}</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-teks sm:text-4xl">{title}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-teks-lembut">{description}</p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 border-t border-garis pt-5">{footer}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
