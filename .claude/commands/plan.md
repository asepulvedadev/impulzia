# Planificación de Feature

Actúa como arquitecto de software. Analiza el requerimiento proporcionado y genera un plan de implementación detallado.

## Pasos

1. Lee el AGENTS.md del módulo involucrado
2. Identifica las tablas, tipos y validaciones necesarias
3. Define los casos de uso con sus inputs/outputs
4. Lista los archivos a crear/modificar
5. Identifica dependencias entre módulos
6. Define criterios de aceptación

## Output esperado

- Plan estructurado con pasos numerados
- Archivos a crear con sus rutas completas
- Esquemas de datos (tablas, tipos Zod)
- Tests que deben pasar antes de considerar la feature completa

## Reglas

- Seguir la estructura DDD: src/modules/{modulo}/{capa}/
- Considerar RLS para todas las tablas
- Incluir validaciones Zod para todos los inputs
- Planificar tests unitarios y de integración

$ARGUMENTS
