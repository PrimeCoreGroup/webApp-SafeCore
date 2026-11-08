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
      path: "/cambiar-contrasena",
      name: "cambiar-contrasena",
      component: () => import("@/app/auth/presentation/views/cambiar-contrasena/CambiarContrasenaPage.vue"),
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
          path: "ubicaciones/nuevo",
          name: "inmueble-nuevo",
          component: () => import("@/app/ubicaciones/presentation/views/inmueble-form/InmuebleFormPage.vue"),
          meta: { title: "Agregar inmueble" },
        },
        {
          path: "ubicaciones/:inmuebleId/editar",
          name: "inmueble-editar",
          component: () => import("@/app/ubicaciones/presentation/views/inmueble-form/InmuebleFormPage.vue"),
          meta: { title: "Editar inmueble" },
        },
        {
          path: "ubicaciones/:inmuebleId/zonas/nueva",
          name: "zona-nueva",
          component: () => import("@/app/ubicaciones/presentation/views/zona-form/ZonaFormPage.vue"),
          meta: { title: "Agregar zona" },
        },
        {
          path: "ubicaciones/:inmuebleId/zonas/:zonaId/editar",
          name: "zona-editar",
          component: () => import("@/app/ubicaciones/presentation/views/zona-form/ZonaFormPage.vue"),
          meta: { title: "Editar zona" },
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
          path: "nodos",
          name: "nodos",
          component: () => import("@/app/nodos/presentation/views/nodos/NodosPage.vue"),
          meta: { title: "Nodos" },
        },
        {
          path: "nodos/nuevo",
          name: "nodo-nuevo",
          component: () => import("@/app/nodos/presentation/views/nodo-form/NodoFormPage.vue"),
          meta: { title: "Registrar nodo" },
        },
        {
          path: "nodos/:id",
          name: "nodo-detalle",
          component: () => import("@/app/nodos/presentation/views/nodo-detalle/NodoDetallePage.vue"),
          meta: { title: "Detalle del nodo" },
        },
        {
          path: "nodos/:id/editar",
          name: "nodo-editar",
          component: () => import("@/app/nodos/presentation/views/nodo-form/NodoFormPage.vue"),
          meta: { title: "Editar nodo" },
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
  const user = getUser();
  const isPublic = to.meta.public === true;

  // Sin sesión solo accede a rutas públicas
  if (!token && !isPublic) return "/login";

  // Solo administradores
  if (token && !isPublic && !user?.roles.includes("Administrator")) return "/login";

  // Tras un restablecimiento solo puede cambiar su contraseña
  if (token && user?.mustChangePassword && to.name !== "cambiar-contrasena") return "/cambiar-contrasena";

  // Con sesión no vuelve al login
  if (token && isPublic && user?.roles.includes("Administrator")) {
    return user.mustChangePassword ? "/cambiar-contrasena" : "/dashboard";
  }
});

export default router;
