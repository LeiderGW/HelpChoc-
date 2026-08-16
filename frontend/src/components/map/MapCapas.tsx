// Interruptores de capa.
//
// Van en la columna y no flotando sobre el mapa por lo mismo que la leyenda:
// encender y apagar capas es leer datos, y todo lo que sea leer datos vive en
// la misma columna. Sobre el mapa solo queda lo que sirve para navegarlo.

import { ChevronDown, Eye, EyeOff } from 'lucide-react';
import { capasPorGrupo, type CapaId } from '../../config/capas';

interface MapCapasProps {
  activas: Set<CapaId>;
  onAlternar: (id: CapaId) => void;
  onTodas: (encender: boolean) => void;
  recuentos: Record<CapaId, number>;
  abierto: boolean;
  onAlternarPanel: () => void;
}

const MapCapas: React.FC<MapCapasProps> = ({
  activas,
  onAlternar,
  onTodas,
  recuentos,
  abierto,
  onAlternarPanel,
}) => {
  const grupos = capasPorGrupo();
  const total = grupos.reduce((s, g) => s + g.items.length, 0);
  const encendidas = grupos.reduce((s, g) => s + g.items.filter(c => activas.has(c.id)).length, 0);

  return (
    <div className="flex-shrink-0 border-b border-gray-200">
      <button
        onClick={onAlternarPanel}
        className="flex w-full items-center justify-between px-4 py-2 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-800"
        aria-expanded={abierto}
      >
        <span>
          Capas visibles{' '}
          <span className="tabular-nums text-gray-400">
            {encendidas}/{total}
          </span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="px-4 pb-3">
          <div className="mb-2 flex gap-3 text-[10px]">
            <button onClick={() => onTodas(true)} className="text-blue-600 hover:underline">
              Mostrar todas
            </button>
            <button onClick={() => onTodas(false)} className="text-gray-400 hover:underline">
              Ocultar todas
            </button>
          </div>

          {grupos.map(grupo => (
            <div key={grupo.grupo} className="mb-2 last:mb-0">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {grupo.grupo}
              </div>
              <ul className="space-y-0.5">
                {grupo.items.map(capa => {
                  const activa = activas.has(capa.id);
                  const n = recuentos[capa.id] ?? 0;

                  return (
                    <li key={capa.id}>
                      <button
                        onClick={() => onAlternar(capa.id)}
                        className={`flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-gray-50 ${
                          activa ? '' : 'opacity-45'
                        }`}
                        aria-pressed={activa}
                      >
                        <span
                          className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: capa.color }}
                        />
                        <span className="min-w-0 flex-1 truncate text-[12px] text-gray-700">{capa.nombre}</span>
                        {/* Los puntos sin dato se marcan aparte: un 0 en gris
                            dice "no hay", no "está apagada". */}
                        <span className="flex-shrink-0 text-[10px] tabular-nums text-gray-400">{n}</span>
                        {activa ? (
                          <Eye className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MapCapas;
