import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import UserCard from '@/components/ui/UserCard'
import Leaderboard from '@/components/ui/Leaderboard'
import ActivityFeed from '@/components/ui/ActivityFeed'
import ParticleField from '@/components/ui/ParticleField'
import type { LeaderboardEntry, User, ActivityEntry } from '@/types'
import GlowButton from '@/components/ui/GlowButton'


interface SessionType {
  session: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        expiresAt: Date;
        token: string;
        ipAddress?: string | null | undefined;
        userAgent?: string | null | undefined;
    };
    user: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
    };
}


async function getUser(session: SessionType): Promise<User> {
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id:       true,
      name:     true,
      image:    true,
      totScore: true,
      // Count their passed submissions for challengesCompleted
      challenges: {
        where:  { status: 'PASSED' },
        select: { language: true, co2Consumed: true },
      },
    },
  })

  if (!dbUser) redirect('/auth/login')

  // Compute rank: count how many users have a higher totScore
  const usersAhead = await prisma.user.count({
    where: { totScore: { gt: dbUser.totScore } },
  })
  const rank = usersAhead + 1

  const totalCO2Consumed = dbUser.challenges.reduce((sum, c) => sum + c.co2Consumed, 0)

  const langCount: Record<string, number> = {}
  for (const c of dbUser.challenges) {
    langCount[c.language] = (langCount[c.language] ?? 0) + 1
  }

  const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'

  return {
    id:                   dbUser.id,
    name:                 dbUser.name,
    avatar:               session.user.image
                            ?? `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${dbUser.id}`,
    rank,
    totScore:                dbUser.totScore,
    challengesCompleted:  dbUser.challenges.length,
    totalCO2Consumed,
    topLanguage,
    streak:               0, // TODO?
  }
}


async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    orderBy: { totScore: 'desc' },
    take: 20,
    select: {
      id:       true,
      name:     true,
      image:    true,
      totScore: true,
      challenges: {
        where:  { status: 'PASSED' },
        select: { language: true, co2Consumed: true },
      },
    },
  })

  const leaderboard: LeaderboardEntry[] = users.map((u, index) => {
    // Top language for this user
    const langCount: Record<string, number> = {}
    for (const c of u.challenges) {
      langCount[c.language] = (langCount[c.language] ?? 0) + 1
    }
    const topLanguage = Object.entries(langCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'N/A'
    const totalCO2Consumed = u.challenges.reduce((sum, c) => sum + c.co2Consumed, 0)
    const delta: 'up' | 'down' | 'same' = 'same' // TODO: track previous rank to compute this

    return {
      id:                  u.id,
      name:                u.name,
      avatar:              u.image ?? `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${u.id}`,
      rank:                index + 1,
      totScore:               u.totScore,
      challengesCompleted: u.challenges.length,
      totalCO2Consumed,
      topLanguage,
      delta
    }
  })

  return leaderboard
}


async function getActivity(userId: string): Promise<ActivityEntry[]> {
  const submissions = await prisma.userChallenge.findMany({
    where:   { userId },
    orderBy: { submittedAt: 'desc' },
    take:    4,
    include: {
      challenge: { select: { title: true } },
    },
  })

  return submissions.map((s) => ({
    id:              s.id,
    challengeName:   s.challenge.title,
    language:        s.language,
    submittedAt:     timeAgo(s.submittedAt),
    totScore:           s.score,
    status:          s.status.toLowerCase() as 'passed' | 'failed' | 'pending',
    co2Consumed:     s.co2Consumed || 0,
    energyReduction: 0, // TODO: compute this based on a baseline per language
  }))
}

export default async function HomePage() {
  // Run all three queries in parallel — no need to wait for them sequentially
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/auth/login')

  const userPromise = getUser(session)
  const leaderboardPromise = userPromise.then((u) =>
    Promise.all([getLeaderboard(), getActivity(u.id)]).then(([lb, act]) => ({ lb, act }))
  )

  const user = await userPromise
  const { lb: leaderboard, act: activity } = await leaderboardPromise

  return (
    <>
    <ParticleField />
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
        <div className='justify-center items-center text-center mt-10 pb-10 mb-12 bg-[#04c946]/15 rounded-lg mx-10 lg:mx-50'>
          <h1 className="font-['Space_Mono',monospace] text-5xl text-[var(--lc-green)]/50 px-20 pt-10 pb-3">
            Welcome Back, {user.name.split(' ')[0]}!
          </h1>
          <h2 className="font-['Space_Mono',monospace] font-bold text-xl px-8 mb-10">
            Ready for a new challenge?
          </h2>
          <GlowButton href="/challenges" label="Start Coding" />
        </div>

        <div className="flex flex-col lg:flex-row flex-1">

          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-6 px-8 py-10 lg:w-[55%] lg:px-14 lg:py-12">
            <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[var(--lc-green)]/50">
              Your Stats
            </p>
            <UserCard user={user} />
            <ActivityFeed entries={activity} />
          </section>

          {/* ── VERTICAL DIVIDER ─────────────────────────────────────── */}
          <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-[#1e3a2a] to-transparent my-10" />

          {/* ── RIGHT COLUMN ─────────────────────────────────────────── */}
          <section className="flex flex-col px-6 py-10 lg:w-[45%] lg:px-10 lg:py-12 lg:overflow-y-auto no-scrollbar">
            <Leaderboard entries={leaderboard} currentUserId={user.id} />
          </section>

        </div>
      </main>
    </>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60)  return 'Just now'
  if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 86400 * 2) return 'Yesterday'
  return `${Math.floor(seconds / 86400)}d ago`
}
