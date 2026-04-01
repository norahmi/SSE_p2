"use client"

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Leaf, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { authClient } from '@/lib/auth-client'

const NAV_LINKS = [
  { href: '/dashboard',  label: 'Dashboard' , isPrivate: true },
  { href: '/challenges', label: 'Challenges', isPrivate: false },
  { href: '/about',      label: 'About'     , isPrivate: false },
]

type Session = {
  user: {
    name: string
    email: string
    image: string
  }
}

export default function Navbar({ session }: { session: Session | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/')
          router.refresh()
        }
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md"
      style={{ borderBottom: '1px solid var(--lc-border)' }}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{
              background: 'color-mix(in srgb, var(--lc-green-dim) 20%, transparent)',
              border: '1px solid color-mix(in srgb, var(--lc-green) 30%, transparent)',
            }}
          >
            <Leaf className="h-4 w-4 text-[var(--lc-green)]" />
            <div className="absolute inset-0 rounded-lg bg-[var(--lc-green)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <span className="font-['Space_Mono',monospace] text-lg font-bold tracking-tight">
            <span className="text-[var(--lc-green)]">leaf</span>
            <span style={{ color: 'var(--lc-text)' }}>code</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, isPrivate }) => (
            (!isPrivate || session) &&
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "relative px-4 py-2 rounded-md text-sm font-medium font-['Space_Mono',monospace] transition-colors",
                  pathname === href
                    ? "text-[var(--lc-green)] bg-[var(--lc-green)]/10"
                    : "text-slate-200 hover:text-slate-100 hover:bg-white/10"
                )}
              >
                {label}
                {pathname === href && (
                  <span className="absolute inset-x-4 -bottom-[17px] h-[2px] rounded-full bg-[var(--lc-green)]" />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA + Logout*/}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#1e3a2a]">
                <img
                  src={session.user.image}
                  alt={session.user.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
                <span className="text-sm font-['Space_Mono',monospace] text-slate-400">
                  {session.user.name}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold font-['Space_Mono',monospace] text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg text-sm font-bold font-['Space_Mono',monospace] transition-colors"
              style={{ background: 'var(--lc-green)', color: 'var(--lc-bg-card)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--lc-green-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--lc-green)')}
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden px-6 py-4"
          style={{
            borderTop: '1px solid var(--lc-border)',
            background: 'var(--lc-bg-card)',
          }}
        >
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label, isPrivate }) => (
              (!isPrivate || session) &&
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={cn(
                    "block px-4 py-2 rounded-md text-sm font-['Space_Mono',monospace] transition-colors",
                    pathname === href
                      ? "text-[var(--lc-green)] bg-[var(--lc-green)]/10"
                      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
            <li className="mt-2">
              {session ? (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1e3a2a]">
                    <img
                      src={session.user.image}
                      alt={session.user.name}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    <span className="text-sm font-['Space_Mono',monospace] text-slate-400">
                      {session.user.name}
                    </span>
                  </div>

                  <button
                    onClick={() => { setMenuOpen(false); handleSignOut() }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 rounded-md text-sm font-['Space_Mono',monospace] text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors mt-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-sm font-bold font-['Space_Mono',monospace] text-center transition-colors"
                  style={{ background: 'var(--lc-green)', color: 'var(--lc-bg-card)' }}
                >
                  Sign In
                </Link>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}