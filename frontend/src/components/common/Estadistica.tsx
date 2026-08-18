import React from 'react';

/**
 * Cifra con su etiqueta.
 *
 * Existe porque cada pantalla resolvía esto a su manera y el número acababa
 * "flotando" lejos de la palabra que lo explica. Tres reglas, siempre las
 * mismas:
 *
 *  1. `leading-none` en el número y una separación corta debajo. Con la
 *     interlínea por defecto, un número de 30 px arrastra ~12 px de aire y el
 *     par deja de leerse como una sola unidad.
 *  2. `tabular-nums`: las cifras ocupan todas lo mismo, así una fila de
 *     tarjetas no se desalinea al pasar de 9 a 10 ni baila al actualizarse.
 *  3. El color es opcional y por defecto no se usa. En una fila de seis
 *     cifras, seis colores distintos no ordenan nada — solo el dato que de
 *     verdad es una alarma se pinta.
 *
 * Semánticamente es una lista de definición: la etiqueta es el término y la
 * cifra su valor, que es como lo anuncian los lectores de pantalla.
 */
const Estadistica: React.FC<{
  valor: number | string;
  etiqueta: string;
  /** Solo para cifras que son una alarma, no para decorar. */
  tono?: 'neutro' | 'alerta';
  /** Detalle opcional bajo la etiqueta (fuente, matiz, unidad). */
  nota?: string;
  className?: string;
}> = ({ valor, etiqueta, tono = 'neutro', nota, className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    <dd
      className={`order-1 font-mono text-[28px] font-bold leading-none tabular-nums ${
        tono === 'alerta' ? 'text-red-700' : 'text-gray-900'
      }`}
    >
      {valor}
    </dd>
    {/* `order-2` deja el término después en el DOM sin romper la lectura:
        visualmente la cifra manda, pero el par sigue siendo dt/dd. */}
    <dt className="order-2 mt-1.5 text-[13px] leading-snug text-gray-600">{etiqueta}</dt>
    {nota && <p className="order-3 mt-0.5 text-[11px] leading-snug text-gray-400">{nota}</p>}
  </div>
);

export default Estadistica;
