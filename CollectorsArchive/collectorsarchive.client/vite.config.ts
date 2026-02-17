import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import mkcert from "vite-plugin-mkcert"

// https://vite.dev/config/
export default defineConfig({
	server: {
		host: true,
	},
	plugins: [
		react(),
		mkcert(), // Enables HTTPS locally
	],
})
