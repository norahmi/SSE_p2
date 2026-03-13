export interface User {
  id: string
  name: string
  avatar: string
  rank: number
  challengesCompleted: number
  totalCO2Saved: number // in grams of CO2 equivalent
  score: number
  topLanguage: string
  streak: number // days
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar: string
  rank: number
  score: number
  challengesCompleted: number
  totalCO2Saved: number
  topLanguage: string
  delta: 'up' | 'down' | 'same' // rank change from last week
}