import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs, so the same build runs from a domain root, from a
  // /project/ subpath on GitHub Pages, or anywhere else -- the host does not
  // have to be decided before the app is built. The service worker registration
  // in main.tsx resolves against the document for the same reason.
  base: './',
  plugins: [react()],
})
