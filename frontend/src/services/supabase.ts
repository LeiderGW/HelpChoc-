import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Si falta la configuración, la app arranca igual y lo dice.
 *
 * Antes esto era un `throw` en el cuerpo del módulo, y tenía dos consecuencias
 * bastante peores que un fallo de datos:
 *
 *  1. En el navegador reventaba antes de montar React, así que un despliegue
 *     sin variables de entorno servía una página en blanco, sin ninguna pista
 *     de qué faltaba salvo abrir la consola.
 *
 *  2. Peor: Vite sustituye `import.meta.env.VITE_*` al compilar. Sin las
 *     variables, la condición se plegaba a `if (true) throw` y el bundler
 *     eliminaba como código muerto TODO lo que venía detrás — la aplicación
 *     entera. El bundle pasaba de 170 kB a 0,9 kB y el build seguía saliendo
 *     "correcto", que es la peor forma de fallar.
 *
 * Ahora el cliente se crea siempre. Las llamadas fallarán —los servicios ya
 * las envuelven en try/catch— pero la interfaz se pinta y el aviso es visible.
 */
export const supabaseConfigurado = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigurado) {
  console.error(
    'Faltan VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. La interfaz se carga, ' +
      'pero no habrá datos. En Vercel se definen en Settings → Environment Variables ' +
      'y hay que volver a desplegar: Vite las incrusta al compilar, no se leen en caliente.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://sin-configurar.supabase.co',
  supabaseAnonKey || 'sin-configurar',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
