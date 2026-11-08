# SafeCore — Web de administración

Frontend (SPA) de SafeCore, plataforma IoT de protección sísmica y contra incendios. Es solo para administradores. Los operadores, responsables de seguridad y residentes usan la app móvil.

**Tecnologías:** Vue 3 · TypeScript · Vite · Vue Router · Tailwind CSS 4 · Lucide · pnpm

## Cómo ejecutarlo

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # typecheck (vue-tsc) + build de producción
```

En desarrollo, las llamadas a `/api` se reenvían al backend de Render mediante un proxy de Vite. Para entrar se necesita un usuario administrador del backend.

## Módulos y endpoints

| Módulo | Endpoints del backend |
| ------ | --------------------- |
| **Inicio de sesión** | `/api/iam/auth/login`, `/api/iam/auth/change-password` |
| **Panel principal** | Se arma con nodos, alertas y ubicaciones |
| **Ubicaciones** | `/api/properties`, `/api/zones` |
| **Nodos** | `/api/devices` (componentes, zona, secreto y pruebas), `/api/SensorReadings` |
| **Alertas** | `/api/RiskSituations` |
| **Analítica** | `/api/analytics/summary`, `/trends`, `/reports` |
| **Usuarios** | `/api/users` (asignaciones y restablecer contraseña) |
| **Configuración** | `/api/settings`, `/api/settings/thresholds` |

Para trabajar sin conexión al backend: crear un `.env` con `VITE_USE_MOCKS=true`, que usa datos de ejemplo guardados en memoria (los cambios se pierden al recargar).

## Sesión y roles

- El login devuelve un token que dura 15 minutos; al vencer, la web vuelve al login.
- Solo entra el rol `Administrator`. Los demás roles reciben un aviso para usar la app móvil.
- Si un administrador restablece la contraseña de otro, este debe cambiarla al iniciar sesión antes de continuar.
- Desde Usuarios, el administrador crea cuentas con los roles `Administrator`, `Operator`, `Responder` y `Resident`, y asigna a cada una los inmuebles y zonas que puede ver.

## Modelo de nodos

Un **nodo** es el controlador (ESP32) instalado en una zona de un inmueble, con sus sensores (temperatura, humo y gas, movimiento) y sus actuadores (luces LED, sonido, servomotor de puerta). En el backend es un `Device`: se registra con su número de serie y el backend entrega un secreto, que se muestra una sola vez, para que el nodo se conecte.

Cada sensor y actuador es un componente con su propio estado (operativo, con falla, desconectado, en mantenimiento o deshabilitado). Desde el detalle del nodo se agregan, editan y eliminan componentes, y se prueban los actuadores.

## Despliegue (Vercel)

`vercel.json` reenvía `/api/*` al backend (así no hace falta CORS) y redirige el resto de rutas a `index.html` para Vue Router. No requiere variables de entorno.

## Estructura

```
src/
├── lib/
│   ├── api.ts            cliente HTTP y sesión
│   ├── data-sources.ts   origen de datos por módulo (api / mock)
│   ├── format.ts         fechas y textos
│   └── messages.ts       mensajes de error del backend en español
├── router/index.ts       rutas + guard (sesión, rol administrador y cambio de contraseña)
├── styles/               Tailwind y colores (theme.css)
└── app/
    ├── auth/  dashboard/  ubicaciones/  nodos/
    ├── alertas/  analitica/  usuarios/  configuracion/
    │     ├── data/           servicio (backend + datos de ejemplo)
    │     └── presentation/   views, models, config y data de ejemplo
    └── shared/               layout, componentes UI y composables
```
