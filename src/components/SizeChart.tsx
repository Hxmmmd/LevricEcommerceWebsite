'use client';

import { useState } from 'react';
import { ChevronDown, Ruler } from 'lucide-react';

const sizes = [
  ['13-inch', '30.4 × 21.2 cm', '1.2–1.4 kg'],
  ['14-inch', '31.3 × 22.1 cm', '1.3–1.6 kg'],
  ['15-inch', '34.0 × 23.7 cm', '1.6–2.1 kg'],
  ['16-inch', '35.6 × 24.8 cm', '1.8–2.4 kg'],
];

export default function SizeChart() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4 shadow-sm sm:p-5">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <span className="flex items-center gap-3">
          <span className="rounded-full bg-blue-500/10 p-2 text-blue-500"><Ruler className="size-4" /></span>
          <span>
            <span className="block text-sm font-bold text-foreground">Size chart</span>
            <span className="mt-1 block text-xs text-muted-foreground">Compare laptop dimensions and weight</span>
          </span>
        </span>
        <ChevronDown className={`size-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ${isOpen ? 'mt-4 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[420px] text-left text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr><th className="px-3 py-2 font-semibold">Size</th><th className="px-3 py-2 font-semibold">Dimensions</th><th className="px-3 py-2 font-semibold">Weight</th></tr>
              </thead>
              <tbody>
                {sizes.map(([size, dimensions, weight]) => <tr key={size} className="border-t border-border"><td className="px-3 py-2.5 font-semibold text-foreground">{size}</td><td className="px-3 py-2.5 text-muted-foreground">{dimensions}</td><td className="px-3 py-2.5 text-muted-foreground">{weight}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
