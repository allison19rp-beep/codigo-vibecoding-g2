# logistica-api

Django 6.0.5 + DRF 3.17.1 project. Early stage — `products` app is scaffold-only (no models, views, tests, or URL routes).

## Metodología

Este proyecto usa **SDD (Spec Driven Development)** — ver `SDD.md`.

El flujo es gestionado por el agente **orquestador** (`.opencode/agents/orquestador.md`), que es el agente primario por defecto. Siempre que llegue un requerimiento nuevo, el orquestador ejecutará:

1. **@spect** — analiza requirements y genera specs en `spec/`
2. **Revisión humana** — el usuario aprueba o solicita cambios al spec
3. **@implement** — implementa los specs en código
4. **@validator** — valida que el código cumpla el spec

## Agents disponibles

| Agent | Archivo | Rol |
|-------|---------|-----|
| `orquestador` | `.opencode/agents/orquestador.md` | Primary — gestiona el flujo SDD |
| `@spect` | `.opencode/agents/spect.md` | Subagent — genera specs |
| `@implement` | `.opencode/agents/implement.md` | Subagent — escribe código |
| `@validator` | `.opencode/agents/validator.md` | Subagent — valida resultados |

## Rules

- Siempre activar el entorno virtual antes de ejecutar cualquier comando del proyecto: `.venv\Scripts\Activate.ps1`
- No ejecutar `python manage.py runserver` — ese comando es siempre manual
- El agente primario es **orquestador**. Si necesitas cambiar a otro agente, usa Tab.

## Commands

```powershell
# Activate venv
.venv\Scripts\Activate.ps1

# Install deps (note: file is requirements.tx, not .txt)
pip install -r requirements.tx

# Run dev server
python manage.py runserver

# Run tests
python manage.py test

# Make migrations (after adding models)
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser
```

## Project structure

- `config/settings.py` — Django settings (uses SQLite3 for dev; `psycopg2-binary` + `python-decouple` installed for future prod use)
- `config/urls.py` — only `/admin/` defined
- `products/` — single app, nothing wired yet

## Gotchas

- `requirements.tx` is intentionally named **`.tx`** not `.txt` — `pip install -r requirements.txt` will fail
- No `.gitignore` at root (add one before committing)
- No linter/formatter/typecheck config yet (none exists in repo)
- `products` app not registered in `INSTALLED_APPS` — add it when wiring up
- Settings use raw `SECRET_KEY` in plaintext; migrate to `python-decouple` before deploying
