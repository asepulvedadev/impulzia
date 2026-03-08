// Hook: PreToolUse(Write)
// Bloquea escritura de código de producción en src/ si no existe un test correspondiente.
//
// Lee de stdin el evento JSON de Claude Code y valida que si se escribe
// en src/modules/**, exista un archivo de test correspondiente en tests/.

import { readFileSync, existsSync } from 'fs'
import { basename } from 'path'

const input = readFileSync('/dev/stdin', 'utf-8')
const evento = JSON.parse(input)

const rutaArchivo = evento.tool_input?.file_path || ''

// Solo aplicar a archivos .ts/.tsx dentro de src/modules/
if (
  !rutaArchivo.includes('src/modules/') ||
  (!rutaArchivo.endsWith('.ts') && !rutaArchivo.endsWith('.tsx'))
) {
  // No aplica — permitir
  console.log(JSON.stringify({ decision: 'approve' }))
  process.exit(0)
}

// Ignorar archivos de tipos/interfaces y validaciones (no requieren test propio)
const nombre = basename(rutaArchivo)
if (rutaArchivo.includes('/interfaces/') || nombre.endsWith('.d.ts') || nombre === 'index.ts') {
  console.log(JSON.stringify({ decision: 'approve' }))
  process.exit(0)
}

// Buscar test correspondiente
const nombreBase = nombre.replace(/\.tsx?$/, '')
const posiblesTests = [
  `tests/unit/${nombreBase}.test.ts`,
  `tests/unit/${nombreBase}.test.tsx`,
  `tests/integration/${nombreBase}.test.ts`,
  `tests/integration/${nombreBase}.test.tsx`,
]

const tieneTest = posiblesTests.some((ruta) => existsSync(ruta))

if (!tieneTest) {
  console.log(
    JSON.stringify({
      decision: 'block',
      reason: `TDD: Debes crear el test primero. Esperado en: ${posiblesTests[0]}`,
    }),
  )
} else {
  console.log(JSON.stringify({ decision: 'approve' }))
}
