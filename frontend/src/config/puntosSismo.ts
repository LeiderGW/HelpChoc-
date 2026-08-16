// Puntos fijos del sismo: epicentro, réplicas, acopios oficiales, hospital y
// albergues.
//
// Van como config tipada y no como GeoJSON servido: son pocos datos, llegan
// con la app, se pintan en el primer frame y el compilador avisa si a un punto
// le falta un campo. Portado desde sismoHelp y aplanado a español.
//
// Cada punto lleva SU fuente y, cuando la ubicación es aproximada, lo dice: la
// mayoría son direcciones publicadas en prensa o por la Gobernación, no
// coordenadas levantadas en terreno. Un mapa de emergencia que finge precisión
// manda gente a la puerta equivocada.

export type PrecisionUbicacion = 'confirmada' | 'aproximada';

export interface EventoSismico {
  id: string;
  nombre: string;
  tipo: 'principal' | 'replica';
  magnitud: number;
  lat: number;
  lng: number;
  fecha: string;
  horaLocal: string | null;
  profundidadKm: number | null;
  precision: PrecisionUbicacion;
  notaPrecision?: string;
  fuente: string;
}

export const eventosSismicos: EventoSismico[] = [
  {
    id: 'sismo-principal',
    nombre: 'Sismo principal M7.4',
    tipo: 'principal',
    magnitud: 7.4,
    lat: 4.99,
    lng: -76.29,
    fecha: '10 ago 2026',
    horaLocal: '07:34',
    profundidadKm: 103,
    precision: 'confirmada',
    fuente: 'Servicio Geológico Colombiano (SGC)',
  },
  {
    id: 'replica-42',
    nombre: 'Réplica M4.2',
    tipo: 'replica',
    magnitud: 4.2,
    lat: 4.98,
    lng: -76.28,
    fecha: '13 ago 2026',
    horaLocal: '09:42',
    profundidadKm: 95,
    precision: 'aproximada',
    notaPrecision:
      'La más fuerte desde el sismo principal, con el mismo epicentro en San José del Palmar. Se sintió en Bogotá, Manizales y Pereira. Las autoridades no reportaron daños ni heridos.',
    fuente: 'SGC',
  },
  {
    id: 'replica-50',
    nombre: 'Réplica M5.0',
    tipo: 'replica',
    magnitud: 5.0,
    lat: 4.95,
    lng: -76.25,
    fecha: '10 ago 2026',
    horaLocal: null,
    profundidadKm: null,
    precision: 'aproximada',
    notaPrecision:
      'Magnitud reportada por el USGS. Ubicación estimada en el entorno del epicentro; las coordenadas exactas no fueron publicadas.',
    fuente: 'USGS',
  },
  {
    id: 'replica-48',
    nombre: 'Réplica M4.8',
    tipo: 'replica',
    magnitud: 4.8,
    lat: 5.02,
    lng: -76.32,
    fecha: '10 ago 2026',
    horaLocal: '08:18',
    profundidadKm: null,
    precision: 'aproximada',
    notaPrecision: 'Magnitud y hora confirmadas por el SGC. Ubicación estimada en el entorno del epicentro.',
    fuente: 'SGC',
  },
  {
    id: 'replica-38',
    nombre: 'Réplica M3.8',
    tipo: 'replica',
    magnitud: 3.8,
    lat: 4.94,
    lng: -76.34,
    fecha: '10 ago 2026',
    horaLocal: '10:01',
    profundidadKm: null,
    precision: 'aproximada',
    notaPrecision: 'Magnitud y hora confirmadas por el SGC. Ubicación estimada en el entorno del epicentro.',
    fuente: 'SGC',
  },
];

// ─── Puntos oficiales de ayuda ───────────────────────────────────────────────

export interface PuntoOficial {
  id: string;
  nombre: string;
  categoria: 'collection' | 'medical' | 'shelter';
  tipo: string;
  municipio: string;
  lat: number;
  lng: number;
  direccion?: string;
  contacto?: string;
  estado?: string;
  precision: PrecisionUbicacion;
  notaPrecision?: string;
  fuente: string;
}

export const puntosOficiales: PuntoOficial[] = [
  {
    id: 'acopio-gobernacion',
    nombre: 'Gobernación del Chocó',
    categoria: 'collection',
    tipo: 'Punto oficial de recolección',
    municipio: 'Quibdó',
    lat: 5.6919,
    lng: -76.6583,
    direccion: 'Calle 31, edificio La Confianza, Quibdó',
    precision: 'aproximada',
    notaPrecision:
      'Dirección publicada por la Gobernación; las coordenadas son una aproximación al centro administrativo de Quibdó.',
    fuente: 'Gobernación del Chocó — ficha de coordinación de ayudas, 12 ago 2026',
  },
  {
    id: 'acopio-centro-logistico',
    nombre: 'Centro Logístico Humanitario del Chocó',
    categoria: 'collection',
    tipo: 'Bodega de acopio y distribución',
    municipio: 'Quibdó',
    lat: 5.6512,
    lng: -76.6262,
    direccion: 'Antigua bodega Postobón, km 4 vía Quibdó–Yuto',
    precision: 'aproximada',
    notaPrecision:
      'Ubicación estimada sobre la vía Quibdó–Yuto a la altura del km 4; conviene confirmar antes de desplazarse.',
    fuente: 'Gobernación del Chocó — ficha de coordinación de ayudas, 12 ago 2026',
  },
  {
    id: 'acopio-quibdo-comunitario',
    nombre: 'Acopio comunitario — Barrio Los Ángeles',
    categoria: 'collection',
    tipo: 'Recolección comunitaria',
    municipio: 'Quibdó',
    lat: 5.6945,
    lng: -76.6605,
    direccion: 'Calle 27A #23-44, Barrio Los Ángeles, Sector San Gabriel',
    contacto: 'Cel. 310 805 0535',
    precision: 'aproximada',
    notaPrecision: 'Iniciativa comunitaria, no oficial. Conviene llamar antes de llevar donaciones.',
    fuente: 'Reporte comunitario, corte 12 ago 2026',
  },
  {
    id: 'atencion-hsfa-quibdo',
    nombre: 'Hospital San Francisco de Asís',
    categoria: 'medical',
    tipo: 'Hospital departamental de referencia',
    municipio: 'Quibdó',
    lat: 5.6975,
    lng: -76.6595,
    estado: 'Llegó a operar al 300% de su capacidad tras el sismo',
    precision: 'aproximada',
    notaPrecision:
      'Reportó necesidad urgente de insumos médicos, equipo quirúrgico y recursos de cuidado crítico.',
    fuente: 'El Tiempo, 12 ago 2026',
  },
  {
    id: 'albergue-coliseo-quibdo',
    nombre: 'Coliseo de Boxeo de Quibdó',
    categoria: 'shelter',
    tipo: 'Albergue operativo',
    municipio: 'Quibdó',
    lat: 5.6912,
    lng: -76.6531,
    estado: 'Operativo · 300 carpas asignadas',
    precision: 'aproximada',
    notaPrecision:
      'La Defensoría reporta que faltan colchonetas, no hay separación entre grupos familiares y la capacidad es insuficiente para la cantidad de damnificados.',
    fuente: 'Defensoría del Pueblo y UNGRD, 13 ago 2026',
  },
];

// ─── Ciudades de referencia ──────────────────────────────────────────────────
//
// El Chocó es 2,5 veces más alto que ancho, así que encuadrarlo entero en una
// pantalla apaisada deja mucho margen a los lados. Se usa para lo que ese
// espacio ya contiene y el mapa necesita explicar: las ciudades donde este
// sismo mató a más gente están justamente ahí, fuera del departamento.
//
// Van atenuadas y no son clicables: son referencia, no el tema. Pero de un
// vistazo se ve que Cali —con 95 muertos— está a 200 km del epicentro, y que
// el margen del mapa no está vacío, está lleno de la parte de la historia que
// no cabe en el Chocó.

export interface CiudadReferencia {
  nombre: string;
  departamento: string;
  lat: number;
  lng: number;
  fallecidos: number | null;
  /** Alineación de la etiqueta para que no se monte sobre el departamento. */
  lado: 'izquierda' | 'derecha';
}

export const ciudadesReferencia: CiudadReferencia[] = [
  { nombre: 'Cali', departamento: 'Valle del Cauca', lat: 3.4516, lng: -76.532, fallecidos: 95, lado: 'derecha' },
  { nombre: 'Pereira', departamento: 'Risaralda', lat: 4.8133, lng: -75.6961, fallecidos: 79, lado: 'derecha' },
  { nombre: 'Manizales', departamento: 'Caldas', lat: 5.0689, lng: -75.5174, fallecidos: 5, lado: 'derecha' },
  { nombre: 'Armenia', departamento: 'Quindío', lat: 4.5339, lng: -75.6811, fallecidos: null, lado: 'derecha' },
  { nombre: 'Buenaventura', departamento: 'Valle del Cauca', lat: 3.8801, lng: -77.0313, fallecidos: 4, lado: 'izquierda' },
  { nombre: 'Medellín', departamento: 'Antioquia', lat: 6.2442, lng: -75.5812, fallecidos: 1, lado: 'derecha' },
];

// ─── Anillos de distancia ────────────────────────────────────────────────────
//
// Círculos concéntricos desde el epicentro, el recurso estándar de los mapas
// sísmicos (USGS, EMSC). Aquí hacen un trabajo concreto: este fue un sismo
// profundo, así que el daño no se concentró junto al epicentro sino que se
// repartió por cientos de kilómetros. Los anillos hacen visible ese alcance —
// se ve de un vistazo que Quibdó está a ~100 km del origen.

export const anillosDistancia = [
  { radioKm: 50, etiqueta: '50 km' },
  { radioKm: 100, etiqueta: '100 km' },
  { radioKm: 150, etiqueta: '150 km' },
];

/** Distancia en km entre dos puntos (fórmula del haversine). */
export function distanciaKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const principal = eventosSismicos[0];

/** Distancia desde el epicentro hasta un punto cualquiera. */
export function distanciaAlEpicentro(lat: number, lng: number): number {
  return distanciaKm(principal.lat, principal.lng, lat, lng);
}
