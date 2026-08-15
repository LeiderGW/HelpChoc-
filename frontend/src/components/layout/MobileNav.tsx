import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Map, Package, Heart, MapPin, Plus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface MobileNavProps {
  onActionClick?: () => void;
}

const MobileNav: React.FC<MobileNavProps> = ({ onActionClick }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/mapa', label: 'Mapa', icon: Map },
    { path: '/necesidades', label: 'Necesidades', icon: Package },
    { path: '/ayudas', label: 'Ayudas', icon: Heart },
    { path: '/puntos-entrega', label: 'Puntos', icon: MapPin },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onActionClick}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600' : ''}`} />
            <span className={`text-xs mt-0.5 ${isActive(item.path) ? 'font-medium text-blue-600' : ''}`}>
              {item.label}
            </span>
          </Link>
        ))}

        {/* Action Button - Report Need */}
        {isAuthenticated && (
          <Link
            to="/reportar-necesidad"
            onClick={onActionClick}
            className="flex flex-col items-center justify-center -mt-4"
          >
            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-700 transition-colors animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs text-red-600 font-medium mt-0.5">Reportar</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default MobileNav;