import type { Metadata } from "next";
import { Orbitron, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DamageXLogo } from "@/components/ui/damagex-logo";
import { Providers } from "@/components/providers";

// Orbitron - Stylish futuristic font perfect for tech/AI products
const orbitron = Orbitron({ 
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

// JetBrains Mono for code/mono text
const jetbrainsMono = JetBrains_Mono({ 
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DamageX - AI Vehicle Damage Analysis",
  description: "Enterprise-grade AI-powered vehicle damage detection and assessment system. Get instant, accurate damage reports.",
  keywords: ["vehicle damage", "AI analysis", "car damage detection", "insurance claims", "damage assessment"],
  authors: [{ name: "DamageX" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "DamageX - AI Vehicle Damage Analysis",
    description: "Enterprise-grade AI-powered vehicle damage detection and assessment system.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${orbitron.variable} ${jetbrainsMono.variable} font-orbitron antialiased`}>
        <Providers>
          <div className="relative flex flex-col min-h-screen bg-background">
          {/* Noise texture overlay */}
          <div 
            className="fixed inset-0 pointer-events-none z-[100] opacity-[0.03]" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }} 
          />
          
          {/* Glass Navbar */}
          <header className="sticky top-0 z-50 w-full">
            <div className="absolute inset-0 glass" />
            <div className="container relative flex h-16 items-center justify-between">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="transition-all duration-300 group-hover:scale-110 text-foreground">
                  <DamageXLogo className="w-10 h-10" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  DamageX
                </span>
              </Link>
              
              {/* Theme Toggle */}
              <ThemeToggle />
            </div>
          </header>
          
          <main className="flex-1 relative z-0">
            {children}
          </main>

          {/* Glass Footer */}
          <footer className="relative mt-auto">
            <div className="absolute inset-0 glass" />
            <div className="container relative py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="text-foreground">
                  <DamageXLogo className="w-7 h-7" />
                </div>
                <span className="font-semibold text-foreground">DamageX</span>
                <span className="text-foreground/40">© 2025</span>
              </div>
              <span className="text-xs text-foreground/50">AI-Powered Vehicle Damage Analysis</span>
            </div>
          </footer>
        </div>
        </Providers>
      </body>
    </html>
  );
}