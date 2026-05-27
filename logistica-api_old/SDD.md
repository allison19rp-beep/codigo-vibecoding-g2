# SDD — Spec Driven Development

## Metodología

SDD (Spec Driven Development) es un flujo de trabajo donde primero se especifica qué debe hacer cada módulo, luego se implementa contra esa especificación, y finalmente se valida el resultado.

Cada **módulo** equivale a una **app de Django**. El flujo se repite por cada módulo.

## Flujo de trabajo

```
[Orquestador]
    │
    ├── 1. Spect ──► genera spec/ (tareas por módulo)
    │
    ├── 2. Revisión humana ◄── usuario aprueba o pide cambios
    │
    ├── 3. Implement ──► lee spec/ y escribe código
    │
    └── 4. Validator ──► revisa código vs spec, reporta errores
```

### Paso 1: Spect

- Lee los requerimientos del proyecto (`docs/`)
- Analiza la arquitectura y el schema de base de datos
- Crea un archivo `spec/<modulo>.md` por cada app de Django
- Cada spec contiene la lista exacta de tareas a implementar

### Paso 2: Revisión humana

- El orquestador presenta el spec generado al usuario
- El usuario puede aprobar o solicitar cambios
- Si hay cambios → se re-ejecuta Spect con el feedback
- Sin aprobación explícita no se avanza a Implement

### Paso 3: Implement

- Lee los archivos `spec/<modulo>.md`
- Implementa el código siguiendo:
  - Buenas prácticas de Django y Python
  - La arquitectura definida en `docs/`
  - El schema de base de datos en `docs/`
- No escribe tests en esta etapa
- Revisa el código existente antes de escribir

### Paso 4: Validator

- Revisa el código que Implement agregó al proyecto
- Verifica que cumpla con:
  - Los requerimientos del spec
  - La arquitectura del proyecto
  - El schema de base de datos
- Si encuentra errores → crea `spec/<modulo>-errores.md` con la lista
- Si no hay errores → responde con un mensaje de confirmación

### Orquestador

- No escribe código
- Ejecuta el flujo en orden: Spect → Revisión humana → Implement → Validator
- Si el usuario rechaza el spec, re-ejecuta Spect
- Si Validator reporta errores, re-ejecuta Implement con el feedback
- Repite hasta que Validator confirme que todo está correcto

## Estructura de carpetas

```
📁 proyecto/
├── docs/              ← arquitectura + schema BD
├── spec/              ← specs generados por Spect
├── .opencode/agents/  ← definiciones de agentes
└── <apps>/            ← código implementado
```
