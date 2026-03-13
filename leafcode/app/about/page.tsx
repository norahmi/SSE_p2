export default function AboutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#22c55e]/60 mb-2">
        About
      </p>
      <h1 className="font-['Space_Mono',monospace] text-3xl font-bold text-slate-100">
        Why LeafCode?
      </h1>
      <p className="mt-4 text-slate-500 text-sm max-w-prose leading-relaxed">
        Software is responsible for a growing share of global energy consumption.
        LeafCode gives developers a playground to practice and incentivise green
        refactoring — measuring real energy proxies, not just lines of code.
      </p>
    </main>
  )
}