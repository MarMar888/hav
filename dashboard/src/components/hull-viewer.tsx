"use client";

import { useState } from "react";

// The viewer is a ~4 MB standalone page, so it only loads when asked for.
export function HullViewer() {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-emerald-950/40">
      {open ? (
        <iframe src="/viz/hull.html" title="Interactive 3D model of the Haav hull" className="h-full w-full" />
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-2 text-zinc-300 hover:text-emerald-400"
        >
          <span className="text-lg font-medium">Open the hull in 3D</span>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">The real CAD, not a render</span>
        </button>
      )}
    </div>
  );
}
