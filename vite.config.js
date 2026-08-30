import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  base: '/estagios/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    svgr(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    env: {
      VITE_API_URL: 'https://api.test/api/v1',
      VITE_AUTH_MODE: 'bearer',
    },
  },
})
