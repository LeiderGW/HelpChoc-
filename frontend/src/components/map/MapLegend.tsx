// Leyenda, al pie de la columna.
//
// Ocupaba doce filas fijas con las nueve categorías de marcador desglosadas,
// la rampa y un párrafo de advertencia — más alto que la lista que debía
// acompañar. Ahora lo permanente es lo que no se puede deducir mirando el
// mapa (la rampa de severidad, que traduce color a gravedad) y el resto vive
// detrás de un desplegable.

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { escalaSeveridad } from '../../config/afectacion';
import { colorMarcador, formaMarcador, glifoMarcador, type MapMarkerKind } from './markerIcons';

const FAMILIAS: { titulo: string; kinds: MapMarkerKind[] }[] = [
  { titulo: 'Necesidades', kinds: ['critical', 'high', 'medium', 'low'] },
  { titulo: 'Respuesta', kinds: ['aid', 'collection', 'delivery', 'shelter', 'medical'] },
  { titulo: 'Sismo', kinds: ['epicentro', 'replica'] },
];

const ETIQUETAS_CORTAS: Partial<Record<MapMarkerKind, string>> = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  aid: 'Ayuda disponible',
  collection: 'Acopio',
  delivery: 'Entrega',
  shelter: 'Albergue',
  medical: 'Salud',
  epicentro: 'Epicentro',
  replica: 'Réplica',
};

const MapLegend: React.FC = () => {
  const [abierta, setAbierta] = useState(false);
  const rampa = [...escalaSeveridad].reverse();

  return (
    <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50">
      {/* Permanente: la rampa. Es lo único que no se puede deducir mirando. */}
      <div className="px-4 pb-2 pt-2.5">
        <div className="flex h-2.5 overflow-hidden rounded-sm border border-gray-300">
          {rampa.map(nivel => (
            <span
              key={nivel.id}
              className="flex-1"
              style={{ backgroundColor: nivel.color }}
              title={`${nivel.etiqueta} — ${nivel.descripcion}`}
            />
          ))}
        </div>
        {/* Las etiquetas van en gris: el color ya está en la barra de encima.
            Repetirlo en el texto no añade información y mete un tono cálido
            más en una columna que sigue la paleta del sitio. */}
        <div className="mt-1 flex justify-between text-[10px] text-gray-500">
          <span>Sin dato</span>
          <span>Afectación del sismo</span>
          <span className="font-semibold text-gray-700">Crítica</span>
        </div>
      </div>

      <button
        onClick={() => setAbierta(v => !v)}
        className="flex w-full items-center justify-between px-4 py-2 text-[11px] font-medium text-gray-500 transition-colors hover:text-gray-800"
        aria-expanded={abierta}
      >
        <span>Qué significa cada símbolo</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${abierta ? 'rotate-180' : ''}`} />
      </button>

      {abierta && (
        <div className="space-y-2.5 border-t border-gray-200 px-4 pb-3 pt-2.5">
          {FAMILIAS.map(familia => (
            <div key={familia.titulo}>
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                {familia.titulo}
              </div>
              <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                {familia.kinds.map(kind => (
                  <li key={kind} className="flex items-center gap-1.5">
                    <Simbolo kind={kind} />
                    <span className="text-[10px] text-gray-600">{ETIQUETAS_CORTAS[kind]}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="border-t border-gray-200 pt-2 text-[10px] leading-snug text-gray-400">
            Gris no significa “sin daño”: son municipios sin cifra publicada. La Gobernación reporta 29 municipios
            afectados pero no desglosó las cifras uno por uno.
          </p>
        </div>
      )}
    </div>
  );
};

/** Reproduce en pequeño la forma real del marcador, no un punto genérico. */
const Simbolo: React.FC<{ kind: MapMarkerKind }> = ({ kind }) => {
  const color = colorMarcador(kind);
  const forma = formaMarcador(kind);
  const glifo = glifoMarcador(kind);

  if (forma === 'replica') {
    return (
      <span
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full border-2"
        style={{ borderColor: color, backgroundColor: 'rgba(179,57,31,0.18)' }}
      />
    );
  }

  const radio = forma === 'insignia' ? '3px' : forma === 'gota' ? '50% 50% 50% 1px' : '50%';

  return (
    <span
      className="grid h-3 w-3 flex-shrink-0 place-items-center border border-white shadow-sm"
      style={{
        backgroundColor: color,
        borderRadius: radio,
        transform: forma === 'gota' ? 'rotate(-45deg)' : undefined,
      }}
    >
      {glifo && forma !== 'gota' && (
        <svg
          viewBox="0 0 24 24"
          className="h-2 w-2"
          style={{ fill: forma === 'epicentro' ? '#fff' : 'none', stroke: '#fff', strokeWidth: 3 }}
          dangerouslySetInnerHTML={{ __html: glifo }}
        />
      )}
    </span>
  );
};

export default MapLegend;
