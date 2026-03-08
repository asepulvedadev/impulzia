/**
 * QRService — client-side QR code generation using the Canvas API.
 * No external dependencies — uses a minimal QR encoding approach
 * via a data URL built from the redemption token.
 *
 * For a real app, integrate qrcode.js or react-qr-code.
 * This service wraps the public API so the component stays decoupled.
 */

export interface QROptions {
  size?: number
  foreground?: string
  background?: string
}

export class QRService {
  /**
   * Generates a QR-like data URL for the given token.
   * In production, replace body with real QR library call.
   */
  static generateDataUrl(token: string, options: QROptions = {}): string {
    const { size = 200, foreground = '#000000', background = '#FFFFFF' } = options

    // Build a URL that the validation scanner will read
    const content = `IMPULZIA:${token}`

    // Return a placeholder SVG that encodes the token visually
    // (replace with qrcode library in production)
    const svgContent = QRService.buildSvgPlaceholder(content, size, foreground, background)
    return `data:image/svg+xml;base64,${btoa(svgContent)}`
  }

  /**
   * Extracts the token from a scanned QR content string.
   * Returns null if the format is invalid.
   */
  static parseScannedContent(scanned: string): string | null {
    const prefix = 'IMPULZIA:'
    if (!scanned.startsWith(prefix)) return null
    const token = scanned.slice(prefix.length).trim()
    if (!/^[A-Z0-9]{8}$/.test(token)) return null
    return token
  }

  /**
   * Validates that a token string matches the expected format.
   */
  static isValidToken(token: string): boolean {
    return /^[A-Z0-9]{8}$/.test(token)
  }

  private static buildSvgPlaceholder(
    content: string,
    size: number,
    fg: string,
    bg: string,
  ): string {
    // Deterministic pattern based on content hash for visual variety
    const hash = content.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const cells = 21 // QR code minimum is 21x21
    const cellSize = size / cells
    const innerCells: string[] = []

    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        // Fixed finder patterns (top-left, top-right, bottom-left)
        const isFinder =
          (row < 7 && col < 7) || (row < 7 && col >= cells - 7) || (row >= cells - 7 && col < 7)
        // Data cells — pseudo-random from hash
        const isData = !isFinder && (hash * (row + 1) * (col + 1)) % 3 === 0

        if (isFinder || isData) {
          innerCells.push(
            `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${fg}" />`,
          )
        }
      }
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${bg}"/>
  ${innerCells.join('\n  ')}
  <text x="${size / 2}" y="${size + 14}" text-anchor="middle" font-size="10" fill="${fg}" font-family="monospace">${content.replace('IMPULZIA:', '')}</text>
</svg>`
  }
}
