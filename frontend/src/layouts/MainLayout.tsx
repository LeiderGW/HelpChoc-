import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Home, Map, Package, Heart, MapPin, 
  BarChart3, AlertTriangle, HeartHandshake, User, 
  LogIn, LogOut, Sun, Moon, Bell 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { supabaseConfigurado } from '../services/supabase';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, appUser, signOut, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/mapa', label: 'Mapa', icon: Map },
    { path: '/necesidades', label: 'Necesidades', icon: Package },
    { path: '/ayudas', label: 'Ayudas', icon: Heart },
    { path: '/puntos-entrega', label: 'Puntos de Entrega', icon: MapPin },
    { path: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  ];

  const actionItems = [
    { path: '/reportar-necesidad', label: 'Reportar Necesidad', icon: AlertTriangle, variant: 'danger' },
    { path: '/ofrecer-ayuda', label: 'Ofrecer Ayuda', icon: HeartHandshake, variant: 'success' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // El mapa ocupa la ventana entera y gestiona su propio desplazamiento por
  // columnas. Si la página además puede desplazarse, la rueda del ratón mueve
  // el documento en vez del panel lateral y el pie de página empuja el mapa
  // fuera de la pantalla.
  const isFullBleed = location.pathname === '/mapa';

  return (
    <div className={isFullBleed ? 'h-screen overflow-hidden bg-gray-50' : 'min-h-screen bg-gray-50'}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">AyudaMapa</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="inline-block w-4 h-4 mr-1" />
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications */}
              {isAuthenticated && (
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                </button>
              )}

              {/* Auth Buttons */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/perfil"
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">
                      {appUser?.full_name || 'Perfil'}
                    </span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label="Sign out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <div className="px-4 py-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="inline-block w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
              <div className="border-t border-gray-200 my-2"></div>
              {actionItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    item.variant === 'danger'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="inline-block w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Aviso de configuración. Sin las variables de Supabase la app carga
          pero no trae datos, y sin este cartel el síntoma es una pantalla
          llena de ceros sin explicación. */}
      {!supabaseConfigurado && (
        <div className="fixed inset-x-0 top-16 z-[60] bg-amber-50 px-4 py-2 text-center text-sm text-amber-900 shadow-sm">
          <strong className="font-semibold">Sin conexión a la base de datos.</strong> Faltan
          <code className="mx-1 rounded bg-amber-100 px-1 font-mono text-xs">VITE_SUPABASE_URL</code>
          y
          <code className="mx-1 rounded bg-amber-100 px-1 font-mono text-xs">VITE_SUPABASE_ANON_KEY</code>
          en el entorno del despliegue.
        </div>
      )}

      {/* Main Content */}
      <main className={isFullBleed ? 'h-screen pt-16' : 'pt-16'}>
        {children}
      </main>

      {/* Footer */}
      {!isFullBleed && (
      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">AyudaMapa</h3>
              <p className="text-gray-400 text-sm">
                Facilitando la coordinación y distribución de ayudas humanitarias en Colombia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/necesidades" className="hover:text-white">Necesidades</Link></li>
                <li><Link to="/ofrecer-ayuda" className="hover:text-white">Ofrecer Ayuda</Link></li>
                <li><Link to="/puntos-entrega" className="hover:text-white">Puntos de Entrega</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Información</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-white">Acerca de</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contacto</Link></li>
                <li><Link to="/privacy" className="hover:text-white">Política de Privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Emergencias</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {/* <li className="flex items-center">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></span>
                  <span>Línea de Emergencia: 123</span>
                </li>
                <li className="text-sm">Cruz Roja: 132</li>
                <li className="text-sm">Defensa Civil: 144</li> */}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} AyudaMapa. Todos los derechos reservados.
          </div>
        </div>
      </footer>
      )}
    </div>
  );
};

export default MainLayout;