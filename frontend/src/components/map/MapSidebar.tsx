// Columna de contenido del mapa.
//
// ─── Por qué está dividida en pestañas ──────────────────────────────────────
//
// La primera versión apilaba en una sola columna: cabecera del sismo con tres
// cifras, nota de fuente de tres líneas, buscador, contador, los doce
// municipios y una leyenda de doce filas. Todo abierto a la vez, todo
// compitiendo, y el usuario tenía que barrer la columna entera para encontrar
// cualquier cosa.
//
// Tres cambios, todos de la misma idea —enseñar menos a la vez—:
//
//  1. La nota de fuente y la leyenda completa pasan a desplegables. Son
//     importantes pero se consultan una vez, no en cada mirada.
//  2. Los dos conjuntos de datos (municipios afectados / puntos de ayuda) se
//     separan en pestañas en vez de competir por la misma lista.
//  3. Menos tamaños de letra y más aire: antes había seis escalas distintas
//     en la misma columna, lo que hacía imposible saber qué era más importante.

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronLeft, Filter, MessageSquarePlus, Search, X } from 'lucide-react';

import Button from '../common/Button';
import MapCapas from './MapCapas';
import MapLegend from './MapLegend';
import type { CapaId } from '../../config/capas';
import { colorMarcador, formaMarcador } from './markerIcons';
import type { MapMarkerData } from '../../hooks/useMapMarkers';
import {
  afectacionPorMunicipio,
  getNivel,
  municipiosConAfectacion,
  normalizarNombre,
  sismoChoco,
  type AfectacionMunicipio,
} from '../../config/afectacion';

type Pestana = 'municipios' | 'ayuda';

interface MetaMunicipio {
  subregion: string | null;
  areaKm2: number | null;
  distanciaEpicentroKm: number | null;
}

interface MapSidebarProps {
  markers: MapMarkerData[];
  loading: boolean;
  nombresMunicipios: Record<string, string>;
  metaMunicipios: Record<string, MetaMunicipio>;
  municipioSeleccionado: string | null;
  onSeleccionarMunicipio: (mpCodigo: string | null) => void;
  onIrAMarcador: (marker: MapMarkerData) => void;
  searchQuery: string;
  onSearchQueryChange: (valor: string) => void;
  onApplySearch: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  filtros: React.ReactNode;
  capasActivas: Set<CapaId>;
  onAlternarCapa: (id: CapaId) => void;
  onTodasLasCapas: (encender: boolean) => void;
  recuentosCapa: Record<CapaId, number>;
  capasAbiertas: boolean;
  onAlternarPanelCapas: () => void;
}

const MapSidebar: React.FC<MapSidebarProps> = ({
  markers,
  loading,
  nombresMunicipios,
  metaMunicipios,
  municipioSeleccionado,
  onSeleccionarMunicipio,
  onIrAMarcador,
  searchQuery,
  onSearchQueryChange,
  onApplySearch,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  onClearFilters,
  filtros,
  capasActivas,
  onAlternarCapa,
  onTodasLasCapas,
  recuentosCapa,
  capasAbiertas,
  onAlternarPanelCapas,
}) => {
  const [pestana, setPestana] = useState<Pestana>('municipios');
  const [fuenteAbierta, setFuenteAbierta] = useState(false);

  // Marcadores agrupados por municipio, cruzando por nombre normalizado.
  const marcadoresPorMunicipio = useMemo(() => {
    const mapa = new Map<string, MapMarkerData[]>();
    markers.forEach(marker => {
      if (!marker.municipality) return;
      const clave = normalizarNombre(marker.municipality);
      const lista = mapa.get(clave);
      if (lista) lista.push(marker);
      else mapa.set(clave, [marker]);
    });
    return mapa;
  }, [markers]);

  const contarAyuda = (mpNombre: string) =>
    marcadoresPorMunicipio.get(normalizarNombre(mpNombre))?.length ?? 0;

  const afectados = useMemo(() => municipiosConAfectacion(), []);

  const seleccionado: AfectacionMunicipio | undefined = municipioSeleccionado
    ? afectacionPorMunicipio[municipioSeleccionado]
    : undefined;

  const nombreSeleccionado = municipioSeleccionado
    ? (seleccionado?.mpNombre ?? nombresMunicipios[municipioSeleccionado] ?? 'Municipio')
    : null;

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Al seleccionar un municipio, la ficha ocupa toda la columna: cabecera
          del sismo, buscador, capas y pestañas se retiran en vez de quedar
          fijos arriba compitiendo con el detalle. "Volver" es la única salida,
          igual que un drill-down normal — no dos formas de deshacer lo mismo. */}
      {!municipioSeleccionado && (
        <>
          {/* ── Cabecera ───────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-4 pb-3 pt-3.5">
            <div className="flex items-baseline gap-2">
              <h1 className="text-[15px] font-bold leading-none text-gray-900">Sismo del Chocó</h1>
              {/* Etiqueta neutra, no carmesí: el carmesí es un valor de la escala
                  de severidad del mapa. Una magnitud no es un nivel de afectación,
                  y pintarla igual hacía que el color dejara de significar algo. */}
              <span className="rounded bg-gray-900 px-1.5 py-0.5 font-mono text-[11px] font-bold leading-none text-white">
                M{sismoChoco.magnitud}
              </span>
            </div>
            <p className="mt-1.5 text-[11px] text-gray-500">
              {sismoChoco.fecha} · {sismoChoco.horaLocal} · {sismoChoco.profundidadKm} km
            </p>

            <div className="mt-3 flex items-stretch gap-2">
              <Cifra valor={sismoChoco.fallecidos} etiqueta="Fallecidos" />
              <Cifra valor={sismoChoco.heridos} etiqueta="Heridos" />
              <Cifra valor={sismoChoco.viviendasDestruidas.toLocaleString('es-CO')} etiqueta="Viviendas" />
            </div>

            <button
              onClick={() => setFuenteAbierta(v => !v)}
              className="mt-2 flex w-full items-center gap-1 text-[10px] text-gray-400 transition-colors hover:text-gray-600"
              aria-expanded={fuenteAbierta}
            >
              <ChevronDown className={`h-3 w-3 transition-transform ${fuenteAbierta ? 'rotate-180' : ''}`} />
              Fuente y alcance de las cifras
            </button>
            {fuenteAbierta && (
              <p className="mt-1.5 rounded-lg bg-gray-50 p-2 text-[10px] leading-relaxed text-gray-500">
                {sismoChoco.municipiosAfectados} de {sismoChoco.municipiosTotales} municipios afectados.{' '}
                {sismoChoco.fuente}, corte {sismoChoco.corte}. Son cifras de la fase de emergencia: el censo de
                damnificados sigue pendiente, así que las de vivienda son las que más van a moverse.
              </p>
            )}
          </div>

          {/* ── Buscador ───────────────────────────────────────────────── */}
          <div className="flex-shrink-0 px-4 pb-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                <input
                  type="text"
                  placeholder="Buscar necesidad o municipio..."
                  className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={e => onSearchQueryChange(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onApplySearch()}
                />
              </div>
              <Button variant="outline" size="sm" onClick={onToggleFilters} aria-label="Filtros">
                <Filter size={15} />
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={onClearFilters} aria-label="Limpiar filtros">
                  <X size={15} />
                </Button>
              )}
            </div>
            {showFilters && <div className="mt-2">{filtros}</div>}
          </div>

          {/* ── Capas ──────────────────────────────────────────────────── */}
          <MapCapas
            activas={capasActivas}
            onAlternar={onAlternarCapa}
            onTodas={onTodasLasCapas}
            recuentos={recuentosCapa}
            abierto={capasAbiertas}
            onAlternarPanel={onAlternarPanelCapas}
          />

          {/* ── Pestañas ──────────────────────────────────────────────── */}
          <div className="flex flex-shrink-0 gap-4 border-b border-gray-200 px-4">
            <Tab activa={pestana === 'municipios'} onClick={() => setPestana('municipios')} recuento={afectados.length}>
              Municipios
            </Tab>
            <Tab activa={pestana === 'ayuda'} onClick={() => setPestana('ayuda')} recuento={markers.length}>
              Ayuda
            </Tab>
          </div>
        </>
      )}

      {/* ── Cuerpo ─────────────────────────────────────────────────────── */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <div className="px-4 py-10 text-center text-[13px] text-gray-400">Cargando datos...</div>
        ) : municipioSeleccionado ? (
          <DetalleMunicipio
            nombre={nombreSeleccionado!}
            afectacion={seleccionado}
            meta={metaMunicipios[municipioSeleccionado]}
            marcadores={marcadoresPorMunicipio.get(normalizarNombre(nombreSeleccionado!)) ?? []}
            esEpicentro={municipioSeleccionado === sismoChoco.epicentroMpCodigo}
            onVolver={() => onSeleccionarMunicipio(null)}
            onIrAMarcador={onIrAMarcador}
          />
        ) : pestana === 'municipios' ? (
          <ListaMunicipios
            municipios={afectados}
            contarAyuda={contarAyuda}
            onSeleccionar={onSeleccionarMunicipio}
          />
        ) : (
          <ListaAyuda marcadores={markers} onIrAMarcador={onIrAMarcador} />
        )}
      </div>

      {!municipioSeleccionado && <MapLegend />}
    </div>
  );
};

// ─── Piezas ──────────────────────────────────────────────────────────────────

/**
 * El azul es el único acento de la interfaz, y significa siempre lo mismo:
 * "esto está activo o se puede pulsar" — igual que la pestaña actual en la
 * barra de navegación del sitio. Todo lo demás de la columna es gris, para
 * que el único color con carga informativa sea el de los datos.
 */
const Tab: React.FC<{
  activa: boolean;
  onClick: () => void;
  recuento: number;
  children: React.ReactNode;
}> = ({ activa, onClick, recuento, children }) => (
  <button
    onClick={onClick}
    className={`-mb-px border-b-2 px-0.5 py-2 text-[13px] font-medium transition-colors ${
      activa ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-800'
    }`}
  >
    {children}
    <span
      className={`ml-1.5 text-[11px] tabular-nums ${activa ? 'text-blue-400' : 'text-gray-400'}`}
    >
      {recuento}
    </span>
  </button>
);

/**
 * Las tres cifras van del mismo color a propósito.
 *
 * Antes "13" iba en carmesí para subrayar que eran muertes. Pero el carmesí ya
 * significa otra cosa en esta pantalla —es el extremo de la rampa de
 * severidad— y usarlo aquí lo convertía en decoración: el mismo color
 * diciendo dos cosas distintas a diez centímetros de distancia. La gravedad ya
 * la carga la palabra "Fallecidos"; el número no necesita gritar.
 */
const Cifra: React.FC<{ valor: number | string; etiqueta: string }> = ({ valor, etiqueta }) => (
  <div className="flex-1 rounded-lg bg-gray-50 px-2 py-1.5">
    <div className="font-mono text-base font-bold leading-none text-gray-900">{valor}</div>
    <div className="mt-1 text-[10px] leading-tight text-gray-500">{etiqueta}</div>
  </div>
);

/** Punto que reproduce la forma real del marcador en el mapa. */
const PuntoForma: React.FC<{ marker: MapMarkerData }> = ({ marker }) => {
  const forma = formaMarcador(marker.kind);
  const color = colorMarcador(marker.kind);
  const radio = forma === 'insignia' ? '3px' : forma === 'gota' ? '50% 50% 50% 1px' : '50%';

  return (
    <span
      className="h-2.5 w-2.5 flex-shrink-0 border border-white shadow-sm"
      style={{
        backgroundColor: forma === 'replica' ? 'rgba(179,57,31,0.18)' : color,
        borderColor: forma === 'replica' ? color : '#fff',
        borderRadius: radio,
        transform: forma === 'gota' ? 'rotate(-45deg)' : undefined,
      }}
    />
  );
};

// ─── Listado de municipios ───────────────────────────────────────────────────

const ListaMunicipios: React.FC<{
  municipios: AfectacionMunicipio[];
  contarAyuda: (nombre: string) => number;
  onSeleccionar: (mpCodigo: string) => void;
}> = ({ municipios, contarAyuda, onSeleccionar }) => (
  <div className="py-1.5">
    {municipios.map(m => {
      const nivel = getNivel(m.severidad);
      const ayuda = contarAyuda(m.mpNombre);

      return (
        <button
          key={m.mpCodigo}
          onClick={() => onSeleccionar(m.mpCodigo)}
          className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-gray-50"
        >
          <span
            className="h-7 w-1 flex-shrink-0 rounded-full"
            style={{ backgroundColor: nivel.color }}
            aria-hidden="true"
          />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-gray-900">{m.mpNombre}</span>
            <span className="block text-[11px] text-gray-500">
              {nivel.etiquetaCorta}
              {m.fallecidos ? ` · ${m.fallecidos} fallecido${m.fallecidos === 1 ? '' : 's'}` : ''}
              {m.heridos ? ` · ${m.heridos} herido${m.heridos === 1 ? '' : 's'}` : ''}
            </span>
          </span>
          {/* Neutro y no azul: el azul de esta pantalla significa "activo /
              pulsable" (pestaña actual, botones, foco). Un recuento no es
              ninguna de las dos cosas, y en azul se leía como un enlace. */}
          {ayuda > 0 && (
            <span className="flex-shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-gray-600">
              {ayuda}
            </span>
          )}
        </button>
      );
    })}

    <p className="px-4 pb-2 pt-3 text-[10px] leading-snug text-gray-400">
      Los {sismoChoco.municipiosTotales - municipios.length} municipios restantes aparecen en gris: no tienen cifra
      publicada, lo que no significa que no hayan sufrido daños.
    </p>
  </div>
);

// ─── Listado de puntos de ayuda ──────────────────────────────────────────────

const ORDEN_GRUPOS: { clave: MapMarkerData['source']; titulo: string }[] = [
  { clave: 'need', titulo: 'Necesidades' },
  { clave: 'oficial', titulo: 'Puntos oficiales' },
  { clave: 'center', titulo: 'Centros registrados' },
  { clave: 'offer', titulo: 'Ayuda ofrecida' },
  { clave: 'evento', titulo: 'Sismo y réplicas' },
];

const ListaAyuda: React.FC<{
  marcadores: MapMarkerData[];
  onIrAMarcador: (marker: MapMarkerData) => void;
}> = ({ marcadores, onIrAMarcador }) => {
  const grupos = ORDEN_GRUPOS.map(g => ({
    ...g,
    items: marcadores.filter(m => m.source === g.clave),
  })).filter(g => g.items.length > 0);

  if (grupos.length === 0) {
    return <p className="px-4 py-10 text-center text-[13px] text-gray-400">No hay puntos que coincidan.</p>;
  }

  return (
    <div className="py-1.5">
      {grupos.map(grupo => (
        <div key={grupo.clave} className="pb-1">
          <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
            {grupo.titulo}
          </div>
          {grupo.items.map(marker => (
            <button
              key={marker.id}
              onClick={() => onIrAMarcador(marker)}
              className="flex w-full items-center gap-2.5 px-4 py-1.5 text-left transition-colors hover:bg-gray-50"
            >
              <PuntoForma marker={marker} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-gray-800">{marker.title}</span>
                <span className="block truncate text-[11px] text-gray-500">
                  {marker.subtitle}
                  {marker.municipality ? ` · ${marker.municipality}` : ''}
                </span>
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Ficha de un municipio ───────────────────────────────────────────────────

const DetalleMunicipio: React.FC<{
  nombre: string;
  afectacion?: AfectacionMunicipio;
  meta?: MetaMunicipio;
  marcadores: MapMarkerData[];
  esEpicentro: boolean;
  onVolver: () => void;
  onIrAMarcador: (marker: MapMarkerData) => void;
}> = ({ nombre, afectacion, meta, marcadores, esEpicentro, onVolver, onIrAMarcador }) => {
  const navigate = useNavigate();
  const nivel = getNivel(afectacion?.severidad);

  const hayCifras =
    !!afectacion &&
    (afectacion.fallecidos !== null ||
      afectacion.heridos !== null ||
      afectacion.viviendasColapsadas !== null ||
      afectacion.viviendasDanadas !== null);

  return (
    <div className="pb-4">
      <button
        onClick={onVolver}
        className="flex items-center gap-1 px-4 py-2.5 text-[13px] font-medium text-gray-600 transition-colors hover:text-gray-900"
      >
        <ChevronLeft size={15} />
        Volver
      </button>

      {/* La severidad deja de ser una etiqueta suelta y pasa a ser el fondo de
          toda la cabecera: es lo primero que se percibe, antes de leer una
          sola cifra — igual que el resto del mapa, donde el color ES el dato. */}
      <div className="px-4 pb-4 pt-1" style={{ backgroundColor: nivel.color }}>
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: nivel.colorTexto, opacity: 0.72 }}>
          Chocó{meta?.subregion ? ` · ${meta.subregion}` : ''}
        </p>
        <h2 className="mt-0.5 text-[26px] font-bold leading-tight" style={{ color: nivel.colorTexto }}>
          {nombre}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.28)', color: nivel.colorTexto }}
          >
            {nivel.etiqueta}
          </span>
          {esEpicentro && (
            <span
              className="rounded-full border px-2 py-1 text-[10px] font-bold"
              style={{ borderColor: nivel.colorTexto, color: nivel.colorTexto }}
            >
              EPICENTRO
            </span>
          )}
        </div>
      </div>

      <div className="px-4">
        {(meta?.distanciaEpicentroKm != null || meta?.areaKm2 != null) && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            {meta?.distanciaEpicentroKm != null && (
              <TarjetaCifra valor={`${Math.round(meta.distanciaEpicentroKm)} km`} etiqueta="Distancia al epicentro" />
            )}
            {meta?.areaKm2 != null && (
              <TarjetaCifra valor={`${Math.round(meta.areaKm2).toLocaleString('es-CO')} km²`} etiqueta="Extensión" />
            )}
          </div>
        )}

        {hayCifras && (
          <div className="mt-3 overflow-hidden rounded-lg border border-gray-200">
            <div className="bg-gray-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
              Afectación reportada
            </div>
            <dl className="px-3">
              {afectacion!.fallecidos !== null && <Fila termino="Fallecidos" valor={afectacion!.fallecidos} />}
              {afectacion!.heridos !== null && <Fila termino="Heridos" valor={afectacion!.heridos} />}
              {afectacion!.viviendasColapsadas !== null && (
                <Fila termino="Viviendas colapsadas" valor={afectacion!.viviendasColapsadas} />
              )}
              {afectacion!.viviendasDanadas !== null && (
                <Fila termino="Viviendas dañadas" valor={afectacion!.viviendasDanadas} />
              )}
            </dl>
          </div>
        )}

        {afectacion ? (
          <>
            <div className="mt-3 rounded-lg border border-gray-200 p-3">
              <p className="text-[13px] leading-relaxed text-gray-700">{afectacion.descripcion}</p>
            </div>
            <p className="mt-2 text-[10px] leading-snug text-gray-400">
              Fuente: {afectacion.fuente} · Corte {afectacion.fechaCorte}
              {afectacion.preliminar && ' · Cifra preliminar'}
            </p>
          </>
        ) : (
          <div className="mt-3 flex gap-2 rounded-lg bg-gray-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <p className="text-[12px] leading-relaxed text-gray-600">{nivel.descripcion}</p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-gray-200 px-4 pt-3">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
          Ayuda registrada aquí
        </div>

        {marcadores.length === 0 ? (
          <p className="py-1 text-[12px] text-gray-400">
            Sin necesidades, centros ni ayudas registradas en este municipio.
          </p>
        ) : (
          <ul className="-mx-2">
            {marcadores.map(marker => (
              <li key={marker.id}>
                <button
                  onClick={() => onIrAMarcador(marker)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-gray-50"
                >
                  <PuntoForma marker={marker} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-gray-800">{marker.title}</span>
                    <span className="block truncate text-[11px] text-gray-500">{marker.subtitle}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cierre accionable: sismoHelp termina en "ayúdanos a corregir este
          dato" porque esa ficha vive de correcciones de la comunidad. El
          bucle de esta app es otro — conectar necesidad con ayuda — así que
          la ficha cierra empujando hacia ESE bucle en vez de imitar un botón
          que no tenemos cómo cumplir. */}
      <div className="mt-4 px-4">
        <Button variant="primary" fullWidth onClick={() => navigate('/reportar-necesidad')} className="gap-2">
          <MessageSquarePlus size={16} />
          Reportar una necesidad aquí
        </Button>
      </div>
    </div>
  );
};

const TarjetaCifra: React.FC<{ valor: string; etiqueta: string }> = ({ valor, etiqueta }) => (
  <div className="rounded-lg border border-gray-200 px-3 py-2.5">
    <div className="font-mono text-[15px] font-bold leading-none text-gray-900">{valor}</div>
    <div className="mt-1 text-[11px] leading-tight text-gray-500">{etiqueta}</div>
  </div>
);

const Fila: React.FC<{ termino: string; valor: number | string }> = ({ termino, valor }) => (
  <div className="flex justify-between gap-4 border-t border-gray-100 py-1.5 text-[12px]">
    <dt className="text-gray-500">{termino}</dt>
    <dd className="m-0 text-right font-mono font-semibold text-gray-800">{valor}</dd>
  </div>
);

export default MapSidebar;
