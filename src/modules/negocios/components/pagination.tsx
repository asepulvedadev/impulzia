'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  basePath?: string
}

export function Pagination({ page, totalPages, basePath = '/explorar' }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(newPage))
    router.push(`${basePath}?${params.toString()}`)
  }

  // Generate page numbers to show
  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="outline" size="sm" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {start > 1 && (
        <>
          <Button variant="outline" size="sm" onClick={() => goToPage(1)}>
            1
          </Button>
          {start > 2 && <span className="px-1 text-muted">...</span>}
        </>
      )}

      {pages.map((p) => (
        <Button
          key={p}
          variant={p === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => goToPage(p)}
          className={cn(p === page && 'pointer-events-none')}
        >
          {p}
        </Button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-muted">...</span>}
          <Button variant="outline" size="sm" onClick={() => goToPage(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => goToPage(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
