import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import Input from '../components/common/Input';

const FAQPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      category: 'General',
      questions: [
        {
          q: '¿Qué es AyudaMapa?',
          a: 'AyudaMapa es una plataforma que conecta personas y comunidades afectadas con organizaciones y voluntarios que ofrecen ayuda humanitaria durante emergencias en Colombia.'
        },
        {
          q: '¿Cómo funciona la plataforma?',
          a: 'La plataforma permite reportar necesidades, ofrecer ayudas, y visualizar en un mapa interactivo dónde se necesitan recursos y dónde hay puntos de ayuda disponibles.'
        },
        {
          q: '¿Es gratuita?',
          a: 'Sí, AyudaMapa es completamente gratuita para todos los usuarios. Nuestra misión es facilitar la ayuda humanitaria sin barreras económicas.'
        }
      ]
    },
    {
      category: 'Usuarios',
      questions: [
        {
          q: '¿Cómo me registro?',
          a: 'Puedes registrarte haciendo clic en el botón "Registrarse" en la esquina superior derecha. Necesitarás un correo electrónico y crear una contraseña.'
        },
        {
          q: '¿Qué roles existen?',
          a: 'Tenemos cuatro roles: Administrador (control total), Organización (registra necesidades y ayudas), Voluntario (ofrece ayuda), y Visitante (consulta información pública).'
        },
        {
          q: '¿Puedo cambiar mi rol?',
          a: 'Sí, puedes solicitar un cambio de rol contactando a nuestro equipo de soporte. Los cambios están sujetos a verificación.'
        }
      ]
    },
    {
      category: 'Necesidades',
      questions: [
        {
          q: '¿Cómo reporto una necesidad?',
          a: 'Haz clic en "Reportar necesidad" en el menú principal. Completa el formulario con la información requerida y envía tu reporte.'
        },
        {
          q: '¿Quién verifica las necesidades?',
          a: 'Las necesidades son verificadas por nuestro equipo de administradores y organizaciones autorizadas para garantizar la autenticidad de la información.'
        },
        {
          q: '¿Qué significa una necesidad "crítica"?',
          a: 'Una necesidad crítica es aquella que requiere atención inmediata. Se determina automáticamente basado en el porcentaje cubierto, tiempo de reporte, y tipo de necesidad.'
        }
      ]
    },
    {
      category: 'Ayudas',
      questions: [
        {
          q: '¿Cómo ofrezco ayuda?',
          a: 'Ve a la sección "Ofrecer ayuda" en el menú, completa el formulario con los detalles de tu oferta y publícala para que otros la vean.'
        },
        {
          q: '¿Puedo ofrecer ayuda sin registrarme?',
          a: 'No, necesitas estar registrado para ofrecer ayuda. Esto nos permite garantizar la trazabilidad y transparencia de las ayudas.'
        },
        {
          q: '¿Cómo sé si mi ayuda llegó?',
          a: 'Puedes seguir el estado de tu ayuda a través de la sección "Mis Ayudas". Recibirás notificaciones cuando la ayuda sea asignada, enviada y recibida.'
        }
      ]
    },
    {
      category: 'Mapa',
      questions: [
        {
          q: '¿Qué significan los colores de los marcadores?',
          a: '🔴 Crítica, 🟠 Alta, 🟡 Media, 🟢 Ayuda disponible, 🔵 Centro de acopio. Cada marcador muestra información detallada al hacer clic.'
        },
        {
          q: '¿Puedo ver el mapa sin conexión?',
          a: 'No, el mapa requiere conexión a Internet. Sin embargo, puedes guardar información importante para consultarla offline.'
        },
        {
          q: '¿Cómo busco una ubicación específica?',
          a: 'Usa la barra de búsqueda en el mapa para buscar por municipio, departamento o tipo de necesidad.'
        }
      ]
    }
  ];

  const filteredFaqs = searchQuery
    ? faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
          q => 
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.questions.length > 0)
    : faqs;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Preguntas Frecuentes</h1>
          <p className="mt-2 text-gray-600">
            Encuentra respuestas a las preguntas más comunes sobre AyudaMapa
          </p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar en las preguntas frecuentes..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* FAQs */}
        {filteredFaqs.map((category, categoryIndex) => (
          <div key={categoryIndex} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{category.category}</h2>
            <div className="space-y-3">
              {category.questions.map((faq, questionIndex) => {
                const globalIndex = categoryIndex * 10 + questionIndex;
                const isOpen = openIndex === globalIndex;

                return (
                  <div
                    key={questionIndex}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <button
                      onClick={() => toggleQuestion(globalIndex)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-800">{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4">
                        <p className="text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {filteredFaqs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron resultados para "{searchQuery}"</p>
          </div>
        )}

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl shadow-xl p-8 text-center text-white mt-8">
          <h3 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="opacity-90 mb-6">
            Nuestro equipo está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Contactar soporte
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;