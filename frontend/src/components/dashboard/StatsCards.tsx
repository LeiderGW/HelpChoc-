import React from 'react';
import { 
  Package, AlertTriangle, CheckCircle, Heart, 
  Users, MapPin, TrendingUp, TrendingDown 
} from 'lucide-react';

interface StatCard {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
}

interface StatsCardsProps {
  stats: StatCard[];
  columns?: 2 | 3 | 4 | 5;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, columns = 4 }) => {
  const getColumnsClass = () => {
    switch (columns) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 3: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 5: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5';
      default: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
    }
  };

  return (
    <div className={`grid ${getColumnsClass()} gap-4`}>
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              {stat.subtitle && (
                <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
              )}
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
              {stat.icon}
            </div>
          </div>
          {stat.trend && (
            <div className="mt-3 flex items-center">
              {stat.trend.direction === 'up' ? (
                <TrendingUp className={`w-4 h-4 text-green-500 mr-1`} />
              ) : (
                <TrendingDown className={`w-4 h-4 text-red-500 mr-1`} />
              )}
              <span className={`text-sm font-medium ${stat.trend.direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend.value}%
              </span>
              <span className="text-xs text-gray-400 ml-1">
                {stat.trend.direction === 'up' ? 'aumento' : 'disminución'}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatsCards;