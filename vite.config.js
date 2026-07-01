import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function sandboxFallbackPlugin() {
  return {
    name: 'sandbox-fallback',
    resolveId(source) {
      if (source.endsWith('views/sandbox/Sandbox.jsx') && process.env.VERCEL) {
        return '\0virtual:sandbox';
      }
      return null;
    },
    load(id) {
      if (id === '\0virtual:sandbox') {
        return 'export default function Sandbox() { return null; }';
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), sandboxFallbackPlugin()],
  optimizeDeps: {
    include: ['recharts'],
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    }
  }
});
