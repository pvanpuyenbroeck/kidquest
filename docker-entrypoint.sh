#!/bin/sh
set -e

PRISMA_CLI="node ./node_modules/prisma/build/index.js"

echo "🦕 KidQuest opstarten..."

# Migreer database (maak tabellen aan als ze nog niet bestaan)
echo "📦 Database migreren..."
$PRISMA_CLI migrate deploy

# Seed database als die leeg is (eerste keer)
echo "🌱 Database controleren..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.settings.count()
  .then(count => {
    if (count === 0) {
      console.log('Eerste opstart — database seeden...');
      return prisma.\$disconnect().then(() => process.exit(2));
    }
    console.log('Database al ingericht.');
    return prisma.\$disconnect();
  })
  .catch(() => process.exit(2));
" || {
  if [ $? -eq 2 ]; then
    node prisma/seed.runtime.cjs
  fi
}

echo "🚀 App starten op poort 3000..."
exec node server.js
