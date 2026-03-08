'use client'
import React from 'react'
import { AiHistoryList } from '@/modules/ia/components/ai-history-list'
import { toggleFavoriteAction, deleteGenerationAction } from '@/modules/ia/use-cases/ia.actions'
import type { AiGeneration } from '@/modules/ia/interfaces'

interface AiHistoryClientProps {
  initialGenerations: AiGeneration[]
  businessId: string
}

export function AiHistoryClient({ initialGenerations }: AiHistoryClientProps) {
  const [generations, setGenerations] = React.useState(initialGenerations)

  const handleToggleFavorite = async (id: string, current: boolean) => {
    setGenerations((prev) => prev.map((g) => (g.id === id ? { ...g, is_favorite: !current } : g)))
    await toggleFavoriteAction(id, !current)
  }

  const handleDelete = async (id: string) => {
    setGenerations((prev) => prev.filter((g) => g.id !== id))
    await deleteGenerationAction(id)
  }

  return (
    <AiHistoryList
      generations={generations}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
    />
  )
}
