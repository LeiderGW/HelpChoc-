import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { CENTER_TYPES, NEED_CATEGORIES } from '../lib/constants';
import { eventosSismicos, puntosOficiales } from '../config/puntosSismo';
import type { EventoSismico, PuntoOficial } from '../config/puntosSismo';
import type { MapMarkerKind, MapMarkerSource } from '../components/map/markerIcons';
import type { AidOffer, CollectionCenter, Need, SeismicEvent } from '../types';

/** Etiqueta legible de una categoría de necesidad; si no está en el catálogo, el valor crudo. */
function etiquetaCategoria(categoria: string): string {
  return NEED_CATEGORIES.find(c => c.value === categoria)?.label ?? categoria;
}

/** Etiqueta legible del tipo de centro. La tabla admite valores fuera del enum. */
function etiquetaTipoCentro(tipo: string): string {
  return CENTER_TYPES[tipo as keyof typeof CENTER_TYPES] ?? tipo;
}

export interface MapMarkerData {
  id: string;
  latitude: number;
  longitude: number;
  kind: MapMarkerKind;
  source: MapMarkerSource;
  title: string;
  subtitle: string;
  municipality?: string;
  department?: string;
  /** Dimensiona los marcadores del evento sísmico. */
  magnitud?: number;
  need?: Need;
  center?: CollectionCenter;
  offer?: AidOffer;
  evento?: EventoSismico;
  oficial?: PuntoOficial;
}

/**
 * Puntos empaquetados con la app: epicentro, réplicas y la infraestructura de
 * respuesta que publicaron la Gobernación, la Defensoría y la prensa.
 *
 * Son el respaldo, no la fuente. La migración 20240101000006 los sube a la
 * base; hasta que se corra —o si la consulta falla— se pintan desde aquí, de
 * modo que el mapa nunca aparece vacío. Cuando ya están en la base se
 * descartan uno a uno comparando `external_id`, así que nunca salen por
 * duplicado durante la transición.
 */
const marcadorDeEvento = (evento: EventoSismico): MapMarkerData => ({
  id: evento.id,
  latitude: evento.lat,
  longitude: evento.lng,
  kind: evento.tipo === 'principal' ? 'epicentro' : 'replica',
  source: 'evento',
  title: evento.nombre,
  subtitle: evento.tipo === 'principal' ? 'Sismo principal' : 'Réplica',
  magnitud: evento.magnitud,
  evento,
});

const marcadorDeOficial = (punto: PuntoOficial): MapMarkerData => ({
  id: punto.id,
  latitude: punto.lat,
  longitude: punto.lng,
  kind: punto.categoria,
  source: 'oficial',
  title: punto.nombre,
  subtitle: punto.tipo,
  municipality: punto.municipio,
  department: 'Chocó',
  oficial: punto,
});

/** Convierte una fila de `seismic_events` a la forma del resto de marcadores. */
const marcadorDeFilaSismica = (fila: SeismicEvent): MapMarkerData => ({
  id: fila.external_id || `evento-${fila.id}`,
  latitude: Number(fila.latitude),
  longitude: Number(fila.longitude),
  kind: fila.event_type === 'principal' ? 'epicentro' : 'replica',
  source: 'evento',
  title: fila.name,
  subtitle: fila.event_type === 'principal' ? 'Sismo principal' : 'Réplica',
  magnitud: Number(fila.magnitude),
  evento: {
    id: fila.external_id,
    nombre: fila.name,
    tipo: fila.event_type,
    magnitud: Number(fila.magnitude),
    lat: Number(fila.latitude),
    lng: Number(fila.longitude),
    fecha: fila.occurred_on,
    horaLocal: fila.local_time ?? null,
    profundidadKm: fila.depth_km ?? null,
    precision: fila.location_precision,
    notaPrecision: fila.location_note ?? undefined,
    fuente: fila.source,
  },
});

interface EstadoMarcadores {
  markers: MapMarkerData[];
  loading: boolean;
  error: string | null;
}

/**
 * Necesidades, centros de acopio y ofertas de ayuda, normalizados a un solo
 * arreglo de marcadores para el mapa.
 *
 * A diferencia de la versión anterior de MapPage, un registro sin
 * coordenadas se omite en vez de ubicarlo al azar cerca de Bogotá: dentro de
 * un mapa acotado al Chocó, un marcador "fantasma" fuera de los límites de
 * paneo confunde más de lo que ayuda.
 */
export function useMapMarkers() {
  const [estado, setEstado] = useState<EstadoMarcadores>({
    markers: [],
    loading: true,
    error: null,
  });

  const cargar = useCallback(async () => {
    setEstado(prev => ({ ...prev, loading: true, error: null }));

    try {
      const [needsRes, centersRes, offersRes, eventsRes] = await Promise.all([
        supabase
          .from('needs')
          .select(`
            *,
            municipality:municipalities(name, department:departments(name)),
            location:locations(*)
          `)
          .neq('status', 'fulfilled'),
        supabase
          .from('collection_centers')
          .select(`
            *,
            municipality:municipalities(name, department:departments(name))
          `)
          .eq('status', 'active'),
        supabase
          .from('aid_offers')
          .select(`
            *,
            location:locations(
              *,
              municipality:municipalities(name, department:departments(name))
            ),
            organization:organizations(name)
          `)
          .eq('status', 'available')
          .limit(100),
        // Puede no existir todavía: la tabla llega con la migración
        // 20240101000006. Si falla, se usan los puntos empaquetados.
        supabase.from('seismic_events').select('*'),
      ]);

      if (needsRes.error) console.error('Error obteniendo necesidades:', needsRes.error);
      if (centersRes.error) console.error('Error obteniendo centros de acopio:', centersRes.error);
      if (offersRes.error) console.error('Error obteniendo ofertas de ayuda:', offersRes.error);

      const markers: MapMarkerData[] = [];

      // ── Eventos sísmicos: base si la tabla existe, config si no ────────
      const filasSismicas = (eventsRes.error ? [] : (eventsRes.data ?? [])) as SeismicEvent[];
      const eventosEnBase = new Set(filasSismicas.map(f => f.external_id));
      filasSismicas.forEach(fila => markers.push(marcadorDeFilaSismica(fila)));
      eventosSismicos
        .filter(e => !eventosEnBase.has(e.id))
        .forEach(e => markers.push(marcadorDeEvento(e)));

      // ── Puntos oficiales que aún no están en la base ───────────────────
      // Los que sí están llegan por la consulta normal de collection_centers,
      // ya con su fuente y su nota, así que solo hay que rellenar los que
      // falten para no perderlos antes de correr la migración.
      const oficialesEnBase = new Set(
        (centersRes.data ?? []).map((c: any) => c.external_id).filter(Boolean)
      );
      puntosOficiales
        .filter(p => !oficialesEnBase.has(p.id))
        .forEach(p => markers.push(marcadorDeOficial(p)));

      (needsRes.data ?? []).forEach((need: any) => {
        const location = need.location;
        if (!location?.latitude || !location?.longitude) return;

        markers.push({
          id: `need-${need.id}`,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          kind: need.priority,
          source: 'need',
          title: need.product,
          subtitle: etiquetaCategoria(need.category),
          municipality: need.municipality?.name,
          department: need.municipality?.department?.name,
          need,
        });
      });

      (centersRes.data ?? []).forEach((center: any) => {
        if (center.latitude == null || center.longitude == null) return;

        markers.push({
          id: `center-${center.id}`,
          latitude: parseFloat(center.latitude),
          longitude: parseFloat(center.longitude),
          kind: center.type,
          source: 'center',
          title: center.name,
          subtitle: etiquetaTipoCentro(center.type),
          municipality: center.municipality?.name,
          department: center.municipality?.department?.name,
          center,
        });
      });

      (offersRes.data ?? []).forEach((offer: any) => {
        const location = offer.location;
        if (!location?.latitude || !location?.longitude) return;

        markers.push({
          id: `offer-${offer.id}`,
          latitude: parseFloat(location.latitude),
          longitude: parseFloat(location.longitude),
          kind: 'aid',
          source: 'offer',
          title: offer.product,
          subtitle: `${offer.quantity} ${offer.unit} disponibles`,
          municipality: location.municipality?.name,
          department: location.municipality?.department?.name,
          offer,
        });
      });

      setEstado({ markers, loading: false, error: null });
    } catch (error: any) {
      setEstado({ markers: [], loading: false, error: error.message });
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  return { ...estado, refetch: cargar };
}
