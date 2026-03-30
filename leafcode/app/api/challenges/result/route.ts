import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'

interface ResultBody {
  submissionId: number
  score: number
}

export async function POST(
  req: NextRequest,
) {
  // Validate request signature from sandbox
  // Validate result body validity
  // Validate submission existence and status
  // Update submission record with final score and status
  // Dispatch notifications to user and update leaderboard if necessary
  return NextResponse.json({ message: 'Result received' })
}