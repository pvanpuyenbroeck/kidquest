'use client'

import { useState } from 'react'
import type { UnlockedMedia } from '@/lib/db'
import { MediaUnlockModal, type MediaUnlockData } from '@/components/shared/MediaUnlockModal'

interface UnlockedMediaGalleryProps {
  media: UnlockedMedia[]
  childName: string
}

export function UnlockedMediaGallery({ media, childName }: UnlockedMediaGalleryProps) {
  const [selected, setSelected] = useState<MediaUnlockData | null>(null)

  if (media.length === 0) return null

  return (
    <>
      <section>
        <h3 className="section-title mb-3">Mijn verrassingen</h3>
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
          {media.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setSelected({
                  taskName: item.taskName,
                  taskEmoji: item.taskEmoji,
                  childName,
                  mediaUrl: item.mediaUrl,
                  mediaType: item.mediaType,
                })
              }
              className="card flex flex-col items-center gap-1 p-3 min-w-[90px] hover:-translate-y-0.5 hover:shadow-card-hover transition-all"
            >
              <span className="text-2xl">{item.taskEmoji}</span>
              <p className="text-[10px] font-bold text-dark leading-tight truncate w-full">
                {item.taskName}
              </p>
              <span className="text-xs text-dark/40">
                {item.mediaType === 'video' ? '🎬' : '🖼️'}
              </span>
            </button>
          ))}
        </div>
      </section>

      <MediaUnlockModal media={selected} onClose={() => setSelected(null)} />
    </>
  )
}
