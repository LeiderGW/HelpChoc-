import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Github, Twitter, Facebook, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <span className="text-xl font-bold">AyudaMapa</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Facilitando la coordinación y distribución de ayudas humanitarias en Colombia durante emergencias.
            </p>
            <div className="mt-4 flex space-x-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="GitHub"
              >
                <Github size={20} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/necesidades" className="text-gray-400 hover:text-white transition-colors">
                  Necesidades
                </Link>
              </li>
              <li>
                <Link to="/ofrecer-ayuda" className="text-gray-400 hover:text-white transition-colors">
                  Ofrecer Ayuda
                </Link>
              </li>
              <li>
                <Link to="/puntos-entrega" className="text-gray-400 hover:text-white transition-colors">
                  Puntos de Entrega
                </Link>
              </li>
              <li>
                <Link to="/mapa" className="text-gray-400 hover:text-white transition-colors">
                  Mapa
                </Link>
              </li>
              <li>
                <Link to="/estadisticas" className="text-gray-400 hover:text-white transition-colors">
                  Estadísticas
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Información</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Acerca de
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                  Términos de Servicio
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Emergencies */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Emergencias</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-3">
                <span className="w-2 h-2 bg-red-600 rounded-full mt-1.5 animate-pulse"></span>
                <div>
                  <p className="text-gray-400">Línea de Emergencia</p>
                  <p className="text-white font-bold">123</p>
                </div>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-gray-400" size={16} />
                <span className="text-gray-400">Cruz Roja: 132</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="text-gray-400" size={16} />
                <span className="text-gray-400">Defensa Civil: 144</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="text-gray-400" size={16} />
                <a href="mailto:info@ayudamapa.com" className="text-gray-400 hover:text-white transition-colors">
                  info@ayudamapa.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">
            © {currentYear} AyudaMapa. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-1 text-sm text-gray-400 mt-2 md:mt-0">
            <span>Hecho con</span>
            <Heart className="text-red-500 w-4 h-4 fill-current" />
            <span>para Colombia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;