import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Project Hav — BOM",
  description: "Bill of materials for Project Hav, a small autonomous RIB.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white font-sans text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-4 px-5 py-4">
            <Link href="/" className="font-semibold">Project Hav</Link>
            <Link href="/" className="text-sm text-zinc-500 hover:text-emerald-600">BOM</Link>
            <Link href="/optimization" className="text-sm text-zinc-500 hover:text-emerald-600">Optimization</Link>
            <a
              href="/viz/hull.html"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              3D hull ↗
            </a>
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
