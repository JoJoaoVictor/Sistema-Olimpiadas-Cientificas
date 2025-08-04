import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path'; 

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      protocolImports: true,
      exclude: ['source-map-js']
    })
  ],
  define: {
    'process.env': {},
    global: 'window'
  },
  resolve: {
    alias: {
      'source-map-js': 'source-map',
      
      // Aliases para caminhos absolutos (opcional, mas recomendado)
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@assets': path.resolve(__dirname, './src/assets'),
      
      // Polyfills adicionais se necessário
      'path': 'path-browserify',
      'stream': 'stream-browserify'
    }
  },
  optimizeDeps: {
    include: [
      'source-map' 
    ],
    exclude: [
      'source-map-js' 
    ]
  }
});