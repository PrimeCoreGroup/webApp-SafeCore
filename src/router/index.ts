import { createRouter, createWebHistory } from "vue-router";
import AppShell from "@/app/shared/presentation/components/AppShell.vue";
import { getToken, getUser } from "@/lib/api";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/app/auth/presentation/views/login/LoginPage.vue"),
      meta: { public: true },
    },
    {
      path: "/",
      component: AppShell,
      redirect: "/dashboard",
      children: [
        {
          path: "dashboard",
          name: "dashboard",
          component: () => import("@/app/dashboard/presentation/views/dashboard/DashboardPage.vue"),
          meta: { title: "Panel principal" },
        },
        {
          path: "ubicaciones",
          name: "ubicaciones",
          component: () => import("@/app/ubicaciones/presentation/views/ubicaciones/UbicacionesPage.vue"),
          meta: { title: "Ubicaciones" },
        },
        {
          path: "ubicaciones/:inmuebleId",
          name: "inmueble-detalle",
          component: () => import("@/app/ubicaciones/presentation/views/inmueble-detalle/InmuebleDetallePage.vue"),
          meta: { title: "Inmueble" },
        },
        {
          path: "ubicaciones/:inmuebleId/zonas/:zonaId",
          name: "zona-detalle",
          component: () => import("@/app/ubicaciones/presentation/views/zona-detalle/ZonaDetallePage.vue"),
          meta: { title: "Zona" },
        },
        {
          path: "sensores",
          name: "sensores",
          component: () => import("@/app/sensores/presentation/views/sensores/SensoresPage.vue"),
          meta: { title: "Sensores IoT" },
        },
        {
          path: "sensores/nuevo",
          name: "sensor-nuevo",
          component: () => import("@/app/sensores/presentation/views/sensor-form/SensorFormPage.vue"),
          meta: { title: "Registrar sensor" },
        },
        {
          path: "sensores/:id",
          name: "sensor-detalle",
          component: () => import("@/app/sensores/presentation/views/sensor-detalle/SensorDetallePage.vue"),
          meta: { title: "Detalle del sensor" },
        },
        {
          path: "sensores/:id/editar",
          name: "sensor-editar",
          component: () => import("@/app/sensores/presentation/views/sensor-form/SensorFormPage.vue"),
          meta: { title: "Editar sensor" },
        },
        {
          path: "alertas",
          name: "alertas",
          component: () => import("@/app/alertas/presentation/views/alertas/AlertasPage.vue"),
          meta: { title: "Alertas" },
        },
        {
          path: "alertas/:id",
          name: "alerta-detalle",
          component: () => import("@/app/alertas/presentation/views/alerta-detalle/AlertaDetallePage.vue"),
          meta: { title: "Detalles de alerta" },
        },
        {
          path: "alertas/:id/resuelta",
          name: "alerta-resuelta",
          component: () => import("@/app/alertas/presentation/views/alerta-resuelta/AlertaResueltaPage.vue"),
          meta: { title: "Alerta resuelta" },
        },
        {
          path: "analitica",
          name: "analitica",
          component: () => import("@/app/analitica/presentation/views/analitica/AnaliticaPage.vue"),
          meta: { title: "Analítica" },
        },
        {
          path: "analitica/reportes",
          name: "reportes",
          component: () => import("@/app/analitica/presentation/views/reportes/ReportesPage.vue"),
          meta: { title: "Reportes" },
        },
        {
          path: "analitica/tendencias",
          name: "tendencias",
          component: () => import("@/app/analitica/presentation/views/tendencias/TendenciasPage.vue"),
          meta: { title: "Tendencias" },
        },
        {
          path: "usuarios",
          name: "usuarios",
          component: () => import("@/app/usuarios/presentation/views/usuarios/UsuariosPage.vue"),
          meta: { title: "Usuarios" },
        },
        {
          path: "usuarios/nuevo",
          name: "usuario-nuevo",
          component: () => import("@/app/usuarios/presentation/views/usuario-form/UsuarioFormPage.vue"),
          meta: { title: "Agregar usuario" },
        },
        {
          path: "usuarios/:id/editar",
          name: "usuario-editar",
          component: () => import("@/app/usuarios/presentation/views/usuario-form/UsuarioFormPage.vue"),
          meta: { title: "Editar usuario" },
        },
        {
          path: "configuracion",
          name: "configuracion",
          component: () => import("@/app/configuracion/presentation/views/configuracion/ConfiguracionPage.vue"),
          meta: { title: "Configuración" },
        },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/dashboard" },
  ],
});

router.beforeEach((to) => {
  const token = getToken();
  const isPublic = to.meta.public === true;

  // Sin sesión → solo puede entrar a rutas públicas
  if (!token && !isPublic) return "/login";

  // La web es solo para administradores; el resto de roles usa la app móvil
  if (token && !isPublic && getUser()?.role !== "ADMIN") return "/login";

  // Con sesión → no puede volver al login con el botón atrás
  if (token && isPublic && getUser()?.role === "ADMIN") return "/dashboard";
});

export default router;
