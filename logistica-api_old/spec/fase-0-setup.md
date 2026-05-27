# Spec: Fase 0 — Setup del proyecto

## Requisitos
- Split de settings en base/development/production
- Variables de entorno vía python-decouple + `.env`
- Instalar dependencias nuevas (simplejwt, cors-headers, django-filter, drf-spectacular)
- Configurar INSTALLED_APPS, DRF, JWT, drf-spectacular
- Definir URLs base del proyecto (/api/v1/auth/, /api/v1/schema/, /api/v1/docs/)

## Tareas

### Dependencia: Tareas 1→3→4→5→6→7→8 (orden secuencial)

1. [ ] **Tarea 1: Crear carpeta `config/settings/` y archivo base**
   - Archivos: `config/settings/__init__.py`, `config/settings/base.py`
   - Crear `config/settings/__init__.py` vacío
   - Mover todo el contenido actual de `config/settings.py` a `config/settings/base.py`
   - En `base.py`, cambiar `SECRET_KEY` para leer desde `decouple.config('SECRET_KEY')`
   - En `base.py`, cambiar `DEBUG` para leer desde `decouple.config('DEBUG', default=False, cast=bool)`
   - Dejar `DATABASES` solo con un placeholder (será sobreescrito por cada entorno)
   - Mantener `INSTALLED_APPS` base (Django contrib apps) en `base.py`
   - Las apps de terceros y locales se agregarán en Tarea 4

2. [ ] **Tarea 2: Crear archivo `.env`**
   - Archivos: `.env`
   - Contenido:
     ```
     SECRET_KEY=django-insecure-=n2c$p9qbbzok1pa9jm61)8v2by#j4s5_1dg8nxnlr)y(d+(6&
     DEBUG=True
     DATABASE_URL=sqlite:///db.sqlite3
     ```
   - Agregar `.env` a `.gitignore` (crear `.gitignore` si no existe)
   - **Nota**: El `SECRET_KEY` actual debe copiarse desde `base.py` para mantener consistencia

3. [ ] **Tarea 3: Crear `config/settings/development.py`**
   - Archivos: `config/settings/development.py`
   - Heredar de `base.py`: `from .base import *`
   - `DEBUG = True`
   - `ALLOWED_HOSTS = ['*']`
   - Base de datos SQLite3 (misma config que la original)
   - Leer `SECRET_KEY` y `DEBUG` desde `.env` (ya resuelto en base.py)

4. [ ] **Tarea 4: Crear `config/settings/production.py`**
   - Archivos: `config/settings/production.py`
   - Heredar de `base.py`: `from .base import *`
   - `DEBUG = False`
   - `ALLOWED_HOSTS` leer desde variable de entorno con `decouple.config('ALLOWED_HOSTS', default='.localhost')`
   - Base de datos PostgreSQL vía `dj_database_url` (instalar `dj-database-url` o parsear manual DATABASE_URL)
   - `SECRET_KEY` debe estar en `.env` o variable de entorno en producción

5. [ ] **Tarea 5: Instalar nuevas dependencias**
   - Archivos: `requirements.tx`
   - Agregar al archivo:
     ```
     djangorestframework-simplejwt==5.6.0
     django-cors-headers==4.7.0
     django-filter==25.1
     drf-spectacular==0.28.0
     dj-database-url==2.3.0
     ```
   - Ejecutar `.venv\Scripts\Activate.ps1` y luego `pip install -r requirements.tx`
   - **Nota**: Verificar versiones compatibles con Django 6.0.5 al momento de instalar

6. [ ] **Tarea 6: Actualizar `manage.py`, `wsgi.py` y `asgi.py` para apuntar a settings por entorno**
   - Archivos: `manage.py`, `config/wsgi.py`, `config/asgi.py`
   - En los 3 archivos, cambiar:
     ```python
     os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
     ```
     por:
     ```python
     from decouple import config
     DJANGO_SETTINGS_MODULE = config('DJANGO_SETTINGS_MODULE', default='config.settings.development')
     os.environ.setdefault('DJANGO_SETTINGS_MODULE', DJANGO_SETTINGS_MODULE)
     ```
   - **Nota**: Esto permite que en producción se setee `DJANGO_SETTINGS_MODULE=config.settings.production` como variable de entorno

7. [ ] **Tarea 7: Configurar `INSTALLED_APPS` — apps de terceros y locales**
   - Archivos: `config/settings/base.py` (o `development.py` si se prefiere mantener base limpia)
   - Agregar al final de `INSTALLED_APPS`:
     ```python
     # Third party apps
     'rest_framework',
     'corsheaders',
     'django_filters',
     'drf_spectacular',

     # Local apps
     'products',
     ```
   - **Decisión de diseño**: Poner estas apps en `base.py` para que estén disponibles tanto en development como production.
     Si alguna app solo debe estar en development (ej: `drf_spectacular`), moverla a `development.py`.
   - **Nota**: Registrar `products` en `INSTALLED_APPS` — esto requiere que la app tenga `apps.py` con `ProductsConfig` (o el nombre por defecto).

8. [ ] **Tarea 8: Agregar `CorsMiddleware` al MIDDLEWARE**
   - Archivos: `config/settings/base.py`
   - Agregar `'corsheaders.middleware.CorsMiddleware'` al inicio de `MIDDLEWARE` (antes de `CommonMiddleware`)
   - Agregar `CORS_ALLOW_ALL_ORIGINS = True` (solo dev) o configurar `CORS_ALLOWED_ORIGINS`

9. [ ] **Tarea 9: Configurar DRF en settings**
   - Archivos: `config/settings/base.py` (o `development.py`)
   - Agregar bloque `REST_FRAMEWORK`:
     ```python
     REST_FRAMEWORK = {
         'DEFAULT_AUTHENTICATION_CLASSES': (
             'rest_framework_simplejwt.authentication.JWTAuthentication',
         ),
         'DEFAULT_PERMISSION_CLASSES': (
             'rest_framework.permissions.IsAuthenticated',
         ),
         'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
         'PAGE_SIZE': 20,
         'DEFAULT_FILTER_BACKENDS': (
             'django_filters.rest_framework.DjangoFilterBackend',
         ),
         'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
     }
     ```

10. [ ] **Tarea 10: Configurar SIMPLE_JWT**
    - Archivos: `config/settings/base.py`
    - Agregar bloque `SIMPLE_JWT`:
      ```python
      from datetime import timedelta

      SIMPLE_JWT = {
          'ACCESS_TOKEN_LIFETIME': timedelta(minutes=30),
          'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
          'AUTH_HEADER_TYPES': ('Bearer',),
      }
      ```

11. [ ] **Tarea 11: Configurar drf-spectacular**
    - Archivos: `config/settings/base.py`
    - Agregar bloque `SPECTACULAR_SETTINGS`:
      ```python
      SPECTACULAR_SETTINGS = {
          'TITLE': 'Logística API',
          'VERSION': '1.0.0',
          'DESCRIPTION': 'API de gestión logística',
      }
      ```

12. [ ] **Tarea 12: Configurar URLs del proyecto**
    - Archivos: `config/urls.py`
    - Agregar imports:
      ```python
      from django.urls import path, include
      from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
      from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
      ```
    - Agregar urlpatterns:
      ```python
      path('api/v1/auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
      path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
      path('api/v1/schema/', SpectacularAPIView.as_view(), name='schema'),
      path('api/v1/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
      ```
    - Mantener `path('admin/', admin.site.urls)`

13. [ ] **Tarea 13: Verificar que el proyecto arranca**
    - Ejecutar `.venv\Scripts\Activate.ps1`
    - Ejecutar `python manage.py check` — sin errores
    - Ejecutar `python manage.py makemigrations` -> luego `python manage.py migrate` — migraciones OK
    - Arrancar servidor manual (no automatizar) y verificar:
      - `GET /api/v1/schema/` devuelve schema OpenAPI
      - `GET /api/v1/docs/` muestra Swagger UI
      - `POST /api/v1/auth/token/` funciona con credenciales

## Notas técnicas
- `dj-database-url` no está instalado aún — agregar a requirements.tx para facilitar parseo de `DATABASE_URL` en producción
- El split de settings sigue el patrón estándar de Django de múltiples archivos de settings
- `drf-spectacular` reemplaza a `coreapi` (deprecado) como generador de esquemas OpenAPI
- JWT usa `rest_framework_simplejwt` que es la librería estándar para DRF + JWT
- No olvidar agregar `.env` a `.gitignore` para no exponer secretos
- Si se usa `python manage.py check --deploy` en producción, ajustar settings adicionales (SECURE_SSL_REDIRECT, etc.)

## Dependencias entre tareas
| Tarea | Depende de |
|-------|-----------|
| 1 (carpeta settings) | — |
| 2 (.env) | — |
| 3 (development.py) | 1 |
| 4 (production.py) | 1 |
| 5 (dependencias) | — |
| 6 (manage/wsgi/asgi) | 1 |
| 7 (INSTALLED_APPS) | 1, 5 |
| 8 (CORS middleware) | 5, 7 |
| 9 (DRF config) | 5, 7 |
| 10 (JWT config) | 5, 9 |
| 11 (Spectacular config) | 5, 9 |
| 12 (URLs) | 7, 9, 10, 11 |
| 13 (verificar) | 6, 12 |

Orden de ejecución sugerido: 1 → 2 → (3,4) → 5 → 6 → 7 → 8 → 9 → (10,11) → 12 → 13
