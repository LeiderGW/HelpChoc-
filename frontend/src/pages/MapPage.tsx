import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import {
  Filter,
  Search,
  X,
  Navigation,
} from 'lucide-react';

import { supabase } from '../services/supabase';
import Button from '../components/common/Button';

import { useSearchParams } from 'react-router-dom';

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
}

/*
 * Corrige automáticamente el problema habitual de los iconos
 * de Leaflet cuando se usa Vite.
 */
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const MapPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const [markersData, setMarkersData] = useState<MapMarker[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MapMarker[]>([]);
  const [selectedMarker, setSelectedMarker] =
    useState<MapMarker | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [filters, setFilters] = useState({
    departments: [] as string[],
    municipalities: [] as string[],
    types: [] as string[],
    priorities: [] as string[],
  });

  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);

  /*
   * Centro inicial: Bogotá.
   * Leaflet usa [latitud, longitud].
   */
  const initialCenter: [number, number] = [4.7110, -74.0721];

  useEffect(() => {
    fetchData();
    fetchDepartments();
  }, []);

  /*
   * Cuando el mapa ya está listo y cambian los marcadores,
   * Leaflet los renderiza automáticamente.
   *
   * Ya no necesitamos addTo() ni remove().
   */
  useEffect(() => {
    if (mapReady && !loading) {
      // Los marcadores se manejan declarativamente mediante React Leaflet.
    }
  }, [filteredMarkers, mapReady, loading]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // -----------------------------
      // Necesidades
      // -----------------------------
      const { data: needsData, error: needsError } = await supabase
        .from('needs')
        .select(`
          *,
          municipality:municipalities(
            name,
            department:departments(name)
          ),
          location:locations(*)
        `)
        .neq('status', 'fulfilled');

      if (needsError) {
        console.error('Error obteniendo necesidades:', needsError);
      }

      // -----------------------------
      // Centros de acopio
      // -----------------------------
      const { data: centersData, error: centersError } = await supabase
        .from('collection_centers')
        .select(`
          *,
          municipality:municipalities(
            name,
            department:departments(name)
          )
        `)
        .eq('status', 'active');

      if (centersError) {
        console.error(
          'Error obteniendo centros de acopio:',
          centersError
        );
      }

      // -----------------------------
      // Ofertas de ayuda
      // -----------------------------
      const { data: offersData, error: offersError } = await supabase
        .from('aid_offers')
        .select(`
          *,
          location:locations(*),
          organization:organizations(name)
        `)
        .eq('status', 'available')
        .limit(50);

      if (offersError) {
        console.error(
          'Error obteniendo ofertas de ayuda:',
          offersError
        );
      }

      const markers: MapMarker[] = [];

      // -----------------------------
      // Necesidades
      // -----------------------------
      needsData?.forEach((need: any) => {
        const location = need.location || {};

        const lat =
          location.latitude ??
          4.7110 + (Math.random() - 0.5) * 2;

        const lng =
          location.longitude ??
          -74.0721 + (Math.random() - 0.5) * 2;

        markers.push({
          id: `need-${need.id}`,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          type: need.priority as MapMarker['type'],
          title: need.product,
          description: need.category,

          data: {
            ...need,
            type: 'need',
            municipality: need.municipality?.name,
            department:
              need.municipality?.department?.name,
          },
        });
      });

      // -----------------------------
      // Centros
      // -----------------------------
      centersData?.forEach((center: any) => {
        if (
          center.latitude === null ||
          center.longitude === null ||
          center.latitude === undefined ||
          center.longitude === undefined
        ) {
          return;
        }

        markers.push({
          id: `center-${center.id}`,
          latitude: parseFloat(center.latitude),
          longitude: parseFloat(center.longitude),
          type: center.type as MapMarker['type'],
          title: center.name,
          description: center.type,

          data: {
            ...center,
            type: 'center',
            municipality: center.municipality?.name,
            department:
              center.municipality?.department?.name,
          },
        });
      });

      // -----------------------------
      // Ofertas de ayuda
      // -----------------------------
      offersData?.forEach((offer: any) => {
        const location = offer.location || {};

        const lat =
          location.latitude ??
          4.7110 + (Math.random() - 0.5) * 2;

        const lng =
          location.longitude ??
          -74.0721 + (Math.random() - 0.5) * 2;

        markers.push({
          id: `offer-${offer.id}`,
          latitude: parseFloat(lat),
          longitude: parseFloat(lng),
          type: 'aid',
          title: offer.product,
          description: `${offer.quantity} ${offer.unit} disponibles`,

          data: {
            ...offer,
            type: 'offer',
          },
        });
      });

      setMarkersData(markers);
      setFilteredMarkers(markers);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) {
        console.error(
          'Error obteniendo departamentos:',
          error
        );
        return;
      }

      setDepartments(data || []);
    } catch (error) {
      console.error(
        'Error fetching departments:',
        error
      );
    }
  };

  const fetchMunicipalities = async (
    departmentName: string
  ) => {
    try {
      const department = departments.find(
        d => d.name === departmentName
      );

      if (!department) return;

      const { data, error } = await supabase
        .from('municipalities')
        .select('*')
        .eq('department_id', department.id)
        .order('name');

      if (error) {
        console.error(
          'Error obteniendo municipios:',
          error
        );
        return;
      }

      setMunicipalities(data || []);
    } catch (error) {
      console.error(
        'Error fetching municipalities:',
        error
      );
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'critical':
        return '#DC2626';

      case 'high':
        return '#F97316';

      case 'medium':
        return '#EAB308';

      case 'aid':
        return '#22C55E';

      case 'collection':
        return '#3B82F6';

      case 'delivery':
        return '#8B5CF6';

      case 'shelter':
        return '#EC4899';

      case 'medical':
        return '#14B8A6';

      default:
        return '#6B7280';
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return '⚠';

      case 'high':
        return '🔴';

      case 'medium':
        return '🟡';

      case 'aid':
        return '✓';

      case 'collection':
        return '📦';

      case 'delivery':
        return '🚚';

      case 'shelter':
        return '🏠';

      case 'medical':
        return '🏥';

      default:
        return '•';
    }
  };

  /*
   * Crea los marcadores personalizados de Leaflet.
   */
  const createMarkerIcon = (type: string) => {
    const color = getMarkerColor(type);
    const icon = getMarkerIcon(type);

    const isCritical = type === 'critical';

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div
          style="
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
            cursor: pointer;
            ${
              isCritical
                ? 'animation: pulse-ring 1.5s ease-in-out infinite;'
                : ''
            }
          "
        >
          ${icon}
        </div>
      `,
      iconSize: [
        isCritical ? 40 : 32,
        isCritical ? 40 : 32,
      ],
      iconAnchor: [
        isCritical ? 20 : 16,
        isCritical ? 20 : 16,
      ],
      popupAnchor: [0, isCritical ? -20 : -16],
    });
  };

  const handleFilterChange = (
    key: keyof typeof filters,
    value: any
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const applyFilters = () => {
    let filtered = [...markersData];

    // -----------------------------
    // Búsqueda
    // -----------------------------
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      filtered = filtered.filter(marker =>
        marker.title
          ?.toLowerCase()
          .includes(query) ||
        marker.description
          ?.toLowerCase()
          .includes(query) ||
        marker.data.municipality
          ?.toLowerCase()
          .includes(query) ||
        marker.data.department
          ?.toLowerCase()
          .includes(query)
      );
    }

    // -----------------------------
    // Prioridades
    // -----------------------------
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(marker =>
        filters.priorities.includes(marker.type)
      );
    }

    // -----------------------------
    // Departamentos
    // -----------------------------
    if (filters.departments.length > 0) {
      filtered = filtered.filter(marker =>
        filters.departments.includes(
          marker.data.department
        )
      );
    }

    // -----------------------------
    // Municipios
    // -----------------------------
    if (filters.municipalities.length > 0) {
      filtered = filtered.filter(marker =>
        filters.municipalities.includes(
          marker.data.municipality
        )
      );
    }

    // -----------------------------
    // Tipo
    // -----------------------------
    if (filters.types.length > 0) {
      filtered = filtered.filter(marker =>
        filters.types.includes(marker.data.type)
      );
    }

    setFilteredMarkers(filtered);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      departments: [],
      municipalities: [],
      types: [],
      priorities: [],
    });

    setSearchQuery('');
    setFilteredMarkers(markersData);
  };

  const needsCount = filteredMarkers.filter(
    marker =>
      marker.type === 'critical' ||
      marker.type === 'high' ||
      marker.type === 'medium'
  ).length;

  const centersCount = filteredMarkers.filter(
    marker =>
      marker.type === 'collection' ||
      marker.type === 'delivery'
  ).length;

  const aidCount = filteredMarkers.filter(
    marker => marker.type === 'aid'
  ).length;

  return (
    <div className="relative h-[calc(100vh-64px)]">

      {/* MAPA LEAFLET */}
      <MapContainer
        center={initialCenter}
        zoom={5}
        className="w-full h-full"
        whenReady={() => setMapReady(true)}
        zoomControl={true}
      >
        {/* OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Marcadores */}
        {filteredMarkers.map(markerData => (
          <Marker
            key={markerData.id}
            position={[
              markerData.latitude,
              markerData.longitude,
            ]}
            icon={createMarkerIcon(markerData.type)}
            eventHandlers={{
              click: () => {
                setSelectedMarker(markerData);
              },
            }}
          >
            <Popup
              closeButton={true}
              maxWidth={320}
            >
              <div className="space-y-2">

                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">
                    {markerData.title}
                  </h3>

                  <span
                    className="px-2 py-1 rounded-full text-xs font-bold text-white"
                    style={{
                      backgroundColor:
                        getMarkerColor(
                          markerData.type
                        ),
                    }}
                  >
                    {markerData.type.toUpperCase()}
                  </span>
                </div>

                <p className="text-sm text-gray-600">
                  {markerData.description}
                </p>

                {/* NECESIDAD */}
                {markerData.data.type === 'need' && (
                  <div className="space-y-1 text-sm">

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Necesitado:
                      </span>

                      <span className="font-medium">
                        {
                          markerData.data
                            .quantity_needed
                        }{' '}
                        {markerData.data.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Recibido:
                      </span>

                      <span className="font-medium text-green-600">
                        {
                          markerData.data
                            .quantity_received
                        }{' '}
                        {markerData.data.unit}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">
                        Pendiente:
                      </span>

                      <span className="font-medium text-red-600">
                        {Math.max(
                          0,
                          (markerData.data
                            .quantity_needed || 0) -
                            (markerData.data
                              .quantity_received || 0)
                        )}{' '}
                        {markerData.data.unit}
                      </span>
                    </div>

                    {markerData.data.municipality && (
                      <div className="text-gray-500 mt-1">
                        📍{' '}
                        {markerData.data.municipality}

                        {markerData.data.department &&
                          `, ${markerData.data.department}`}
                      </div>
                    )}

                  </div>
                )}

                {/* CENTRO */}
                {markerData.data.type === 'center' && (
                  <div className="text-sm space-y-1">

                    {markerData.data.address && (
                      <p className="text-gray-600">
                        📍 {markerData.data.address}
                      </p>
                    )}

                    {markerData.data.schedule && (
                      <p className="text-gray-600">
                        🕐 {markerData.data.schedule}
                      </p>
                    )}

                    {markerData.data.contact_phone && (
                      <p className="text-gray-600">
                        📞{' '}
                        {
                          markerData.data
                            .contact_phone
                        }
                      </p>
                    )}

                  </div>
                )}

                {/* OFERTA */}
                {markerData.data.type === 'offer' && (
                  <div className="text-sm">

                    <p className="text-gray-600">
                      📦{' '}
                      {markerData.data.quantity}{' '}
                      {markerData.data.unit}{' '}
                      disponibles
                    </p>

                    {markerData.data.organization
                      ?.name && (
                      <p className="text-gray-600">
                        🏢{' '}
                        {
                          markerData.data
                            .organization.name
                        }
                      </p>
                    )}

                  </div>
                )}

                <button
                  onClick={() => {
                    const isNeed =
                      markerData.data.type ===
                      'need';

                    window.location.href = isNeed
                      ? `/necesidades/${markerData.data.id}`
                      : markerData.data.type ===
                        'center'
                      ? `/puntos-entrega`
                      : `/ayudas`;
                  }}
                  className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Ver detalles
                </button>

              </div>
            </Popup>
          </Marker>
        ))}

        {/* Botón de ubicación */}
        <LocationButton />
      </MapContainer>

      {/* LOADING */}
      {(loading || !mapReady) && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none">

          <div className="text-center">

            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>

            <p className="mt-4 text-gray-600">
              Cargando mapa...
            </p>

          </div>

        </div>
      )}

      {/* BUSCADOR Y FILTROS */}
      <div className="absolute top-4 left-4 right-4 md:left-8 md:right-8 z-[1001]">

        <div className="bg-white rounded-xl shadow-lg p-3">

          <div className="flex flex-col md:flex-row gap-2">

            <div className="flex-1 relative">

              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />

              <input
                type="text"
                placeholder="Buscar por municipio, departamento o necesidad..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={e =>
                  setSearchQuery(e.target.value)
                }
                onKeyDown={e =>
                  e.key === 'Enter' &&
                  applyFilters()
                }
              />

            </div>

            <div className="flex gap-2">

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setShowFilters(!showFilters)
                }
              >
                <Filter
                  className="mr-1"
                  size={16}
                />
                Filtros
              </Button>

              <Button
                size="sm"
                onClick={applyFilters}
              >
                Aplicar
              </Button>

              {(searchQuery ||
                filters.priorities.length > 0 ||
                filters.departments.length > 0 ||
                filters.municipalities.length > 0 ||
                filters.types.length > 0) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X size={16} />
                </Button>
              )}

            </div>

          </div>

          {/* PANEL DE FILTROS */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200">

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* PRIORIDADES */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prioridades
                  </label>

                  <div className="flex flex-wrap gap-1">

                    {[
                      'critical',
                      'high',
                      'medium',
                      'aid',
                      'collection',
                    ].map(priority => (

                      <button
                        key={priority}
                        onClick={() => {

                          const current =
                            filters.priorities;

                          const updated =
                            current.includes(priority)
                              ? current.filter(
                                  x =>
                                    x !==
                                    priority
                                )
                              : [
                                  ...current,
                                  priority,
                                ];

                          handleFilterChange(
                            'priorities',
                            updated
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          filters.priorities.includes(
                            priority
                          )
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {priority.toUpperCase()}
                      </button>

                    ))}

                  </div>

                </div>

                {/* DEPARTAMENTOS */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamentos
                  </label>

                  <select
                    className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={e => {

                      const value =
                        e.target.value;

                      if (!value) return;

                      const current =
                        filters.departments;

                      const updated =
                        current.includes(value)
                          ? current.filter(
                              x => x !== value
                            )
                          : [
                              ...current,
                              value,
                            ];

                      handleFilterChange(
                        'departments',
                        updated
                      );

                      fetchMunicipalities(value);
                    }}
                    value=""
                  >

                    <option value="">
                      Seleccionar departamento
                    </option>

                    {departments.map(department => (
                      <option
                        key={department.id}
                        value={department.name}
                      >
                        {department.name}
                      </option>
                    ))}

                  </select>

                  {filters.departments.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">

                      {filters.departments.map(
                        department => (

                          <span
                            key={department}
                            className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs"
                          >

                            {department}

                            <button
                              onClick={() => {

                                const updated =
                                  filters.departments.filter(
                                    x =>
                                      x !==
                                      department
                                  );

                                handleFilterChange(
                                  'departments',
                                  updated
                                );
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>

                          </span>

                        )
                      )}

                    </div>
                  )}

                </div>

                {/* TIPOS */}
                <div>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipos
                  </label>

                  <div className="flex flex-wrap gap-1">

                    {[
                      'need',
                      'center',
                      'offer',
                    ].map(type => (

                      <button
                        key={type}
                        onClick={() => {

                          const current =
                            filters.types;

                          const updated =
                            current.includes(type)
                              ? current.filter(
                                  x => x !== type
                                )
                              : [
                                  ...current,
                                  type,
                                ];

                          handleFilterChange(
                            'types',
                            updated
                          );
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          filters.types.includes(type)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type === 'need'
                          ? 'Necesidad'
                          : type === 'center'
                          ? 'Centro'
                          : 'Ayuda'}
                      </button>

                    ))}

                  </div>

                </div>

              </div>

              {/* MUNICIPIOS */}
              {municipalities.length > 0 && (
                <div className="mt-3">

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Municipios
                  </label>

                  <div className="flex flex-wrap gap-1">

                    {municipalities.map(
                      municipality => {

                        const selected =
                          filters.municipalities.includes(
                            municipality.name
                          );

                        return (
                          <button
                            key={municipality.id}
                            onClick={() => {

                              const current =
                                filters.municipalities;

                              const updated =
                                selected
                                  ? current.filter(
                                      x =>
                                        x !==
                                        municipality.name
                                    )
                                  : [
                                      ...current,
                                      municipality.name,
                                    ];

                              handleFilterChange(
                                'municipalities',
                                updated
                              );
                            }}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              selected
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {municipality.name}
                          </button>
                        );
                      }
                    )}

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* LEYENDA */}
      <div className="absolute bottom-4 left-4 z-[1001] bg-white rounded-xl shadow-lg p-3">

        <div className="space-y-1">

          <LegendItem
            color="bg-red-600"
            text="Necesidad Crítica"
          />

          <LegendItem
            color="bg-orange-500"
            text="Necesidad Alta"
          />

          <LegendItem
            color="bg-yellow-500"
            text="Necesidad Media"
          />

          <LegendItem
            color="bg-green-500"
            text="Ayuda Disponible"
          />

          <LegendItem
            color="bg-blue-500"
            text="Centro de Acopio"
          />

          <LegendItem
            color="bg-purple-500"
            text="Punto de Entrega"
          />

        </div>

      </div>

      {/* ESTADÍSTICAS */}
      <div className="absolute top-24 right-4 z-[1001] bg-white rounded-xl shadow-lg p-3 hidden lg:block">

        <div className="text-sm space-y-1">

          <StatRow
            label="Total marcadores:"
            value={filteredMarkers.length}
          />

          <StatRow
            label="Necesidades:"
            value={needsCount}
            valueClass="text-red-600"
          />

          <StatRow
            label="Centros:"
            value={centersCount}
            valueClass="text-blue-600"
          />

          <StatRow
            label="Ayudas:"
            value={aidCount}
            valueClass="text-green-600"
          />

        </div>

      </div>

      {/* MARCADOR SELECCIONADO */}
      {selectedMarker && (
        <div className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[1001]">

          <div className="bg-white rounded-xl shadow-xl p-4">

            <div className="flex items-start justify-between">

              <div>

                <h4 className="font-bold text-gray-900">
                  {selectedMarker.title}
                </h4>

                <p className="text-sm text-gray-600">
                  {selectedMarker.description}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedMarker(null)
                }
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>

            </div>

            <div className="mt-3">

              <Button
                size="sm"
                fullWidth
                onClick={() => {

                  const isNeed =
                    selectedMarker.data.type ===
                    'need';

                  window.location.href =
                    isNeed
                      ? `/necesidades/${selectedMarker.data.id}`
                      : selectedMarker.data.type ===
                        'center'
                      ? `/puntos-entrega`
                      : `/ayudas`;
                }}
              >
                Ver detalles
              </Button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

/*
 * Botón para usar la ubicación del usuario.
 */
const LocationButton: React.FC = () => {
  const map = useMap();

  const locateUser = () => {
    map.locate({
      setView: true,
      maxZoom: 15,
      enableHighAccuracy: true,
    });
  };

  return (
    <div className="leaflet-control leaflet-bar">
      <button
        onClick={locateUser}
        title="Mi ubicación"
        className="flex items-center justify-center w-8 h-8 bg-white hover:bg-gray-100"
      >
        <Navigation size={16} />
      </button>
    </div>
  );
};

const LegendItem: React.FC<{
  color: string;
  text: string;
}> = ({ color, text }) => (
  <div className="flex items-center text-sm">
    <span
      className={`w-3 h-3 rounded-full ${color} mr-2`}
    />
    <span>{text}</span>
  </div>
);

const StatRow: React.FC<{
  label: string;
  value: number;
  valueClass?: string;
}> = ({ label, value, valueClass = 'text-gray-900' }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-gray-500">
      {label}
    </span>

    <span className={`font-bold ${valueClass}`}>
      {value}
    </span>
  </div>
);

export default MapPage;