import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Package, User, Calendar, MapPin, Filter, Search, Plus } from 'lucide-react';
import { supabase } from '../services/supabase';
import { AidOffer } from '../types';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import { toast } from 'sonner';

const OffersPage: React.FC = () => {
  const [offers, setOffers] = useState<AidOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('aid_offers')
        .select(`
          *,
          user:users(full_name, email),
          organization:organizations(name),
          need:needs(product, priority, municipality:municipalities(name)),
          location:locations(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOffers(data || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Error al cargar las ayudas');
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    const matchesSearch = offer.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.user?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          offer.organization?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || offer.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'assigned':
        return 'Asignada';
      case 'in_transit':
        return 'En tránsito';
      case 'delivered':
        return 'Entregada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-700';
      case 'in_transit':
        return 'bg-blue-100 text-blue-700';
      case 'delivered':
        return 'bg-purple-100 text-purple-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Heart className="mr-3 text-red-500" size={32} />
              Ayudas Ofrecidas
            </h1>
            <p className="text-gray-600 mt-1">
              Descubre las ayudas que personas y organizaciones están ofreciendo
            </p>
          </div>
          {isAuthenticated && (
            <Link
              to="/ofrecer-ayuda"
              className="mt-4 md:mt-0 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Ofrecer ayuda
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por producto, organización o persona..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="available">Disponibles</option>
              <option value="assigned">Asignadas</option>
              <option value="in_transit">En tránsito</option>
              <option value="delivered">Entregadas</option>
            </select>
          </div>
        </div>

        {/* Offers List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3">
                      <Package className="text-blue-600 mt-1" size={24} />
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{offer.product}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            {offer.quantity} {offer.unit}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(offer.status)}`}>
                            {getStatusLabel(offer.status)}
                          </span>
                          {offer.need && (
                            <Link
                              to={`/necesidades/${offer.need_id}`}
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Asociada a: {offer.need.product}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      {offer.user && (
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {offer.user.full_name}
                        </div>
                      )}
                      {offer.organization && (
                        <div className="flex items-center">
                          <span className="font-medium mr-1">🏢</span>
                          {offer.organization.name}
                        </div>
                      )}
                      {offer.availability_date && (
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Disponible: {new Date(offer.availability_date).toLocaleDateString('es-CO')}
                        </div>
                      )}
                    </div>

                    {offer.notes && (
                      <p className="mt-2 text-sm text-gray-500">{offer.notes}</p>
                    )}

                    {offer.contact_info && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Contacto:</span> {offer.contact_info}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 md:mt-0 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        toast.info('Ver detalles - Próximamente');
                      }}
                    >
                      Ver detalles
                    </Button>
                    {offer.status === 'available' && (
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => {
                          toast.success('Solicitud de ayuda enviada');
                        }}
                      >
                        Solicitar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredOffers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Heart className="mx-auto text-gray-300" size={64} />
            <h3 className="mt-4 text-lg font-medium text-gray-600">No se encontraron ayudas</h3>
            <p className="text-gray-500">Sé el primero en ofrecer ayuda</p>
            {isAuthenticated && (
              <Link
                to="/ofrecer-ayuda"
                className="mt-4 inline-block bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
              >
                Ofrecer ayuda ahora
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OffersPage;