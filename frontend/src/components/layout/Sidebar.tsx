import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home, Map, Package, Heart, MapPin, BarChart3,
  AlertTriangle, HeartHandshake, User, Settings, LogOut,
  ChevronLeft, ChevronRight, Shield, Users, Bell,
  ClipboardList, Truck, Building2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_LABELS } from '../../lib/constants';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle, onClose }) => {
  const location = useLocation();
  const { appUser, signOut, isAuthenticated, isAdmin, isOrganization } = useAuth();
  const { theme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const mainNavItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/mapa', label: 'Mapa', icon: Map },
    { path: '/necesidades', label: 'Necesidades', icon: Package },
    { path: '/ayudas', label: 'Ayudas', icon: Heart },
    { path: '/puntos-entrega', label: 'Puntos de Entrega', icon: MapPin },
  ];

  const actionItems = [
    { path: '/reportar-necesidad', label: 'Reportar Necesidad', icon: AlertTriangle, variant: 'danger' },
    { path: '/ofrecer-ayuda', label: 'Ofrecer Ayuda', icon: HeartHandshake, variant: 'success' },
  ];

  const adminItems = [
    { path: '/estadisticas', label: 'Dashboard', icon: BarChart3 },
    { path: '/usuarios', label: 'Usuarios', icon: Users },
    { path: '/verificaciones', label: 'Verificaciones', icon: Shield },
    { path: '/organizaciones', label: 'Organizaciones', icon: Building2 },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${expanded ? 'w-64' : 'w-20'}
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <div className={`flex items-center space-x-2 ${!expanded && 'hidden'}`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">AyudaMapa</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {expanded ? (
              <ChevronLeft className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* User Info */}
        {isAuthenticated && appUser && (
          <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${!expanded && 'justify-center'}`}>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {appUser.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            {expanded && (
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {appUser.full_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {ROLE_LABELS[(appUser.role ?? 'visitor') as keyof typeof ROLE_LABELS]}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {/* Main Navigation */}
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                  ${!expanded && 'justify-center'}
                `}
                title={!expanded ? item.label : undefined}
              >
                <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                {expanded && <span className="ml-3 text-sm">{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className={`text-xs font-medium text-gray-400 uppercase tracking-wider ${!expanded && 'hidden'}`}>
              Acciones
            </p>
            {actionItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-2.5 rounded-lg transition-colors mt-1
                  ${item.variant === 'danger'
                    ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30'
                    : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30'
                  }
                  ${!expanded && 'justify-center'}
                `}
                title={!expanded ? item.label : undefined}
              >
                <item.icon className="w-5 h-5" />
                {expanded && <span className="ml-3 text-sm">{item.label}</span>}
              </Link>
            ))}
          </div>

          {/* Admin Section */}
          {(isAdmin || isOrganization) && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className={`text-xs font-medium text-gray-400 uppercase tracking-wider ${!expanded && 'hidden'}`}>
                Administración
              </p>
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-colors mt-1
                    ${isActive(item.path)
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }
                    ${!expanded && 'justify-center'}
                  `}
                  title={!expanded ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {expanded && <span className="ml-3 text-sm">{item.label}</span>}
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors
                ${!expanded && 'justify-center'}
              `}
              title={!expanded ? 'Cerrar Sesión' : undefined}
            >
              <LogOut className="w-5 h-5" />
              {expanded && <span className="ml-3 text-sm">Cerrar Sesión</span>}
            </button>
          ) : (
            <div className={`space-y-2 ${!expanded && 'flex flex-col items-center'}`}>
              <Link
                to="/login"
                onClick={onClose}
                className={`
                  flex items-center w-full px-3 py-2.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors
                  ${!expanded && 'justify-center'}
                `}
                title={!expanded ? 'Iniciar Sesión' : undefined}
              >
                <LogOut className="w-5 h-5" />
                {expanded && <span className="ml-3 text-sm">Iniciar Sesión</span>}
              </Link>
              <Link
                to="/register"
                onClick={onClose}
                className={`
                  flex items-center w-full px-3 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors
                  ${!expanded && 'justify-center'}
                `}
                title={!expanded ? 'Registrarse' : undefined}
              >
                <User className="w-5 h-5" />
                {expanded && <span className="ml-3 text-sm">Registrarse</span>}
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;