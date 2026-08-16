// Iconos de Leaflet, construidos con divIcon (HTML/CSS) en vez de imágenes.
//
// ─── Por qué este sistema de color ──────────────────────────────────────────
//
// La versión anterior pintaba diez categorías con diez tonos distintos (rojo,
// naranja, amarillo, verde, azul, morado, rosa, turquesa...) encima de un
// coropleto que ya usaba una rampa de cinco. Catorce colores compitiendo: nada
// destacaba porque todo destacaba, y el mapa dejó de parecerse al resto del
// sitio.
//
// Ahora hay una sola regla: **la forma dice qué es, el color dice cuánto
// urge**, y la única rampa secuencial del mapa es la del coropleto.
//
//   ○  círculo    → necesidad     (cálidos: la urgencia, como las insignias
//                                  del resto del sitio; el tamaño refuerza)
//   ▢  insignia   → oferta        (verde: hay suministro disponible)
//   ◇  gota       → infraestructura de respuesta (familia fría; el glifo
//                                  distingue acopio/entrega/albergue/salud)
//   ◎  anillos    → sismo         (carmesí, el mismo que remata la rampa)
//
// Frío = respuesta, cálido = problema. Y como dos puntos de la misma familia
// comparten color, el glifo —no el tono— es lo que hay que mirar para
// distinguirlos, que es justo lo que evita inventar un color por categoría.

import L from 'leaflet';

export type MapMarkerKind =
  // Necesidades, por prioridad
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'covered'
  // Oferta de ayuda
  | 'aid'
  // Infraestructura de respuesta
  | 'collection'
  | 'delivery'
  | 'shelter'
  | 'medical'
  | 'other'
  // Evento sísmico
  | 'epicentro'
  | 'replica';

export type MapMarkerSource = 'need' | 'center' | 'offer' | 'evento' | 'oficial';

type Forma = 'circulo' | 'insignia' | 'gota' | 'epicentro' | 'replica';

interface EstiloMarcador {
  color: string;
  forma: Forma;
  /** Glifo SVG (trazo, no relleno). Los círculos de necesidad no llevan. */
  glifo?: string;
  tamano: number;
  pulso?: boolean;
  etiqueta: string;
}

// Glifos: trazos simples, legibles a 14 px.
const GLIFOS = {
  caja: '<path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z"/><path d="M3 7.5 12 12l9-4.5M12 12v9"/>',
  camion: '<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  techo: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/>',
  cruz: '<path d="M12 4v16M4 12h16"/>',
  visto: '<path d="M4 12.5 9.5 18 20 6.5"/>',
  rayo: '<path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H12l1-8.5Z"/>',
  punto: '<circle cx="12" cy="12" r="4"/>',
} as const;

const ESTILOS: Record<MapMarkerKind, EstiloMarcador> = {
  // ── Necesidad: círculo cálido. El tamaño refuerza la urgencia, así que el
  //    orden se percibe aunque el color se lea mal (daltonismo, sol en la
  //    pantalla, impresión en gris).
  critical: { color: '#dc2626', forma: 'circulo', tamano: 30, pulso: true, etiqueta: 'Necesidad crítica' },
  high: { color: '#ea580c', forma: 'circulo', tamano: 25, etiqueta: 'Necesidad alta' },
  medium: { color: '#d97706', forma: 'circulo', tamano: 21, etiqueta: 'Necesidad media' },
  // Gris y no verde: una necesidad de prioridad baja sigue siendo una
  // necesidad. En verde se lee como "resuelto", y además chocaba con el verde
  // de las ofertas, que significa lo contrario.
  low: { color: '#9ca3af', forma: 'circulo', tamano: 18, etiqueta: 'Necesidad baja' },
  covered: { color: '#9ca3af', forma: 'circulo', tamano: 18, etiqueta: 'Cubierta' },

  // ── Oferta: insignia verde. Es lo único verde del mapa.
  aid: { color: '#059669', forma: 'insignia', glifo: GLIFOS.visto, tamano: 26, etiqueta: 'Ayuda disponible' },

  // ── Infraestructura de respuesta: gotas frías, el glifo distingue.
  collection: { color: '#1d6f8b', forma: 'gota', glifo: GLIFOS.caja, tamano: 28, etiqueta: 'Centro de acopio' },
  delivery: { color: '#1d6f8b', forma: 'gota', glifo: GLIFOS.camion, tamano: 28, etiqueta: 'Punto de entrega' },
  shelter: { color: '#0f766e', forma: 'gota', glifo: GLIFOS.techo, tamano: 28, etiqueta: 'Albergue' },
  medical: { color: '#0f766e', forma: 'gota', glifo: GLIFOS.cruz, tamano: 28, etiqueta: 'Atención en salud' },
  other: { color: '#64748b', forma: 'gota', glifo: GLIFOS.punto, tamano: 26, etiqueta: 'Otro punto' },

  // ── Sismo: el carmesí que remata la rampa de severidad.
  epicentro: { color: '#7f1d1d', forma: 'epicentro', glifo: GLIFOS.rayo, tamano: 26, etiqueta: 'Epicentro' },
  replica: { color: '#b3391f', forma: 'replica', tamano: 14, etiqueta: 'Réplica' },
};

/**
 * Radio en píxeles de un evento sísmico según su magnitud.
 *
 * Escalar por energía sería lo fiel a la física —un M7.4 libera unas 2.800
 * veces más que un M3.8— pero da un círculo que se traga el municipio entero.
 * Se usa una potencia suave sobre la magnitud, como en los mapas del USGS: el
 * principal domina con claridad sin borrar el mapa debajo.
 */
export function radioPorMagnitud(magnitud: number): number {
  return Math.round(2.4 * Math.pow(Math.max(magnitud - 2.4, 0.5), 1.1));
}

interface OpcionesIcono {
  activo?: boolean;
  /** Solo para 'epicentro' y 'replica': dimensiona el marcador. */
  magnitud?: number;
}

export function iconoMarcador(kind: MapMarkerKind, opciones: OpcionesIcono = {}): L.DivIcon {
  const estilo = ESTILOS[kind] ?? ESTILOS.other;
  const { activo = false, magnitud } = opciones;

  // ── Epicentro: núcleo con anillos que se expanden ──────────────────────
  if (estilo.forma === 'epicentro') {
    const r = radioPorMagnitud(magnitud ?? 7.4);
    const caja = r * 6; // sitio para que los anillos crezcan sin recortarse
    return L.divIcon({
      className: 'marcador-mapa',
      html: `
        <div class="mk-epicentro${activo ? ' mk--activo' : ''}" style="--r:${r}px;--c:${estilo.color}">
          <span class="mk-epicentro__onda"></span>
          <span class="mk-epicentro__onda mk-epicentro__onda--2"></span>
          <span class="mk-epicentro__nucleo">
            <svg viewBox="0 0 24 24" aria-hidden="true">${estilo.glifo}</svg>
          </span>
        </div>`,
      iconSize: [caja, caja],
      iconAnchor: [caja / 2, caja / 2],
      popupAnchor: [0, -r],
    });
  }

  // ── Réplica: anillo hueco, tamaño proporcional a su magnitud ───────────
  if (estilo.forma === 'replica') {
    const r = radioPorMagnitud(magnitud ?? 4);
    const size = r * 2;
    return L.divIcon({
      className: 'marcador-mapa',
      html: `<div class="mk-replica${activo ? ' mk--activo' : ''}" style="width:${size}px;height:${size}px;--c:${estilo.color}"></div>`,
      iconSize: [size, size],
      iconAnchor: [r, r],
      popupAnchor: [0, -r],
    });
  }

  const size = estilo.tamano + (activo ? 6 : 0);
  const clases = ['mk', `mk--${estilo.forma}`];
  if (activo) clases.push('mk--activo');
  if (estilo.pulso) clases.push('mk--pulso');

  const contenido = estilo.glifo
    ? `<svg viewBox="0 0 24 24" aria-hidden="true">${estilo.glifo}</svg>`
    : '';

  return L.divIcon({
    className: 'marcador-mapa',
    html: `<div class="${clases.join(' ')}" style="width:${size}px;height:${size}px;--c:${estilo.color}">${contenido}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Ciudad de referencia, fuera del Chocó.
 *
 * Deliberadamente sobria: un punto y un nombre, sin color de severidad. Estas
 * ciudades no son el tema del mapa —lo es el Chocó— pero explican por qué el
 * saldo nacional es veinte veces el departamental. Si se pintaran con la misma
 * escala que los municipios competirían con ellos y el foco se perdería.
 */
export function iconoCiudad(
  nombre: string,
  fallecidos: number | null,
  lado: 'izquierda' | 'derecha'
): L.DivIcon {
  const etiqueta = fallecidos ? `${nombre} <b>${fallecidos}</b>` : nombre;
  return L.divIcon({
    className: 'marcador-mapa',
    html: `<div class="ciudad-ref ciudad-ref--${lado}">
             <span class="ciudad-ref__punto"></span>
             <span class="ciudad-ref__texto">${etiqueta}</span>
           </div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

export function colorMarcador(kind: MapMarkerKind): string {
  return (ESTILOS[kind] ?? ESTILOS.other).color;
}

export function formaMarcador(kind: MapMarkerKind): Forma {
  return (ESTILOS[kind] ?? ESTILOS.other).forma;
}

export function etiquetaMarcador(kind: MapMarkerKind): string {
  return (ESTILOS[kind] ?? ESTILOS.other).etiqueta;
}

export function glifoMarcador(kind: MapMarkerKind): string | undefined {
  return (ESTILOS[kind] ?? ESTILOS.other).glifo;
}
