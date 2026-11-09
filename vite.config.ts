import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves this project from a repository subpath.
// Other hosts such as Render serve it from the domain root.
const base = process.env.GITHUB_ACTIONS === 'true' ? '/DSQUARE-STUDIO/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
