# Flujo TDD Estricto

Implementa la feature siguiendo TDD (Red-Green-Refactor) de forma estricta.

## Flujo obligatorio

### 1. RED — Escribir test que falla

- Crea el archivo de test en `tests/unit/` o `tests/integration/`
- Escribe el test que describe el comportamiento esperado
- Ejecuta `bun test` y confirma que FALLA

### 2. GREEN — Implementar mínimo para que pase

- Escribe el código mínimo necesario para que el test pase
- NO sobre-implementes, solo lo que el test requiere
- Ejecuta `bun test` y confirma que PASA

### 3. REFACTOR — Mejorar sin cambiar comportamiento

- Refactoriza el código manteniendo los tests verdes
- Aplica principios SOLID y Clean Code
- Ejecuta `bun test` y confirma que sigue PASANDO

## Reglas

- NUNCA escribas código de producción sin un test que falle primero
- Un ciclo por comportamiento/caso de uso
- Commits pequeños: test → implementación → refactor
- Usa `describe` y `it` en español para los tests

$ARGUMENTS
