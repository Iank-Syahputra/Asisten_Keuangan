"use client";

import { SignUp } from "@clerk/nextjs";
import { Wallet, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#050810] relative overflow-hidden">
      {/* Ambient Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#00BA88]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-3xl" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors z-50"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Kembali</span>
      </button>

      {/* Logo Section */}
      <div className="mb-8 flex flex-col items-center z-10">
        <div className="relative">
          <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full" />
          <div className="relative bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-2xl shadow-emerald-900/40">
            <Wallet className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">
          Asisten <span className="text-[#00BA88]">Keuangan</span>
        </h1>
        <p className="text-gray-400 text-sm mt-1">Buat akun baru</p>
      </div>

      {/* Clerk Sign Up Component */}
      <div className="z-10 w-full max-w-md px-4">
        <SignUp
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: '#00BA88',
              colorBackground: '#111827',
              colorInputBackground: '#1F2937',
              colorInputText: '#FFFFFF',
              colorText: '#FFFFFF',
              colorTextSecondary: '#9CA3AF',
              colorBorder: '#374151',
            },
            elements: {
              // Card & Container
              rootBox: 'bg-transparent',
              card: 'bg-[#111827] border border-white/10 shadow-2xl shadow-emerald-900/20 !important',
              
              // Header
              header: 'border-b border-white/10 !important',
              headerTitle: 'text-white text-xl font-bold !important',
              headerSubtitle: 'text-gray-400 text-sm !important',
              
              // Main Content
              main: 'bg-[#111827] !important',
              
              // Social Buttons
              socialButtons: 'gap-3 !important',
              socialButtonsBlockButton: 'bg-[#1F2937] border border-white/10 hover:bg-[#374151] transition-all !important',
              socialButtonsBlockButtonText: 'text-white text-sm font-medium !important',
              socialButtonsBlockButtonArrow: 'text-gray-400 !important',
              
              // Divider
              dividerLine: 'bg-white/10 !important',
              dividerText: 'text-gray-500 text-xs !important',
              
              // Form Fields
              formField: 'mb-4 !important',
              formFieldLabel: 'text-gray-300 text-sm font-medium mb-1.5 !important',
              formFieldInput: 'bg-[#1F2937] border border-white/10 text-white placeholder:text-gray-500 rounded-lg focus:border-[#00BA88] focus:ring-1 focus:ring-[#00BA88] transition-all !important',
              formFieldAction: 'text-[#00BA88] hover:text-emerald-400 text-sm !important',
              
              // Buttons
              formButtonPrimary: 'bg-[#00BA88] hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-lg transition-all hover:scale-[1.02] shadow-lg shadow-emerald-900/30 !important',
              formButtonReset: 'text-gray-400 hover:text-white text-sm font-medium !important',
              
              // Footer & Links
              footer: 'border-t border-white/10 !important',
              footerAction: 'text-gray-400 !important',
              footerActionLink: 'text-[#00BA88] hover:text-emerald-400 font-semibold !important',
              
              // Error & Success Messages
              formFieldErrorText: 'text-red-400 text-xs mt-1 !important',
              formFieldWarningText: 'text-amber-400 text-xs mt-1 !important',
              formFieldSuccessText: 'text-emerald-400 text-xs mt-1 !important',
              
              // Identity Preview
              identityPreview: 'bg-[#1F2937] border border-white/10 rounded-lg !important',
              identityPreviewText: 'text-gray-300 !important',
              identityPreviewEditButton: 'text-[#00BA88] hover:text-emerald-400 !important',
              
              // Phone Input
              phoneInputButton: 'bg-[#1F2937] border border-white/10 text-white !important',
              phoneInputCountryText: 'text-gray-300 !important',
              phoneInputCountryFlag: 'rounded !important',

              // Verification Code
              formFieldCode: 'bg-[#1F2937] border border-white/10 text-white rounded-lg !important',
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/dashboard"
        />
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center z-10">
        <p className="text-xs text-gray-500">
          © 2026 Asisten Keuangan. Aman & Terenkripsi.
        </p>
      </footer>
    </div>
  );
}
