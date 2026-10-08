# SafeCore — Web de administración

Frontend (SPA) de SafeCore, plataforma IoT de protección sísmica y contra incendios. Es solo para administradores; propietarios y residentes usan la app móvil.

## Tecnologías
Vue 3 · TypeScript · Vite · Vue Router · Tailwind CSS 4 · Lucide · pnpm

## Comandos
```bash
pnpm install
pnpm dev        # servidor de desarrollo
pnpm build      # typecheck (vue-tsc) + build
```

## Backend y mocks
El backend aún no está disponible, así que los servicios (`src/app/*/data/*.service.ts`) devuelven datos mock desde `presentation/data/mock-*.ts`. Cada función tiene comentado el endpoint que consumirá.

Para conectar el backend real:
1. Copiar `.env.example` a `.env`.
2. Definir `VITE_API_BASE_URL` y poner `VITE_USE_MOCKS=false`.
3. Ajustar paths y DTO en cada servicio (están marcados con `TODO(backend)`).

## Estructura
```
src/
├── lib/api.ts              cliente fetch, token JWT y flag de mocks
├── router/index.ts         rutas + guard (sesión y rol ADMIN)
├── styles/                 Tailwind y tokens de color (theme.css)
└── app/
    ├── auth/  dashboard/  ubicaciones/  sensores/
    ├── alertas/  analitica/  usuarios/  configuracion/
    │     └── data/ (servicio HTTP) · presentation/ (views, components, models, config, data mock)
    └── shared/             AppShell, componentes UI, composables
```

## Modelo de ubicaciones
`Inmueble → Zona → Dispositivos`. Cada dispositivo pertenece además a un **Nodo Edge** (un inmueble puede tener varios); el nodo es un dato del dispositivo, no un nivel de navegación.
