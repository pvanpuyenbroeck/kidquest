'use client'

import { cn } from '@/lib/utils'
import { getChildTheme, type ChildTheme } from '@/lib/child-themes'

interface ThemeAvatarProps {
  emoji: string
  theme: ChildTheme | string
  size?: 'md' | 'lg'
  className?: string
}

const sizeStyles = {
  md: 'h-16 w-16 text-3xl',
  lg: 'h-24 w-24 text-5xl',
}

export function ThemeAvatar({ emoji, theme, size = 'lg', className }: ThemeAvatarProps) {
  const config = getChildTheme(theme)

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full ring-4 shadow-soft animate-float',
        config.avatar,
        sizeStyles[size],
        className
      )}
      style={{
        backgroundColor: `${config.color}33`,
        boxShadow: `0 0 0 4px ${config.color}`,
      }}
    >
      <span role="img" aria-hidden="true">
        {emoji}
      </span>
    </div>
  )
}
