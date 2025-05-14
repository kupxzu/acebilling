import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Compresses assets using Gzip (.js, .css, etc.)
    viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
    }),

    // Visual report of bundle size
    visualizer({
        filename: './dist/bundle-report.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
    }),
    tailwindcss(),
],
css: {
  devSourcemap: false, // Disable source maps
},
build: {
  minify: 'terser',
  terserOptions: {
      compress: {
          drop_console: true, // Remove console.logs
          drop_debugger: true,
      },
  },
},
  server: {
    proxy: {
      '/api': {
        target: 'http://billing.test',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})