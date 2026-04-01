export interface User {
  id: string
  name: string
  avatar: string
  rank: number
  challengesCompleted: number
  totScore: number
  topLanguage: string
  streak: number // days, if we want this then we just have to store the streak and to update it either +1 or reset to 0
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  rank: number
  displayRank?: number
  totScore: number
  challengesCompleted: number
  topLanguage: string
  delta: 'up' | 'down' | 'same' // also idk about this, we would have to track previous rank
}

export interface ActivityEntry {
  id: string
  challengeName: string        // the challenge title
  language: string             // language used in this submission
  submittedAt: string
  totScore: number
  energyConsumption: number
  status: 'passed' | 'failed' | 'pending'
}