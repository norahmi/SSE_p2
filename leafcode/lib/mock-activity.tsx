import type { ActivityEntry } from '@/components/ui/ActivityFeed'

/**
 * MOCK activity data.
 * Replace with a real DB query using the logged-in user's ID:
 *   await prisma.submission.findMany({
 *     where: { userId: user.id },
 *     orderBy: { createdAt: 'desc' },
 *     take: 4,
 *   })
 */
export const MOCK_ACTIVITY: ActivityEntry[] = [
  {
    id: 'sub_001',
    challengeName: 'Optimize Matrix Multiply',
    language: 'Python',
    submittedAt: '2 hours ago',
    score: 1240,
    co2Saved: 3200,
    energyReduction: 74,
    status: 'passed',
  },
  {
    id: 'sub_002',
    challengeName: 'Refactor API Handler',
    language: 'TypeScript',
    submittedAt: 'Yesterday',
    score: 890,
    co2Saved: 1800,
    energyReduction: 61,
    status: 'passed',
  },
  {
    id: 'sub_003',
    challengeName: 'Sort Algorithm Showdown',
    language: 'Python',
    submittedAt: '3 days ago',
    score: 0,
    co2Saved: 0,
    energyReduction: 12,
    status: 'failed',
  },
  {
    id: 'sub_004',
    challengeName: 'Database Query Tuning',
    language: 'Go',
    submittedAt: 'Just now',
    score: 0,
    co2Saved: 0,
    energyReduction: 0,
    status: 'pending',
  },
]