'use client'

import * as React from 'react'
import { QrCode, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QRService } from '../services/qr.service'
import { confirmRedemptionAction } from '../actions/incentive.actions'
import type { Redemption } from '../interfaces'

type ScanState = 'idle' | 'loading' | 'success' | 'error'

interface ValidationScannerProps {
  onConfirmed?: (redemption: Redemption) => void
}

export function ValidationScanner({ onConfirmed }: ValidationScannerProps) {
  const [token, setToken] = React.useState('')
  const [state, setState] = React.useState<ScanState>('idle')
  const [message, setMessage] = React.useState('')
  const [confirmed, setConfirmed] = React.useState<Redemption | null>(null)

  async function handleValidate() {
    const normalizedToken = token.trim().toUpperCase()

    if (!QRService.isValidToken(normalizedToken)) {
      setState('error')
      setMessage('El código debe tener 8 caracteres alfanuméricos')
      return
    }

    setState('loading')
    const result = await confirmRedemptionAction(normalizedToken)

    if (result.success && result.data) {
      setState('success')
      setMessage('¡Canje confirmado exitosamente!')
      setConfirmed(result.data)
      onConfirmed?.(result.data)
      setToken('')
    } else {
      setState('error')
      setMessage(result.error ?? 'Error al validar el código')
    }
  }

  function handleReset() {
    setState('idle')
    setMessage('')
    setConfirmed(null)
    setToken('')
  }

  return (
    <Card className="p-5 space-y-4 max-w-sm mx-auto">
      <div className="flex items-center gap-2 text-white font-bold">
        <QrCode size={20} className="text-brand-primary-400" />
        <span>Validar Canje</span>
      </div>

      {state === 'success' ? (
        <div className="text-center space-y-3">
          <CheckCircle2 size={48} className="mx-auto text-brand-success-400" />
          <p className="text-white font-semibold">{message}</p>
          {confirmed && (
            <p className="text-xs text-muted">
              Confirmado el{' '}
              {new Date(confirmed.confirmed_at ?? confirmed.created_at).toLocaleString('es-CO')}
            </p>
          )}
          <Button variant="outline" size="sm" onClick={handleReset}>
            Validar otro código
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm text-muted">Ingresa el código del cliente</label>
            <Input
              value={token}
              onChange={(e) => {
                setToken(e.target.value.toUpperCase())
                if (state === 'error') setState('idle')
              }}
              placeholder="ABCD1234"
              maxLength={8}
              className="font-mono text-center text-lg tracking-widest uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
            />
            {state === 'error' && (
              <div className="flex items-center gap-1.5 text-xs text-brand-error-400">
                <XCircle size={13} />
                <span>{message}</span>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={handleValidate}
            disabled={token.length !== 8 || state === 'loading'}
          >
            {state === 'loading' ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Validando...
              </>
            ) : (
              'Confirmar canje'
            )}
          </Button>

          <p className="text-xs text-muted text-center">
            El cliente debe mostrar su código QR o decir los 8 caracteres
          </p>
        </>
      )}
    </Card>
  )
}
