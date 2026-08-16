import { useEffect, useRef, useState } from 'react';
import { Crosshair, Layers2, Maximize, Minimize, Minus, Plus, Scan } from 'lucide-react';
import { TILES, type EstiloMapa } from './mapTiles';

interface MapControlsProps {
  estiloMapa: EstiloMapa;
  onEstiloMapaChange: (estilo: EstiloMapa) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onEncuadrar: () => void;
  onUbicarme: () => void;
  onPantallaCompleta: () => void;
  pantallaCompleta: boolean;
}

/**
 * Cluster de controles flotante, abajo a la derecha: la esquina que Google
 * Maps reserva para navegar el mapa, y la más cómoda para el pulgar en móvil.
 */
const MapControls: React.FC<MapControlsProps> = ({
  estiloMapa,
  onEstiloMapaChange,
  onZoomIn,
  onZoomOut,
  onEncuadrar,
  onUbicarme,
  onPantallaCompleta,
  pantallaCompleta,
}) => {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => {
      if (!contenedor.current?.contains(e.target as Node)) setAbierto(false);
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  const estilos = Object.entries(TILES) as [EstiloMapa, (typeof TILES)[EstiloMapa]][];

  return (
    <div ref={contenedor} className="flex flex-col items-end gap-2">
      {/* Mapa base */}
      <div className="relative">
        {abierto && (
          <div className="absolute bottom-0 right-11 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            {estilos.map(([id, def]) => (
              <button
                key={id}
                onClick={() => {
                  onEstiloMapaChange(id);
                  setAbierto(false);
                }}
                className={`block w-full px-3 py-2 text-left transition-colors hover:bg-gray-50 ${
                  estiloMapa === id ? 'bg-blue-50' : ''
                }`}
              >
                <div className={`text-xs font-semibold ${estiloMapa === id ? 'text-blue-700' : 'text-gray-800'}`}>
                  {def.label}
                </div>
                <div className="text-[10px] leading-tight text-gray-500">{def.descripcion}</div>
              </button>
            ))}
          </div>
        )}

        <Grupo>
          <Boton
            icono={Layers2}
            etiqueta={`Mapa base: ${TILES[estiloMapa].label}`}
            activo={abierto}
            onClick={() => setAbierto(v => !v)}
          />
        </Grupo>
      </div>

      {/* Navegación */}
      <Grupo>
        <Boton icono={Plus} etiqueta="Acercar" onClick={onZoomIn} />
        <Separador />
        <Boton icono={Minus} etiqueta="Alejar" onClick={onZoomOut} />
        <Separador />
        <Boton icono={Scan} etiqueta="Ver todo el Chocó" onClick={onEncuadrar} />
        <Separador />
        <Boton icono={Crosshair} etiqueta="Mi ubicación" onClick={onUbicarme} />
        <div className="hidden sm:block">
          <Separador />
          <Boton
            icono={pantallaCompleta ? Minimize : Maximize}
            etiqueta={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
            onClick={onPantallaCompleta}
          />
        </div>
      </Grupo>
    </div>
  );
};

const Grupo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="overflow-hidden rounded-xl border border-gray-200 bg-white/95 shadow-md backdrop-blur-md">
    {children}
  </div>
);

const Separador: React.FC = () => <div className="mx-1.5 h-px bg-gray-200" />;

const Boton: React.FC<{
  icono: typeof Plus;
  etiqueta: string;
  onClick: () => void;
  activo?: boolean;
}> = ({ icono: Icono, etiqueta, onClick, activo }) => (
  <button
    onClick={onClick}
    title={etiqueta}
    aria-label={etiqueta}
    className={`group flex h-9 w-9 items-center justify-center transition-colors ${
      activo ? 'bg-blue-50' : 'hover:bg-gray-100 active:bg-gray-200'
    }`}
  >
    <Icono className={`h-4 w-4 transition-colors ${activo ? 'text-blue-700' : 'text-gray-600 group-hover:text-gray-900'}`} />
  </button>
);

export default MapControls;
