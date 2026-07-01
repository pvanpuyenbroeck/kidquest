'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { getChildTheme } from '@/lib/child-themes'
import type { FamilyChild, FamilyGoal, FamilyReward } from '@/lib/db'
import { ThemeAvatar } from '@/components/shared/ThemeAvatar'
import { PointsBadge } from '@/components/shared/PointsBadge'
import { TaskList } from '@/components/tasks/TaskList'
import { RewardCard } from '@/components/rewards/RewardCard'
import { GoalProgressCard } from '@/components/goals/GoalProgressCard'
import { UnlockedMediaGallery } from '@/components/rewards/UnlockedMediaGallery'
import { PunishmentCard } from '@/components/punishments/PunishmentCard'

interface ChildColumnProps {
  child: FamilyChild
  rewards: FamilyReward[]
  sharedGoals?: FamilyGoal[]
  index?: number
}

export function ChildColumn({ child, rewards, sharedGoals = [], index = 0 }: ChildColumnProps) {
  const themeConfig = getChildTheme(child.theme)
  const dailyTasks = child.assignments.filter((a) => a.task.type === 'daily')
  const weeklyTasks = child.assignments.filter((a) => a.task.type === 'weekly')

  const childRewards = rewards.filter(
    (r) => r.availableTo === 'all' || r.availableTo === child.id
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.4 }}
      className="flex flex-col gap-5 min-w-0"
    >
      {/* Header */}
      <div
        className={cn(
          'card bg-gradient-to-br border-2 flex flex-col items-center gap-3 py-6',
          themeConfig.header
        )}
        style={{
          borderColor: themeConfig.color,
          backgroundImage: `linear-gradient(to bottom right, ${themeConfig.color}22, ${themeConfig.color}44)`,
        }}
      >
        <ThemeAvatar emoji={child.avatarEmoji} theme={child.theme} />
        <h2 className="font-display text-3xl font-extrabold text-dark">{child.name}</h2>
        <PointsBadge points={child.points} />
      </div>

      {/* Taken */}
      <TaskList
        assignments={dailyTasks}
        theme={child.theme}
        childName={child.name}
        title="Taken voor vandaag"
      />

      {weeklyTasks.length > 0 && (
        <TaskList
          assignments={weeklyTasks}
          theme={child.theme}
          childName={child.name}
          title="Deze week"
        />
      )}

      {/* Bonustaken */}
      {child.bonusAssignments.length > 0 && (
        <TaskList
          assignments={child.bonusAssignments}
          theme={child.theme}
          childName={child.name}
          title="Extra bonustaken"
        />
      )}

      {/* Straffen vandaag */}
      {child.punishmentsToday.length > 0 && (
        <section>
          <h3 className="section-title mb-3">Straffen vandaag</h3>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
            {child.punishmentsToday.map((punishment, i) => (
              <PunishmentCard key={punishment.id} punishment={punishment} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Ontgrendelde media */}
      <UnlockedMediaGallery media={child.unlockedMedia} childName={child.name} />

      {/* Spaardoelen */}
      {(sharedGoals.length > 0 || child.personalGoals.length > 0) && (
        <section className="space-y-2">
          <h3 className="section-title mb-3">Sparen voor...</h3>
          {sharedGoals.map((goal, i) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              childId={child.id}
              childName={child.name}
              childPoints={child.points}
              theme={child.theme}
              index={i}
              compact
            />
          ))}
          {child.personalGoals.map((goal, i) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              childId={child.id}
              childName={child.name}
              childPoints={child.points}
              theme={child.theme}
              index={sharedGoals.length + i}
              compact
            />
          ))}
        </section>
      )}

      {/* Beloningen */}
      <section>
        <h3 className="section-title mb-3">Beloningen vandaag</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {childRewards.map((reward, i) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              childId={child.id}
              childName={child.name}
              childPoints={child.points}
              theme={child.theme}
              claimedToday={child.claimedRewardIdsToday.includes(reward.id)}
              index={i}
            />
          ))}
        </div>
      </section>
    </motion.div>
  )
}
