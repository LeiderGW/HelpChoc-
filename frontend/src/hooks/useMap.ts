import { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';

interface MapOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
  interactive?: boolean;
}

interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  type: 'critical' | 'high' | 'medium' | 'aid' | 'collection' | 'delivery' | 'shelter' | 'medical';
  title: string;
  description: string;
  data: any;
  onClick?: (data: any) => void;
}

export const useMap = (containerRef: React.RefObject<HTMLDivElement>, options: MapOptions = {}) => {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const popup = useRef<mapboxgl.Popup | null>(null);

  const {
    center = [-74.0721, 4.7110],
    zoom = 5,
    style = 'mapbox://styles/mapbox/light-v11',
    interactive = true,
  } = options;

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || map) return;

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    const mapInstance = new mapboxgl.Map({
      container: containerRef.current,
      style,
      center,
      zoom,
      interactive,
    });

    if (interactive) {
      mapInstance.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.addControl(new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }), 'top-right');
    }

    mapInstance.on('load', () => {
      setIsLoaded(true);
    });

    setMap(mapInstance);

    return () => {
      markers.current.forEach(marker => marker.remove());
      popup.current?.remove();
      mapInstance.remove();
    };
  }, [containerRef, center, zoom, style, interactive]);

  // Get marker color
  const getMarkerColor = useCallback((type: string) => {
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
  }, []);

  // Get marker icon
  const getMarkerIcon = useCallback((type: string) => {
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
  }, []);

  // Add markers
  const addMarkers = useCallback((markersData: MapMarker[]) => {
    if (!map || !isLoaded) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    popup.current?.remove();

    // Add new markers
    markersData.forEach((markerData) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer transition-transform hover:scale-110';
      
      const color = getMarkerColor(markerData.type);
      const icon = getMarkerIcon(markerData.type);
      const isCritical = markerData.type === 'critical';
      
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
          ${isCritical ? 'animation: pulse-ring 1.5s ease-in-out infinite;' : ''}
        ">
          ${icon}
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([markerData.longitude, markerData.latitude])
        .addTo(map);

      if (markerData.onClick) {
        marker.getElement().addEventListener('click', () => {
          markerData.onClick?.(markerData.data);
        });
      }

      markers.current.push(marker);
    });
  }, [map, isLoaded, getMarkerColor, getMarkerIcon]);

  // Show popup
  const showPopup = useCallback((markerData: MapMarker) => {
    if (!map) return;

    if (popup.current) {
      popup.current.remove();
    }

    const isNeed = markerData.data?.type === 'need';
    const isCenter = markerData.data?.type === 'center';
    const isOffer = markerData.data?.type === 'offer';

    let html = `
      <div class="p-3 max-w-xs">
        <div class="flex items-start justify-between">
          <h3 class="font-bold text-gray-900 text-base">${markerData.title}</h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-bold text-white" style="background-color: ${getMarkerColor(markerData.type)}">
            ${markerData.type.toUpperCase()}
          </span>
        </div>
        <p class="text-sm text-gray-600 mt-1">${markerData.description}</p>
    `;

    if (isNeed && markerData.data) {
      const data = markerData.data;
      const pending = data.quantity_needed - data.quantity_received;
      const coverage = Math.min((data.quantity_received / data.quantity_needed) * 100, 100);
      
      html += `
        <div class="mt-2 space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-500">Necesitado:</span>
            <span class="font-medium">${data.quantity_needed} ${data.unit}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Recibido:</span>
            <span class="font-medium text-green-600">${data.quantity_received} ${data.unit}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Pendiente:</span>
            <span class="font-medium text-red-600">${pending} ${data.unit}</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-1.5">
            <div class="bg-blue-600 h-1.5 rounded-full" style="width: ${Math.min(coverage, 100)}%"></div>
          </div>
          ${data.municipality ? `<div class="text-xs text-gray-500 mt-1">📍 ${data.municipality}</div>` : ''}
        </div>
      `;
    }

    if (isCenter && markerData.data) {
      const data = markerData.data;
      html += `
        <div class="mt-2 space-y-1 text-sm">
          ${data.address ? `<div class="text-gray-600">📍 ${data.address}</div>` : ''}
          ${data.schedule ? `<div class="text-gray-600">🕐 ${data.schedule}</div>` : ''}
          ${data.contact_phone ? `<div class="text-gray-600">📞 ${data.contact_phone}</div>` : ''}
        </div>
      `;
    }

    if (isOffer && markerData.data) {
      const data = markerData.data;
      html += `
        <div class="mt-2 space-y-1 text-sm">
          <div class="text-gray-600">📦 ${data.quantity} ${data.unit} disponibles</div>
          ${data.organization?.name ? `<div class="text-gray-600">🏢 ${data.organization.name}</div>` : ''}
        </div>
      `;
    }

    html += `
        <button 
          onclick="window.location.href='${isNeed ? `/necesidades/${markerData.data?.id}` : isCenter ? `/puntos-entrega` : `/ayudas`}'"
          class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Ver detalles
        </button>
      </div>
    `;

    const popupContainer = document.createElement('div');
    popupContainer.innerHTML = html;

    popup.current = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      maxWidth: '320px',
      className: 'custom-popup',
    })
      .setLngLat([markerData.longitude, markerData.latitude])
      .setDOMContent(popupContainer.firstElementChild as HTMLElement)
      .addTo(map);
  }, [map, getMarkerColor]);

  // Clear markers
  const clearMarkers = useCallback(() => {
    markers.current.forEach(marker => marker.remove());
    markers.current = [];
    popup.current?.remove();
  }, []);

  // Fly to location
  const flyTo = useCallback((lngLat: [number, number], zoomLevel?: number) => {
    if (!map) return;
    map.flyTo({
      center: lngLat,
      zoom: zoomLevel || 12,
      duration: 1500,
    });
  }, [map]);

  // Fit bounds
  const fitBounds = useCallback((bounds: [[number, number], [number, number]]) => {
    if (!map) return;
    map.fitBounds(bounds, {
      padding: 50,
      duration: 1500,
    });
  }, [map]);

  return {
    map,
    isLoaded,
    addMarkers,
    clearMarkers,
    showPopup,
    flyTo,
    fitBounds,
  };
};

// Add CSS for animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse-ring {
      0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4); }
      50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
      100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
    }
    .custom-popup .mapboxgl-popup-content {
      border-radius: 12px;
      padding: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    }
    .custom-popup .mapboxgl-popup-close-button {
      font-size: 20px;
      padding: 8px 12px;
      color: #6B7280;
      background: transparent;
      border: none;
    }
    .custom-popup .mapboxgl-popup-close-button:hover {
      color: #374151;
    }
  `;
  document.head.appendChild(style);
}