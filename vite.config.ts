import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [vue(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Reenvía /api al backend en desarrollo (evita CORS)
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'https://backend-safecore.onrender.com',
          changeOrigin: true,
          secure: true,
        },
      },
    },
  }
})
