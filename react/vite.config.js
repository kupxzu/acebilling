import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'
import svgr from 'vite-plugin-svgr'
import path from 'path'

// Define configurable port with default value
export default defineConfig(({ mode, command }) => {
  // Get the port from command line arguments
  const port = process.env.PORT || 3000;

  return {
    plugins: [
      react({
        jsxRuntime: 'automatic',
        fastRefresh: true
      }),
      svgr(),
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        deleteOriginFile: false,
      }),
      visualizer({
        filename: './dist/bundle-report.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
      tailwindcss(),
    ],
    css: {
      devSourcemap: false,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@assets': path.resolve(__dirname, 'src/assets'),
      }
    },
    build: {
      target: 'esnext',
      minify: 'esbuild',
      cssCodeSplit: true,
      sourcemap: false,
      outDir: 'dist',
      chunkSizeWarningLimit: 500,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor';
              }
              if (id.includes('@headlessui') || id.includes('@heroicons')) {
                return 'ui';
              }
              if (id.includes('chart.js') || id.includes('react-chartjs-2')) {
                return 'charts';
              }
            }
          }
        }
      }
    },
    server: {
      port: parseInt(port, 80),
      open: true,
      strictPort: false, 
      hmr: {
        overlay: true,
        clientPort: parseInt(port, 80)
      },
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom',
        'react-router-dom',
        'chart.js',
        'react-chartjs-2',
        '@headlessui/react',
        '@heroicons/react'
      ],
      esbuildOptions: {
        target: 'esnext'
      }
    }
  }
})