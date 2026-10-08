# SafeCore — Web de administración

Frontend (SPA) de SafeCore, plataforma IoT de protección sísmica y contra incendios. Es solo para administradores; propietarios y residentes usan la app móvil.

**Tecnologías:** Vue 3 · TypeScript · Vite · Vue Router · Tailwind CSS 4 · Lucide · pnpm

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck (vue-tsc) + build de producción
```

No hace falta configurar nada: en desarrollo, las llamadas a `/api` se reenvían al backend de Render mediante un proxy de Vite.

## ¿Qué usa el backend y qué son datos de ejemplo?

Backend: https://backend-safecore.onrender.com/swagger/index.html

| Módulo | Origen | Endpoints del backend | Qué falta |
| ------ | ------ | --------------------- | --------- |
| **Sensores IoT** | Backend | `Devices`, `SensorReadings` | Ubicación, nodo y umbrales (no existen en el backend): quedan "Sin asignar". El botón "Probar" se oculta. |
| **Alertas** | Backend | `RiskSituations` | Ubicación, dispositivo y descripción de la alerta. |
| **Usuarios** | Backend | `Users` | Rol (el backend no lo maneja): se muestra "Sin rol definido". |
| **Panel principal** | Backend | Se arma con sensores y alertas | La tarjeta "Estado por ubicación" no se muestra. |
| **Inicio de sesión** | Datos de ejemplo | — (`AuthController` está vacío) | Cualquier correo y contraseña ingresan como administrador. |
| **Ubicaciones** | Datos de ejemplo | — | El backend no tiene inmuebles, zonas ni nodos. |
| **Analítica** | Datos de ejemplo | — | Sin endpoints. |
| **Configuración** | Datos de ejemplo | — | `SystemConfigurations` no cubre estas opciones. |

Las pantallas con datos de ejemplo muestran la insignia **"Datos de ejemplo"** junto al título. Esos datos viven solo en memoria: los cambios se pierden al recargar.

Para trabajar sin conexión al backend: crear un `.env` con `VITE_USE_MOCKS=true`, que fuerza todos los módulos a datos de ejemplo.

## Cómo conectar un módulo nuevo

1. Cambiar su origen en `src/lib/data-sources.ts` (`"mock"` → `api()`).
2. En su servicio (`src/app/<modulo>/data/*.service.ts`) completar la rama real: cada función ya tiene su estructura y los datos de ejemplo siguen como respaldo.
3. Actualizar la tabla de arriba.

## Despliegue (Vercel)

`vercel.json` reenvía `/api/*` al backend (así no hace falta CORS) y redirige el resto de rutas a `index.html` para Vue Router. No requiere variables de entorno.

## Estructura

```
src/
├── lib/
│   ├── api.ts            cliente HTTP
│   ├── data-sources.ts   origen de datos por módulo (api / mock)
│   └── format.ts         fechas y textos
├── router/index.ts       rutas + guard (sesión y rol ADMIN)
├── styles/               Tailwind y colores (theme.css)
└── app/
    ├── auth/  dashboard/  ubicaciones/  sensores/
    ├── alertas/  analitica/  usuarios/  configuracion/
    │     ├── data/           servicio (backend + datos de ejemplo)
    │     └── presentation/   views, models, config y data de ejemplo
    └── shared/               layout, componentes UI y composables
```

## Notas sobre el backend actual

Mientras el backend siga así, el frontend se adapta de esta forma:

- `category`, `connectivityStatus`, `riskType`, `severity` y `status` son texto libre en el backend; el frontend entiende valores en español o inglés (por ejemplo `online`/`offline`, `active`/`resolved`).
- Todos los campos de los DTO son obligatorios (no vacíos).
- Al crear un usuario se envía `passwordHash: "pendiente-autenticacion"`, porque aún no hay login ni cifrado de contraseñas.
- Al resolver una alerta se envía `status: "resolved"`.
