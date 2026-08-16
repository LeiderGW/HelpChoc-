// Capas del mapa: a qué grupo pertenece cada punto y cuáles se pueden apagar.
//
// Cada marcador pertenece a exactamente una capa, y cada capa se enciende o se
// apaga por separado. Es lo que evita que el mapa se sature: en Quibdó hay
// nueve puntos dentro de un kilómetro, y quien va a llevar una caja de comida
// no necesita ver encima el epicentro, las réplicas y el hospital.
//
// La capa se deduce del tipo del punto, así que no hay que mantener una lista
// aparte: un centro nuevo en la base de datos cae solo en la suya.

import type { MapMarkerKind } from '../components/map/markerIcons';

export type CapaId =
  | 'necesidades'
  | 'ofertas'
  | 'acopio'
  | 'entrega'
  | 'albergues'
  | 'salud'
  | 'sismo'
  | 'otros';

export interface Capa {
  id: CapaId;
  nombre: string;
  /** Familia a la que pertenece, para agrupar los interruptores. */
  grupo: 'Ayuda' | 'Respuesta' | 'Contexto';
  /** Color del interruptor y de las agrupaciones. Coincide con el marcador. */
  color: string;
  orden: number;
}

export const capas: Capa[] = [
  { id: 'necesidades', nombre: 'Necesidades', grupo: 'Ayuda', color: '#dc2626', orden: 1 },
  { id: 'ofertas', nombre: 'Ayuda ofrecida', grupo: 'Ayuda', color: '#059669', orden: 2 },
  { id: 'acopio', nombre: 'Centros de acopio', grupo: 'Respuesta', color: '#1d6f8b', orden: 3 },
  { id: 'entrega', nombre: 'Puntos de entrega', grupo: 'Respuesta', color: '#1d6f8b', orden: 4 },
  { id: 'albergues', nombre: 'Albergues', grupo: 'Respuesta', color: '#0f766e', orden: 5 },
  { id: 'salud', nombre: 'Atención en salud', grupo: 'Respuesta', color: '#0f766e', orden: 6 },
  { id: 'otros', nombre: 'Otros puntos', grupo: 'Respuesta', color: '#64748b', orden: 7 },
  { id: 'sismo', nombre: 'Epicentro y réplicas', grupo: 'Contexto', color: '#7f1d1d', orden: 8 },
];

const POR_KIND: Record<MapMarkerKind, CapaId> = {
  critical: 'necesidades',
  high: 'necesidades',
  medium: 'necesidades',
  low: 'necesidades',
  covered: 'necesidades',
  aid: 'ofertas',
  collection: 'acopio',
  delivery: 'entrega',
  shelter: 'albergues',
  medical: 'salud',
  other: 'otros',
  epicentro: 'sismo',
  replica: 'sismo',
};

export function capaDe(kind: MapMarkerKind): CapaId {
  return POR_KIND[kind] ?? 'otros';
}

export function getCapa(id: CapaId): Capa {
  return capas.find(c => c.id === id) ?? capas[capas.length - 1];
}

/** Todas encendidas al entrar: esconder datos por defecto sería peor que el ruido. */
export const capasIniciales: CapaId[] = capas.map(c => c.id);

/** Capas agrupadas por familia, en orden, para pintar los interruptores. */
export function capasPorGrupo(): { grupo: Capa['grupo']; items: Capa[] }[] {
  const grupos: Capa['grupo'][] = ['Ayuda', 'Respuesta', 'Contexto'];
  return grupos.map(grupo => ({
    grupo,
    items: capas.filter(c => c.grupo === grupo).sort((a, b) => a.orden - b.orden),
  }));
}
