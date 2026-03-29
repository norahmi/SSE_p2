export interface User {
  id: string
  name: string
  avatar: string
  rank: number
  challengesCompleted: number
  totalCO2Consumed: number // idk if we will have this but it would be cool to show how much CO2 the user has consumed in total
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
  totalCO2Consumed: number // same as above
  topLanguage: string
  delta: 'up' | 'down' | 'same' // also idk about this, we would have to track previous rank
}

export interface ActivityEntry {
  id: string
  challengeName: string        // the challenge title
  language: string             // language used in this submission
  submittedAt: string
  totScore: number
  co2Consumed: number             // same
  energyReduction: number      // also idk about this, it would be interesting to show but "reduction" means that we need a baseline per language.
  status: 'passed' | 'failed' | 'pending'
}