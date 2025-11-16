'use client'

import { useRef } from 'react'
import NewsCard from './NewsCard'
import { useImpressionTracking, useClickTracking } from '@/lib/use-analytics'
import type { ArticleRow } from '@/lib/article-row'

type TrackedNewsCardProps = {
  article: ArticleRow
  position: 'hero' | 'featured-side' | 'featured-bottom' | 'latest-grid' | 'theme-focus'
  positionIndex: number
  score?: number
  // Props do NewsCard
  theme: string
  date: number | null
  internalUrl: string
  imageUrl: string
  summary: string
  title: string
  isMain?: boolean
}

export default function TrackedNewsCard({
  article,
  position,
  positionIndex,
  score = 0,
  ...newsCardProps
}: TrackedNewsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Track impression when card becomes visible
  useImpressionTracking(cardRef, article, position, positionIndex, score)

  // Track click
  const handleClick = useClickTracking(article, position, positionIndex, score)

  return (
    <div ref={cardRef} onClick={handleClick}>
      <NewsCard {...newsCardProps} />
    </div>
  )
}
