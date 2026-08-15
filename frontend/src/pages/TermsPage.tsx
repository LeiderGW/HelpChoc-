import React from 'react';
import { FileText, CheckCircle, AlertCircle, Shield, Users, MapPin } from 'lucide-react';

const TermsPage: React.FC = () => {
  const terms = [
    {
      icon: CheckCircle,
      title: 'Aceptación de Términos',
      content: `Al utilizar AyudaMapa, aceptas cumplir con estos términos y condiciones. 
      Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar la plataforma.`,
    },
    {
      icon: Shield,
      title: 'Responsabilidad del Usuario',
      content: `Eres responsable de la veracidad de la información que proporcionas. 
      La información falsa o engañosa puede ser eliminada y resultar en la suspensión de tu cuenta.`,
    },
    {
      icon: Users,
      title: 'Uso de la Plataforma',
      content: `AyudaMapa está diseñada para facilitar la ayuda humanitaria. 
      No debes usar la plataforma para fines ilegales, fraudulentos o que puedan dañar a otros.`,
    },
    {
      icon: MapPin,
      title: 'Ubicación y Datos Geográficos',
      content: `Al proporcionar información de ubicación, aceptas que esta sea pública 
      para facilitar la coordinación de ayudas. La información de contacto privada 
      permanece protegida.`,
    },
    {
      icon: AlertCircle,
      title: 'Limitación de Responsabilidad',
      content: `AyudaMapa actúa como intermediario entre personas y organizaciones. 
      No somos responsables de la calidad o cantidad de las ayudas proporcionadas.`,
    },
    {
      icon: FileText,
      title: 'Modificaciones',
      content: `Nos reservamos el derecho de modificar estos términos en cualquier momento. 
      Las modificaciones serán publicadas en esta página y entrarán en vigor inmediatamente.`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Términos de Servicio</h1>
          <p className="mt-2 text-gray-600">
            Última actualización: {new Date().toLocaleDateString('es-CO', { 
              day: '2-digit', 
              month: 'long', 
              year: 'numeric' 
            })}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bienvenido a AyudaMapa</h2>
          <p className="text-gray-600 leading-relaxed">
            Al utilizar nuestra plataforma, te comprometes a cumplir con estos términos y 
            condiciones. AyudaMapa es una herramienta de coordinación humanitaria que 
            conecta a personas y organizaciones para facilitar la ayuda durante emergencias.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {terms.map((term, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                  <term.icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{term.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{term.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Políticas Adicionales</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Cuentas y Registro</h4>
              <p className="text-sm text-gray-600 mt-1">
                Debes tener al menos 18 años para registrarte. La información de registro 
                debe ser veraz y actualizada.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Contenido y Propiedad</h4>
              <p className="text-sm text-gray-600 mt-1">
                El contenido generado por los usuarios es de su propiedad, pero al 
                publicarlo en la plataforma, otorgas a AyudaMapa el derecho de usarlo 
                para los fines de la plataforma.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-800">Suspensión de Cuentas</h4>
              <p className="text-sm text-gray-600 mt-1">
                Nos reservamos el derecho de suspender o eliminar cuentas que violen 
                estos términos o que sean utilizadas para actividades fraudulentas.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mt-8 text-center">
          <p className="text-gray-600">
            Si tienes preguntas sobre nuestros términos de servicio,{' '}
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

export default TermsPage;