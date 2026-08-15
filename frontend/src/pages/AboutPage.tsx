import React from 'react';
import { Heart, Users, MapPin, Shield, Target, Globe } from 'lucide-react';

const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Heart,
      title: 'Solidaridad',
      description: 'Creemos en el poder de la ayuda mutua y la colaboración para superar las emergencias.',
    },
    {
      icon: Shield,
      title: 'Confianza',
      description: 'Verificamos cada necesidad para garantizar que la ayuda llegue a quienes realmente la necesitan.',
    },
    {
      icon: Target,
      title: 'Eficiencia',
      description: 'Optimizamos la distribución de recursos para que la ayuda llegue rápido y donde más se necesita.',
    },
    {
      icon: Globe,
      title: 'Transparencia',
      description: 'Toda la información es pública y verificable, para que puedas confiar en el sistema.',
    },
  ];

  const team = [
    {
      name: 'Juan Pérez',
      role: 'Director Ejecutivo',
      image: 'https://ui-avatars.com/api/?name=Juan+Perez&size=100&background=3B82F6&color=fff',
    },
    {
      name: 'María González',
      role: 'Coordinadora de Emergencias',
      image: 'https://ui-avatars.com/api/?name=Maria+Gonzalez&size=100&background=3B82F6&color=fff',
    },
    {
      name: 'Carlos Rodríguez',
      role: 'Desarrollador Principal',
      image: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&size=100&background=3B82F6&color=fff',
    },
    {
      name: 'Ana Martínez',
      role: 'Gestora de Comunidades',
      image: 'https://ui-avatars.com/api/?name=Ana+Martinez&size=100&background=3B82F6&color=fff',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Sobre AyudaMapa</h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Conectamos personas y organizaciones para facilitar la ayuda humanitaria en Colombia.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h2>
          <p className="text-gray-600 leading-relaxed">
            Facilitar la coordinación, visualización y distribución de ayudas humanitarias durante 
            emergencias como terremotos, inundaciones, deslizamientos y otras situaciones de desastre 
            en Colombia. Conectamos tres necesidades fundamentales: personas que necesitan ayuda, 
            organizaciones que ofrecen ayuda, y personas que necesitan saber qué se necesita y dónde.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {values.map((value, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <value.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{value.title}</h3>
              <p className="mt-2 text-gray-600 text-sm">{value.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold">50+</div>
              <div className="text-sm opacity-80">Municipios atendidos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">500+</div>
              <div className="text-sm opacity-80">Necesidades reportadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">200+</div>
              <div className="text-sm opacity-80">Organizaciones registradas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm opacity-80">Personas beneficiadas</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nuestro Equipo</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-blue-100"
                />
                <h4 className="font-semibold text-gray-900">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Quieres colaborar?</h2>
          <p className="text-gray-600 mb-6">
            Si eres una organización o voluntario y quieres sumarte a AyudaMapa, contáctanos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@ayudamapa.com"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Contactar
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Registrarse
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;