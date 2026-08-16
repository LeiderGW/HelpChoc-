import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/map.css';
import { Circle, GeoJSON, MapContainer, Marker, ScaleControl, TileLayer, useMap } from 'react-leaflet';
import { PanelLeftOpen, X } from 'lucide-react';

import MapFilters, { MapFiltersState } from '../components/map/MapFilters';
import MapControls from '../components/map/MapControls';
import MapSidebar from '../components/map/MapSidebar';
import MarcadoresAgrupados from '../components/map/MarcadoresAgrupados';
import { capaDe, capasIniciales, type CapaId } from '../config/capas';
import { TILES, type EstiloMapa } from '../components/map/mapTiles';
import { colorMarcador, iconoCiudad } from '../components/map/markerIcons';
import { CHOCO_BOUNDS, LIMITES_PANEO, type PropsMunicipio } from '../config/geografia';
import { afectacionPorMunicipio, getNivel } from '../config/afectacion';
import { useGeoJson } from '../hooks/useGeoJson';
import { useMapMarkers, type MapMarkerData } from '../hooks/useMapMarkers';
import {
  anillosDistancia,
  ciudadesReferencia,
  distanciaAlEpicentro,
  eventosSismicos,
} from '../config/puntosSismo';
import { locationService } from '../services/locationService';
import { getPriorityLabel } from '../utils/priorityCalculator';
import { indexarMunicipios, municipioEnCoordenada } from '../utils/geo';

// Corrige el problema habitual de los iconos por defecto de Leaflet con Vite.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Panes propios, en el orden en que se apilan:
//   200  teselas del mapa base
//   400  municipios (overlayPane de Leaflet)
//   450  topónimos del mapa base — encima de los polígonos, pero DEBAJO de la
//        máscara: si fueran por encima, los nombres de Panamá y Medellín
//        seguirían nítidos fuera del Chocó y la máscara no atenuaría nada
//   460  máscara
//   465  nuestras etiquetas de municipio — por encima de la máscara. Van
//        aparte de los topónimos del mapa base porque un nombre largo se sale
//        del borde del departamento, y ahí la máscara le comía la cola:
//        "San José del Palmar" se leía con "Palmar" medio borrado.
//   470  contorno — encima de la máscara, que si no le come el borde
//   600  marcadores (markerPane de Leaflet)
const PANE_ETIQUETAS = 'pane-etiquetas';
const PANE_MASCARA = 'pane-mascara';
const PANE_ETIQUETAS_MUNICIPIO = 'pane-etiquetas-municipio';
const PANE_CONTORNO = 'pane-contorno';

const PADDING_ENCUADRE: [number, number] = [24, 24];

/**
 * `flyToBounds` con red de seguridad: si el contenedor mide 0 (pestaña en
 * segundo plano, panel a medio animar), Leaflet calcula un zoom infinito,
 * lanza sobre `new LatLng(NaN, NaN)` y React se queda con la página en
 * blanco. Que un mapa no pueda encuadrarse no puede tumbar la página.
 */
function encuadrarSeguro(map: L.Map, limites: L.LatLngBounds, opciones: L.FitBoundsOptions & { duration?: number }) {
  const { x, y } = map.getSize();
  const [padIzq, padArriba] = (opciones.paddingTopLeft ?? [0, 0]) as [number, number];
  const [padDer, padAbajo] = (opciones.paddingBottomRight ?? [0, 0]) as [number, number];
  if (x - padIzq - padDer < 40 || y - padArriba - padAbajo < 40) return;
  map.flyToBounds(limites, opciones);
}

/**
 * Leaflet mide el contenedor una sola vez, al construirse. Si el layout
 * todavía no ha corrido en ese momento —o la columna lateral está
 * apareciendo— se queda con un tamaño equivocado para siempre. Este hook lo
 * vuelve a medir cuando el elemento cambia de tamaño y avisa la primera vez
 * que hay un tamaño real, para que el encuadre inicial espere a ese momento.
 */
function useContenedorMedido(onPrimeraMedida: () => void) {
  const map = useMap();
  const yaAviso = useRef(false);

  useEffect(() => {
    const contenedor = map.getContainer();

    const medir = () => {
      const { width, height } = contenedor.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      map.invalidateSize({ animate: false });
      if (!yaAviso.current) {
        yaAviso.current = true;
        onPrimeraMedida();
      }
    };

    medir();
    const observer = new ResizeObserver(medir);
    observer.observe(contenedor);
    return () => observer.disconnect();
  }, [map, onPrimeraMedida]);
}

/** Crea los panes propios y aplica el encuadre inicial sobre el Chocó. */
function ConfiguracionMapa() {
  const map = useMap();

  useEffect(() => {
    for (const [nombre, z] of [
      [PANE_ETIQUETAS, '450'],
      [PANE_MASCARA, '460'],
      [PANE_ETIQUETAS_MUNICIPIO, '465'],
      [PANE_CONTORNO, '470'],
    ] as const) {
      if (map.getPane(nombre)) continue;
      const pane = map.createPane(nombre);
      pane.style.zIndex = z;
      pane.style.pointerEvents = 'none';
    }
  }, [map]);

  const encuadrar = useCallback(() => {
    const { x, y } = map.getSize();
    if (x - 48 < 40 || y - 48 < 40) return;
    map.fitBounds(CHOCO_BOUNDS, {
      paddingTopLeft: PADDING_ENCUADRE,
      paddingBottomRight: PADDING_ENCUADRE,
      animate: false,
    });
  }, [map]);

  useContenedorMedido(encuadrar);
  return null;
}

/** Expone la instancia de Leaflet al componente padre, para los controles. */
function CapturarMapa({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onReady(map);
  }, [map, onReady]);
  return null;
}

/**
 * Publica el zoom en el contenedor para que el CSS decida qué etiquetas de
 * municipio caben, sin que React tenga que volver a crear las 31 geometrías
 * cada vez que alguien hace zoom.
 */
function ZoomExpuesto() {
  const map = useMap();
  useEffect(() => {
    const aplicar = () => {
      const zoom = map.getZoom();
      const el = map.getContainer();
      el.dataset.zoom = String(Math.round(zoom));
      el.dataset.detalle = zoom < 8 ? 'minimo' : zoom < 10 ? 'medio' : 'completo';
    };
    aplicar();
    map.on('zoomend', aplicar);
    return () => {
      map.off('zoomend', aplicar);
    };
  }, [map]);
  return null;
}

function marcadorVisible(
  marker: MapMarkerData,
  filters: MapFiltersState,
  busqueda: string,
  capasActivas: Set<CapaId>
): boolean {
  if (!capasActivas.has(capaDe(marker.kind))) return false;
  if (busqueda) {
    const q = busqueda.toLowerCase();
    const coincide =
      marker.title?.toLowerCase().includes(q) ||
      marker.subtitle?.toLowerCase().includes(q) ||
      marker.municipality?.toLowerCase().includes(q) ||
      marker.department?.toLowerCase().includes(q);
    if (!coincide) return false;
  }
  if (filters.types.length > 0 && !filters.types.includes(marker.source)) return false;
  if (filters.priorities.length > 0 && marker.source === 'need' && !filters.priorities.includes(marker.kind)) {
    return false;
  }
  if (filters.departments.length > 0 && !(marker.department && filters.departments.includes(marker.department))) {
    return false;
  }
  if (
    filters.municipalities.length > 0 &&
    !(marker.municipality && filters.municipalities.includes(marker.municipality))
  ) {
    return false;
  }
  return true;
}

const EMPTY_FILTERS: MapFiltersState = { departments: [], municipalities: [], types: [], priorities: [] };

/** Origen de los anillos de distancia. */
const epicentro = eventosSismicos[0];

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  /** Vista a la que volver cuando se cierra la ficha de un punto. */
  const vistaPrevia = useRef<{ center: L.LatLng; zoom: number } | null>(null);
  const [mapaListo, setMapaListo] = useState(false);

  const { markers: markersCrudos, loading } = useMapMarkers();
  const { datos: mascara } = useGeoJson('/data/choco_mascara.geojson');
  const { datos: contorno } = useGeoJson('/data/choco_contorno.geojson');
  const { datos: municipiosGeo } = useGeoJson('/data/choco_municipios.geojson');

  const [estiloMapa, setEstiloMapa] = useState<EstiloMapa>('claro');
  const [pantallaCompleta, setPantallaCompleta] = useState(false);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState<string | null>(null);

  const [sidebarAbierta, setSidebarAbierta] = useState(true);
  const [capasActivas, setCapasActivas] = useState<Set<CapaId>>(() => new Set(capasIniciales));
  const [capasAbiertas, setCapasAbiertas] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [filters, setFilters] = useState<MapFiltersState>(EMPTY_FILTERS);

  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [municipalities, setMunicipalities] = useState<{ id: string; name: string; department_id: string }[]>([]);
  const municipiosCargados = useRef<Set<string>>(new Set());

  useEffect(() => {
    locationService.getDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setPantallaCompleta(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // Escape cierra lo que esté abierto, salvo mientras se escribe en un campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable) return;
      if (e.key !== 'Escape') return;
      if (vistaPrevia.current) mapRef.current?.closePopup();
      else setMunicipioSeleccionado(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  /** mpCodigo → MpNombre, para los municipios que no tienen ficha de afectación. */
  const nombresMunicipios = useMemo(() => {
    const mapa: Record<string, string> = {};
    municipiosGeo?.features.forEach(f => {
      const props = f.properties as unknown as PropsMunicipio | null;
      if (props?.MpCodigo) mapa[String(props.MpCodigo)] = props.MpNombre;
    });
    return mapa;
  }, [municipiosGeo]);

  const municipiosIndexados = useMemo(
    () => (municipiosGeo ? indexarMunicipios(municipiosGeo.features) : []),
    [municipiosGeo]
  );

  /**
   * Completa el municipio de cada marcador a partir de su coordenada.
   *
   * `municipality_id` viene en NULL en buena parte de los registros, así que
   * confiar solo en la llave foránea dejaría sin municipio a puntos que están
   * claramente dentro de uno. La tabla manda cuando trae el dato; la geometría
   * lo rellena cuando no.
   */
  const markers = useMemo(() => {
    const todos = markersCrudos;
    if (municipiosIndexados.length === 0) return todos;
    return todos.map(marker => {
      if (marker.municipality) return marker;
      const municipio = municipioEnCoordenada(marker.latitude, marker.longitude, municipiosIndexados);
      if (!municipio) return marker;
      return { ...marker, municipality: municipio.nombre, department: marker.department ?? 'Chocó' };
    });
  }, [markersCrudos, municipiosIndexados]);

  // Carga perezosa: los municipios de un departamento solo se piden la
  // primera vez que ese departamento se selecciona en los filtros.
  const handleFilterChange = useCallback(
    (nuevos: MapFiltersState) => {
      const agregados = nuevos.departments.filter(d => !municipiosCargados.current.has(d));
      agregados.forEach(async nombre => {
        municipiosCargados.current.add(nombre);
        const dept = departments.find(d => d.name === nombre);
        if (!dept) return;
        const data = await locationService.getMunicipalities(dept.id);
        setMunicipalities(prev => [...prev, ...data.filter((m: any) => !prev.some(p => p.id === m.id))]);
      });
      setFilters(nuevos);
    },
    [departments]
  );

  const handleClearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setSearchQuery('');
    setAppliedSearch('');
  }, []);

  const applySearch = useCallback(() => setAppliedSearch(searchQuery.trim()), [searchQuery]);

  const filteredMarkers = useMemo(
    () => markers.filter(m => marcadorVisible(m, filters, appliedSearch, capasActivas)),
    [markers, filters, appliedSearch, capasActivas]
  );

  /**
   * Cuántos puntos hay por capa, contados ANTES de aplicar las capas pero
   * DESPUÉS de buscador y filtros: el número junto al interruptor tiene que
   * decir cuántos aparecerían al encenderlo, no cuántos hay en total.
   */
  const recuentosCapa = useMemo(() => {
    const base = Object.fromEntries(capasIniciales.map(id => [id, 0])) as Record<CapaId, number>;
    markers.forEach(m => {
      if (!marcadorVisible(m, filters, appliedSearch, new Set(capasIniciales))) return;
      base[capaDe(m.kind)] += 1;
    });
    return base;
  }, [markers, filters, appliedSearch]);

  const hasActiveFilters =
    appliedSearch !== '' ||
    filters.priorities.length > 0 ||
    filters.departments.length > 0 ||
    filters.municipalities.length > 0 ||
    filters.types.length > 0;

  const handleVerDetalles = (marker: MapMarkerData) => {
    if (marker.source === 'need') navigate(`/necesidades/${marker.need?.id}`);
    else if (marker.source === 'center') navigate('/puntos-entrega');
    else navigate('/ayudas');
  };

  /**
   * Acercarse a un punto, recordando desde dónde se venía.
   *
   * Sin esto, mirar tres puntos seguidos dejaba el mapa clavado en el último a
   * zoom 14, sin forma evidente de recuperar la vista del departamento salvo
   * alejar a mano. Se guarda la vista anterior al primer salto y se devuelve
   * al cerrar la ficha (ver el efecto de más abajo).
   */
  const enfocarMarcador = useCallback((marker: MapMarkerData) => {
    const map = mapRef.current;
    if (!map) return;

    // Si su capa está apagada el marcador no existe en el DOM y no habría nada
    // que abrir. Pedir ver un punto es motivo suficiente para encender la suya.
    setCapasActivas(prev => (prev.has(capaDe(marker.kind)) ? prev : new Set(prev).add(capaDe(marker.kind))));

    if (!vistaPrevia.current) {
      vistaPrevia.current = { center: map.getCenter(), zoom: map.getZoom() };
    }
    map.flyTo([marker.latitude, marker.longitude], Math.max(map.getZoom(), 15), { duration: 0.7 });

    // La ficha se abre cuando el mapa se detiene, no tras un temporizador a
    // ojo: a zoom 15 la agrupación que contenía este punto ya se deshizo y su
    // marcador existe. Con un setTimeout fijo se abría a veces sobre un
    // marcador que todavía no se había vuelto a montar.
    map.once('moveend', () => {
      window.setTimeout(() => markerRefs.current.get(marker.id)?.openPopup(), 60);
    });
  }, []);

  const alternarCapa = useCallback((id: CapaId) => {
    setCapasActivas(prev => {
      const siguiente = new Set(prev);
      if (siguiente.has(id)) siguiente.delete(id);
      else siguiente.add(id);
      return siguiente;
    });
  }, []);

  const alternarTodasLasCapas = useCallback((encender: boolean) => {
    setCapasActivas(encender ? new Set(capasIniciales) : new Set());
  }, []);

  const registrarMarcador = useCallback((id: string, instancia: L.Marker | null) => {
    if (instancia) markerRefs.current.set(id, instancia);
    else markerRefs.current.delete(id);
  }, []);

  const restaurarVista = useCallback(() => {
    const map = mapRef.current;
    const previa = vistaPrevia.current;
    if (!map || !previa) return;
    vistaPrevia.current = null;
    map.flyTo(previa.center, previa.zoom, { duration: 0.6 });
  }, []);

  /**
   * Llegada desde otra página con `?punto=<id>` (el botón "Ver en mapa" de la
   * lista de puntos de entrega). Se comporta igual que pulsar el marcador en
   * el mapa: acerca, abre la ficha y guarda la vista para poder volver.
   *
   * El parámetro se borra de la URL en cuanto se usa, para que recargar o
   * compartir el enlace no deje el mapa clavado en un punto para siempre.
   */
  const puntoPedido = searchParams.get('punto');

  useEffect(() => {
    if (!puntoPedido || !mapaListo || loading) return;
    const marker = markers.find(m => m.id === puntoPedido);
    if (!marker) return;

    enfocarMarcador(marker);
    setSearchParams(previos => {
      const siguiente = new URLSearchParams(previos);
      siguiente.delete('punto');
      return siguiente;
    }, { replace: true });
  }, [puntoPedido, mapaListo, loading, markers, enfocarMarcador, setSearchParams]);

  /**
   * Al cerrar la ficha de un punto, volver a la vista anterior.
   *
   * El pequeño retardo es necesario: saltar de un marcador a otro emite
   * `popupclose` e inmediatamente después `popupopen`, y sin la espera el mapa
   * se alejaría a mitad del salto. Si llega la apertura, se cancela la vuelta.
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    let pendiente: number | undefined;
    const alCerrar = () => {
      window.clearTimeout(pendiente);
      pendiente = window.setTimeout(restaurarVista, 80);
    };
    const alAbrir = () => window.clearTimeout(pendiente);

    map.on('popupclose', alCerrar);
    map.on('popupopen', alAbrir);
    return () => {
      window.clearTimeout(pendiente);
      map.off('popupclose', alCerrar);
      map.off('popupopen', alAbrir);
    };
  }, [mapaListo, restaurarVista]);

  const handleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen();
    else document.exitFullscreen();
  };

  /** "Ver todo": si hay un municipio abierto lo cierra; si no, vuelve al Chocó. */
  const handleEncuadrar = useCallback(() => {
    if (municipioSeleccionado) {
      setMunicipioSeleccionado(null);
      return;
    }
    if (!mapRef.current) return;
    encuadrarSeguro(mapRef.current, L.latLngBounds(CHOCO_BOUNDS), {
      paddingTopLeft: PADDING_ENCUADRE,
      paddingBottomRight: PADDING_ENCUADRE,
      duration: 0.6,
    });
  }, [municipioSeleccionado]);

  const handleUbicarme = useCallback(() => {
    mapRef.current?.locate({ setView: true, maxZoom: 13, enableHighAccuracy: true });
  }, []);

  // ─── El encuadre sigue a la selección ──────────────────────────────────
  //
  // Entrar a un municipio acerca la vista; salir devuelve al departamento
  // completo. Vive aquí y no en el botón "Volver" porque hay tres formas de
  // salir (botón, Escape, "Ver todo") y todas terminan en `null`.
  const municipioPrevio = useRef<string | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !municipiosGeo) return;

    const previo = municipioPrevio.current;
    municipioPrevio.current = municipioSeleccionado;

    if (municipioSeleccionado) {
      const feature = municipiosGeo.features.find(
        f => String((f.properties as any)?.MpCodigo) === municipioSeleccionado
      );
      if (!feature) return;
      const limites = L.geoJSON(feature as any).getBounds();
      if (!limites.isValid()) return;
      encuadrarSeguro(map, limites, {
        paddingTopLeft: [40, 40],
        paddingBottomRight: [40, 40],
        maxZoom: 11,
        duration: 0.7,
      });
      return;
    }

    // Solo alejamos si antes había algo seleccionado: si no, esto pisaría el
    // encuadre inicial al montar.
    if (!previo) return;
    encuadrarSeguro(map, L.latLngBounds(CHOCO_BOUNDS), {
      paddingTopLeft: PADDING_ENCUADRE,
      paddingBottomRight: PADDING_ENCUADRE,
      duration: 0.6,
    });
  }, [municipioSeleccionado, municipiosGeo]);

  // ─── Coropleto ─────────────────────────────────────────────────────────

  const estiloMunicipio = useCallback(
    (feature?: { properties: any }) => {
      const codigo = feature?.properties?.MpCodigo ? String(feature.properties.MpCodigo) : undefined;
      const dato = codigo ? afectacionPorMunicipio[codigo] : undefined;
      const nivel = getNivel(dato?.severidad);
      const seleccionado = codigo === municipioSeleccionado;

      // El relleno tiene dos modos, y el disparador es la selección.
      //
      // Sin nada seleccionado se pinta sólido: se están comparando 31
      // municipios entre sí y el color ES la información, tiene que coincidir
      // con la leyenda de un vistazo. En cuanto se entra en uno, la pregunta
      // deja de ser "cuál está peor" y pasa a ser "cómo se llega y qué hay
      // ahí" — así que la capa se retira a un velo y deja ver calles, ríos y
      // los marcadores. Al deseleccionar vuelve sola.
      const hayFoco = municipioSeleccionado !== null;

      return {
        fillColor: nivel.color,
        fillOpacity: hayFoco
          ? seleccionado
            ? 0.18
            : 0.1
          : dato
            ? 0.82
            : 0.4,
        color: seleccionado ? '#111827' : nivel.colorBorde,
        weight: seleccionado ? 2.5 : 0.8,
        opacity: seleccionado ? 1 : hayFoco ? 0.5 : 0.75,
        className: 'municipio-path',
      };
    },
    [municipioSeleccionado]
  );

  const onCadaMunicipio = useCallback(
    (feature: any, layer: L.Layer) => {
      const props = feature.properties as PropsMunicipio;
      const codigo = props?.MpCodigo ? String(props.MpCodigo) : undefined;
      if (!codigo) return;

      const dato = afectacionPorMunicipio[codigo];
      const path = layer as L.Path;

      // Etiqueta permanente solo en los municipios con afectación reportada:
      // rotular los 31 a la vez llena el mapa de texto y esconde justo lo que
      // hay que ver. Cuáles se muestran a cada zoom lo decide el CSS.
      if (dato) {
        path.bindTooltip(props.MpNombre, {
          permanent: true,
          direction: 'center',
          className: `etiqueta-municipio etiqueta-municipio--${dato.severidad}`,
          pane: PANE_ETIQUETAS_MUNICIPIO,
          opacity: 1,
        });
      } else {
        path.bindTooltip(props.MpNombre, { sticky: true, className: 'tooltip-municipio' });
      }

      path.on({
        mouseover: () => {
          path.setStyle({ weight: 2.5, color: '#111827', opacity: 1 });
          path.bringToFront();
        },
        mouseout: () => path.setStyle(estiloMunicipio(feature)),
        click: () => setMunicipioSeleccionado(codigo),
      });
    },
    [estiloMunicipio]
  );

  // Forzar el re-render del GeoJSON cuando cambia lo que decide su color.
  const claveMunicipios = `municipios-${municipioSeleccionado ?? 'ninguno'}`;

  const tiles = TILES[estiloMapa];

  const filtrosNode = (
    <MapFilters
      departments={departments}
      municipalities={municipalities}
      onFilterChange={handleFilterChange}
      onClear={handleClearFilters}
    />
  );

  return (
    <div ref={containerRef} className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-white">
      {/* ── Columna de contenido ──────────────────────────────────────────
          En escritorio es una columna real del layout, así que el mapa se
          encoge para dejarle sitio en vez de quedar tapado debajo. En móvil
          no hay ancho para dos columnas: se convierte en una hoja sobre el
          mapa. */}
      {sidebarAbierta && (
        <div className="absolute inset-x-0 bottom-0 top-16 z-[1200] flex-shrink-0 border-gray-200 bg-white md:relative md:inset-auto md:top-auto md:z-auto md:w-[22rem] md:border-r lg:w-[24rem]">
          <MapSidebar
            markers={filteredMarkers}
            loading={loading}
            nombresMunicipios={nombresMunicipios}
            municipioSeleccionado={municipioSeleccionado}
            onSeleccionarMunicipio={setMunicipioSeleccionado}
            onIrAMarcador={enfocarMarcador}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
            onApplySearch={applySearch}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(v => !v)}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            filtros={filtrosNode}
            capasActivas={capasActivas}
            onAlternarCapa={alternarCapa}
            onTodasLasCapas={alternarTodasLasCapas}
            recuentosCapa={recuentosCapa}
            capasAbiertas={capasAbiertas}
            onAlternarPanelCapas={() => setCapasAbiertas(v => !v)}
          />

          <button
            onClick={() => setSidebarAbierta(false)}
            className="absolute right-3 top-3 rounded-lg border border-gray-200 bg-white/95 p-2 shadow-sm backdrop-blur-md md:hidden"
            aria-label="Cerrar panel"
          >
            <X className="h-4 w-4 text-gray-700" />
          </button>
        </div>
      )}

      {/* ── Columna del mapa ──────────────────────────────────────────────
          `z-0` crea un contexto de apilamiento que encierra los z-index
          internos de Leaflet, cuyos controles usan valores altos y si no se
          dibujarían por encima de la hoja de datos en móvil. */}
      <div className="relative z-0 min-w-0 flex-1">
        <MapContainer
          bounds={CHOCO_BOUNDS}
          boundsOptions={{ paddingTopLeft: PADDING_ENCUADRE, paddingBottomRight: PADDING_ENCUADRE }}
          minZoom={6}
          maxZoom={16}
          maxBounds={LIMITES_PANEO}
          maxBoundsViscosity={1}
          zoomControl={false}
          className="h-full w-full"
          // Zoom en pasos enteros: con zoomSnap fraccionario Leaflet deja de
          // podar el nivel de teselas anterior y las etiquetas del zoom viejo
          // se quedan estiradas encima de las nuevas.
          zoomSnap={1}
          zoomDelta={1}
        >
          <ConfiguracionMapa />
          <CapturarMapa
            onReady={map => {
              mapRef.current = map;
              setMapaListo(true);
            }}
          />
          <ZoomExpuesto />

          <TileLayer
            key={estiloMapa}
            url={tiles.url}
            attribution={tiles.attribution}
            maxNativeZoom={18}
            keepBuffer={2}
          />

          {/* Coropleto: el indicador cálido, ámbar → carmesí por severidad */}
          {municipiosGeo && (
            <GeoJSON
              key={claveMunicipios}
              data={municipiosGeo as any}
              style={estiloMunicipio as any}
              onEachFeature={onCadaMunicipio}
            />
          )}

          {/* Máscara: el mundo menos el Chocó, para que la atención se quede adentro */}
          {mascara && (
            <GeoJSON
              key="mascara"
              data={mascara as any}
              pane={PANE_MASCARA}
              interactive={false}
              style={{ fillColor: '#f2f0ea', fillOpacity: estiloMapa === 'satelite' ? 0.72 : 0.86, stroke: false }}
            />
          )}

          {/* Contorno del departamento, por encima del relleno y de la máscara */}
          {contorno && (
            <GeoJSON
              key="contorno"
              data={contorno as any}
              pane={PANE_CONTORNO}
              interactive={false}
              style={{ fillOpacity: 0, color: '#1f2937', weight: 1.8, opacity: 0.9 }}
            />
          )}

          {/* Topónimos del mapa base, solo al acercarse: por debajo de zoom 9
              lo único que aportan es el nombre del departamento en mayúsculas
              gigantes encima de nuestras propias etiquetas. */}
          {tiles.etiquetas && (
            <TileLayer
              key={`${estiloMapa}-etiquetas`}
              url={tiles.etiquetas}
              pane={PANE_ETIQUETAS}
              minZoom={9}
              maxNativeZoom={18}
              keepBuffer={2}
            />
          )}

          {/* Anillos de distancia desde el epicentro. Este sismo fue profundo:
              el daño no se concentró junto al origen sino que se repartió por
              cientos de kilómetros, y los anillos hacen visible ese alcance. */}
          {anillosDistancia.map(anillo => (
            <Circle
              key={anillo.radioKm}
              center={[epicentro.lat, epicentro.lng]}
              radius={anillo.radioKm * 1000}
              interactive={false}
              pathOptions={{ color: '#7f1d1d', weight: 1, opacity: 0.4, dashArray: '3 6', fillOpacity: 0 }}
            />
          ))}

          {/* Ciudades de referencia, fuera del Chocó: explican por qué el saldo
              nacional es veinte veces el departamental. No son clicables. */}
          {ciudadesReferencia.map(ciudad => (
            <Marker
              key={ciudad.nombre}
              position={[ciudad.lat, ciudad.lng]}
              icon={iconoCiudad(ciudad.nombre, ciudad.fallecidos, ciudad.lado)}
              interactive={false}
              zIndexOffset={-500}
            />
          ))}

          {/* Necesidades, centros, ofertas, puntos oficiales, epicentro y
              réplicas. Los que se tapan entre sí se agrupan por capa. */}
          <MarcadoresAgrupados
            markers={filteredMarkers}
            onEnfocar={enfocarMarcador}
            registrarMarcador={registrarMarcador}
            renderPopup={marker => (
              <PopupMarcador marker={marker} onVerDetalles={() => handleVerDetalles(marker)} />
            )}
          />

          <ScaleControl position="bottomleft" imperial={false} />
        </MapContainer>

        {/* Cargando */}
        {loading && (
          <div className="pointer-events-none absolute inset-0 z-[1000] flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
              <p className="mt-3 text-sm text-gray-600">Cargando datos...</p>
            </div>
          </div>
        )}

        {/* Lo único que flota sobre el mapa: los controles de navegación */}
        <div className="absolute bottom-4 right-3 z-[600] md:right-4">
          <MapControls
            estiloMapa={estiloMapa}
            onEstiloMapaChange={setEstiloMapa}
            onZoomIn={() => mapRef.current?.zoomIn()}
            onZoomOut={() => mapRef.current?.zoomOut()}
            onEncuadrar={handleEncuadrar}
            onUbicarme={handleUbicarme}
            onPantallaCompleta={handleFullscreen}
            pantallaCompleta={pantallaCompleta}
          />
        </div>

        {/* Disparador de la columna cuando está cerrada */}
        {!sidebarAbierta && (
          <button
            onClick={() => setSidebarAbierta(true)}
            className="absolute left-3 top-3 z-[600] flex items-center gap-2 rounded-lg border border-gray-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-md transition-colors hover:bg-white"
          >
            <PanelLeftOpen className="h-4 w-4 flex-shrink-0 text-blue-700" />
            <span className="text-sm font-semibold text-gray-800">Ver datos</span>
          </button>
        )}
      </div>
    </div>
  );
};

const PopupMarcador: React.FC<{ marker: MapMarkerData; onVerDetalles: () => void }> = ({ marker, onVerDetalles }) => {
  const need = marker.need;
  const center = marker.center;
  const offer = marker.offer;
  const evento = marker.evento;
  const oficial = marker.oficial;

  return (
    <div className="popup-help space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-bold leading-snug text-gray-900">{marker.title}</h3>
        <span
          className="whitespace-nowrap rounded-full px-2 py-1 text-xs font-bold text-white"
          style={{ backgroundColor: colorMarcador(marker.kind) }}
        >
          {marker.source === 'need' ? getPriorityLabel(marker.kind as any) : marker.subtitle}
        </span>
      </div>

      {/* Epicentro y réplicas */}
      {evento && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Magnitud:</span>
            <span className="font-medium">
              {evento.magnitud.toFixed(1)} {evento.tipo === 'principal' ? 'Mw' : ''}
            </span>
          </div>
          {evento.profundidadKm && (
            <div className="flex justify-between">
              <span className="text-gray-500">Profundidad:</span>
              <span className="font-medium">{evento.profundidadKm} km</span>
            </div>
          )}
          {evento.tipo === 'replica' && (
            <div className="flex justify-between">
              <span className="text-gray-500">Del epicentro:</span>
              <span className="font-medium">{distanciaAlEpicentro(evento.lat, evento.lng).toFixed(0)} km</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Cuándo:</span>
            <span className="font-medium">
              {evento.fecha}
              {evento.horaLocal ? ` · ${evento.horaLocal}` : ''}
            </span>
          </div>
          <p className="pt-1 text-[11px] leading-snug text-gray-400">
            Fuente: {evento.fuente}
            {evento.precision === 'aproximada' && ' · ubicación aproximada'}
          </p>
          {evento.notaPrecision && (
            <p className="text-[11px] leading-snug text-gray-500">{evento.notaPrecision}</p>
          )}
        </div>
      )}

      {/* Puntos oficiales: acopio, hospital, albergue */}
      {oficial && (
        <div className="space-y-1 text-sm">
          {oficial.direccion && <p className="text-gray-600">📍 {oficial.direccion}</p>}
          {oficial.contacto && <p className="text-gray-600">📞 {oficial.contacto}</p>}
          {oficial.estado && <p className="text-gray-600">ℹ️ {oficial.estado}</p>}
          <p className="pt-1 text-[11px] leading-snug text-gray-400">
            Fuente: {oficial.fuente}
            {oficial.precision === 'aproximada' && ' · ubicación aproximada'}
          </p>
          {oficial.notaPrecision && (
            <p className="text-[11px] leading-snug text-gray-500">⚠ {oficial.notaPrecision}</p>
          )}
        </div>
      )}

      {marker.source === 'need' && need && (
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Necesitado:</span>
            <span className="font-medium">
              {need.quantity_needed} {need.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Recibido:</span>
            <span className="font-medium text-green-600">
              {need.quantity_received} {need.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Pendiente:</span>
            <span className="font-medium text-red-600">
              {Math.max(0, need.quantity_needed - need.quantity_received)} {need.unit}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-blue-600"
              style={{
                width: `${Math.min(100, (need.quantity_received / Math.max(need.quantity_needed, 1)) * 100)}%`,
              }}
            />
          </div>
          {marker.municipality && (
            <div className="mt-1 text-gray-500">
              📍 {marker.municipality}
              {marker.department && `, ${marker.department}`}
            </div>
          )}
        </div>
      )}

      {marker.source === 'center' && center && (
        <div className="space-y-1 text-sm">
          {center.address && <p className="text-gray-600">📍 {center.address}</p>}
          {center.schedule && <p className="text-gray-600">🕐 {center.schedule}</p>}
          {center.contact_phone && <p className="text-gray-600">📞 {center.contact_phone}</p>}
          {center.responsible_person && <p className="text-gray-600">👤 {center.responsible_person}</p>}
          {/* Solo los puntos publicados por una entidad traen procedencia; los
              que alguien registró desde la app la dejan vacía. */}
          {center.source && (
            <p className="pt-1 text-[11px] leading-snug text-gray-400">
              Fuente: {center.source}
              {center.location_precision === 'aproximada' && ' · ubicación aproximada'}
            </p>
          )}
          {center.location_note && (
            <p className="text-[11px] leading-snug text-gray-500">⚠ {center.location_note}</p>
          )}
        </div>
      )}

      {marker.source === 'offer' && offer && (
        <div className="space-y-1 text-sm">
          <p className="text-gray-600">
            📦 {offer.quantity} {offer.unit} disponibles
          </p>
          {offer.organization?.name && <p className="text-gray-600">🏢 {offer.organization.name}</p>}
          {offer.contact_info && <p className="text-gray-600">📞 {offer.contact_info}</p>}
        </div>
      )}

      {/* Solo los registros de la app tienen ficha propia; el epicentro y los
          puntos publicados por la Gobernación no llevan a ninguna parte. */}
      {(need || center || offer) && (
        <button
          onClick={onVerDetalles}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Ver detalles
        </button>
      )}
    </div>
  );
};

export default MapPage;
