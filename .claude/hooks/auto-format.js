// Hook: PostToolUse(Write)
// Auto-formatea archivos .ts/.tsx/.js/.jsx/.json/.css después de escribirlos.

import { readFileSync } from 'fs'
import { execSync } from 'child_process'

const input = readFileSync('/dev/stdin', 'utf-8')
const evento = JSON.parse(input)

const rutaArchivo = evento.tool_input?.file_path || ''

const extensionesFormateables = ['.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.md']
const debeFormatear = extensionesFormateables.some((ext) => rutaArchivo.endsWith(ext))

if (debeFormatear) {
  try {
    execSync(`bunx prettier --write "${rutaArchivo}"`, {
      stdio: 'pipe',
      timeout: 10000,
    })
  } catch {
    // Si prettier falla, no bloquear — solo loguear
    console.error(`auto-format: No se pudo formatear ${rutaArchivo}`)
  }
}
