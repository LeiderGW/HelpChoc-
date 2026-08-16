import React, { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import Button from '../common/Button';

interface MapFiltersProps {
  onFilterChange: (filters: MapFiltersState) => void;
  onClear: () => void;
  departments: { id: string; name: string }[];
  municipalities: { id: string; name: string; department_id: string }[];
}

export interface MapFiltersState {
  departments: string[];
  municipalities: string[];
  types: string[];
  priorities: string[];
}

const MapFilters: React.FC<MapFiltersProps> = ({
  onFilterChange,
  onClear,
  departments,
  municipalities,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<MapFiltersState>({
    departments: [],
    municipalities: [],
    types: [],
    priorities: [],
  });

  const handleFilterChange = (key: keyof MapFiltersState, value: string) => {
    const current = filters[key];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    const newFilters = { ...filters, [key]: updated };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setFilters({
      departments: [],
      municipalities: [],
      types: [],
      priorities: [],
    });
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(arr => arr.length > 0);

  const typeOptions = [
    { value: 'need', label: 'Necesidades' },
    { value: 'center', label: 'Centros' },
    { value: 'offer', label: 'Ayudas' },
  ];

  const priorityOptions = [
    { value: 'critical', label: 'Crítica', color: 'bg-red-600' },
    { value: 'high', label: 'Alta', color: 'bg-orange-500' },
    { value: 'medium', label: 'Media', color: 'bg-yellow-500' },
    { value: 'low', label: 'Baja', color: 'bg-green-500' },
    { value: 'covered', label: 'Cubierta', color: 'bg-gray-500' },
  ];

  const selectedDepartmentIds = departments
    .filter(d => filters.departments.includes(d.name))
    .map(d => d.id);

  const visibleMunicipalities = selectedDepartmentIds.length
    ? municipalities.filter(m => selectedDepartmentIds.includes(m.department_id))
    : [];

  return (
    <div className="bg-white rounded-xl shadow-lg">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 rounded-xl transition-colors"
      >
        <div className="flex items-center">
          <Filter className="mr-2 text-gray-500" size={20} />
          <span className="font-medium text-gray-700">Filtros</span>
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          )}
        </div>
        <div className="flex items-center">
          {hasActiveFilters && (
            <span className="text-xs text-blue-600 mr-2">
              {Object.values(filters).reduce((acc, arr) => acc + arr.length, 0)} activos
            </span>
          )}
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-gray-100 space-y-4">
          {/* Priorities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridades
            </label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map(p => (
                <button
                  key={p.value}
                  onClick={() => handleFilterChange('priorities', p.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.priorities.includes(p.value)
                      ? `${p.color} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Types */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipos
            </label>
            <div className="flex flex-wrap gap-2">
              {typeOptions.map(t => (
                <button
                  key={t.value}
                  onClick={() => handleFilterChange('types', t.value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.types.includes(t.value)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Departments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Departamentos
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {departments.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleFilterChange('departments', d.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    filters.departments.includes(d.name)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          {/* Municipalities */}
          {visibleMunicipalities.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipios
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {visibleMunicipalities.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleFilterChange('municipalities', m.name)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      filters.municipalities.includes(m.name)
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Aplicar
            </Button>
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={handleClear}
              >
                <X className="mr-1" size={16} />
                Limpiar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MapFilters;