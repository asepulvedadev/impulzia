'use client'

import * as React from 'react'
import { Copy, CheckCheck, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { QRService } from '../services/qr.service'

interface RedemptionQRProps {
  token: string
  incentiveTitle: string
  expiresAt: string
}

export function RedemptionQR({ token, incentiveTitle, expiresAt }: RedemptionQRProps) {
  const [copied, setCopied] = React.useState(false)
  const qrDataUrl = React.useMemo(() => QRService.generateDataUrl(token, { size: 200 }), [token])

  // Snapshot render time once so we don't call impure Date.now() inside useMemo
  const [renderTime] = React.useState<number>(() => Date.now())

  const { isExpired, timeLeft } = React.useMemo(() => {
    const expiresMs = new Date(expiresAt).getTime()
    const diff = expiresMs - renderTime
    if (diff <= 0) return { isExpired: true, timeLeft: 'Expirado' }
    const hours = Math.floor(diff / 3_600_000)
    const mins = Math.floor((diff % 3_600_000) / 60_000)
    const tl = hours > 0 ? `${hours}h ${mins}m` : `${mins} minutos`
    return { isExpired: false, timeLeft: tl }
  }, [expiresAt, renderTime])

  async function handleCopy() {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-5 flex flex-col items-center gap-4 max-w-xs mx-auto">
      <div className="text-center">
        <p className="text-sm text-muted">Tu código para</p>
        <p className="font-bold text-white">{incentiveTitle}</p>
      </div>

      {/* QR code */}
      <div className={`p-3 bg-white rounded-xl ${isExpired ? 'opacity-40 grayscale' : ''}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt={`QR ${token}`} width={160} height={160} />
      </div>

      {/* Token */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-2xl font-bold tracking-widest text-white">{token}</span>
        <button
          onClick={handleCopy}
          className="text-muted hover:text-white transition-colors"
          aria-label="Copiar código"
        >
          {copied ? (
            <CheckCheck size={16} className="text-brand-success-400" />
          ) : (
            <Copy size={16} />
          )}
        </button>
      </div>

      {/* Expiry */}
      <div
        className={`flex items-center gap-1.5 text-sm ${isExpired ? 'text-brand-error-400' : 'text-muted'}`}
      >
        <Clock size={14} />
        <span>{isExpired ? 'Este código ha expirado' : `Válido por: ${timeLeft}`}</span>
      </div>

      <p className="text-xs text-muted text-center">
        Muestra este QR al negocio para validar tu descuento
      </p>
    </Card>
  )
}
