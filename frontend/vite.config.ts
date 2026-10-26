import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (command === 'build') {
    let api: URL
    try {
      api = new URL(env.VITE_API_URL)
    } catch {
      throw new Error('Configure VITE_API_URL em .env.production com a URL HTTPS da API Render, incluindo /api/v1.')
    }
    if (api.protocol !== 'https:' || ['localhost', '127.0.0.1', '[::1]'].includes(api.hostname) || api.username || api.password || api.search || api.hash || api.pathname.replace(/\/$/, '') !== '/api/v1') {
      throw new Error('VITE_API_URL deve ser uma URL HTTPS publica terminada em /api/v1, sem credenciais, query ou fragmento.')
    }
    if (env.VITE_API_MOCK === 'true') throw new Error('Desative VITE_API_MOCK para gerar a build de producao.')
  }
  return {
  base: '/tecti/2026/gpec06/',
  plugins: [
    figmaAssetResolver(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
