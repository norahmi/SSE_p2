import ParticleField from '@/components/ui/ParticleField'
import GlowButton from '@/components/ui/GlowButton'
import FloatingTerminal from '@/components/ui/FloatingTerminal'

export default async function LandingPage() {
    return (
        <>
            <ParticleField />
            <FloatingTerminal />

            <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-64px)]">

                <section className="flex flex-col items-center justify-center text-center px-6 gap-8">
                    <h1 className="font-['Space_Mono',monospace] font-bold leading-[1.05] text-slate-100
                                    text-6xl sm:text-7xl md:text-8xl xl:text-9xl">
                    Code{' '}
                    <span
                        className="text-[var(--lc-green)]"
                        style={{ textShadow: '0 0 60px #28eb7066, 0 0 120px #28eb7022' }}
                    >
                        green,
                    </span>
                    <br />
                    <span className="text-slate-200">get lean.</span>
                    </h1>

                    <p className="font-['Space_Mono',monospace] text-sm text-slate-500 leading-relaxed max-w-md">
                    Compete to minimize the energy footprint of real codebases.
                    Every optimization counts — measured, ranked, remembered.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-5">
                    <GlowButton href="/challenges" label="Start Coding" />
                    
                    </div>
                </section>

            </main>
        </>
    )
}