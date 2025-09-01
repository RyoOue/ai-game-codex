import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages (project pages) で /ai-game-codex/ 配下に配置されるため
  base: '/ai-game-codex/',
})
