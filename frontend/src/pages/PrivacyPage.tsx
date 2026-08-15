import React from 'react';
import { Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const sections = [
    {
      icon: Shield,
      title: 'Protección de Datos',
      content: `En AyudaMapa nos tomamos muy en serio la privacidad de tus datos. 
      Toda la información personal que compartes está protegida y solo se utiliza 
      para los fines de la plataforma. No compartimos tus datos con terceros sin 
      tu consentimiento explícito.`,
    },
    {
      icon: Lock,
      title: 'Seguridad de la Información',
      content: `Utilizamos tecnologías de encriptación avanzadas para proteger 
      tus datos. Toda la información se almacena de forma segura en servidores 
      con altos estándares de seguridad.`,
    },
    {
      icon: Eye,
      title: 'Transparencia',
      content: `Creemos en la transparencia total. Puedes ver en todo momento 
      qué información tenemos sobre ti y cómo se está utilizando. Siempre 
      puedes solicitar la eliminación de tus datos.`,
    },
    {
      icon: Database,
      title: 'Almacenamiento de Datos',
      content: `Los datos se almacenan en servidores seguros con copias de 
      respaldo. Solo personal autorizado tiene acceso a la información, y 
      siempre bajo estrictos protocolos de seguridad.`,
    },
    {
      icon: UserCheck,
      title: 'Control de tu Información',
      content: `Tienes control total sobre tu información. Puedes actualizar, 
      modificar o eliminar tus datos en cualquier momento desde tu perfil.`,
    },
    {
      icon: FileText,
      title: 'Política de Cookies',
      content: `Utilizamos cookies para mejorar tu experiencia en la plataforma. 
      Puedes gestionar tus preferencias de cookies en cualquier momento desde 
      la configuración de tu navegador.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Política de Privacidad</h1>
          <p className="mt-2 text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-CO', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <p className="text-gray-600 leading-relaxed">
            En AyudaMapa, la privacidad y seguridad de tus datos es nuestra prioridad. 
            Esta política describe cómo recopilamos, usamos y protegemos tu información 
            cuando utilizas nuestra plataforma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <section.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tus Derechos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Acceso</h4>
              <p className="text-sm text-gray-600 mt-1">
                Puedes solicitar una copia de todos tus datos personales.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Rectificación</h4>
              <p className="text-sm text-gray-600 mt-1">
                Puedes corregir cualquier dato incorrecto o incompleto.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Eliminación</h4>
              <p className="text-sm text-gray-600 mt-1">
                Puedes solicitar la eliminación permanente de tus datos.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Oposición</h4>
              <p className="text-sm text-gray-600 mt-1">
                Puedes oponerte al procesamiento de tus datos en cualquier momento.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 text-center">
          <p className="text-gray-600">
            Si tienes preguntas sobre nuestra política de privacidad,{' '}
            <a href="/contact" className="text-blue-600 hover:underline">
              contáctanos
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;