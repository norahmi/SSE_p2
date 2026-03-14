export interface User {
  id: string
  name: string
  avatar: string
  rank: number
  challengesCompleted: number
  totalCO2Consumed: number // in grams of CO2 equivalent
  totScore: number
  topLanguage: string
  streak: number // days
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  rank: number
  displayRank?: number
  totScore: number
  challengesCompleted: number
  totalCO2Consumed: number        // renamed
  topLanguage: string
  delta: 'up' | 'down' | 'same'
}

export interface ActivityEntry {
  id: string
  challengeName: string        // the challenge title
  language: string             // language used in this submission
  submittedAt: string          // human-readable e.g. "2h ago"
  totScore: number
  co2Consumed: number             // grams consumed in this specific submission
  energyReduction: number      // percentage e.g. 74 means −74%
  status: 'passed' | 'failed' | 'pending'
}