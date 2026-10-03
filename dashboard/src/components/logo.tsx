// The Hav mark: a deep-V hull seen from the bow, with the waterline cutting across it.
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <path d="M3 9h26l-5 15a3 3 0 0 1-2.8 2H10.8A3 3 0 0 1 8 24L3 9Z" fill="currentColor" opacity=".18" />
      <path d="M3 9h26l-5 15a3 3 0 0 1-2.8 2H10.8A3 3 0 0 1 8 24L3 9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M1 17c3-2 5-2 8 0s5 2 8 0 5-2 8 0 4 1 6 0" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
