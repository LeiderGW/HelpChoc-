// Estilos de mapa base. Los tres usan teselas públicas sin necesidad de
// token: no dependemos de Mapbox para el fondo del mapa.

export type EstiloMapa = 'claro' | 'satelite' | 'relieve';

interface DefinicionEstilo {
  label: string;
  descripcion: string;
  url: string;
  /** Capa de etiquetas aparte, pintada por encima de los marcadores del Chocó. */
  etiquetas: string | null;
  attribution: string;
}

export const TILES: Record<EstiloMapa, DefinicionEstilo> = {
  claro: {
    label: 'Claro',
    descripcion: 'Fondo neutro, ideal para leer los marcadores',
    url: 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png',
    etiquetas: 'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satelite: {
    label: 'Satélite',
    descripcion: 'Imágenes reales del terreno',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    etiquetas: 'https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',
    attribution: 'Imágenes &copy; Esri, Maxar, Earthstar Geographics',
  },
  relieve: {
    label: 'Relieve',
    descripcion: 'Topografía y curvas de nivel',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    etiquetas: null,
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)',
  },
};
