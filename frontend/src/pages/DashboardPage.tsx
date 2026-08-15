import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Package, AlertTriangle, CheckCircle, Heart, Users, 
  MapPin, TrendingUp, TrendingDown, Calendar, Clock
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const DashboardPage: React.FC = () => {
  const { isAdmin, isOrganization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNeeds: 0,
    criticalNeeds: 0,
    coveredNeeds: 0,
    totalOffers: 0,
    deliveredOffers: 0,
    totalCenters: 0,
    activeCenters: 0,
    affectedPeople: 0,
    municipalities: 0,
  });
  const [needsByCategory, setNeedsByCategory] = useState<any[]>([]);
  const [needsByDepartment, setNeedsByDepartment] = useState<any[]>([]);
  const [needsOverTime, setNeedsOverTime] = useState<any[]>([]);
  const [topNeeds, setTopNeeds] = useState<any[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<any[]>([]);

  const COLORS = ['#DC2626', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'];

  useEffect(() => {
    if (!isAdmin && !isOrganization) {
      toast.error('No tienes permisos para acceder al dashboard');
      return;
    }
    fetchDashboardData();
  }, [isAdmin, isOrganization]);

  const fetchDashboardData = async () => {
    try {
      // Fetch needs statistics
      const { data: needsData } = await supabase
        .from('needs')
        .select('priority, status, category, department_id, affected_people, created_at, quantity_needed, quantity_received');

      // Fetch offers
      const { data: offersData } = await supabase
        .from('aid_offers')
        .select('status');

      // Fetch centers
      const { data: centersData } = await supabase
        .from('collection_centers')
        .select('status');

      // Fetch municipalities
      const { count: municipalitiesCount } = await supabase
        .from('municipalities')
        .select('*', { count: 'exact', head: true });

      // Process statistics
      const totalNeeds = needsData?.length || 0;
      const criticalNeeds = needsData?.filter(n => n.priority === 'critical').length || 0;
      const coveredNeeds = needsData?.filter(n => n.status === 'fulfilled').length || 0;
      const totalOffers = offersData?.length || 0;
      const deliveredOffers = offersData?.filter(o => o.status === 'delivered').length || 0;
      const totalCenters = centersData?.length || 0;
      const activeCenters = centersData?.filter(c => c.status === 'active').length || 0;
      const affectedPeople = needsData?.reduce((sum, n) => sum + (n.affected_people || 0), 0) || 0;

      setStats({
        totalNeeds,
        criticalNeeds,
        coveredNeeds,
        totalOffers,
        deliveredOffers,
        totalCenters,
        activeCenters,
        affectedPeople,
        municipalities: municipalitiesCount || 0,
      });

      // Process by category
      const categoryMap: Record<string, number> = {};
      needsData?.forEach(n => {
        categoryMap[n.category] = (categoryMap[n.category] || 0) + 1;
      });
      setNeedsByCategory(
        Object.entries(categoryMap).map(([name, value]) => ({ name, value }))
      );

      // Process by department
      const departmentMap: Record<string, number> = {};
      needsData?.forEach(n => {
        if (n.department_id) {
          departmentMap[n.department_id] = (departmentMap[n.department_id] || 0) + 1;
        }
      });
      // Get department names
      const departmentIds = Object.keys(departmentMap);
      if (departmentIds.length > 0) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id, name')
          .in('id', departmentIds);
        setNeedsByDepartment(
          deptData?.map(d => ({
            name: d.name,
            value: departmentMap[d.id] || 0,
          })) || []
        );
      }

      // Process over time
      const timeMap: Record<string, number> = {};
      needsData?.forEach(n => {
        const date = new Date(n.created_at);
        const key = date.toLocaleDateString('es-CO', { month: 'short', day: 'numeric' });
        timeMap[key] = (timeMap[key] || 0) + 1;
      });
      setNeedsOverTime(
        Object.entries(timeMap).map(([date, count]) => ({ date, count }))
      );

      // Process priority distribution
      const priorityMap: Record<string, number> = {};
      needsData?.forEach(n => {
        priorityMap[n.priority] = (priorityMap[n.priority] || 0) + 1;
      });
      setPriorityDistribution(
        Object.entries(priorityMap).map(([name, value]) => ({ name, value }))
      );

      // Top needs
      const needsWithPending = needsData?.map(n => ({
        ...n,
        pending: n.quantity_needed - n.quantity_received,
      })) || [];
      const sorted = needsWithPending
        .filter(n => n.pending > 0)
        .sort((a, b) => b.pending - a.pending)
        .slice(0, 10);
      setTopNeeds(sorted);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Error al cargar el dashboard');
      setLoading(false);
    }
  };

  if (!isAdmin && !isOrganization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto text-red-500" size={64} />
          <h2 className="mt-4 text-2xl font-bold text-gray-800">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder al dashboard</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Estadísticas en tiempo real de la plataforma</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Necesidades</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalNeeds}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <AlertTriangle className="text-red-500 mr-1" size={16} />
              <span className="text-red-600 font-medium">{stats.criticalNeeds}</span>
              <span className="text-gray-500 ml-1">críticas</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ayudas Ofrecidas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOffers}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="text-green-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-1" size={16} />
              <span className="text-green-600 font-medium">{stats.deliveredOffers}</span>
              <span className="text-gray-500 ml-1">entregadas</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Personas Afectadas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.affectedPeople}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-lg">
                <Users className="text-orange-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <MapPin className="text-blue-500 mr-1" size={16} />
              <span className="text-gray-600">{stats.municipalities} municipios</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Centros Activos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCenters}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <MapPin className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Total: {stats.totalCenters} centros</span>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Needs by Category */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Necesidades por Categoría</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={needsByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {needsByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Distribución de Prioridades</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6">
                    {priorityDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Needs Over Time */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Evolución de Necesidades</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={needsOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#3B82F6" fill="#93C5FD" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Needs by Department */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Necesidades por Departamento</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={needsByDepartment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Needs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Top 10 Necesidades más Urgentes</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Producto</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoría</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Pendiente</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Prioridad</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Cobertura</th>
                </tr>
              </thead>
              <tbody>
                {topNeeds.map((need) => {
                  const coverage = (need.quantity_received / need.quantity_needed) * 100;
                  return (
                    <tr key={need.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{need.product}</td>
                      <td className="py-3 px-4 text-gray-600">{need.category}</td>
                      <td className="py-3 px-4 font-medium text-red-600">
                        {need.pending} {need.unit}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold text-white ${
                          need.priority === 'critical' ? 'bg-red-600' :
                          need.priority === 'high' ? 'bg-orange-500' :
                          need.priority === 'medium' ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}>
                          {need.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(coverage, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{Math.round(coverage)}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;