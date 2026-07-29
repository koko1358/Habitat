import type { Metadata, Viewport } from "next";
import { Space_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/nav/app-shell";
import "./globals.css";

// General Sans isn't on Google Fonts, so it's loaded the same way the
// design mockup (taphabit:design.html) loads it — a Fontshare <link> below —
// rather than via next/font/google.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TapHabit",
  description: "A simple, personal habit tracker for quick daily use.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TapHabit",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  // The taphabit:design.html mockup is light-only — no dark variant exists
  // to be faithful to, so the theme is forced light (see ThemeProvider
  // below) rather than guessing dark colors that aren't in the source.
  themeColor: "#f7f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,700,800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" forcedTheme="light">
          <AppShell>{children}</AppShell>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
