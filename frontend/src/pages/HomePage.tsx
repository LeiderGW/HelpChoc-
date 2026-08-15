import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, AlertTriangle, Package, Users, Heart, ArrowRight } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Need } from '../types';
import { getPriorityColor, getPriorityIcon } from '../utils/priorityCalculator';

const HomePage: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [stats, setStats] = useState({
    totalNeeds: 0,
    criticalNeeds: 0,
    coveredNeeds: 0,
    totalOffers: 0,
    affectedPeople: 0,
    activeCenters: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch recent needs
      const { data: needsData, error: needsError } = await supabase
        .from('needs')
        .select(`
          *,
          municipality:municipalities(name),
          department:departments(name)
        `)
        .order('created_at', { ascending: false })
        .limit(6);

      if (needsError) throw needsError;
      setNeeds(needsData || []);

      // Fetch statistics
      const { data: statsData, error: statsError } = await supabase
        .from('needs')
        .select('priority, status, affected_people');

      if (statsError) throw statsError;

      const total = statsData?.length || 0;
      const critical = statsData?.filter(n => n.priority === 'critical').length || 0;
      const covered = statsData?.filter(n => n.status === 'fulfilled').length || 0;
      const affected = statsData?.reduce((sum, n) => sum + (n.affected_people || 0), 0) || 0;

      // Get total offers
      const { count: offersCount } = await supabase
        .from('aid_offers')
        .select('*', { count: 'exact', head: true });

      // Get active centers
      const { count: centersCount } = await supabase
        .from('collection_centers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalNeeds: total,
        criticalNeeds: critical,
        coveredNeeds: covered,
        totalOffers: offersCount || 0,
        affectedPeople: affected,
        activeCenters: centersCount || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNeeds = needs.filter(need =>
    need.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
    need.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Encuentra dónde se necesita ayuda
              </h1>
              <p className="text-xl opacity-90 mb-8 max-w-2xl">
                Conectamos personas y comunidades afectadas con organizaciones y voluntarios que ofrecen ayuda humanitaria en Colombia.
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-yellow-400">{stats.criticalNeeds}</div>
                <div className="text-sm">Necesidades Críticas</div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Buscar necesidades por producto, categoría o ubicación..."
              className="w-full px-6 py-4 pr-12 rounded-xl text-gray-800 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={24} />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/necesidades"
              className="bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg flex items-center"
            >
              <Package className="mr-2" size={20} />
              Ver necesidades
            </Link>
            <Link
              to="/ofrecer-ayuda"
              className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg flex items-center"
            >
              <Heart className="mr-2" size={20} />
              Ofrecer ayuda
            </Link>
            <Link
              to="/reportar-necesidad"
              className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors shadow-lg flex items-center"
            >
              <AlertTriangle className="mr-2" size={20} />
              Reportar necesidad
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-blue-600">{stats.totalNeeds}</div>
            <div className="text-sm text-gray-600">Necesidades activas</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-red-600">{stats.criticalNeeds}</div>
            <div className="text-sm text-gray-600">Necesidades críticas</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-green-600">{stats.coveredNeeds}</div>
            <div className="text-sm text-gray-600">Necesidades cubiertas</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-purple-600">{stats.totalOffers}</div>
            <div className="text-sm text-gray-600">Ayudas ofrecidas</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-orange-600">{stats.affectedPeople}</div>
            <div className="text-sm text-gray-600">Personas afectadas</div>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-teal-600">{stats.activeCenters}</div>
            <div className="text-sm text-gray-600">Centros activos</div>
          </div>
        </div>
      </section>

      {/* Recent Needs */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Necesidades recientes</h2>
            <Link to="/necesidades" className="text-blue-600 hover:text-blue-700 font-medium flex items-center">
              Ver todas <ArrowRight className="ml-1" size={18} />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNeeds.map((need) => {
                const pending = need.quantity_needed - need.quantity_received;
                const percentage = Math.min((need.quantity_received / need.quantity_needed) * 100, 100);
                
                return (
                  <div key={need.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">{need.product}</h3>
                          <p className="text-sm text-gray-500">{need.category}</p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getPriorityColor(need.priority)}`}>
                          {getPriorityIcon(need.priority)} {need.priority.toUpperCase()}
                        </div>
                      </div>
                      
                      <div className="space-y-3 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Necesitado:</span>
                          <span className="font-medium">{need.quantity_needed} {need.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Recibido:</span>
                          <span className="font-medium text-green-600">{need.quantity_received} {need.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Pendiente:</span>
                          <span className="font-medium text-red-600">{pending} {need.unit}</span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-right text-xs text-gray-500">{Math.round(percentage)}% cubierto</div>
                        
                        {need.location && (
                          <div className="flex items-center text-sm text-gray-600 mt-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {need.municipality?.name || 'Ubicación no especificada'}
                          </div>
                        )}
                      </div>
                      
                      <Link
                        to={`/necesidades/${need.id}`}
                        className="block mt-4 text-center bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Critical Needs Section */}
      <section className="py-12 px-4 bg-gradient-to-r from-red-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-red-700 mb-8 flex items-center">
            <AlertTriangle className="mr-2" size={24} />
            Necesidades críticas - Atención inmediata requerida
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needs.filter(n => n.priority === 'critical').slice(0, 4).map((need) => (
              <div key={need.id} className="bg-white border-l-4 border-red-600 rounded-xl shadow-lg p-5 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-lg">{need.product}</h4>
                    <p className="text-sm text-gray-600">{need.category}</p>
                    {need.municipality && (
                      <p className="text-sm text-gray-500 mt-1">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        {need.municipality.name}
                      </p>
                    )}
                  </div>
                  <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    CRÍTICA
                  </span>
                </div>
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-sm">
                    <span className="font-bold text-red-600">
                      {need.quantity_needed - need.quantity_received} {need.unit}
                    </span>
                    {' '}pendientes
                  </span>
                  <Link
                    to={`/necesidades/${need.id}`}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Ayudar ahora
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            ¿Quieres hacer la diferencia?
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Cada ayuda cuenta. Reporta necesidades u ofrece tu apoyo hoy mismo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/reportar-necesidad"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              Reportar necesidad
            </Link>
            <Link
              to="/ofrecer-ayuda"
              className="bg-green-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-green-600 transition-colors shadow-lg"
            >
              Ofrecer ayuda
            </Link>
            <Link
              to="/mapa"
              className="bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold hover:bg-blue-400 transition-colors shadow-lg border border-white/20"
            >
              Ver mapa
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;