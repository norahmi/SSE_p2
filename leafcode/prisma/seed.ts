import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Difficulty } from "@prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding challenges...')

  await prisma.challenge.deleteMany()

  await prisma.challenge.create({
    data: {
      title: 'The Patience Trap',
      description: `
You are programming the Ares I Mars Rover’s communication relay.
The orbiter will be in position in exactly delay ms milliseconds.
You must wait exactly that long to save battery, then encrypt and return the transmission payload.

Starter Code:

def wait_and_transmit(api, delay_ms, payload_string):
    """
    Waits for the specified delay_ms, then encrypts and returns the payload.
    WARNING: Constant CPU polling will drain the battery!
    """
    # Write your energy-efficient code here
    pass
      `,
      difficulty: Difficulty.EASY,
    },
  })

  console.log('Done seeding.')
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });