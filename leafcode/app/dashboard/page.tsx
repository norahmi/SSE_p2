import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { MOCK_LEADERBOARD } from '@/lib/mock-leaderboard'
import { MOCK_ACTIVITY } from '@/lib/mock-activity'
import UserCard from '@/components/ui/UserCard'
import Leaderboard from '@/components/ui/Leaderboard'
import ActivityFeed from '@/components/ui/ActivityFeed'
import ParticleField from '@/components/ui/ParticleField'
import type { User } from '@/types'

async function getUser(): Promise<User> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/login')
  const { user } = session
  return {
    id: user.id,
    name: user.name,
    avatar: user.image ?? `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.id}`,
    rank: 7,
    challengesCompleted: 14,
    totalCO2Saved: 48320,
    score: 9240,
    topLanguage: 'Python',
    streak: 5,
  }
}

export default async function HomePage() {
  const user = await getUser()
  const leaderboard = MOCK_LEADERBOARD
  const activity = MOCK_ACTIVITY

  return (
    <>
      <ParticleField />
      <main className="relative z-10 flex flex-col min-h-[calc(100vh-64px)]">
        <div className='justify-center items-center text-center mt-10 pb-10 mb-12 bg-[#04c946]/15 rounded-lg mx-10 lg:mx-50'>
          <h1 className="font-['Space_Mono',monospace] text-5xl text-[#28eb70]/50 px-20 pt-10 pb-3">
            Welcome Back, {user.name.split(' ')[0]}!
          </h1>
          <h2 className="font-['Space_Mono',monospace] font-bold text-xl px-8">
            Ready for a new challenge?
          </h2>
        </div>
        <div className="flex flex-col lg:flex-row flex-1">

          {/* ── LEFT COLUMN ──────────────────────────────────────────── */}
          <section className="flex flex-col gap-6 px-8 py-10 lg:w-[55%] lg:px-14 lg:py-12">

            <p className="font-['Space_Mono',monospace] text-xs uppercase tracking-widest text-[#28eb70]/50">
              Your Stats
            </p>

            <UserCard user={user} />

            <ActivityFeed entries={activity} />

          </section>

          {/* ── VERTICAL DIVIDER ───────────────────────────────────────
          <div className="hidden lg:block w-px border-l border-[#1e3a2a]" /> */}

          {/* ── RIGHT COLUMN — leaderboard ───────────────────────────── */}
          <section className="flex flex-col px-6 py-10 lg:w-[45%] lg:px-10 lg:py-12 lg:overflow-y-auto no-scrollbar">
            <Leaderboard entries={leaderboard} currentUserId={user.id} />
          </section>

        </div>
      </main>
    </>
  )
}