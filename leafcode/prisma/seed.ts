import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from '@prisma/client';
import { Difficulty } from '@prisma/client';
import { Language } from '@prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const challenges = [
  {
    title: 'The Patience Trap',
    difficulty: Difficulty.EASY,
    languages: [Language.PYTHON, Language.CPP, Language.C, Language.JAVASCRIPT],
    description: `
    Concept: Resource Management

    You are programming the Ares I Mars Rover's communication relay. 
    The orbiter will be in position in exactly delay ms milliseconds. 
    You must wait exactly that long to save battery, then encrypt and return the transmission payload.`,
    startingCodes: [
      { language: Language.PYTHON,
        code: 
`def wait_and_transmit (api , delay_ms , payload_string ):
"""Waits for the specified delay_ms , then encrypts and returns the payload .
WARNING : Constant CPU polling will drain the battery !
"""
# Write your energy - efficient code here
pass
        `
      },
      { language: Language.CPP, 
        code:
`#include <string>
#include <chrono>
#include <thread>

std::string wait_and_transmit(void* api, int delay_ms, std::string payload_string) {
    /*
    * Waits for the specified delay_ms, then encrypts and returns the payload.
    * WARNING: Constant CPU polling will drain the battery!
    * HINT: The std::this_thread namespace has what you need.
    */

    // Write your energy-efficient code here
    return "";
}
        ` },
      { language: Language.C, 
        code:
`#include <unistd.h>
char* wait_and_transmit(void* api, int delay_ms, const char* payload_string) {
    /*
    * Waits for the specified delay_ms, then encrypts and returns the payload.
    * WARNING: Constant CPU polling (busy-waiting) will drain the battery!
    * HINT: Look into system sleep functions.
    */
    
    // Write your energy-efficient code here
    return NULL;
}
        ` },
      { language: Language.JAVASCRIPT, 
        code:
`async function waitAndTransmit(api, delayMs, payloadString) {
  /**
   * Waits for the specified delayMs, then encrypts and returns the payload.
   * WARNING: A 'while' loop checking the time will freeze the thread!
   * HINT: Think about Promises and setTimeout.
   */

  // Write your energy-efficient code here
  return "";
}
        ` },
    ]
  },

  {
    title: 'The Turbo Trap',
    difficulty: Difficulty.HARD,
    languages: [Language.PYTHON],
    description: `
    Concept: Concurrency Scaling

    A deep space telescope has captured an array of signal frequencies. 
    You must apply a heavy mathematical smoothing algorithm to every frequency. 
    The payload sizes vary wildly: sometimes 10 signals, and sometimes 10,000,000.
    `,
    startingCodes: [
      { language: Language.PYTHON,
        code:
`import multiprocessing
def process_signals(frequencies):
    """
    Applies a mathematical smoothing function to a list of frequencies.
    HINT: Is booting up 4 CPU cores always the most energy-efficient choice?
    """
    pass
        `
      },
    ]
  },

  {
    title: 'The Telemetry Router',
    difficulty: Difficulty.MEDIUM,
    languages: [Language.PYTHON, Language.CPP, Language.C, Language.JAVASCRIPT],
    description: `
    Concept: Efficient Search Structures

    Your orbital relay processes millions of data packets. 
    You are given a database of 100,000 known telemetry routes (e.g., "MARS.BASE.ALPHA") 
    and an incoming stream of 10,000 partial route queries (e.g., "MARS.BASE").

    Return how many queries match the start of a known route.
    `,
  startingCodes: [
      { language: Language.PYTHON,
        code:
`def count_valid_routes ( known_routes , queries ):
"""
Returns the number of queries that are valid prefixes of known_routes .
HINT : Can you build a data structure that maps prefixes in advance ?
"""
# Write your energy - efficient code here
return 0
        `
      },
      { language: Language.CPP, 
        code:
`#include <vector>
#include <string>

/**
 * Returns the number of queries that are valid prefixes of known_routes.
 * * HINT: How can you avoid O(N * M) string comparisons? 
 * Think about using a Trie or a sorted search.
 */
int count_valid_routes(const std::vector<std::string>& known_routes, const std::vector<std::string>& queries) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
      { language: Language.C, 
        code:
`#include <stdio.h>
#include <string.h>

/**
 * Returns the number of queries that are valid prefixes of known_routes.
 * * @param known_routes An array of strings representing valid telemetry routes.
 * @param num_routes The number of elements in known_routes.
 * @param queries An array of strings to check against known routes.
 * @param num_queries The number of elements in queries.
 * * HINT: Can you build a data structure (like a Trie) to map prefixes in advance?
 */
int count_valid_routes(const char** known_routes, int num_routes, const char** queries, int num_queries) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
      { language: Language.JAVASCRIPT, 
        code:
`/**
 * Returns the number of queries that are valid prefixes of known_routes.
 * * @param {string[]} knownRoutes
 * @param {string[]} queries
 * * HINT: Building a nested object representing each character 
 * can help you find prefixes in linear time.
 */
function countValidRoutes(knownRoutes, queries) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
    ]
  },

  {
    title: 'The Solar Flare Scanner',
    difficulty: Difficulty.MEDIUM,
    languages: [Language.PYTHON, Language.CPP, Language.C, Language.JAVASCRIPT],
    description: `
    Concept: Redundant Operations

    Your satellite has recorded 1,000,000 seconds of solar radiation data. 
    Find the maximum radiation absorbed in any continuous block of exactly k seconds.
    `,
    startingCodes: [
      { language: Language.PYTHON,
        code:
`def max_radiation_window(radiation_data, k):
"""
Finds the maximum sum of any contiguous sub-array of length 'k'.
HINT: Do you really need to recompute every window?
"""
return 0
        `
      },
      { language: Language.CPP, 
        code:
`#include <vector>
#include <algorithm>

/**
 * Finds the maximum sum of any contiguous sub-array of length 'k'.
 * * HINT: A "Sliding Window" approach will let you solve this in O(n) time
 * instead of O(n * k).
 */
long long max_radiation_window(const std::vector<int>& radiation_data, int k) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
      { language: Language.C, 
        code:
`#include <stdio.h>

/**
 * Finds the maximum sum of any contiguous sub-array of length 'k'.
 * * @param radiation_data An array of integers representing sensor readings.
 * @param n The total number of seconds (size of the array).
 * @param k The window size in seconds.
 * * HINT: If you subtract the value leaving the window and add the 
 * value entering it, you never have to re-sum the middle!
 */
long long max_radiation_window(const int* radiation_data, int n, int k) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
      { language: Language.JAVASCRIPT, 
        code:
`/**
 * Finds the maximum sum of any contiguous sub-array of length 'k'.
 * * @param {number[]} radiationData
 * @param {number} k
 * * HINT: Do you really need to recompute every window? 
 * Think about the difference between window i and window i+1.
 */
function maxRadiationWindow(radiationData, k) {
    // Write your energy-efficient code here
    return 0;
}
        ` },
    ]
  },

  {
    title: 'The Spatial Locality Crisis',
    difficulty: Difficulty.MEDIUM,
    languages: [Language.CPP],
    description: `
    Concept: Memory Architecture

    You are processing a 2D topographical map of the ocean floor represented as a massive grid. 
    Calculate the sum of all elevation points.

    `,
    startingCodes: [
      { language: Language.CPP,
        code:
`#include <vector>

long long calculateElevation(const std::vector<std::vector<int>>& grid, int size) {
    /*
    * Calculates the total sum of all points in the 2D grid.
    * HINT: How does the computer physically store a 2D grid in RAM?
    */
    return 0;
}
        `
      },
    ]
  },

  {
    title: 'The Copy-by-Value Sinkhole',
    difficulty: Difficulty.EASY,
    languages: [Language.CPP],
    description: `
    Concept: Data Duplication

    The central server receives massive user-profile objects from edge nodes. 
    Write a function that scans a given profile and returns true if the user’s suspicion score is over 90.
    `,
    startingCodes: [
      { language: Language.CPP,
        code:
`#include <vector>

bool evaluateProfile(UserProfile profile) {
  /*
  * WARNING: How much energy does it take to copy this object?
  */
  return false;
}
        `
      },
    ]
  },

  {
    title: 'The Orbital Collision Engine',
    difficulty: Difficulty.HARD,
    languages: [Language.PYTHON, Language.CPP, Language.C, Language.JAVASCRIPT],
    description: `
Concept: Distance Algorithms

You are tracking 20,000 asteroids in a 2D plane. 
Find how many pairs of asteroids are dangerously close to each other (distance < D).
    `,
    startingCodes: [
      { language: Language.PYTHON, 
        code:
`import math

def count_collisions(asteroids, dangerous_distance):
    """
    Returns the number of asteroid pairs within the dangerous_distance.
    HINT: math.sqrt() is heavy. Do you really need exact distances?
    """
    # Write your energy - efficient code here
    return 0
        ` 
      },
      { language: Language.CPP, 
        code:
`#include <vector>

struct Asteroid {
    double x;
    double y;
};

/**
 * Returns the number of asteroid pairs within the dangerous_distance.
 * * HINT: Floating point square roots are expensive for a satellite CPU.
 * Is there a way to check proximity using only multiplication and addition?
 */
int count_collisions(const std::vector<Asteroid>& asteroids, double dangerous_distance) {
    // Write your energy-efficient code here
    return 0;
}
        ` 
      },
      { language: Language.C, 
        code:
`#include <stdio.h>

typedef struct {
    double x;
    double y;
} Asteroid;

/**
 * Returns the number of asteroid pairs within the dangerous_distance.
 * @param asteroids Array of Asteroid structures.
 * @param n Number of asteroids.
 * @param dangerous_distance The threshold distance.
 * * HINT: math.sqrt() is a heavy operation. Can you compare 
 * squared distances instead?
 */
int count_collisions(const Asteroid* asteroids, int n, double dangerous_distance) {
    // Write your energy-efficient code here
    return 0;
}
        ` 
      },
      { language: Language.JAVASCRIPT, 
        code:
`/**
 * Returns the number of asteroid pairs within the dangerous_distance.
 * @param {Object[]} asteroids - Array of {x, y} coordinates.
 * @param {number} dangerousDistance
 * * HINT: Math.sqrt() is heavy. If a^2 + b^2 < d^2, then the 
 * asteroids are dangerously close.
 */
function countCollisions(asteroids, dangerousDistance) {
    // Write your energy-efficient code here
    return 0;
}
        ` 
      },
    ]

  },
]

async function main() {
  console.log('Seeding challenges...')

  await prisma.startingCode.deleteMany() 
  await prisma.challenge.deleteMany()

  for (const challenge of challenges) {
    // Destructure to separate the nested array from the main challenge fields
    const { startingCodes, ...challengeData } = challenge;
    await prisma.challenge.create({
      data: {
        ...challengeData,
        startingCodes: {
          create: startingCodes
        }
      }
    });
  }
  console.log(`\nSeeded ${challenges.length} challenges.`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())