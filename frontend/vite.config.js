import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    // Temporarily disable Fast Refresh to avoid HMR export-consistency checks
    react({ fastRefresh: false }),
    tailwindcss()
  ],
})
