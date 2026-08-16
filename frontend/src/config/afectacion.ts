// Escala de severidad y afectación reportada por municipio del Chocó.
//
// Es la capa de contexto del mapa: antes de saber dónde está la ayuda hay que
// saber dónde golpeó más fuerte. Los datos se unen a choco_municipios.geojson
// por MpCodigo, así que la geometría se pinta una vez y el color lo decide el
// dato.
//
// Portado desde el proyecto sismoHelp, aplanado a español (esta app no es
// bilingüe).

export type Severidad = 'critica' | 'alta' | 'media' | 'baja' | 'sin_datos';

// ─── La escala ───────────────────────────────────────────────────────────────
//
// Rampa secuencial ámbar → carmesí, en la línea de la que usa el ShakeMap del
// USGS para intensidad. Dos decisiones deliberadas:
//
//  · No se usa verde para "sin dato". En un mapa de emergencia el verde se lee
//    como "aquí está bien", y no lo sabemos: son municipios sin cifra
//    publicada. El gris no afirma nada, que es lo que corresponde.
//  · La rampa es de un solo tono creciente, no colores distintos. Así el orden
//    se percibe sin leer la leyenda.

export interface NivelSeveridad {
  id: Severidad;
  etiqueta: string;
  /** Versión de una palabra, para la rampa de la leyenda. */
  etiquetaCorta: string;
  descripcion: string;
  color: string;
  colorBorde: string;
  /** Color de texto legible sobre `color`. */
  colorTexto: string;
  orden: number;
}

export const nivelesSeveridad: Record<Severidad, NivelSeveridad> = {
  critica: {
    id: 'critica',
    etiqueta: 'Afectación crítica',
    etiquetaCorta: 'Crítica',
    descripcion: 'La mayor parte del casco urbano destruida o inhabitable',
    color: '#7f1d1d',
    colorBorde: '#5c1212',
    colorTexto: '#ffffff',
    orden: 4,
  },
  alta: {
    id: 'alta',
    etiqueta: 'Afectación alta',
    etiquetaCorta: 'Alta',
    descripcion: 'Víctimas confirmadas y daños estructurales extensos',
    color: '#b3391f',
    colorBorde: '#8c2a15',
    colorTexto: '#ffffff',
    orden: 3,
  },
  media: {
    id: 'media',
    etiqueta: 'Afectación media',
    etiquetaCorta: 'Media',
    descripcion: 'Daños reportados en viviendas o infraestructura',
    color: '#e08a2e',
    colorBorde: '#b06a1f',
    colorTexto: '#3c290c',
    orden: 2,
  },
  baja: {
    id: 'baja',
    etiqueta: 'Afectación baja',
    etiquetaCorta: 'Baja',
    descripcion: 'Sismo sentido con fuerza, con daños puntuales',
    color: '#f0cd80',
    colorBorde: '#c9a65c',
    colorTexto: '#3c290c',
    orden: 1,
  },
  sin_datos: {
    id: 'sin_datos',
    etiqueta: 'Sin dato desagregado',
    etiquetaCorta: 'Sin dato',
    descripcion:
      'La Gobernación reporta 29 municipios afectados, pero no publicó cifras municipio por municipio. Ausencia de dato no significa ausencia de daño.',
    color: '#d8d3c6',
    colorBorde: '#b3ac9b',
    colorTexto: '#453f34',
    orden: 0,
  },
};

/** Niveles en orden descendente, para leyendas y listados. */
export const escalaSeveridad: NivelSeveridad[] = Object.values(nivelesSeveridad).sort(
  (a, b) => b.orden - a.orden
);

export function getNivel(severidad: Severidad | undefined | null): NivelSeveridad {
  return nivelesSeveridad[severidad ?? 'sin_datos'] ?? nivelesSeveridad.sin_datos;
}

// ─── Resumen del evento ──────────────────────────────────────────────────────
//
// Cifras del Reporte de Situación #10 de la Gobernación del Chocó. Van con su
// fuente y su corte pegados: son de la fase de emergencia, no un censo casa
// por casa, y la Defensoría insiste en que el censo de damnificados sigue
// pendiente.

export const sismoChoco = {
  magnitud: 7.4,
  escalaMagnitud: 'Mw',
  fecha: '10 de agosto de 2026',
  horaLocal: '07:34 a. m.',
  profundidadKm: 103,
  epicentro: 'San José del Palmar',
  epicentroMpCodigo: '27660',

  fallecidos: 13,
  heridos: 182,
  desaparecidos: 0,
  municipiosAfectados: 29,
  municipiosTotales: 31,
  viviendasDestruidas: 1144,
  viviendasAveriadas: 8868,
  personasDamnificadas: 21216,

  fuente: 'Gobernación del Chocó, Reporte de Situación #10',
  corte: '12 ago 2026, 6:05 p. m.',
  censoPendiente: true,
} as const;

// ─── Afectación por municipio ────────────────────────────────────────────────
//
// La Gobernación reporta 29 municipios afectados pero solo publica el
// consolidado departamental, sin desglose. Lo que hay aquí se reconstruyó
// municipio por municipio a partir de declaraciones de alcaldes, reportes de
// prensa verificados y el balance por ciudades de la UNGRD — por eso cada ficha
// lleva SU fuente, y no la del reporte oficial.
//
// Son 12 de 29. Los otros quedan en `sin_datos`: pintar de "sin afectación" un
// municipio que sí fue golpeado, solo porque nadie publicó su cifra, sería el
// peor error que podría cometer este mapa.

export interface AfectacionMunicipio {
  mpCodigo: string;
  mpNombre: string;
  severidad: Severidad;
  fallecidos: number | null;
  heridos: number | null;
  viviendasColapsadas: number | null;
  /** Texto libre ("550", "~400", "Casi todo el casco urbano"). */
  viviendasDanadas: string | null;
  descripcion: string;
  /** Fuente concreta de ESTE municipio, que casi nunca es el reporte oficial. */
  fuente: string;
  fechaCorte: string;
  preliminar: boolean;
}

export const afectacionPorMunicipio: Record<string, AfectacionMunicipio> = {
  '27745': {
    mpCodigo: '27745',
    mpNombre: 'Sipí',
    severidad: 'critica',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: 70,
    viviendasDanadas: 'Casi todo el casco urbano',
    descripcion:
      'El municipio más devastado del Chocó en proporción: de un casco urbano de alrededor de 100 viviendas quedaron en pie unas pocas decenas. Comercios y supermercados destruidos y la fachada de la estación de policía dañada. A la emergencia se suma que Sipí está cercado por el conflicto armado, lo que ha dificultado la llegada de ayuda.',
    fuente: 'Senadora Jennifer Pedraza y líderes comunitarios, vía El Tiempo y Semana',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27001': {
    mpCodigo: '27001',
    mpNombre: 'Quibdó',
    severidad: 'alta',
    fallecidos: 9,
    heridos: 119,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Capital departamental y municipio con más víctimas del Chocó. Colapsos parciales en el Banco Agrario, el Banco de la República, la UNAD, la Universidad Claretiana y varias escuelas. El Hospital San Francisco de Asís llegó a operar al 300% de su capacidad en los primeros días y seguía al 160% el 13 de agosto. El aeropuerto El Caraño suspendió operaciones.',
    fuente: 'UNGRD (balance por ciudades) y El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27361': {
    mpCodigo: '27361',
    mpNombre: 'Istmina',
    severidad: 'alta',
    fallecidos: null,
    heridos: 70,
    viviendasColapsadas: null,
    viviendasDanadas: '550',
    descripcion:
      'Más de 3.000 damnificados y 550 viviendas afectadas en el casco urbano. Instituciones educativas y el Palacio Municipal con daños, grietas profundas en las vías pavimentadas, y el municipio quedó sin electricidad ni comunicación telefónica. Familias durmiendo en escuelas. Es paso obligado de los municipios ribereños, así que atiende a mucha más gente de la que censa.',
    fuente: 'Alcaldía de Istmina (alcalde Jaison Mosquera), vía Semana y El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27660': {
    mpCodigo: '27660',
    mpNombre: 'San José del Palmar',
    severidad: 'alta',
    fallecidos: 0,
    heridos: null,
    viviendasColapsadas: 20,
    viviendasDanadas: '~400',
    descripcion:
      'Municipio epicentro. El acueducto quedó fuera de servicio y más de 24 deslizamientos bloquearon la vía a Cartago, dejándolo incomunicado por tierra. El corregimiento de La Italia, con unos 3.000 habitantes, quedó sin señal telefónica y sin contacto con la cabecera. Sin fallecidos confirmados en el casco urbano.',
    fuente: 'Alcaldía de San José del Palmar (alcalde León Fabio Marín), vía El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27491': {
    mpCodigo: '27491',
    mpNombre: 'Nóvita',
    severidad: 'media',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Las dos cúpulas de la catedral colapsaron. El municipio está entre los que registraron intensidad VI-VII en la escala de Mercalli, de las más altas fuera del área epicentral.',
    fuente: 'El Tiempo y Servicio Geológico Colombiano',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27025': {
    mpCodigo: '27025',
    mpNombre: 'Alto Baudó',
    severidad: 'media',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Afectaciones en la comunidad de Catrú Central, incluida la Institución Educativa Indígena Patricio Mecha, en el resguardo Emberá de los ríos Catrú, Dubasa y Ankosó. Los habitantes describieron las consecuencias como “monstruosas”.',
    fuente: 'Reportes comunitarios vía El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27077': {
    mpCodigo: '27077',
    mpNombre: 'Bajo Baudó',
    severidad: 'media',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Daños en infraestructura de comunidades indígenas, con viviendas de madera colapsadas parcial o totalmente. Los habitantes describieron las consecuencias como “monstruosas”.',
    fuente: 'Reportes comunitarios vía El Tiempo y Pulzo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27250': {
    mpCodigo: '27250',
    mpNombre: 'El Litoral del San Juan',
    severidad: 'media',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Viviendas completamente destruidas en asentamientos indígenas, donde las construcciones de madera colapsaron parcial o totalmente. Daños estructurales confirmados en los resguardos Chachajo y Papayo, del pueblo Wounaan. Familias que quedaron sin nada.',
    fuente: 'Reportes comunitarios vía El Tiempo y Pulzo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27075': {
    mpCodigo: '27075',
    mpNombre: 'Bahía Solano',
    severidad: 'media',
    fallecidos: 1,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Mateo Valencia, de 6 años, hijo del alcalde del municipio, murió al colapsar una edificación. El municipio, sobre la costa pacífica norte, quedó parcialmente incomunicado.',
    fuente: 'El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27495': {
    mpCodigo: '27495',
    mpNombre: 'Nuquí',
    severidad: 'baja',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: 1,
    viviendasDanadas: null,
    descripcion:
      'Colapsó una casa de tres pisos. Al estar sobre la costa, los habitantes evacuaron por temor a una respuesta del mar, que finalmente no se produjo: por su profundidad y mecanismo, este sismo no generó tsunami.',
    fuente: 'El Tiempo',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27205': {
    mpCodigo: '27205',
    mpNombre: 'Condoto',
    severidad: 'baja',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Intensidad VI-VII en la escala de Mercalli: sacudida fuerte, sentida por todos, con daños puntuales en construcciones. Sin cifras desagregadas publicadas.',
    fuente: 'Servicio Geológico Colombiano (mapa de intensidades)',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
  '27787': {
    mpCodigo: '27787',
    mpNombre: 'Tadó',
    severidad: 'baja',
    fallecidos: null,
    heridos: null,
    viviendasColapsadas: null,
    viviendasDanadas: null,
    descripcion:
      'Intensidad VI-VII en la escala de Mercalli: sacudida fuerte, sentida por todos, con daños puntuales en construcciones. Sin cifras desagregadas publicadas.',
    fuente: 'Servicio Geológico Colombiano (mapa de intensidades)',
    fechaCorte: '12 ago 2026',
    preliminar: true,
  },
};

/** Municipios con dato, ordenados de mayor a menor severidad. */
export function municipiosConAfectacion(): AfectacionMunicipio[] {
  return Object.values(afectacionPorMunicipio).sort((a, b) => {
    const d = getNivel(b.severidad).orden - getNivel(a.severidad).orden;
    return d !== 0 ? d : a.mpNombre.localeCompare(b.mpNombre, 'es');
  });
}

/**
 * Normaliza un nombre de municipio para poder cruzar el GeoJSON con la tabla
 * `municipalities` de Supabase, que no siempre coincide en tildes ni mayúsculas
 * ("El Litoral Del San Juán" vs "El Litoral del San Juan").
 */
export function normalizarNombre(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
