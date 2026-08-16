// Agrupación de marcadores por tipo y cercanía.
//
// El problema: en Quibdó hay nueve puntos dentro de un kilómetro. A vista de
// departamento se pintan uno encima de otro, así que no se sabe cuántos hay ni
// se puede pulsar el de abajo — la pantalla dice "aquí hay algo" y nada más.
//
// La solución no es una librería de clustering, que traería su propio CSS y su
// propia idea de cómo se ve un mapa: es rejilla sobre el plano de píxeles. Se
// proyectan los puntos al zoom actual, se reparten en celdas de ~46 px y los
// que caen en la misma celda **y son de la misma capa** se dibujan como un
// solo disco con su número. Agrupar solo dentro de la capa es lo que hace que
// la cuenta signifique algo: "3 acopios" es información, "3 cosas" no.
//
// Al acercarse las celdas cubren menos terreno y los grupos se deshacen solos.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import { capaDe, getCapa } from '../../config/capas';
import { iconoMarcador } from './markerIcons';
import type { MapMarkerData } from '../../hooks/useMapMarkers';

/** Lado de la celda en píxeles. Por debajo de esto dos puntos se tapan. */
const CELDA_PX = 46;

interface Grupo {
  clave: string;
  lat: number;
  lng: number;
  items: MapMarkerData[];
}

function agrupar(markers: MapMarkerData[], map: L.Map, zoom: number): Grupo[] {
  const celdas = new Map<string, MapMarkerData[]>();

  for (const marker of markers) {
    const punto = map.project([marker.latitude, marker.longitude], zoom);
    const cx = Math.floor(punto.x / CELDA_PX);
    const cy = Math.floor(punto.y / CELDA_PX);
    // La capa entra en la clave: dos puntos vecinos de distinto tipo siguen
    // siendo dos marcadores distintos, no un grupo de dos cosas mezcladas.
    const clave = `${capaDe(marker.kind)}:${cx}:${cy}`;
    const lista = celdas.get(clave);
    if (lista) lista.push(marker);
    else celdas.set(clave, [marker]);
  }

  return [...celdas.entries()].map(([clave, items]) => {
    // El grupo se ancla en el centroide de lo que contiene, no en el centro de
    // la celda: si no, el disco salta al cruzar una frontera invisible.
    const lat = items.reduce((s, m) => s + m.latitude, 0) / items.length;
    const lng = items.reduce((s, m) => s + m.longitude, 0) / items.length;
    return { clave, lat, lng, items };
  });
}

function iconoGrupo(items: MapMarkerData[]): L.DivIcon {
  const capa = getCapa(capaDe(items[0].kind));
  const size = items.length > 9 ? 34 : 30;

  return L.divIcon({
    className: 'marcador-mapa',
    html: `<div class="mk-grupo" style="width:${size}px;height:${size}px;--c:${capa.color}">${items.length}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface Props {
  markers: MapMarkerData[];
  onEnfocar: (marker: MapMarkerData) => void;
  registrarMarcador: (id: string, instancia: L.Marker | null) => void;
  renderPopup: (marker: MapMarkerData) => React.ReactNode;
}

const MarcadoresAgrupados: React.FC<Props> = ({
  markers,
  onEnfocar,
  registrarMarcador,
  renderPopup,
}) => {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());

  useEffect(() => {
    const alTerminar = () => setZoom(map.getZoom());
    map.on('zoomend', alTerminar);
    return () => {
      map.off('zoomend', alTerminar);
    };
  }, [map]);

  const grupos = useMemo(() => agrupar(markers, map, zoom), [markers, map, zoom]);

  /** Al pulsar un grupo, acercarse hasta que se deshaga. */
  const abrirGrupo = useCallback(
    (grupo: Grupo) => {
      const limites = L.latLngBounds(grupo.items.map(m => [m.latitude, m.longitude] as [number, number]));
      // Todos en el mismo sitio (una dirección compartida): fitBounds no puede
      // separarlos, así que se sube un par de niveles y ya.
      if (limites.getNorthEast().equals(limites.getSouthWest())) {
        map.flyTo([grupo.lat, grupo.lng], Math.min(map.getZoom() + 3, map.getMaxZoom()), { duration: 0.6 });
        return;
      }
      map.flyToBounds(limites, { padding: [70, 70], maxZoom: 16, duration: 0.6 });
    },
    [map]
  );

  return (
    <>
      {grupos.map(grupo => {
        if (grupo.items.length === 1) {
          const marker = grupo.items[0];
          return (
            <Marker
              key={marker.id}
              position={[marker.latitude, marker.longitude]}
              icon={iconoMarcador(marker.kind, { magnitud: marker.magnitud })}
              ref={instancia => registrarMarcador(marker.id, instancia)}
              eventHandlers={{ click: () => onEnfocar(marker) }}
            >
              <Popup maxWidth={320} autoPan={false}>
                {renderPopup(marker)}
              </Popup>
            </Marker>
          );
        }

        return (
          <Marker
            key={grupo.clave}
            position={[grupo.lat, grupo.lng]}
            icon={iconoGrupo(grupo.items)}
            eventHandlers={{ click: () => abrirGrupo(grupo) }}
            title={`${grupo.items.length} ${getCapa(capaDe(grupo.items[0].kind)).nombre.toLowerCase()}`}
          />
        );
      })}
    </>
  );
};

export default MarcadoresAgrupados;
