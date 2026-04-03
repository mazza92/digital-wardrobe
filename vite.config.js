import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize JSX runtime
      jsxRuntime: 'automatic'
    })
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-router-dom', 'react-i18next'],
    alias: {
      react: path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      // Alias for faster imports
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
    }
  },
  build: {
    // Disable source maps for smaller production bundles
    sourcemap: false,
    // Optimize bundle size with better chunking
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React and react-i18next together - react-i18next needs React
          if (id.includes('node_modules/react/') ||
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/react-i18next')) {
            return 'react-vendor'
          }
          // Router - needed for navigation (critical path)
          if (id.includes('node_modules/react-router')) {
            return 'router'
          }
          // Styled components - needed for UI (critical path)
          if (id.includes('node_modules/styled-components')) {
            return 'styled'
          }
          // Supabase - defer loading (not critical for initial render)
          if (id.includes('node_modules/@supabase')) {
            return 'supabase'
          }
          // i18next core (without react-i18next)
          if (id.includes('node_modules/i18next') || id.includes('node_modules/i18next-browser-languagedetector')) {
            return 'i18n'
          }
          // Critical page components - predictable names for preloading
          if (id.includes('components/pages/OutfitDetail')) {
            return 'outfit-detail'
          }
          if (id.includes('components/pages/MainPortal')) {
            return 'main-portal'
          }
          // Do not split /pages/auth/ into a separate chunk — it can duplicate React
          // context modules and break useAuth() inside lazy-loaded Profile after signup.
        },
        // Optimize chunk names for caching
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]'
      }
    },
    // Use esbuild for fast minification
    minify: 'esbuild',
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Inline small assets as base64
    assetsInlineLimit: 8192,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable CSS minification
    cssMinify: true,
    // Optimize module preload
    modulePreload: {
      polyfill: false // Modern browsers support this natively
    }
  },
  // Optimize dependencies for faster dev startup
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'styled-components', 
      'i18next', 
      'react-i18next'
    ],
    // Force pre-bundling for consistent behavior
    force: false
  },
  // Server optimizations
  server: {
    // Enable HMR
    hmr: true,
    // Warmup can improve HMR later, but makes "npm run dev" feel slower.
    // Enable only when needed: VITE_WARMUP=true
    ...(process.env.VITE_WARMUP === 'true'
      ? {
          warmup: {
            clientFiles: [
              './src/components/pages/MainPortal.jsx',
              './src/components/pages/OutfitDetail.jsx',
              './src/App.jsx'
            ]
          }
        }
      : {})
  },
  // Preview server optimizations
  preview: {
    headers: {
      // Cache static assets for 1 year
      'Cache-Control': 'public, max-age=31536000, immutable'
    }
  },
  // Enable JSON tree-shaking
  json: {
    stringify: true
  },
  // Esbuild options
  esbuild: {
    // Remove legal comments in production
    legalComments: 'none',
    // Target modern browsers
    target: 'es2020',
    // Remove console.* and debugger statements in production
    drop: ['console', 'debugger']
  }
})
