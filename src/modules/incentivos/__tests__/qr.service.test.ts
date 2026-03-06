import { describe, it, expect } from 'vitest'
import { QRService } from '../services/qr.service'

describe('QRService.parseScannedContent', () => {
  it('extracts token from valid IMPULZIA prefix', () => {
    const token = QRService.parseScannedContent('IMPULZIA:AB3D5F7G')
    expect(token).toBe('AB3D5F7G')
  })

  it('returns null for invalid prefix', () => {
    expect(QRService.parseScannedContent('OTHER:AB3D5F7G')).toBeNull()
    expect(QRService.parseScannedContent('AB3D5F7G')).toBeNull()
  })

  it('returns null for invalid token format', () => {
    expect(QRService.parseScannedContent('IMPULZIA:ab3d5f7g')).toBeNull()
    expect(QRService.parseScannedContent('IMPULZIA:SHORT')).toBeNull()
    expect(QRService.parseScannedContent('IMPULZIA:TOOLONGG9')).toBeNull()
  })
})

describe('QRService.isValidToken', () => {
  it('validates 8-char uppercase alphanumeric tokens', () => {
    expect(QRService.isValidToken('AB3D5F7G')).toBe(true)
    expect(QRService.isValidToken('12345678')).toBe(true)
  })

  it('rejects invalid tokens', () => {
    expect(QRService.isValidToken('abc')).toBe(false)
    expect(QRService.isValidToken('AB3D5F7!')).toBe(false)
    expect(QRService.isValidToken('')).toBe(false)
  })
})

describe('QRService.generateDataUrl', () => {
  it('returns a data URL string', () => {
    const url = QRService.generateDataUrl('AB3D5F7G')
    expect(url).toMatch(/^data:image\/svg\+xml;base64,/)
  })

  it('generates different outputs for different tokens', () => {
    const url1 = QRService.generateDataUrl('AB3D5F7G')
    const url2 = QRService.generateDataUrl('XY9Z2W4Q')
    expect(url1).not.toBe(url2)
  })
})
