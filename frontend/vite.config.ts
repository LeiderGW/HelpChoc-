import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: 'dist',
    // Los sourcemaps se suben pero no se sirven al usuario: pesan y en
    // producción solo hacen falta para leer un stack trace.
    sourcemap: false,
    rollupOptions: {
      output: {
        // Vite 8 (rolldown) ya no acepta el objeto {chunk: [paquetes]}; tiene
        // que ser una función. El objeto anterior además apartaba un chunk
        // para `mapbox-gl`, que se dejó de usar cuando el mapa pasó a Leaflet:
        // el build fallaba pidiendo un paquete que ya no importa nadie.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('leaflet')) return 'leaflet';
          if (id.includes('recharts')) return 'recharts';
          if (id.includes('@supabase')) return 'supabase';
          return 'vendor';
        },
      },
    },
  },
});