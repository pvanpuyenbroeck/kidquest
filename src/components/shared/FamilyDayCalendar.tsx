'use client'

import { format, startOfWeek, addDays, isSameDay } from 'date-fns'
import { nl } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { FamilyToday } from '@/lib/db'

interface FamilyDayCalendarProps {
  today: FamilyToday
}

export function FamilyDayCalendar({ today }: FamilyDayCalendarProps) {
  const weekStart = startOfWeek(new Date(today.date), { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)
    return {
      date,
      dayNumber: date.getDate(),
      weekdayShort: format(date, 'EEE', { locale: nl }),
      isToday: isSameDay(date, new Date(today.date)),
    }
  })

  return (
    <section className="max-w-6xl mx-auto w-full mb-4">
      <div className="card border-2 border-cream-200 bg-white/80 p-4 md:p-5">
        <div className="text-center mb-4">
          <p className="text-xs font-bold uppercase tracking-widest text-dark/40">
            Vandaag
          </p>
          <p className="font-display text-2xl md:text-3xl font-extrabold text-dark capitalize">
            {today.label}
          </p>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {weekDays.map((day) => (
            <div
              key={day.date.toISOString()}
              className={cn(
                'flex flex-col items-center rounded-2xl py-2 px-1 transition-colors',
                day.isToday
                  ? 'bg-accent-orange text-white shadow-md scale-105'
                  : 'bg-cream-100 text-dark/50'
              )}
            >
              <span
                className={cn(
                  'text-[10px] md:text-xs font-bold uppercase',
                  day.isToday ? 'text-white/80' : 'text-dark/40'
                )}
              >
                {day.weekdayShort}
              </span>
              <span
                className={cn(
                  'text-lg md:text-xl font-extrabold font-display',
                  day.isToday ? 'text-white' : 'text-dark/60'
                )}
              >
                {day.dayNumber}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-dark/40 font-medium mt-3">
          Taken en beloningen gelden voor vandaag · punten en spaardoelen blijven bewaard
        </p>
      </div>
    </section>
  )
}
