import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, Filter, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { Need } from '../../types';
import { getPriorityColor, getPriorityIcon, getPriorityLabel } from '../../utils/priorityCalculator';
import { formatRelativeTime } from '../../utils/formatters';
import Badge from '../common/Badge';
import Button from '../common/Button';

interface NeedListProps {
  needs: Need[];
  loading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  onFilterChange?: (filters: any) => void;
}

const NeedList: React.FC<NeedListProps> = ({
  needs,
  loading = false,
  onLoadMore,
  hasMore = false,
  onFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredNeeds = needs.filter(need => {
    const matchesSearch = need.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          need.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || need.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || need.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const handleFilterApply = () => {
    onFilterChange?.({ priority: filterPriority, status: filterStatus });
    setShowFilters(false);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar necesidades..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <Filter className="mr-2" size={16} />
            Filtros
            {(filterPriority !== 'all' || filterStatus !== 'all') && (
              <span className="ml-1 w-2 h-2 bg-blue-600 rounded-full inline-block" />
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                >
                  <option value="all">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="high">Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendiente</option>
                  <option value="verified">Verificado</option>
                  <option value="fulfilled">Cubierto</option>
                </select>
              </div>
            </div>
            <div className="mt-3 flex gap-3">
              <Button size="sm" onClick={handleFilterApply}>Aplicar filtros</Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setFilterPriority('all');
                  setFilterStatus('all');
                  onFilterChange?.({ priority: 'all', status: 'all' });
                }}
              >
                Limpiar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Mostrando {filteredNeeds.length} de {needs.length} necesidades
      </div>

      {/* Needs List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredNeeds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-md">
          <Package className="mx-auto text-gray-300" size={64} />
          <h3 className="mt-4 text-lg font-medium text-gray-600">No se encontraron necesidades</h3>
          <p className="text-gray-500">Intenta ajustar los filtros o reporta una nueva necesidad</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNeeds.map((need) => {
            const pending = need.quantity_needed - need.quantity_received;
            const percentage = Math.min((need.quantity_received / need.quantity_needed) * 100, 100);
            const isCritical = need.priority === 'critical';
            const isVerified = need.verification_status === 'verified';

            return (
              <div
                key={need.id}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
                  isCritical ? 'border-l-4 border-red-500' : ''
                }`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <h3 className="font-bold text-gray-800">{need.product}</h3>
                        <Badge variant={need.priority as any} size="sm">
                          {getPriorityIcon(need.priority)} {getPriorityLabel(need.priority)}
                        </Badge>
                        {isVerified && (
                          <Badge variant="verified" size="sm">✓ Verificado</Badge>
                        )}
                        {need.status === 'fulfilled' && (
                          <Badge variant="success" size="sm">Cubierto</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{need.category}</p>
                    </div>
                    <Link
                      to={`/necesidades/${need.id}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Ver detalles →
                    </Link>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-xs text-gray-500">Necesitado</p>
                      <p className="font-medium">{need.quantity_needed} {need.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Recibido</p>
                      <p className="font-medium text-green-600">{need.quantity_received} {need.unit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Pendiente</p>
                      <p className="font-medium text-red-600">{pending} {need.unit}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 100 ? 'bg-green-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{Math.round(percentage)}% cubierto</span>
                      {need.affected_people && (
                        <span>👥 {need.affected_people} personas</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {need.municipality?.name || 'Ubicación no especificada'}
                    </div>
                    <span>Actualizado: {formatRelativeTime(need.updated_at)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More */}
      {hasMore && !loading && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onLoadMore}>
            Cargar más
          </Button>
        </div>
      )}
    </div>
  );
};

export default NeedList;