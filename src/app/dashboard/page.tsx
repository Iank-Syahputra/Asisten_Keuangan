"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Chat from "@/components/chat";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ChartPie,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useRouter } from "next/navigation";

export default function Dashboard() {
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
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/")}
              className="text-gray-400 hover:text-white hover:bg-white/5 text-sm px-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Kembali</span>
            </Button>

            <div className="w-px h-5 bg-white/10" />

            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-2 rounded-xl">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Asisten <span className="text-emerald-400">Keuangan</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserButton />
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col">
        {/* AI CHAT - Full Page Focus */}
        <div className="flex-1 bg-gray-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-white">Asisten AI Keuangan</span>
              </div>
            </div>
            <Button
              onClick={() => router.push("/dashboard/overview")}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm h-9 px-4 rounded-xl font-medium gap-2"
            >
              <ChartPie className="w-4 h-4" />
              <span className="hidden sm:inline">Lihat Dashboard</span>
              <span className="sm:hidden">Dashboard</span>
            </Button>
          </div>

          {/* Chat body - takes remaining space */}
          <div className="flex-1 p-4 min-h-[60vh]">
            <SignedIn>
              <Chat />
            </SignedIn>
            <SignedOut>
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                  <Wallet className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Masuk untuk mulai</p>
                <p className="text-xs text-gray-500 mb-5">Login terlebih dahulu untuk menggunakan asisten AI</p>
                <SignInButton>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm h-9 px-6 rounded-xl font-medium">
                    Masuk Sekarang
                  </Button>
                </SignInButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 w-full border-t border-white/5 bg-gray-950 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-emerald-400 to-teal-600 p-1.5 rounded-lg">
              <Wallet className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-bold">Asisten <span className="text-emerald-400">Keuangan</span></span>
          </div>
          <p className="text-[11px] text-gray-600">© 2026 Asisten Keuangan. Semua hak dilindungi.</p>
        </div>
      </footer>
    </div>
  );
} 