import Link from "next/link";
import { Logo } from "@/components/logo";

const nav = "hidden text-sm text-zinc-600 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 sm:inline";

export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-zinc-200/80 bg-white/85 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/85">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-5 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Logo />
            Project Hav
          </Link>
          <nav className="ml-4 flex items-center gap-6">
            <Link href="/#race" className={nav}>The race</Link>
            <Link href="/#boat" className={nav}>The boat</Link>
            <Link href="/#status" className={nav}>Build status</Link>
          </nav>
          <Link
            href="/sponsors"
            className="ml-auto rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-emerald-400"
          >
            Sponsor the build
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-start gap-x-12 gap-y-6 px-5 py-10 text-sm text-zinc-500">
          <div className="max-w-md">
            <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-zinc-100">
              <Logo className="h-5 w-5" />
              Project Hav
            </p>
            <p className="mt-3">
              Our entry in the PEP27 Workforce Development Competition, Autonomy Division. It hasn&apos;t touched
              water yet. Everything on this site is the design as it stands today.
            </p>
          </div>
          <nav className="flex flex-col gap-2 sm:ml-auto">
            <Link href="/sponsors" className="hover:text-emerald-600">Sponsor the build</Link>
            <Link href="/#status" className="hover:text-emerald-600">Build status</Link>
            <a href="/viz/hull.html" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600">3D hull ↗</a>
            <Link href="/bom" className="hover:text-emerald-600">Team workshop</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
