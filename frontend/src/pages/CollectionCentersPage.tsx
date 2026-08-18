import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle, Clock, Home, MapPin, Package, Phone, Search, Stethoscope, Truck, XCircle, type LucideIcon } from 'lucide-react';
import { supabase } from '../services/supabase';
import { CollectionCenter } from '../types';
import Button from '../components/common/Button';
import { toast } from 'sonner';

const CollectionCentersPage: React.FC = () => {
  const [centers, setCenters] = useState<CollectionCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const { data, error } = await supabase
        .from('collection_centers')
        .select(`
          *,
          municipality:municipalities(name, department:departments(name))
        `)
        .order('name');

      if (error) throw error;
      setCenters(data || []);
    } catch (error) {
      console.error('Error fetching centers:', error);
      toast.error('Error al cargar los centros');
    } finally {
      setLoading(false);
    }
  };

  const filteredCenters = centers.filter(center => {
    const matchesSearch = center.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          center.municipality?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || center.status === filterStatus;
    const matchesType = filterType === 'all' || center.type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'temporary':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo';
      case 'closed':
        return 'Cerrado';
      case 'temporary':
        return 'Temporal';
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'collection':
        return 'Centro de Acopio';
      case 'delivery':
        return 'Punto de Entrega';
      case 'shelter':
        return 'Refugio';
      case 'medical':
        return 'Centro Médico';
      default:
        return 'Otro';
    }
  };

  const getTypeIcon = (type: string): LucideIcon => {
    switch (type) {
      case 'collection':
        return Package;
      case 'delivery':
        return Truck;
      case 'shelter':
        return Home;
      case 'medical':
        return Stethoscope;
      default:
        return MapPin;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Puntos de Entrega y Centros de Acopio</h1>
            <p className="text-gray-600 mt-1">
              Encuentra los puntos habilitados para entregar y recibir ayuda
            </p>
          </div>
          {/* Aquí iba un botón "Registrar Centro" que apuntaba a
              /registrar-centro. Esa ruta no existe: caía en el comodín del
              router y devolvía al inicio sin explicar nada, que es peor que
              no ofrecer el botón. Cuando exista la pantalla, se vuelve a
              poner envuelto en {(isAdmin || isOrganization) && ...}. */}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nombre, dirección o municipio..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="collection">Centro de Acopio</option>
              <option value="delivery">Punto de Entrega</option>
              <option value="shelter">Refugio</option>
              <option value="medical">Centro Médico</option>
            </select>
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="temporary">Temporales</option>
              <option value="closed">Cerrados</option>
            </select>
          </div>
        </div>

        {/* Centers Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCenters.map((center) => (
              <div key={center.id} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-shadow hover:shadow-lg">
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const IconoTipo = getTypeIcon(center.type);
                        return <IconoTipo className="text-gray-500" size={22} strokeWidth={1.75} aria-hidden="true" />;
                      })()}
                      <h3 className="font-bold text-gray-800">{center.name}</h3>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
                      center.status === 'active' ? 'bg-green-100 text-green-700' :
                      center.status === 'temporary' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getStatusIcon(center.status)}
                      <span>{getStatusLabel(center.status)}</span>
                    </span>
                  </div>

                  <div className="flex-1 space-y-2 text-sm">
                    <div className="flex items-start text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {center.address}
                        {center.municipality && (
                          <span className="block text-gray-500">
                            {center.municipality.name}
                            {center.municipality.department && `, ${center.municipality.department.name}`}
                          </span>
                        )}
                      </span>
                    </div>

                    {center.schedule && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{center.schedule}</span>
                      </div>
                    )}

                    {center.contact_phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{center.contact_phone}</span>
                      </div>
                    )}

                    {center.responsible_person && (
                      <div className="flex items-center text-gray-600">
                        <span className="font-medium mr-1">Responsable:</span>
                        <span>{center.responsible_person}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {getTypeLabel(center.type)}
                    </span>
                    {/* El mapa recibe el id del punto, no unas coordenadas
                        sueltas: así se comporta igual que pulsar el marcador
                        allí —acerca, abre la ficha y guarda la vista para
                        poder volver— en vez de dejar el mapa centrado en un
                        sitio sin decir en qué. Navegación de router, no
                        window.location: recargar la app entera perdía el
                        estado y tardaba lo suyo. */}
                    <Button
                      size="sm"
                      onClick={() => navigate(`/mapa?punto=center-${center.id}`)}
                    >
                      Ver en mapa
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredCenters.length === 0 && !loading && (
          <div className="text-center py-12">
            <MapPin className="mx-auto text-gray-300" size={64} />
            <h3 className="mt-4 text-lg font-medium text-gray-600">No se encontraron centros</h3>
            <p className="text-gray-500">Intenta ajustar los filtros o registra un nuevo centro</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionCentersPage;