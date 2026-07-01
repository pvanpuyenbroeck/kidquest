import { create } from 'zustand'
import type { GoalContributeResult, RewardClaimResult, TaskCompleteResult } from '@/lib/db'

export interface PendingTask {
  assignmentId: string
  taskName: string
  taskEmoji: string
  childName: string
}

export interface PendingReward {
  childId: string
  rewardId: string
  rewardName: string
  rewardEmoji: string
  childName: string
}

export interface PendingGoal {
  childId: string
  goalId: string
  goalName: string
  goalEmoji: string
  childName: string
  amount: number
}

interface ParentAuthState {
  isAuthenticated: boolean
  showPinModal: boolean
  pendingTask: PendingTask | null
  pendingReward: PendingReward | null
  pendingGoal: PendingGoal | null
  onTaskComplete: ((result: TaskCompleteResult) => void) | null
  onRewardClaim: ((result: RewardClaimResult) => void) | null
  onGoalContribute: ((result: GoalContributeResult) => void) | null

  setAuthenticated: (value: boolean) => void
  setOnTaskComplete: (fn: (result: TaskCompleteResult) => void) => void
  setOnRewardClaim: (fn: (result: RewardClaimResult) => void) => void
  setOnGoalContribute: (fn: (result: GoalContributeResult) => void) => void
  openPinModal: (pending?: PendingTask | PendingReward | PendingGoal) => void
  closePinModal: () => void
  requestTaskComplete: (pending: PendingTask) => Promise<void>
  requestRewardClaim: (pending: PendingReward) => Promise<void>
  requestGoalContribute: (pending: PendingGoal) => Promise<void>
  completeTask: (assignmentId: string) => Promise<TaskCompleteResult | null>
  claimReward: (childId: string, rewardId: string) => Promise<RewardClaimResult | null>
  contributeToGoal: (
    childId: string,
    goalId: string,
    amount: number
  ) => Promise<GoalContributeResult | null>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
}

export const useParentAuthStore = create<ParentAuthState>((set, get) => ({
  isAuthenticated: false,
  showPinModal: false,
  pendingTask: null,
  pendingReward: null,
  pendingGoal: null,
  onTaskComplete: null,
  onRewardClaim: null,
  onGoalContribute: null,

  setAuthenticated: (value) => set({ isAuthenticated: value }),

  setOnTaskComplete: (fn) => set({ onTaskComplete: fn }),

  setOnRewardClaim: (fn) => set({ onRewardClaim: fn }),

  setOnGoalContribute: (fn) => set({ onGoalContribute: fn }),

  openPinModal: (pending) => {
    if (pending && 'assignmentId' in pending) {
      set({ showPinModal: true, pendingTask: pending, pendingReward: null, pendingGoal: null })
    } else if (pending && 'rewardId' in pending) {
      set({ showPinModal: true, pendingReward: pending, pendingTask: null, pendingGoal: null })
    } else if (pending && 'goalId' in pending) {
      set({ showPinModal: true, pendingGoal: pending, pendingTask: null, pendingReward: null })
    } else {
      set({ showPinModal: true, pendingTask: null, pendingReward: null, pendingGoal: null })
    }
  },

  closePinModal: () =>
    set({ showPinModal: false, pendingTask: null, pendingReward: null, pendingGoal: null }),

  requestTaskComplete: async (pending) => {
    const { isAuthenticated, openPinModal, completeTask } = get()
    if (!isAuthenticated) {
      openPinModal(pending)
      return
    }
    await completeTask(pending.assignmentId)
  },

  requestRewardClaim: async (pending) => {
    const { isAuthenticated, openPinModal, claimReward } = get()
    if (!isAuthenticated) {
      openPinModal(pending)
      return
    }
    await claimReward(pending.childId, pending.rewardId)
  },

  requestGoalContribute: async (pending) => {
    const { isAuthenticated, openPinModal, contributeToGoal } = get()
    if (!isAuthenticated) {
      openPinModal(pending)
      return
    }
    await contributeToGoal(pending.childId, pending.goalId, pending.amount)
  },

  completeTask: async (assignmentId) => {
    try {
      const res = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) set({ isAuthenticated: false })
        return null
      }

      get().onTaskComplete?.(data as TaskCompleteResult)
      return data as TaskCompleteResult
    } catch {
      return null
    }
  },

  claimReward: async (childId, rewardId) => {
    try {
      const res = await fetch('/api/rewards/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, rewardId }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) set({ isAuthenticated: false })
        return null
      }

      get().onRewardClaim?.(data as RewardClaimResult)
      return data as RewardClaimResult
    } catch {
      return null
    }
  },

  contributeToGoal: async (childId, goalId, amount) => {
    try {
      const res = await fetch('/api/goals/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId, goalId, amount }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 401) set({ isAuthenticated: false })
        return null
      }

      get().onGoalContribute?.(data as GoalContributeResult)
      return data as GoalContributeResult
    } catch {
      return null
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    set({
      isAuthenticated: false,
      showPinModal: false,
      pendingTask: null,
      pendingReward: null,
      pendingGoal: null,
    })
  },

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/session')
      const data = await res.json()
      set({ isAuthenticated: data.authenticated === true })
    } catch {
      set({ isAuthenticated: false })
    }
  },
}))
