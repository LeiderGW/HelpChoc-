import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Need } from '../../types';
import { getPriorityColor, getPriorityIcon } from '../../utils/priorityCalculator';
import Badge from '../common/Badge';

interface TopNeedsProps {
  needs: (Need & { pending: number })[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
}

const TopNeeds: React.FC<TopNeedsProps> = ({
  needs,
  title = 'Necesidades más urgentes',
  maxItems = 10,
  showViewAll = true,
}) => {
  const sortedNeeds = needs
    .filter(n => n.pending > 0)
    .sort((a, b) => b.pending - a.pending)
    .slice(0, maxItems);

  if (sortedNeeds.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 text-center">
        <div className="text-4xl mb-3">🎉</div>
        <p className="text-gray-500 font-medium">¡Todas las necesidades están cubiertas!</p>
        <p className="text-sm text-gray-400 mt-1">No hay necesidades pendientes en este momento</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <TrendingUp className="mr-2 text-red-500" size={20} />
            {title}
          </h3>
          {showViewAll && (
            <Link
              to="/necesidades"
              className="text-sm text-blue-600 hover:underline"
            >
              Ver todas
            </Link>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                # Producto
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pendiente
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cobertura
              </th>
              <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedNeeds.map((need, index) => {
              const coverage = Math.min((need.quantity_received / need.quantity_needed) * 100, 100);
              const isCritical = need.priority === 'critical';

              return (
                <tr key={need.id} className={`hover:bg-gray-50 transition-colors ${isCritical ? 'bg-red-50' : ''}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400 mr-2 font-medium">#{index + 1}</span>
                      <span className="font-medium text-gray-800">
                        {need.product}
                        {isCritical && (
                          <AlertTriangle className="inline ml-1 text-red-500" size={14} />
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">{need.category}</td>
                  <td className="py-3 px-4 font-medium text-red-600">
                    {need.pending} {need.unit}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={need.priority as any} size="sm">
                      {getPriorityIcon(need.priority)} {need.priority.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-20 bg-gray-200 rounded-full h-1.5 mr-2">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            coverage >= 80 ? 'bg-green-500' :
                            coverage >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round(coverage)}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Link
                      to={`/necesidades/${need.id}`}
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      Ayudar →
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopNeeds;