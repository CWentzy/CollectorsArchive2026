import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import mkcert from "vite-plugin-mkcert"

// https://vite.dev/config/
export default defineConfig({
	server: {
		host: true,
		proxy: {
			// Forward all /api requests to the .NET backend
			"/api": {
				// From "profiles.http.applicationUrl" CollectorsArchive.Server/Properties/launchSettings.json
				target: "http://localhost:5190",
				changeOrigin: true,
				secure: false,
			},
		},
	},
	plugins: [
		react(),
		mkcert(), // Enables HTTPS locally
	],
})
