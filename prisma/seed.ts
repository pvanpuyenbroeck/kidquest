// Lokale fallback als .env ontbreekt (productie zet DATABASE_URL via Docker)
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./prisma/dev.db'
}

import { PrismaClient } from '@prisma/client'
import { startOfDay, startOfWeek } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Database seeden...')

  const today = startOfDay(new Date())
  const week = startOfWeek(new Date(), { weekStartsOn: 1 })
  const isMonday = new Date().getDay() === 1

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

  // Kinderen: Aline (8j, unicorn) en Lea (5j, dino)
  const aline = await prisma.child.upsert({
    where: { id: 'child-aline' },
    update: {
      name: 'Aline',
      theme: 'unicorn',
      avatarEmoji: '🦄',
      points: 25,
      sortOrder: 0,
    },
    create: {
      id: 'child-aline',
      name: 'Aline',
      theme: 'unicorn',
      avatarEmoji: '🦄',
      points: 25,
      sortOrder: 0,
    },
  })

  const lea = await prisma.child.upsert({
    where: { id: 'child-lea' },
    update: {
      name: 'Lea',
      theme: 'dino',
      avatarEmoji: '🦕',
      points: 15,
      sortOrder: 1,
    },
    create: {
      id: 'child-lea',
      name: 'Lea',
      theme: 'dino',
      avatarEmoji: '🦕',
      points: 15,
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

  const allTasks = [...dailyTasks, ...weeklyTasks, ...bonusTasks]

  for (const task of allTasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: task,
    })
  }

  // Wijs alle taken toe aan beide kinderen
  for (const child of [aline, lea]) {
    for (const task of allTasks) {
      await prisma.childTask.upsert({
        where: { childId_taskId: { childId: child.id, taskId: task.id } },
        update: {},
        create: { childId: child.id, taskId: task.id },
      })
    }
  }

  // TaskAssignments voor vandaag / deze week
  for (const child of [aline, lea]) {
    for (const task of dailyTasks) {
      await prisma.taskAssignment.upsert({
        where: {
          id: `assign-${child.id}-${task.id}-daily`,
        },
        update: { status: 'unlocked', unlockedAt: new Date() },
        create: {
          id: `assign-${child.id}-${task.id}-daily`,
          childId: child.id,
          taskId: task.id,
          date: today,
          status: 'unlocked',
          unlockedAt: new Date(),
        },
      })
    }

    for (const task of weeklyTasks) {
      const weeklyStatus = isMonday ? 'unlocked' : 'pending'
      await prisma.taskAssignment.upsert({
        where: {
          id: `assign-${child.id}-${task.id}-weekly`,
        },
        update: {
          status: weeklyStatus,
          unlockedAt: weeklyStatus === 'unlocked' ? new Date() : null,
        },
        create: {
          id: `assign-${child.id}-${task.id}-weekly`,
          childId: child.id,
          taskId: task.id,
          date: week,
          status: weeklyStatus,
          unlockedAt: weeklyStatus === 'unlocked' ? new Date() : undefined,
        },
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

  // Voorbeeld spaardoel (gezinsuitstap)
  await prisma.savingsGoal.upsert({
    where: { id: 'goal-uitstap' },
    update: {},
    create: {
      id: 'goal-uitstap',
      name: 'Uitstap naar de dierentuin',
      emoji: '🦁',
      description: 'Samen een dagje naar Planckendael!',
      targetPoints: 200,
      currentPoints: 0,
      availableTo: 'all',
    },
  })

  console.log('✅ Database klaar!')
  console.log(`   🦄 ${aline.name} aangemaakt (${aline.points} punten)`)
  console.log(`   🦕 ${lea.name} aangemaakt (${lea.points} punten)`)
  console.log(`   📋 ${allTasks.length} taken aangemaakt`)
  console.log(`   🎁 ${rewards.length} beloningen aangemaakt`)
  console.log(`   🎯 1 spaardoel aangemaakt`)
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
