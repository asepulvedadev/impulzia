'use client'
import React from 'react'
import { cn } from '@/lib/utils'

interface StreamingTextProps {
  text: string
  isStreaming?: boolean
  className?: string
}

export function StreamingText({ text, isStreaming = false, className }: StreamingTextProps) {
  return (
    <div className={cn('relative font-mono text-sm text-slate-200 whitespace-pre-wrap leading-relaxed', className)}>
      {text}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-brand-primary-400 ml-0.5 align-middle animate-pulse" />
      )}
    </div>
  )
}
