"use client";

import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Shield,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Ambient BG */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-600/10 rounded-full blur-3xl" />
      </div>

      {/* NAV */}
      <nav className="relative z-50 w-full border-b border-white/5 backdrop-blur-sm bg-gray-950/80 sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl shadow-lg shadow-emerald-900/40">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm tracking-tight">
              Asisten <span className="text-emerald-400">Keuangan</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <SignedOut>
              <Link href="/sign-in">
                <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 text-sm">
                  Masuk
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => router.push("/dashboard")} className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm">
                  Dashboard
                </Button>
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6">

        {/* HERO */}
        <section className="py-4 sm:py-10 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <Sparkles className="w-3 h-3" />
            Asisten Keuangan Berbasis AI
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-white mb-5">
            Kelola{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
              Keuangan
            </span>
            <br />
            Lebih Bijak
          </h1>

          {/* Desc */}
          <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-9 max-w-md">
            Catat pengeluaran, analisis keuangan, dan raih tujuan finansial Anda
            dengan bantuan AI yang cerdas dan mudah digunakan.
          </p>

          {/* CTA */}
          <SignedOut>
            <Link href="/sign-in">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 text-sm rounded-xl font-semibold shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02]">
                Mulai Sekarang
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 px-8 text-sm rounded-xl font-semibold shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02]"
            >
              Buka Dashboard
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </SignedIn>
        </section>

        {/* FEATURES */}
        <section className="py-6 border-t border-white/10">
          <div className="text-center mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400 mb-2">Fitur Utama</p>
            <h2 className="text-xl sm:text-2xl font-bold text-white">Semua yang Anda butuhkan</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: <PiggyBank className="w-5 h-5" />,
                title: "Catat Pengeluaran",
                desc: "Pantau setiap transaksi harian dengan kategori otomatis yang cerdas.",
                colorClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Analisis Keuangan",
                desc: "Laporan visual dan insight mendalam untuk memahami pola pengeluaran Anda.",
                colorClass: "bg-teal-500/10 border-teal-500/20 text-teal-400",
              },
              {
                icon: <Shield className="w-5 h-5" />,
                title: "Aman & Privat",
                desc: "Data Anda terlindungi dengan enkripsi tingkat tinggi dan privasi penuh.",
                colorClass: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 transition-all duration-200 hover:-translate-y-0.5 flex flex-col items-center text-center"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${f.colorClass}`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-gray-950 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-lg">
                <Wallet className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-bold">
                Asisten <span className="text-emerald-400">Keuangan</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
              {["Privasi", "Syarat", "Bantuan"].map((link) => (
                <a key={link} href="#" className="hover:text-emerald-400 transition-colors">
                  {link}
                </a>
              ))}
            </div>

            <p className="text-[11px] text-gray-600">© 2026 Asisten Keuangan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}