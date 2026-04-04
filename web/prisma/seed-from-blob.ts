/**
 * One-time migration script: copies data from UserData.data JSON blob
 * into the normalized Prisma tables.
 *
 * Safe to re-run — all operations are upserts.
 *
 * Run with:
 *   cd web && npx ts-node --project tsconfig.json prisma/seed-from-blob.ts
 *
 * Or via tsx (faster, no tsconfig needed):
 *   cd web && npx tsx prisma/seed-from-blob.ts
 */

import { PrismaClient, Prisma } from '@prisma/client'
import type { AppData, Account, MonthlySnapshot, FamilyMember, RecurringExpense, VariableExpense, IncomeSource, AccountHoldings } from '../src/types/index'

const prisma = new PrismaClient()

async function migrateUser(userId: string, blob: AppData) {
  const accounts = blob.accounts ?? []
  const snapshots = blob.snapshots ?? []
  const familyMembers = blob.familyMembers ?? []
  const expenses = blob.expenses ?? []
  const variableExpenses = blob.variableExpenses ?? []
  const income = blob.income ?? []
  const holdings = blob.accountHoldings ?? []

  // ── 1. FinancialAccounts ───────────────────────────────────────────────────
  // Preserve blob ids so SnapshotEntry.accountId references stay valid.
  // Use array index as sortOrder to preserve display order.
  for (let i = 0; i < accounts.length; i++) {
    const acc: Account = accounts[i]
    await prisma.financialAccount.upsert({
      where: { id: acc.id },
      update: {
        name: acc.name,
        type: acc.type,
        kind: acc.kind ?? 'custom',
        owner: acc.owner ?? null,
        notes: acc.notes ?? null,
        url: acc.url ?? null,
        monthlyDeposit: acc.monthlyDeposit ?? null,
        feesFixed: acc.feesFixed ?? null,
        feesOnBalance: acc.feesOnBalance ?? null,
        feesOnDeposit: acc.feesOnDeposit ?? null,
        description: acc.description ?? null,
        bankVendor: acc.bankVendor ?? null,
        brokerageVendor: acc.brokerageVendor ?? null,
        sortOrder: i,
      },
      create: {
        id: acc.id,
        userId,
        name: acc.name,
        type: acc.type,
        kind: acc.kind ?? 'custom',
        owner: acc.owner ?? null,
        notes: acc.notes ?? null,
        url: acc.url ?? null,
        monthlyDeposit: acc.monthlyDeposit ?? null,
        feesFixed: acc.feesFixed ?? null,
        feesOnBalance: acc.feesOnBalance ?? null,
        feesOnDeposit: acc.feesOnDeposit ?? null,
        description: acc.description ?? null,
        bankVendor: acc.bankVendor ?? null,
        brokerageVendor: acc.brokerageVendor ?? null,
        sortOrder: i,
      },
    })
  }
  const accountIds = new Set(accounts.map((a) => a.id))
  console.log(`  FinancialAccount: ${accounts.length} upserted`)

  // ── 2. FamilyMembers ───────────────────────────────────────────────────────
  for (const fm of familyMembers as FamilyMember[]) {
    await prisma.familyMember.upsert({
      where: { userId_name: { userId, name: fm.name } },
      update: { isChild: fm.isChild ?? false },
      create: { userId, name: fm.name, isChild: fm.isChild ?? false },
    })
  }
  console.log(`  FamilyMember: ${familyMembers.length} upserted`)

  // ── 3. MonthlySnapshots + SnapshotEntries ──────────────────────────────────
  for (const snap of snapshots as MonthlySnapshot[]) {
    const dbSnap = await prisma.monthlySnapshot.upsert({
      where: { userId_date: { userId, date: snap.date } },
      update: {
        updatedAt: snap.updatedAt ? new Date(snap.updatedAt) : new Date(),
      },
      create: {
        id: snap.id,
        userId,
        date: snap.date,
        createdAt: snap.createdAt ? new Date(snap.createdAt) : new Date(),
        updatedAt: snap.updatedAt ? new Date(snap.updatedAt) : new Date(),
      },
    })

    for (const entry of snap.entries) {
      if (!accountIds.has(entry.accountId)) {
        console.warn(`    Skipping orphaned SnapshotEntry: accountId=${entry.accountId} not in accounts`)
        continue
      }
      await prisma.snapshotEntry.upsert({
        where: { snapshotId_accountId: { snapshotId: dbSnap.id, accountId: entry.accountId } },
        update: {
          balance: entry.balance,
          subBalances: entry.subBalances ?? Prisma.JsonNull,
          lastUpdatedAt: entry.lastUpdatedAt ? new Date(entry.lastUpdatedAt) : null,
        },
        create: {
          snapshotId: dbSnap.id,
          accountId: entry.accountId,
          balance: entry.balance,
          subBalances: entry.subBalances ?? Prisma.JsonNull,
          lastUpdatedAt: entry.lastUpdatedAt ? new Date(entry.lastUpdatedAt) : null,
        },
      })
    }
  }
  console.log(`  MonthlySnapshot: ${snapshots.length} upserted`)

  // ── 4. RecurringExpenses ───────────────────────────────────────────────────
  // Preserve blob ids — Transaction.recurringExpenseId references them by string.
  for (const exp of expenses as RecurringExpense[]) {
    await prisma.recurringExpense.upsert({
      where: { id: exp.id },
      update: {
        name: exp.name,
        amount: exp.amount,
        category: exp.category,
        billingCycle: exp.billingCycle,
        owner: exp.owner ?? null,
        notes: exp.notes ?? null,
        active: exp.active,
      },
      create: {
        id: exp.id,
        userId,
        name: exp.name,
        amount: exp.amount,
        category: exp.category,
        billingCycle: exp.billingCycle,
        owner: exp.owner ?? null,
        notes: exp.notes ?? null,
        active: exp.active,
      },
    })
  }
  console.log(`  RecurringExpense: ${expenses.length} upserted`)

  // ── 5. VariableExpenses ────────────────────────────────────────────────────
  for (const ve of variableExpenses as VariableExpense[]) {
    await prisma.variableExpense.upsert({
      where: { id: ve.id },
      update: {
        name: ve.name,
        category: ve.category,
        owner: ve.owner ?? null,
        active: ve.active,
      },
      create: {
        id: ve.id,
        userId,
        name: ve.name,
        category: ve.category,
        owner: ve.owner ?? null,
        active: ve.active,
      },
    })
  }
  console.log(`  VariableExpense: ${variableExpenses.length} upserted`)

  // ── 6. IncomeSources ───────────────────────────────────────────────────────
  for (const inc of income as IncomeSource[]) {
    await prisma.incomeSource.upsert({
      where: { id: inc.id },
      update: {
        name: inc.name,
        type: inc.type,
        grossAmount: inc.grossAmount,
        netAmount: inc.netAmount,
        billingCycle: inc.billingCycle,
        owner: inc.owner ?? null,
        notes: inc.notes ?? null,
        active: inc.active,
      },
      create: {
        id: inc.id,
        userId,
        name: inc.name,
        type: inc.type,
        grossAmount: inc.grossAmount,
        netAmount: inc.netAmount,
        billingCycle: inc.billingCycle,
        owner: inc.owner ?? null,
        notes: inc.notes ?? null,
        active: inc.active,
      },
    })
  }
  console.log(`  IncomeSource: ${income.length} upserted`)

  // ── 7. AccountHoldings ─────────────────────────────────────────────────────
  for (const ah of holdings as AccountHoldings[]) {
    if (!accountIds.has(ah.accountId)) {
      console.warn(`    Skipping orphaned AccountHoldings: accountId=${ah.accountId} not in accounts`)
      continue
    }
    await prisma.accountHoldings.upsert({
      where: { accountId: ah.accountId },
      update: {
        updatedAt: new Date(ah.updatedAt),
        totalValueNIS: ah.totalValueNIS,
        holdings: ah.holdings as object[],
      },
      create: {
        accountId: ah.accountId,
        userId,
        updatedAt: new Date(ah.updatedAt),
        totalValueNIS: ah.totalValueNIS,
        holdings: ah.holdings as object[],
      },
    })
  }
  console.log(`  AccountHoldings: ${holdings.length} upserted`)
}

async function main() {
  console.log('The UserData.data blob column has been dropped.')
  console.log('This script is no longer needed — data lives in normalized tables.')
  console.log('To seed data, use: npx tsx scripts/seed-user-data.ts <email>')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
