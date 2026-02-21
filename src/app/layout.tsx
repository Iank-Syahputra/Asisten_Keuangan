import type { Metadata } from "next";
import { Geist, Geist_Mono, Parkinsans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  fallback: ["system-ui", "sans-serif"],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Asisten Keuangan - Kelola Keuangan Pribadi dengan AI",
  description:
    "Asisten Keuangan pribadi berbasis AI untuk membantu Anda mengelola pengeluaran, analisis keuangan, dan mencapai kebebasan finansial.",
};

const clerkAppearance = {
  variables: {
    colorPrimary: '#10b981',
    colorBackground: '#0a0a0a',
    colorInputBackground: '#171717',
    colorInputText: '#ffffff',
    colorText: '#ffffff',
    colorTextSecondary: '#a3a3a3',
    colorBorder: '#262626',
  },
  elements: {
    formButtonPrimary: 'bg-emerald-600 hover:bg-emerald-500 !important',
    card: 'bg-gray-950 border border-white/10 !important',
    headerTitle: 'text-white !important',
    headerSubtitle: 'text-gray-400 !important',
    socialButtonsBlockButton: 'bg-gray-900 border border-white/10 text-white hover:bg-gray-800 !important',
    socialButtonsBlockButtonText: 'text-white !important',
    formFieldInput: 'bg-gray-900 border border-white/10 text-white placeholder:text-gray-500 !important',
    footerActionLink: 'text-emerald-400 hover:text-emerald-300 !important',
    identityPreviewEditButton: 'text-emerald-400 !important',
    formFieldLabel: 'text-gray-300 !important',
    dividerLine: 'bg-white/10 !important',
    dividerText: 'text-gray-500 !important',
    formFieldErrorText: 'text-red-400 !important',
    formFieldWarningText: 'text-amber-400 !important',
    phoneInputButton: 'bg-gray-900 border border-white/10 text-white !important',
    phoneInputCountryText: 'text-white !important',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ ...clerkAppearance }}>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.className} ${geistMono.className} ${parkinsans.className} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
