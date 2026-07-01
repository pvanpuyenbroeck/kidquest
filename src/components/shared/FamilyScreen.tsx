'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, LockOpen } from 'lucide-react'
import { toast } from 'sonner'
import type { FamilyScreenData, GoalContributeResult, RewardClaimResult, TaskCompleteResult } from '@/lib/db'
import { ChildColumn } from '@/components/children/ChildColumn'
import { FamilyDayCalendar } from '@/components/shared/FamilyDayCalendar'
import { PinModal } from '@/components/shared/PinModal'
import { MediaUnlockModal, type MediaUnlockData } from '@/components/shared/MediaUnlockModal'
import { GoalCelebration } from '@/components/shared/GoalCelebration'
import { RewardCelebration } from '@/components/shared/RewardCelebration'
import { TaskCelebration } from '@/components/shared/TaskCelebration'
import { useParentAuthStore } from '@/stores/parentAuthStore'

interface FamilyScreenProps {
  data: FamilyScreenData
}

export function FamilyScreen({ data }: FamilyScreenProps) {
  const router = useRouter()
  const [taskCelebration, setTaskCelebration] = useState<TaskCompleteResult | null>(null)
  const [rewardCelebration, setRewardCelebration] = useState<RewardClaimResult | null>(null)
  const [goalCelebration, setGoalCelebration] = useState<GoalContributeResult | null>(null)
  const [mediaUnlock, setMediaUnlock] = useState<MediaUnlockData | null>(null)
  const {
    isAuthenticated,
    openPinModal,
    logout,
    checkSession,
    setOnTaskComplete,
    setOnRewardClaim,
    setOnGoalContribute,
  } = useParentAuthStore()

  const handleTaskSuccess = useCallback(
    (result: TaskCompleteResult) => {
      setTaskCelebration(result)
      toast.success(`${result.childName} heeft "${result.taskName}" afgerond!`)
      if (result.mediaUrl && result.mediaType) {
        setMediaUnlock({
          taskName: result.taskName,
          taskEmoji: result.taskEmoji,
          childName: result.childName,
          mediaUrl: result.mediaUrl,
          mediaType: result.mediaType,
        })
      }
      router.refresh()
    },
    [router]
  )

  const handleRewardSuccess = useCallback(
    (result: RewardClaimResult) => {
      setRewardCelebration(result)
      toast.success(`${result.childName} heeft "${result.rewardName}" geclaimd!`)
      router.refresh()
    },
    [router]
  )

  const handleGoalSuccess = useCallback(
    (result: GoalContributeResult) => {
      if (result.goalReached) {
        setGoalCelebration(result)
      } else {
        toast.success(
          `${result.childName} heeft ⭐ ${result.amount} punten gestort voor "${result.goalName}"!`
        )
      }
      router.refresh()
    },
    [router]
  )

  useEffect(() => {
    const checkNewDay = () => {
      const now = new Date().toISOString().slice(0, 10)
      if (now !== data.today.date) {
        router.refresh()
      }
    }
    const interval = setInterval(checkNewDay, 60_000)
    return () => clearInterval(interval)
  }, [data.today.date, router])

  useEffect(() => {
    checkSession()
    setOnTaskComplete(handleTaskSuccess)
    setOnRewardClaim(handleRewardSuccess)
    setOnGoalContribute(handleGoalSuccess)
  }, [
    checkSession,
    setOnTaskComplete,
    setOnRewardClaim,
    setOnGoalContribute,
    handleTaskSuccess,
    handleRewardSuccess,
    handleGoalSuccess,
  ])

  const handleTaskCelebrationDone = useCallback(() => {
    setTaskCelebration(null)
  }, [])

  const handleRewardCelebrationDone = useCallback(() => {
    setRewardCelebration(null)
  }, [])

  const handleGoalCelebrationDone = useCallback(() => {
    setGoalCelebration(null)
  }, [])

  return (
    <>
      <main className="min-h-screen bg-cream-100 p-4 md:p-6 flex flex-col">
        <header className="text-center mb-6 animate-slide-up space-y-3">
          <h1 className="font-display text-3xl md:text-4xl font-extrabold text-dark">
            {data.familyName}
          </h1>
          <p className="text-dark/50 font-medium">KidQuest 🦕🦄</p>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 badge bg-accent-green/20 text-accent-green px-4 py-2 text-sm hover:bg-accent-green/30 transition-colors"
            >
              <LockOpen className="h-4 w-4" />
              Ouder modus actief — tik om te vergrendelen
            </button>
          ) : (
            <button
              onClick={() => openPinModal()}
              className="inline-flex items-center gap-2 btn-primary text-sm px-5 py-2"
            >
              <Lock className="h-4 w-4" />
              Ouder pincode invoeren
            </button>
          )}
        </header>

        <FamilyDayCalendar today={data.today} />

        {data.sharedGoals.length > 0 && (
          <section className="max-w-6xl mx-auto w-full mb-2 space-y-3">
            <h2 className="section-title text-center">🎯 Ons grote doel</h2>
            {data.sharedGoals.map((goal, i) => (
              <div
                key={goal.id}
                className="card border-2 border-accent-orange/30 bg-gradient-to-br from-white to-cream-50 p-5"
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{goal.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-xl font-extrabold text-dark">{goal.name}</p>
                    {goal.description && (
                      <p className="text-sm text-dark/50 mt-0.5">{goal.description}</p>
                    )}
                    <p className="text-sm font-bold text-dark/60 mt-2">
                      ⭐ {goal.currentPoints} / {goal.targetPoints} punten ({goal.progressPercent}%)
                    </p>
                    <div className="h-3 bg-cream-200 rounded-full overflow-hidden mt-2">
                      <div
                        className="h-full bg-accent-orange rounded-full transition-all"
                        style={{ width: `${goal.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl xl:max-w-7xl mx-auto w-full">
          {data.children.map((child, index) => (
            <ChildColumn
              key={child.id}
              child={child}
              rewards={data.rewards}
              sharedGoals={data.sharedGoals}
              index={index}
            />
          ))}
        </div>

        <footer className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-dark/30 hover:text-dark/60 font-medium transition-colors"
          >
            ← Terug naar start
          </Link>
        </footer>
      </main>

      <PinModal />
      <TaskCelebration result={taskCelebration} onDone={handleTaskCelebrationDone} />
      <GoalCelebration result={goalCelebration} onDone={handleGoalCelebrationDone} />
      <RewardCelebration result={rewardCelebration} onDone={handleRewardCelebrationDone} />
      <MediaUnlockModal media={mediaUnlock} onClose={() => setMediaUnlock(null)} />
    </>
  )
}
