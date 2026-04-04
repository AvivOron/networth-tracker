#!/bin/bash
# Restores data from pg_dump backup into the current (post-migration) schema.
# Only restores tables that exist in both the backup and the new schema.
# Run from web/ directory:
#   bash prisma/restore-from-backup.sh

set -e

BACKUP="prisma/db_backup/050426.sql"

# Load env vars from .env.local
if [ -f .env.local ]; then
  export $(grep -v '^#' .env.local | xargs)
fi

DB_URL="${DIRECT_DATABASE_URL:-$DATABASE_URL}"

if [ -z "$DB_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

echo "Restoring data from $BACKUP..."

# Extract and replay COPY blocks for the tables we care about.
# We use awk to pull each COPY...\.  block and pipe it to psql.

TABLES=(
  '"User"'
  '"Account"'
  '"Session"'
  '"VerificationToken"'
  '"Household"'
  '"HouseholdMember"'
  '"UserData"'
  '"Transaction"'
  '"Property"'
  '"ExpenseCategory"'
)

for TABLE in "${TABLES[@]}"; do
  echo -n "  Restoring $TABLE... "
  awk "/^COPY public\.$TABLE /,/^\\\\./" "$BACKUP" | psql "$DB_URL" --no-password -q 2>&1
  echo "done"
done

echo ""
echo "Data restore complete."
echo ""
echo "Now run the blob migration to populate normalized tables:"
echo "  npx tsx prisma/seed-from-blob.ts"
