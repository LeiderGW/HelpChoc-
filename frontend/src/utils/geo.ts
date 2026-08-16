// Utilidades geométricas para cruzar puntos con los polígonos del GeoJSON.
//
// Hacen falta porque `municipality_id` viene en NULL en buena parte de los
// registros de Supabase: hay centros de acopio y ofertas que están
// físicamente dentro de un municipio pero sin la llave foránea que lo diga.
// Cruzar por coordenada es además lo correcto para un mapa: si el marcador se
// dibuja dentro del polígono de Quibdó, está en Quibdó, diga lo que diga —o
// deje de decir— la tabla.

interface FeatureLike {
  properties: Record<string, unknown> | null;
  geometry: { type: string; coordinates: unknown };
}

type Anillo = [number, number][];

/** [oesteMin, surMin, esteMax, norteMax] */
type Caja = [number, number, number, number];

export interface MunicipioIndexado {
  codigo: string;
  nombre: string;
  caja: Caja;
  /** Cada polígono es [anilloExterior, ...huecos]. */
  poligonos: Anillo[][];
}

function esAnillo(valor: unknown): valor is Anillo {
  return (
    Array.isArray(valor) &&
    valor.length > 0 &&
    Array.isArray(valor[0]) &&
    typeof (valor[0] as unknown[])[0] === 'number'
  );
}

/** Ray casting sobre un anillo, en coordenadas [lng, lat]. */
function dentroDelAnillo(lng: number, lat: number, anillo: Anillo): boolean {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    const cruza = yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (cruza) dentro = !dentro;
  }
  return dentro;
}

/** Dentro del anillo exterior y fuera de todos los huecos. */
function dentroDelPoligono(lng: number, lat: number, poligono: Anillo[]): boolean {
  if (poligono.length === 0 || !dentroDelAnillo(lng, lat, poligono[0])) return false;
  for (let i = 1; i < poligono.length; i++) {
    if (dentroDelAnillo(lng, lat, poligono[i])) return false;
  }
  return true;
}

/**
 * Prepara los municipios una sola vez: normaliza Polygon y MultiPolygon a la
 * misma forma y precalcula la caja envolvente de cada uno, que es lo que
 * permite descartar la mayoría sin recorrer miles de vértices.
 */
export function indexarMunicipios(features: FeatureLike[]): MunicipioIndexado[] {
  const indexados: MunicipioIndexado[] = [];

  for (const feature of features) {
    const props = feature.properties ?? {};
    const codigo = props.MpCodigo != null ? String(props.MpCodigo) : null;
    const nombre = props.MpNombre != null ? String(props.MpNombre) : null;
    if (!codigo || !nombre) continue;

    const { type, coordinates } = feature.geometry ?? {};
    const poligonos: Anillo[][] = [];

    if (type === 'Polygon' && Array.isArray(coordinates)) {
      poligonos.push((coordinates as unknown[]).filter(esAnillo));
    } else if (type === 'MultiPolygon' && Array.isArray(coordinates)) {
      for (const poligono of coordinates as unknown[]) {
        if (Array.isArray(poligono)) poligonos.push((poligono as unknown[]).filter(esAnillo));
      }
    }
    if (poligonos.length === 0) continue;

    let oeste = Infinity;
    let sur = Infinity;
    let este = -Infinity;
    let norte = -Infinity;
    for (const poligono of poligonos) {
      for (const [lng, lat] of poligono[0] ?? []) {
        if (lng < oeste) oeste = lng;
        if (lng > este) este = lng;
        if (lat < sur) sur = lat;
        if (lat > norte) norte = lat;
      }
    }

    indexados.push({ codigo, nombre, caja: [oeste, sur, este, norte], poligonos });
  }

  return indexados;
}

/** El municipio que contiene la coordenada, o null si cae fuera del Chocó. */
export function municipioEnCoordenada(
  lat: number,
  lng: number,
  municipios: MunicipioIndexado[]
): MunicipioIndexado | null {
  for (const municipio of municipios) {
    const [oeste, sur, este, norte] = municipio.caja;
    if (lng < oeste || lng > este || lat < sur || lat > norte) continue;
    if (municipio.poligonos.some(p => dentroDelPoligono(lng, lat, p))) return municipio;
  }
  return null;
}
