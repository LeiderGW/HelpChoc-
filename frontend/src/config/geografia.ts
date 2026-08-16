// Constantes geográficas del Chocó.
//
// Separadas del componente del mapa porque la página también las necesita
// (el botón "Ver todo el Chocó" de los controles) y porque exportar
// constantes desde un archivo de componentes rompe el fast refresh de Vite.
//
// Medidas sobre choco_contorno.geojson (mismo origen que usa sismoHelp).

/** Extensión del Chocó: [[sur, oeste], [norte, este]]. */
export const CHOCO_BOUNDS: [[number, number], [number, number]] = [
  [3.9649, -77.8837],
  [8.6777, -76.0019],
];

/**
 * Hasta dónde puede pasear el usuario.
 *
 * Encerrar el paneo en el departamento exacto se siente trabado justo cuando
 * alguien quiere ver dónde queda el Chocó respecto al resto del país. El
 * límite es el departamento más el occidente colombiano circundante.
 */
export const LIMITES_PANEO: [[number, number], [number, number]] = [
  [2.6, -79.4],
  [9.8, -74.4],
];

/** Propiedades que trae choco_municipios.geojson. */
export interface PropsMunicipio {
  MpCodigo: string;
  MpNombre: string;
  MpAltitud: number | null;
  AreaHa: number | null;
  Subregion: string | null;
  DeptoNom: string;
}
