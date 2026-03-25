import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Difficulty } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const challenges = [
  {
    title: 'The Patience Trap',
    difficulty: Difficulty.EASY,
    description: `
Concept: Resource Management

You are programming the Ares I Mars Rover’s communication relay. 
The orbiter will be in position in exactly delay ms milliseconds. 
You must wait exactly that long to save battery, then encrypt and return the transmission payload.

Starter Code:

def wait_and_transmit(api, delay_ms, payload_string):
    """
    Waits for the specified delay_ms, then encrypts and returns the payload.
    WARNING: Constant CPU polling will drain the battery!
    """
    pass
    `,
  },

  {
    title: 'The Turbo Trap',
    difficulty: Difficulty.HARD,
    description: `
Concept: Concurrency Scaling

A deep space telescope has captured an array of signal frequencies. 
You must apply a heavy mathematical smoothing algorithm to every frequency. 
The payload sizes vary wildly: sometimes 10 signals, and sometimes 10,000,000.

Starter Code:

import multiprocessing

def process_signals(frequencies):
    """
    Applies a mathematical smoothing function to a list of frequencies.
    HINT: Is booting up 4 CPU cores always the most energy-efficient choice?
    """
    pass
    `,
  },

  {
    title: 'The Telemetry Router',
    difficulty: Difficulty.MEDIUM,
    description: `
Concept: Efficient Search Structures

Your orbital relay processes millions of data packets. 
You are given a database of 100,000 known telemetry routes (e.g., "MARS.BASE.ALPHA") 
and an incoming stream of 10,000 partial route queries (e.g., "MARS.BASE").

Return how many queries match the start of a known route.

Starter Code:

def count_valid_routes(known_routes, queries):
    """
    Returns the number of queries that are valid prefixes of known_routes.
    HINT: Can you build a data structure that maps prefixes in advance?
    """
    return 0
    `,
  },

  {
    title: 'The Solar Flare Scanner',
    difficulty: Difficulty.MEDIUM,
    description: `
Concept: Redundant Operations

Your satellite has recorded 1,000,000 seconds of solar radiation data. 
Find the maximum radiation absorbed in any continuous block of exactly k seconds.

Starter Code:

def max_radiation_window(radiation_data, k):
    """
    Finds the maximum sum of any contiguous sub-array of length 'k'.
    HINT: Do you really need to recompute every window?
    """
    return 0
    `,
  },

  {
    title: 'The Spatial Locality Crisis',
    difficulty: Difficulty.MEDIUM,
    description: `
Concept: Memory Architecture

You are processing a 2D topographical map of the ocean floor represented as a massive grid. 
Calculate the sum of all elevation points.

Starter Code:

long long calculateElevation(const std::vector<std::vector<int>>& grid, int size) {
    /*
     * Calculates the total sum of all points in the 2D grid.
     * HINT: How does the computer physically store a 2D grid in RAM?
     */
    return 0;
}
    `,
  },

  {
    title: 'The Copy-by-Value Sinkhole',
    difficulty: Difficulty.EASY,
    description: `
Concept: Data Duplication

The central server receives massive user-profile objects from edge nodes. 
Write a function that scans a given profile and returns true if the user’s suspicion score is over 90.

Starter Code:

bool evaluateProfile(UserProfile profile) {
    /*
     * WARNING: How much energy does it take to copy this object?
     */
    return false;
}
    `,
  },

  {
    title: 'The Orbital Collision Engine',
    difficulty: Difficulty.HARD,
    description: `
Concept: Distance Algorithms

You are tracking 20,000 asteroids in a 2D plane. 
Find how many pairs of asteroids are dangerously close to each other (distance < D).

Starter Code:

import math

def count_collisions(asteroids, dangerous_distance):
    """
    Returns the number of asteroid pairs within the dangerous_distance.
    HINT: math.sqrt() is heavy. Do you really need exact distances?
    """
    return 0
    `,
  },
]

async function main() {
  console.log('🌱 Seeding challenges...')

  await prisma.challenge.deleteMany()

  for (const challenge of challenges) {
    const created = await prisma.challenge.create({ data: challenge })
    console.log(`✓ ${created.title}`)
  }

  console.log(`\n✅ Seeded ${challenges.length} challenges.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())