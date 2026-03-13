import { NextResponse } from 'next/server'
import type { User } from '@/types'

/**
 * GET /api/user
 *
 * Returns the currently authenticated user's profile and stats.
 * Replace the mock data below with a real DB query (e.g. Prisma, Drizzle)
 * once your backend is wired up. Use NextAuth or Clerk to get the session
 * and look up the real user ID.
 *
 * Example with Prisma + NextAuth:
 *   import { getServerSession } from 'next-auth'
 *   const session = await getServerSession(authOptions)
 *   const user = await prisma.user.findUnique({ where: { email: session.user.email } })
 */
export async function GET(): Promise<NextResponse<User>> {
  // ─── MOCK DATA — swap this block for a real DB query ──────────────────────
const mockUser: User = {
    id: 'usr_demo_001',
    name: 'Alex Chen',
    avatar: 'https://api.dicebear.com/8.x/bottts-neutral/svg?seed=leafcode-alex',
    rank: 7,
    challengesCompleted: 14,
    totalCO2Saved: 48320, // grams — ~48 kg CO2
    score: 9240,
    topLanguage: 'Python',
    streak: 5,
}
  // ──────────────────────────────────────────────────────────────────────────

return NextResponse.json(mockUser)
}