import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type:
    | 'critical'
    | 'high'
    | 'medium'
    | 'aid'
    | 'collection'
    | 'delivery'
    | 'shelter'
    | 'medical';
  title: string;
  description: string;
  data: any;
  onClick?: (data: any) => void;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  onMarkerClick?: (data: any) => void;
  className?: string;
  height?: string;
  interactive?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = [-76.5, 5.7],
  zoom = 7,
  markers = [],
  onMarkerClick,
  className = '',
  height = '100%',
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  const [mapLoaded, setMapLoaded] = useState(false);

  // Límites del Chocó
  const chocoBounds = useRef<mapboxgl.LngLatBounds | null>(null);

  /*
   * ============================================================
   * COLORES DE LOS MARCADORES
   * ============================================================
   */

  const getMarkerColor = (type: string) => {
    const colors: Record<string, string> = {
      critical: '#DC2626',
      high: '#F97316',
      medium: '#EAB308',
      aid: '#22C55E',
      collection: '#3B82F6',
      delivery: '#8B5CF6',
      shelter: '#EC4899',
      medical: '#14B8A6',
    };

    return colors[type] || '#6B7280';
  };

  /*
   * ============================================================
   * ICONOS DE LOS MARCADORES
   * ============================================================
   */

  const getMarkerIcon = (type: string) => {
    const icons: Record<string, string> = {
      critical: '⚠',
      high: '🔴',
      medium: '🟡',
      aid: '✓',
      collection: '📦',
      delivery: '🚚',
      shelter: '🏠',
      medical: '🏥',
    };

    return icons[type] || '•';
  };

  /*
   * ============================================================
   * OBTENER COORDENADAS DEL GEOJSON
   * ============================================================
   */

  const extendCoordinates = (
    coordinates: any,
    bounds: mapboxgl.LngLatBounds
  ) => {
    if (!coordinates) return;

    // Coordenada [longitude, latitude]
    if (
      Array.isArray(coordinates) &&
      coordinates.length >= 2 &&
      typeof coordinates[0] === 'number' &&
      typeof coordinates[1] === 'number'
    ) {
      bounds.extend([
        coordinates[0],
        coordinates[1],
      ]);

      return;
    }

    // Arrays anidados
    if (Array.isArray(coordinates)) {
      coordinates.forEach((coordinate) => {
        extendCoordinates(coordinate, bounds);
      });
    }
  };

  /*
   * ============================================================
   * CREAR MAPA
   * ============================================================
   */

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,

      style: 'mapbox://styles/mapbox/light-v11',

      center,

      zoom,

      interactive,

      // Evita una navegación demasiado alejada
      minZoom: 6,
    });

    map.current = mapInstance;

    /*
     * ============================================================
     * CONTROLES
     * ============================================================
     */

    if (interactive) {
      mapInstance.addControl(
        new mapboxgl.NavigationControl(),
        'top-right'
      );

      mapInstance.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true,
          },
          trackUserLocation: true,
        }),
        'top-right'
      );
    }

    /*
     * ============================================================
     * CUANDO MAPBOX TERMINA DE CARGAR
     * ============================================================
     */

    mapInstance.on('load', async () => {
      try {
        /*
         * --------------------------------------------------------
         * CARGAR GEOJSON DEL CHOCÓ
         * --------------------------------------------------------
         */

        const response = await fetch(
          '/geojson/choco.geojson'
        );

        if (!response.ok) {
          throw new Error(
            `No se pudo cargar el GeoJSON: ${response.status}`
          );
        }

        const chocoGeoJSON = await response.json();

        /*
         * --------------------------------------------------------
         * CALCULAR BOUNDS DEL CHOCÓ
         * --------------------------------------------------------
         */

        const bounds = new mapboxgl.LngLatBounds();

        chocoGeoJSON.features?.forEach(
          (feature: any) => {
            if (!feature.geometry) return;

            extendCoordinates(
              feature.geometry.coordinates,
              bounds
            );
          }
        );

        if (!bounds.isEmpty()) {
          chocoBounds.current = bounds;

          /*
           * ------------------------------------------------------
           * CENTRAR EL MAPA EN EL CHOCÓ
           * ------------------------------------------------------
           */

          mapInstance.fitBounds(bounds, {
            padding: 40,
            duration: 0,
            maxZoom: 9,
          });

          /*
           * ------------------------------------------------------
           * BLOQUEAR NAVEGACIÓN FUERA DEL CHOCÓ
           * ------------------------------------------------------
           *
           * Se agrega un pequeño margen para que el mapa no
           * quede demasiado rígido en los bordes.
           */

          const sw = bounds.getSouthWest();
          const ne = bounds.getNorthEast();

          const paddingLng = 0.15;
          const paddingLat = 0.15;

          const restrictedBounds =
            new mapboxgl.LngLatBounds(
              [
                sw.lng - paddingLng,
                sw.lat - paddingLat,
              ],
              [
                ne.lng + paddingLng,
                ne.lat + paddingLat,
              ]
            );

          mapInstance.setMaxBounds(
            restrictedBounds
          );
        }

        /*
         * --------------------------------------------------------
         * AGREGAR GEOJSON
         * --------------------------------------------------------
         */

        if (
          mapInstance.getSource('choco')
        ) {
          return;
        }

        mapInstance.addSource('choco', {
          type: 'geojson',
          data: chocoGeoJSON,
        });

        /*
         * --------------------------------------------------------
         * RELLENO DEL CHOCÓ
         * --------------------------------------------------------
         */

        mapInstance.addLayer({
          id: 'choco-fill',
          type: 'fill',
          source: 'choco',
          paint: {
            'fill-color': '#2563EB',
            'fill-opacity': 0.08,
          },
        });

        /*
         * --------------------------------------------------------
         * BORDE DE MUNICIPIOS
         * --------------------------------------------------------
         */

        mapInstance.addLayer({
          id: 'choco-municipalities',
          type: 'line',
          source: 'choco',
          paint: {
            'line-color': '#64748B',
            'line-width': 1,
            'line-opacity': 0.8,
          },
        });

        /*
         * --------------------------------------------------------
         * BORDE PRINCIPAL DEL CHOCÓ
         * --------------------------------------------------------
         */

        mapInstance.addLayer({
          id: 'choco-outline',
          type: 'line',
          source: 'choco',
          paint: {
            'line-color': '#1D4ED8',
            'line-width': 3,
            'line-opacity': 1,
          },
        });

        /*
         * --------------------------------------------------------
         * EVENTO CLICK SOBRE MUNICIPIOS
         * --------------------------------------------------------
         */

        mapInstance.on(
          'click',
          'choco-fill',
          (event) => {
            if (!event.features?.length) {
              return;
            }

            const feature =
              event.features[0];

            const properties =
              feature.properties || {};

            /*
             * Intentamos encontrar el nombre del municipio
             * utilizando diferentes nombres de propiedades
             * habituales en GeoJSON.
             */

            const municipalityName =
              properties.name ||
              properties.NAME ||
              properties.NOMBRE ||
              properties.NOM_MUN ||
              properties.municipio ||
              properties.MUNICIPIO ||
              'Municipio del Chocó';

            /*
             * Mostrar popup del municipio
             */

            new mapboxgl.Popup({
              closeButton: true,
              closeOnClick: true,
              maxWidth: '280px',
            })
              .setLngLat(event.lngLat)
              .setHTML(`
                <div style="
                  padding: 8px;
                  font-family: Arial, sans-serif;
                ">
                  <h3 style="
                    margin: 0 0 5px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                  ">
                    ${municipalityName}
                  </h3>

                  <p style="
                    margin: 0;
                    font-size: 13px;
                    color: #6B7280;
                  ">
                    Chocó, Colombia
                  </p>
                </div>
              `)
              .addTo(mapInstance);
          }
        );

        /*
         * --------------------------------------------------------
         * CAMBIAR CURSOR SOBRE MUNICIPIOS
         * --------------------------------------------------------
         */

        mapInstance.on(
          'mouseenter',
          'choco-fill',
          () => {
            mapInstance.getCanvas().style.cursor =
              'pointer';
          }
        );

        mapInstance.on(
          'mouseleave',
          'choco-fill',
          () => {
            mapInstance.getCanvas().style.cursor =
              '';
          }
        );

        /*
         * --------------------------------------------------------
         * MAPA LISTO
         * --------------------------------------------------------
         */

        setMapLoaded(true);

      } catch (error) {
        console.error(
          'Error cargando GeoJSON del Chocó:',
          error
        );

        /*
         * Aunque falle el GeoJSON,
         * permitimos que el mapa continúe funcionando.
         */

        setMapLoaded(true);
      }
    });

    /*
     * ============================================================
     * LIMPIEZA
     * ============================================================
     */

    return () => {
      markersRef.current.forEach(
        marker => marker.remove()
      );

      markersRef.current = [];

      popupRef.current?.remove();

      mapInstance.remove();

      map.current = null;

      chocoBounds.current = null;
    };

  }, []);

  /*
   * ============================================================
   * ACTUALIZAR MARCADORES
   * ============================================================
   */

  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const mapInstance = map.current;

    /*
     * Eliminar marcadores anteriores
     */

    markersRef.current.forEach(
      marker => marker.remove()
    );

    markersRef.current = [];

    popupRef.current?.remove();

    /*
     * ============================================================
     * AGREGAR NUEVOS MARCADORES
     * ============================================================
     */

    markers.forEach((markerData) => {

      /*
       * ----------------------------------------------------------
       * IMPORTANTE:
       * Solo agregamos marcadores que estén dentro del
       * área aproximada del Chocó.
       * ----------------------------------------------------------
       */

      if (chocoBounds.current) {
        const insideBounds =
          chocoBounds.current.contains([
            markerData.longitude,
            markerData.latitude,
          ]);

        if (!insideBounds) {
          return;
        }
      }

      /*
       * ----------------------------------------------------------
       * CREAR ELEMENTO DEL MARCADOR
       * ----------------------------------------------------------
       */

      const el =
        document.createElement('div');

      el.className =
        'cursor-pointer transition-transform hover:scale-110';

      const color =
        getMarkerColor(markerData.type);

      const icon =
        getMarkerIcon(markerData.type);

      const isCritical =
        markerData.type === 'critical';

      el.innerHTML = `
        <div style="
          width: ${isCritical ? '40px' : '32px'};
          height: ${isCritical ? '40px' : '32px'};
          background-color: ${color};
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
          font-size: ${isCritical ? '18px' : '14px'};
          color: white;
          font-weight: bold;
          ${
            isCritical
              ? 'animation: pulse-ring 1.5s ease-in-out infinite;'
              : ''
          }
        ">
          ${icon}
        </div>
      `;

      /*
       * ----------------------------------------------------------
       * CREAR MARCADOR
       * ----------------------------------------------------------
       */

      const marker =
        new mapboxgl.Marker({
          element: el,
        })
          .setLngLat([
            markerData.longitude,
            markerData.latitude,
          ])
          .addTo(mapInstance);

      /*
       * ----------------------------------------------------------
       * CLICK EN MARCADOR
       * ----------------------------------------------------------
       */

      marker
        .getElement()
        .addEventListener(
          'click',
          () => {

            if (onMarkerClick) {
              onMarkerClick(
                markerData.data
              );
            }

            showPopup(markerData);
          }
        );

      markersRef.current.push(marker);
    });

    /*
     * ============================================================
     * IMPORTANTE:
     *
     * NO hacemos fitBounds() de los marcadores.
     *
     * Antes esto podía sacar el mapa del Chocó.
     * El GeoJSON controla ahora el foco del mapa.
     * ============================================================
     */

  }, [
    mapLoaded,
    markers,
    onMarkerClick,
  ]);

  /*
   * ============================================================
   * POPUP DEL MARCADOR
   * ============================================================
   */

  const showPopup = (
    markerData: MapMarker
  ) => {

    if (!map.current) return;

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const popupContent =
      document.createElement('div');

    popupContent.className =
      'p-2 max-w-xs';

    const isNeed =
      markerData.data?.type === 'need';

    const isCenter =
      markerData.data?.type === 'center';

    const isOffer =
      markerData.data?.type === 'offer';

    let html = `
      <div class="space-y-2">

        <div class="flex items-start justify-between">

          <h3 class="
            font-bold
            text-gray-900
            text-lg
          ">
            ${markerData.title}
          </h3>

          <span
            class="
              px-2
              py-1
              rounded-full
              text-xs
              font-bold
              text-white
            "
            style="
              background-color:
              ${getMarkerColor(markerData.type)}
            "
          >
            ${markerData.type.toUpperCase()}
          </span>

        </div>

        <p class="
          text-sm
          text-gray-600
        ">
          ${markerData.description}
        </p>
    `;

    /*
     * ==========================================================
     * NECESIDAD
     * ==========================================================
     */

    if (
      isNeed &&
      markerData.data
    ) {

      const data =
        markerData.data;

      const needed =
        Number(data.quantity_needed) || 0;

      const received =
        Number(data.quantity_received) || 0;

      const pending =
        Math.max(
          needed - received,
          0
        );

      const coverage =
        needed > 0
          ? Math.min(
              (received / needed) * 100,
              100
            )
          : 0;

      html += `
        <div class="space-y-1 text-sm">

          <div class="
            flex
            justify-between
          ">
            <span class="text-gray-500">
              Necesitado:
            </span>

            <span class="font-medium">
              ${needed}
              ${data.unit || ''}
            </span>
          </div>

          <div class="
            flex
            justify-between
          ">
            <span class="text-gray-500">
              Recibido:
            </span>

            <span class="
              font-medium
              text-green-600
            ">
              ${received}
              ${data.unit || ''}
            </span>
          </div>

          <div class="
            flex
            justify-between
          ">
            <span class="text-gray-500">
              Pendiente:
            </span>

            <span class="
              font-medium
              text-red-600
            ">
              ${pending}
              ${data.unit || ''}
            </span>
          </div>

          <div class="
            w-full
            bg-gray-200
            rounded-full
            h-1.5
          ">
            <div
              class="
                bg-blue-600
                h-1.5
                rounded-full
              "
              style="
                width: ${coverage}%
              "
            ></div>
          </div>

          <div class="
            flex
            justify-between
            text-xs
          ">
            <span>
              ${Math.round(coverage)}% cubierto
            </span>

            ${
              data.municipality
                ? `
                  <span>
                    📍 ${data.municipality}
                  </span>
                `
                : ''
            }

          </div>

        </div>
      `;
    }

    /*
     * ==========================================================
     * CENTRO
     * ==========================================================
     */

    if (
      isCenter &&
      markerData.data
    ) {

      const data =
        markerData.data;

      html += `
        <div class="
          text-sm
          space-y-1
        ">

          ${
            data.address
              ? `
                <p class="text-gray-600">
                  📍 ${data.address}
                </p>
              `
              : ''
          }

          ${
            data.schedule
              ? `
                <p class="text-gray-600">
                  🕐 ${data.schedule}
                </p>
              `
              : ''
          }

          ${
            data.contact_phone
              ? `
                <p class="text-gray-600">
                  📞 ${data.contact_phone}
                </p>
              `
              : ''
          }

          ${
            data.responsible_person
              ? `
                <p class="text-gray-600">
                  👤 ${data.responsible_person}
                </p>
              `
              : ''
          }

        </div>
      `;
    }

    /*
     * ==========================================================
     * AYUDA
     * ==========================================================
     */

    if (
      isOffer &&
      markerData.data
    ) {

      const data =
        markerData.data;

      html += `
        <div class="text-sm">

          <p class="text-gray-600">
            📦
            ${data.quantity || 0}
            ${data.unit || ''}
            disponibles
          </p>

          ${
            data.organization?.name
              ? `
                <p class="text-gray-600">
                  🏢
                  ${data.organization.name}
                </p>
              `
              : ''
          }

          ${
            data.contact_info
              ? `
                <p class="text-gray-600">
                  📞
                  ${data.contact_info}
                </p>
              `
              : ''
          }

        </div>
      `;
    }

    /*
     * ==========================================================
     * BOTÓN DETALLES
     * ==========================================================
     */

    html += `
        <button
          onclick="
            window.location.href='${
              isNeed
                ? `/necesidades/${markerData.data?.id}`
                : isCenter
                  ? '/puntos-entrega'
                  : '/ayudas'
            }'
          "
          class="
            w-full
            mt-2
            bg-blue-600
            text-white
            py-2
            rounded-lg
            text-sm
            font-medium
            hover:bg-blue-700
            transition-colors
          "
        >
          Ver detalles
        </button>

      </div>
    `;

    popupContent.innerHTML =
      html;

    /*
     * ==========================================================
     * CREAR POPUP
     * ==========================================================
     */

    popupRef.current =
      new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        maxWidth: '320px',
        className: 'custom-popup',
      })
        .setLngLat([
          markerData.longitude,
          markerData.latitude,
        ])
        .setDOMContent(
          popupContent
        )
        .addTo(map.current);
  };

  /*
   * ============================================================
   * FLY TO
   * ============================================================
   */

  const flyTo = (
    lngLat: [number, number],
    zoomLevel?: number
  ) => {

    if (!map.current) return;

    /*
     * No permitir flyTo fuera del Chocó
     */

    if (
      chocoBounds.current &&
      !chocoBounds.current.contains(
        lngLat
      )
    ) {
      return;
    }

    map.current.flyTo({
      center: lngLat,
      zoom: zoomLevel || 12,
      duration: 1500,
    });
  };

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <div
      ref={mapContainer}
      className={`relative ${className}`}
      style={{
        height,
        width: '100%',
      }}
    />
  );
};

export default MapComponent;

/*
 * ==============================================================
 * ESTILOS
 * ==============================================================
 */

const style =
  document.createElement('style');

style.textContent = `

  @keyframes pulse-ring {

    0% {
      transform: scale(1);
      box-shadow:
        0 0 0 0
        rgba(220, 38, 38, 0.4);
    }

    50% {
      transform: scale(1.05);
      box-shadow:
        0 0 0 10px
        rgba(220, 38, 38, 0);
    }

    100% {
      transform: scale(1);
      box-shadow:
        0 0 0 0
        rgba(220, 38, 38, 0);
    }

  }

  .custom-popup
  .mapboxgl-popup-content {

    border-radius: 12px;

    padding: 0;

    box-shadow:
      0 4px 20px
      rgba(0,0,0,0.15);

  }

  .custom-popup
  .mapboxgl-popup-close-button {

    font-size: 20px;

    padding:
      8px 12px;

    color: #6B7280;

    background:
      transparent;

    border: none;

  }

  .custom-popup
  .mapboxgl-popup-close-button:hover {

    color: #374151;

  }

`;

document.head.appendChild(style);