import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import mkcert from "vite-plugin-mkcert"

export default defineConfig({
  server: {
    host: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7053', //launchSettings.json
        changeOrigin: true,
        secure: false, // Vital: ignores SSL certificate issues during local dev
      },
    },
  },
  plugins: [
    react(),
    mkcert(),
  ],
})
