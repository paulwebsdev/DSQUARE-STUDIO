import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Actions provides this environment variable during Pages builds.
// Render uses the root path, so no Node type package is needed here.
declare const process: {
  env: Record<string, string | undefined>
}

const base = process.env.GITHUB_ACTIONS === 'true' ? '/DSQUARE-STUDIO/' : '/'

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
})
