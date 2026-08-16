import { useEffect, useState } from 'react';

/** Forma mínima de un FeatureCollection: lo justo que Leaflet's <GeoJSON> necesita. */
export interface GeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    properties: Record<string, unknown> | null;
    geometry: { type: string; coordinates: unknown };
  }>;
}

export interface EstadoGeoJson {
  datos: GeoJsonFeatureCollection | null;
  cargando: boolean;
  error: Error | null;
}

/**
 * Carga un GeoJSON estático (de /public) y lo deja disponible como estado.
 * Evita setState tras desmontar el componente o tras cambiar `path` antes
 * de que termine la descarga anterior.
 */
export function useGeoJson(path: string | null | undefined): EstadoGeoJson {
  const [estado, setEstado] = useState<EstadoGeoJson>({
    datos: null,
    cargando: Boolean(path),
    error: null,
  });

  useEffect(() => {
    if (!path) {
      setEstado({ datos: null, cargando: false, error: null });
      return;
    }

    let vigente = true;
    setEstado(prev => ({ ...prev, cargando: true, error: null }));

    fetch(path)
      .then(res => {
        if (!res.ok) throw new Error(`No se pudo cargar ${path}: ${res.status}`);
        return res.json();
      })
      .then((datos: GeoJsonFeatureCollection) => {
        if (vigente) setEstado({ datos, cargando: false, error: null });
      })
      .catch((error: Error) => {
        if (vigente) setEstado({ datos: null, cargando: false, error });
      });

    return () => {
      vigente = false;
    };
  }, [path]);

  return estado;
}
