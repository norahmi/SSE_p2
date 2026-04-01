import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import ParticleField from "@/components/ui/ParticleField"
import { Leaf } from "lucide-react"

export default async function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    })

    if (session) redirect("/")

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-[#060f0a] overflow-hidden">

        {/* Particle background */}
        <ParticleField />

        {/* Dot-grid texture */}
        <div
            className="pointer-events-none fixed inset-0 z-0"
            style={{
            backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(40,235,112,0.05) 1px, transparent 0)",
            backgroundSize: "24px 24px",
            }}
        />

        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 z-0">
            <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full"
            style={{
                background:
                "radial-gradient(circle, rgba(40,235,112,0.06) 0%, transparent 70%)",
            }}
            />
        </div>

        {/* Main card */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden
                            border border-[#1e3a2a] shadow-2xl">

            {/* ── LEFT: full-bleed image + logo overlay ─────────────────── */}
            <div className="relative hidden md:block overflow-hidden">

                {/* The image — swap src for any photo you like */}
                <img
                src="/assets/img/ui/pic1.jpg"
                alt="Deep forest reflected in a still lake"
                className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Dark gradient so the logo stays readable over any photo */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#060f0a]/70 via-transparent to-[#060f0a]/60" />

                {/* Green tint overlay — keeps it on-brand */}
                <div className="absolute inset-0 bg-[#28eb70]/5 mix-blend-screen" />

                {/* Corner accents */}
                <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#28eb70]/50 rounded-tl-2xl" />
                <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#28eb70]/50 rounded-br-2xl" />
                </div>

                {/* Logo — top-left over the image */}
                <div className="absolute top-8 left-8 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg border border-[#28eb70]/40 bg-[#060f0a]/60
                                backdrop-blur-sm flex items-center justify-center text-sm">
                    <Leaf className="h-4 w-4 text-[var(--lc-green)]" />
                </div>
                <span className="font-['Space_Mono',monospace] text-lg font-bold drop-shadow-lg">
                    <span className="text-[#28eb70]">leaf</span>
                    <span className="text-slate-100">code</span>
                </span>
                </div>

                {/* Tagline — bottom-left over the image */}
                <div className="absolute bottom-8 left-8 right-8">
                <p className="font-['Space_Mono',monospace] text-lg font-bold text-slate-100 leading-snug drop-shadow-lg"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}>
                    Be better, code{' '}
                    <span className="text-[#28eb70]"
                        style={{ textShadow: '0 0 30px rgba(40,235,112,0.5)' }}>
                    green
                    </span>{' '}
                </p>
                </div>
            </div>

            {/* ── RIGHT: auth form (children) ───────────────────────────── */}
            <div className="relative flex flex-col bg-[#060f0a] p-8 md:p-10">

                {/* Mobile logo (shown only on small screens) */}
                <div className="flex items-center gap-2 mb-8 md:hidden">
                <div className="h-7 w-7 rounded-lg border border-[#28eb70]/30 bg-[#28eb70]/8
                                flex items-center justify-center text-xs">
                    🌿
                </div>
                <span className="font-['Space_Mono',monospace] text-base font-bold">
                    <span className="text-[#28eb70]">leaf</span>
                    <span className="text-slate-100">code</span>
                </span>
                </div>

                {/* The sign-in / sign-up form rendered by children */}
                <div className="flex-1 flex flex-col justify-center">
                {children}
                </div>

                {/* Legal footer */}
                <p className="mt-8 text-center font-['Space_Mono',monospace] text-[10px]
                            text-slate-700 leading-relaxed">
                By continuing, you agree to our{" "}
                <Link
                    href="/legal/terms-of-service"
                    className="text-slate-500 hover:text-[#28eb70] transition-colors underline underline-offset-2"
                >
                    Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                    href="/legal/privacy-policy"
                    className="text-slate-500 hover:text-[#28eb70] transition-colors underline underline-offset-2"
                >
                    Privacy Policy
                </Link>
                .
                </p>
            </div>

            </div>
        </div>
        </div>
    )
}