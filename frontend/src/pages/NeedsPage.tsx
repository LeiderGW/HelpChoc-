import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, MapPin, Package, AlertTriangle } from 'lucide-react';
import { needsService } from '../services/needsService';
import { Need, NeedFilters, NeedCategory } from '../types';
import { getPriorityColor, getPriorityIcon } from '../utils/priorityCalculator';
import Button from '../components/common/Button';

const NeedsPage: React.FC = () => {
  const [needs, setNeeds] = useState<Need[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<NeedFilters>({
    page: 1,
    limit: 20,
  });
  const [totalPages, setTotalPages] = useState(0);

  const categories: { value: NeedCategory; label: string }[] = [
    { value: 'water', label: 'Agua' },
    { value: 'food', label: 'Alimentos' },
    { value: 'medicines', label: 'Medicamentos' },
    { value: 'first_aid', label: 'Primeros Auxilios' },
    { value: 'clothing', label: 'Ropa' },
    { value: 'mattresses', label: 'Colchonetas' },
    { value: 'hygiene', label: 'Higiene' },
    { value: 'cleaning', label: 'Aseo' },
    { value: 'housing', label: 'Vivienda' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'transport', label: 'Transporte' },
    { value: 'energy', label: 'Energía' },
    { value: 'communications', label: 'Comunicaciones' },
    { value: 'other', label: 'Otros' },
  ];

  useEffect(() => {
    fetchNeeds();
  }, [filters]);

  const fetchNeeds = async () => {
    setLoading(true);
    const response = await needsService.getNeeds(filters);
    if (response.data) {
      setNeeds(response.data);
      setTotalPages(response.pagination?.totalPages || 0);
    }
    setLoading(false);
  };

  const handleFilterChange = (key: keyof NeedFilters, value: any) => {
    setFilters({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filtering
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchNeeds();
  };

  const handlePageChange = (newPage: number) => {
    setFilters({
      ...filters,
      page: newPage,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="mr-3 text-blue-600" size={32} />
              Necesidades Activas
            </h1>
            <p className="text-gray-600 mt-1">
              Encuentra las necesidades reportadas y descubre cómo puedes ayudar
            </p>
          </div>
          <Link
            to="/reportar-necesidad"
            className="mt-4 md:mt-0 bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg flex items-center"
          >
            <AlertTriangle className="mr-2" size={20} />
            Reportar necesidad
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por producto, categoría o descripción..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2" size={18} />
              Filtros
            </Button>
            <Button type="submit">Buscar</Button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.priority || ''}
                  onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
                >
                  <option value="">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                >
                  <option value="">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="verified">Verificado</option>
                  <option value="fulfilled">Cubierto</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  placeholder="Ej: Antioquia"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filters.department || ''}
                  onChange={(e) => handleFilterChange('department', e.target.value || undefined)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Needs List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {needs.map((need) => {
                const pending = need.quantity_needed - need.quantity_received;
                const percentage = Math.min((need.quantity_received / need.quantity_needed) * 100, 100);
                
                return (
                  <div key={need.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg text-gray-800">{need.product}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getPriorityColor(need.priority)}`}>
                            {getPriorityIcon(need.priority)} {need.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{need.category}</p>
                      </div>
                      {need.verification_status === 'verified' && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          ✓ Verificado
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-3">
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
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{Math.round(percentage)}% cubierto</span>
                        {need.affected_people && (
                          <span>👥 {need.affected_people} personas</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-1" />
                        {need.municipality?.name || 'Ubicación no especificada'}
                      </div>
                      <Link
                        to={`/necesidades/${need.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Ver detalles
                      </Link>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs text-gray-400">
                      <span>Reportado: {new Date(need.created_at).toLocaleDateString()}</span>
                      <span>Actualizado: {new Date(need.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! - 1)}
                  disabled={filters.page === 1}
                >
                  Anterior
                </Button>
                <span className="px-4 py-2 text-sm">
                  Página {filters.page} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(filters.page! + 1)}
                  disabled={filters.page === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            )}

            {needs.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-300" size={64} />
                <h3 className="mt-4 text-lg font-medium text-gray-600">No se encontraron necesidades</h3>
                <p className="text-gray-500">Intenta ajustar los filtros o reporta una nueva necesidad</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NeedsPage;