import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Database seeden...')

  // Instellingen
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      familyName: 'Onze Familie',
      parentPin: '1234',
    },
  })

  // Kinderen
  const emma = await prisma.child.upsert({
    where: { id: 'child-emma' },
    update: {},
    create: {
      id: 'child-emma',
      name: 'Emma',
      theme: 'dino',
      avatarEmoji: '🦕',
      points: 0,
      sortOrder: 0,
    },
  })

  const lotte = await prisma.child.upsert({
    where: { id: 'child-lotte' },
    update: {},
    create: {
      id: 'child-lotte',
      name: 'Lotte',
      theme: 'unicorn',
      avatarEmoji: '🦄',
      points: 0,
      sortOrder: 1,
    },
  })

  // Standaard dagelijkse taken
  const dailyTasks = [
    { id: 'task-tafel', name: 'Tafel dekken', emoji: '🍽️', type: 'daily', recurrence: 'daily', pointsLoss: 5 },
    { id: 'task-tanden', name: 'Tanden poetsen', emoji: '🦷', type: 'daily', recurrence: 'daily', pointsLoss: 5 },
    { id: 'task-spullen', name: 'Spullen opruimen', emoji: '🧹', type: 'daily', recurrence: 'daily', pointsLoss: 5 },
  ]

  const weeklyTasks = [
    { id: 'task-kamer', name: 'Kamer opruimen', emoji: '🛏️', type: 'weekly', recurrence: 'weekly', pointsLoss: 10 },
  ]

  const bonusTasks = [
    { id: 'task-bonus-helpen', name: 'Extra helpen', emoji: '🌟', type: 'bonus', recurrence: null, pointsReward: 20 },
    { id: 'task-bonus-lezen', name: 'Boek lezen', emoji: '📚', type: 'bonus', recurrence: null, pointsReward: 15 },
  ]

  for (const task of [...dailyTasks, ...weeklyTasks, ...bonusTasks]) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    })
  }

  // Wijs alle taken toe aan beide kinderen
  for (const child of [emma, lotte]) {
    for (const task of [...dailyTasks, ...weeklyTasks, ...bonusTasks]) {
      await prisma.childTask.upsert({
        where: { childId_taskId: { childId: child.id, taskId: task.id } },
        update: {},
        create: { childId: child.id, taskId: task.id },
      })
    }
  }

  // Standaard beloningen
  const rewards = [
    { id: 'reward-screen-30', name: '30 min schermtijd', emoji: '📱', pointsCost: 30 },
    { id: 'reward-screen-60', name: '1 uur schermtijd', emoji: '📺', pointsCost: 55 },
    { id: 'reward-roblox', name: 'Roblox sessie', emoji: '🎮', pointsCost: 40 },
    { id: 'reward-snoep', name: 'Snoepje kiezen', emoji: '🍬', pointsCost: 20 },
    { id: 'reward-ipad', name: 'iPad tijd', emoji: '🎯', pointsCost: 35 },
  ]

  for (const reward of rewards) {
    await prisma.reward.upsert({
      where: { id: reward.id },
      update: {},
      create: reward,
    })
  }

  // Standaard straffen
  const punishments = [
    { id: 'punt-onbeleefd', name: 'Onbeleefd zijn', emoji: '😤', pointsLoss: 10 },
    { id: 'punt-liegen', name: 'Liegen', emoji: '🤥', pointsLoss: 15 },
    { id: 'punt-ruzie', name: 'Ruzie maken', emoji: '😠', pointsLoss: 10 },
    { id: 'punt-niet-luisteren', name: 'Niet luisteren', emoji: '🙉', pointsLoss: 5 },
  ]

  for (const punishment of punishments) {
    await prisma.punishment.upsert({
      where: { id: punishment.id },
      update: {},
      create: punishment,
    })
  }

  console.log('✅ Database klaar!')
  console.log(`   👧 ${emma.name} aangemaakt`)
  console.log(`   👧 ${lotte.name} aangemaakt`)
  console.log(`   📋 ${dailyTasks.length + weeklyTasks.length + bonusTasks.length} taken aangemaakt`)
  console.log(`   🎁 ${rewards.length} beloningen aangemaakt`)
  console.log(`   ⚠️  ${punishments.length} straffen aangemaakt`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
