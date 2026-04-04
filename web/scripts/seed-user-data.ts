/**
 * Seeds the database with local app data for a specific user.
 * Usage: npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/seed-user-data.ts <email>
 */

import { PrismaClient } from '@prisma/client'
import { saveAppData } from '../src/lib/data'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

const DATA_PATH = path.join(
  process.env.HOME!,
  'Library/Application Support/networth-tracker/networth-data.json'
)

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: seed-user-data.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`No user found with email: ${email}`)
    process.exit(1)
  }

  const raw = fs.readFileSync(DATA_PATH, 'utf-8')
  const data = JSON.parse(raw)

  // Strip fields not needed in the web app
  delete data.driveSync

  await saveAppData(user.id, data)

  console.log(`✓ Seeded data for ${email} (userId: ${user.id})`)
  console.log(`  accounts: ${data.accounts?.length ?? 0}`)
  console.log(`  snapshots: ${data.snapshots?.length ?? 0}`)
  console.log(`  expenses: ${data.expenses?.length ?? 0}`)
  console.log(`  familyMembers: ${data.familyMembers?.length ?? 0}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
