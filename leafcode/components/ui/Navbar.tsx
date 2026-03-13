"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Leaf, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  {href: '/dashboard', label: 'Dashboard' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/about', label: 'About' },
]

export default function Navbar() {
const pathname = usePathname()
const [menuOpen, setMenuOpen] = useState(false)

return (
<header className="sticky top-0 z-50 border-b border-[#1e3a2a]  backdrop-blur-md">
    <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
    {/* Logo */}
    <Link href="/" className="flex items-center gap-2 group">
        <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-[#294232]/20 border border-[#28eb70]/30 group-hover:border-[#28eb70]/60 transition-colors">
        <Leaf className="h-4 w-4 text-[#28eb70]" />
        <div className="absolute inset-0 rounded-lg bg-[#28eb70]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="font-['Space_Mono',monospace] text-lg font-bold tracking-tight">
        <span className="text-[#28eb70]">leaf</span>
        <span className="text-slate-100">code</span>
        </span>
    </Link>

    {/* Desktop links */}
    <ul className="hidden md:flex items-center gap-1">
        {NAV_LINKS.map(({ href, label }) => (
        <li key={href}>
            <Link
            href={href}
            className={cn(
                "relative px-4 py-2 rounded-md text-sm font-medium font-['Space_Mono',monospace] transition-colors",
                pathname === href
                ? "text-[#28eb70] bg-[#28eb70]/10"
                : "text-slate-200 hover:text-slate-100 hover:bg-white/10"
            )}
            >
            {label}
            {pathname === href && (
                <span className="absolute inset-x-4 -bottom-[17px] h-[2px] bg-[#28eb70] rounded-full" />
            )}
            </Link>
        </li>
        ))}
    </ul>

    {/* CTA */}
    <div className="hidden md:flex items-center gap-3">
        <Link
        href="/challenges"
        className="px-4 py-2 rounded-lg bg-[#28eb70] text-[#0a1a10] text-sm font-bold font-['Space_Mono',monospace] hover:bg-[#16a34a] transition-colors"
        >
        Enter Challenge
        </Link>
    </div>

    {/* Mobile hamburger */}
    <button
        className="md:hidden text-slate-400 hover:text-slate-100 transition-colors"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
    >
        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
    </nav>

    {/* Mobile menu */}
    {menuOpen && (
    <div className="md:hidden border-t border-[#1e3a2a] bg-[#0a1a10] px-6 py-4">
        <ul className="flex flex-col gap-2">
        {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
            <Link
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                "block px-4 py-2 rounded-md text-sm font-['Space_Mono',monospace] transition-colors",
                pathname === href
                    ? "text-[#28eb70] bg-[#28eb70]/10"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                )}
            >
                {label}
            </Link>
            </li>
        ))}
        <li className="mt-2">
            <Link
            href="/challenges"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-2 rounded-lg bg-[#28eb70] text-slate-200 text-sm font-bold font-['Space_Mono',monospace] text-center hover:bg-[#16a34a] transition-colors"
            >
            Enter Challenge
            </Link>
        </li>
        </ul>
    </div>
    )}
</header>
)
}