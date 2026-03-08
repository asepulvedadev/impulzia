# Code Review

Realiza un code review exhaustivo de los cambios actuales.

## Pasos

1. Ejecuta `git diff --staged` o `git diff` para ver los cambios
2. Analiza cada archivo modificado

## Checklist de revisión

- [ ] **Tipos**: No hay `any`, todos los tipos son explícitos
- [ ] **Validación**: Server Actions usan Zod para validar inputs
- [ ] **Seguridad**: No se exponen keys sensibles, RLS considerado
- [ ] **Tests**: Cada función nueva tiene test correspondiente
- [ ] **Nombres**: Variables y funciones en español, descriptivas
- [ ] **Errores**: Manejo de errores adecuado, no se silencian
- [ ] **Performance**: No hay queries N+1, se usa cache donde aplica
- [ ] **Imports**: Sin imports circulares, paths con alias @/

## Output esperado

- Lista de issues encontrados con severidad (crítico/mayor/menor)
- Sugerencias de mejora concretas
- Veredicto: aprobar / solicitar cambios

$ARGUMENTS
