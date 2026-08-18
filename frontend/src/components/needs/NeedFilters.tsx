import React from 'react';
import { Filter, X } from 'lucide-react';
import { NeedFilters as NeedFiltersType, NeedCategory } from '../../types';
import { NEED_CATEGORIES } from '../../lib/constants';
import Button from '../common/Button';

interface NeedFiltersProps {
  filters: NeedFiltersType;
  onFilterChange: (key: keyof NeedFiltersType, value: any) => void;
  onClearFilters: () => void;
  onApply: () => void;
  show: boolean;
  onToggle: () => void;
}

const NeedFilters: React.FC<NeedFiltersProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  onApply,
  show,
  onToggle,
}) => {
  const hasActiveFilters = Object.values(filters).some(v => v && v !== '');

  if (!show) {
    return (
      <Button variant="outline" onClick={onToggle} className="mb-4">
        <Filter className="mr-2" size={18} />
        Filtros {hasActiveFilters && <span className="ml-1 text-blue-600">●</span>}
      </Button>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-700 flex items-center">
          <Filter className="mr-2" size={18} />
          Filtros
        </h4>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.category || ''}
            onChange={(e) => onFilterChange('category', e.target.value || undefined)}
          >
            <option value="">Todas</option>
            {/* Un <option> solo admite texto plano: aquí no cabe el icono. */}
            {NEED_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridad
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.priority || ''}
            onChange={(e) => onFilterChange('priority', e.target.value || undefined)}
          >
            <option value="">Todas</option>
            <option value="critical">Crítica</option>
            <option value="high">Alta</option>
            <option value="medium">Media</option>
            <option value="low">Baja</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado
          </label>
          <select
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status || ''}
            onChange={(e) => onFilterChange('status', e.target.value || undefined)}
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="verified">Verificado</option>
            <option value="fulfilled">Cubierto</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <Button onClick={onApply} className="flex-1">
          Aplicar filtros
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={onClearFilters} className="flex-1">
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  );
};

export default NeedFilters;