import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // React + CodeMirror land around 700 kB minified (~235 kB gzipped); fine for this app.
  build: { chunkSizeWarningLimit: 1000 },
  server: {
    // Forward API calls to the FastAPI dev server, so no CORS setup is needed.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
