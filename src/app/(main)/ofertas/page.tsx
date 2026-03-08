'use client'

import * as React from 'react'
import {
  IncentiveGrid,
  IncentiveGridSkeleton,
} from '@/modules/incentivos/components/incentive-grid'
import { IncentiveFilters } from '@/modules/incentivos/components/incentive-filters'
import { IncentiveDetailModal } from '@/modules/incentivos/components/incentive-detail-modal'
import { RedemptionQR } from '@/modules/incentivos/components/redemption-qr'
import {
  saveIncentiveAction,
  unsaveIncentiveAction,
  redeemIncentiveAction,
} from '@/modules/incentivos/actions/incentive.actions'
import type { IncentiveWithBusiness, RedeemResult } from '@/modules/incentivos/interfaces'

type IncentiveType = 'coupon' | 'combo' | 'reward'

export default function OfertasPage() {
  const [incentives, setIncentives] = React.useState<IncentiveWithBusiness[]>([])
  const [loading, setLoading] = React.useState(true)
  const [activeType, setActiveType] = React.useState<IncentiveType | undefined>()
  const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set())
  const [selected, setSelected] = React.useState<IncentiveWithBusiness | null>(null)
  const [redeeming, setRedeeming] = React.useState(false)
  const [redeemResult, setRedeemResult] = React.useState<RedeemResult | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)

    const params = new URLSearchParams({ city: 'Cúcuta', limit: '24' })
    if (activeType) params.set('type', activeType)

    fetch(`/api/incentives/active?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setIncentives(Array.isArray(data) ? data : [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [activeType])

  async function handleSave(id: string) {
    const isSaved = savedIds.has(id)
    setSavedIds((prev) => {
      const next = new Set(prev)
      isSaved ? next.delete(id) : next.add(id)
      return next
    })
    if (isSaved) {
      await unsaveIncentiveAction(id)
    } else {
      await saveIncentiveAction(id)
    }
  }

  async function handleRedeem(id: string) {
    const incentive = incentives.find((i) => i.id === id)
    if (incentive) setSelected(incentive)
  }

  async function handleConfirmRedeem(id: string) {
    setRedeeming(true)
    const result = await redeemIncentiveAction(id)
    setRedeeming(false)
    if (result.success && result.data) {
      setRedeemResult(result.data)
      setSelected(null)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Ofertas y Descuentos</h1>
          <p className="text-muted text-sm mt-1">Cupones, combos y premios de negocios locales</p>
        </div>

        <IncentiveFilters activeType={activeType} onTypeChange={setActiveType} />

        {loading ? (
          <IncentiveGridSkeleton count={12} />
        ) : (
          <IncentiveGrid
            incentives={incentives}
            savedIds={savedIds}
            onSave={handleSave}
            onRedeem={handleRedeem}
          />
        )}
      </div>

      {/* Detail modal */}
      <IncentiveDetailModal
        incentive={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onRedeem={handleConfirmRedeem}
        isRedeeming={redeeming}
      />

      {/* QR modal after redeem */}
      {redeemResult && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setRedeemResult(null)}
              className="absolute -top-10 right-0 text-white text-sm hover:underline"
            >
              Cerrar
            </button>
            <RedemptionQR
              token={redeemResult.token}
              incentiveTitle={redeemResult.incentive_title}
              expiresAt={redeemResult.expires_at}
            />
          </div>
        </div>
      )}
    </div>
  )
}
