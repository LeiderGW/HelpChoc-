import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  MapPin, Calendar, User, CheckCircle, AlertTriangle, 
  Share2, MessageCircle, Twitter, Facebook, Copy,
  ArrowLeft, Package, Heart, Phone, Mail,
  Clock, Users, Award, Shield
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { Need, StatusHistory } from '../types';
import { getPriorityColor, getPriorityLabel } from '../utils/priorityCalculator';
import Button from '../components/common/Button';
import Estadistica from '../components/common/Estadistica';
import { toast } from 'sonner';
import { AID_STATUS_LABELS, STATUS_LABELS, etiquetaCategoria } from '../lib/constants';

const NeedDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [need, setNeed] = useState<Need | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [relatedOffers, setRelatedOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchNeed(id);
      fetchHistory(id);
      fetchRelatedOffers(id);
    }
  }, [id]);

  const fetchNeed = async (needId: string) => {
    try {
      const { data, error } = await supabase
        .from('needs')
        .select(`
          *,
          municipality:municipalities(name, department:departments(name)),
          location:locations(*),
          reporter:users!needs_reporter_id_fkey(full_name, email, phone),
          verified_by_user:users!needs_verified_by_fkey(full_name, email)
        `)
        .eq('id', needId)
        .single();

      if (error) throw error;
      
      if (data) {
        setNeed({
          ...data,
          quantity_pending: data.quantity_needed - data.quantity_received,
          coverage_percentage: (data.quantity_received / data.quantity_needed) * 100,
        });
      }
    } catch (error) {
      console.error('Error fetching need:', error);
      toast.error('Error al cargar la necesidad');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (needId: string) => {
    try {
      const { data } = await supabase
        .from('status_history')
        .select(`
          *,
          user:users(full_name)
        `)
        .eq('need_id', needId)
        .order('created_at', { ascending: false });
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchRelatedOffers = async (needId: string) => {
    try {
      const { data } = await supabase
        .from('aid_offers')
        .select(`
          *,
          user:users(full_name, email),
          organization:organizations(name)
        `)
        .eq('need_id', needId)
        .order('created_at', { ascending: false });
      setRelatedOffers(data || []);
    } catch (error) {
      console.error('Error fetching related offers:', error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Ayuda necesaria: ${need?.product} - ${need?.quantity_pending} ${need?.unit} pendientes. ¡Ayuda a la comunidad!`;

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success('Enlace copiado al portapapeles');
      return;
    }

    window.open(shareUrls[platform], '_blank');
  };

  const handleOfferHelp = () => {
    // La sesión solo se pide al enviar, no para ver el formulario: el
    // propio formulario de oferta avisa y guarda lo escrito si hace falta
    // iniciar sesión.
    navigate(`/ofrecer-ayuda?need=${id}`);
  };

  const handleViewOnMap = () => {
    if (need?.location?.latitude && need?.location?.longitude) {
      navigate(`/mapa?punto=need-${id}`);
    } else {
      toast.info('Esta necesidad todavía no tiene una ubicación exacta registrada');
      navigate('/mapa');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!need) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="mx-auto text-gray-300" size={64} />
          <h2 className="mt-4 text-xl font-semibold text-gray-600">Necesidad no encontrada</h2>
          <Link to="/necesidades" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver a necesidades
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = need.verification_status === 'verified';
  const isCritical = need.priority === 'critical';
  const pending = need.quantity_pending || 0;
  const percentage = need.coverage_percentage || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="mr-2" size={20} />
          Volver
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`p-6 ${isCritical ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'}`}>
            <div className="flex flex-wrap items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isCritical ? 'bg-red-800' : 'bg-blue-800'}`}>
                    {getPriorityLabel(need.priority)}
                  </span>
                  {isVerified && (
                    <span className="bg-green-500/30 px-3 py-1 rounded-full text-xs font-bold flex items-center">
                      <CheckCircle className="mr-1" size={14} />
                      Verificado
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold">{need.product}</h1>
                <p className="text-white/80 mt-1">{etiquetaCategoria(need.category)}</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleOfferHelp}
                className="mt-2 md:mt-0 bg-white text-blue-600 hover:bg-gray-100"
              >
                <Heart className="mr-2" size={16} />
                Ofrecer ayuda
              </Button>
            </div>
          </div>

          {/* Stats Grid — la unidad va como nota para no repetirla en cada
              cifra ni dejarla suelta al lado del número. */}
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-b border-gray-100 p-6 md:grid-cols-4">
            <Estadistica valor={need.quantity_needed} etiqueta="Necesitado" nota={need.unit} />
            <Estadistica valor={need.quantity_received} etiqueta="Recibido" nota={need.unit} />
            <Estadistica valor={pending} etiqueta="Pendiente" nota={need.unit} tono={pending > 0 ? 'alerta' : 'neutro'} />
            <Estadistica valor={`${Math.round(percentage)}%`} etiqueta="Cubierto" />
          </dl>

          {/* Progress Bar */}
          <div className="px-6 py-4 bg-gray-50">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-4 rounded-full transition-all duration-500 ${
                  percentage >= 100 ? 'bg-green-500' : percentage >= 60 ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{need.unit}</span>
              <span>100%</span>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
                  <p className="text-gray-600">{need.description || 'Sin descripción adicional'}</p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Ubicación</h3>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2" size={18} />
                    {need.municipality?.name || 'No especificado'}
                    {need.municipality?.department && `, ${need.municipality.department.name}`}
                  </div>
                  {need.location?.address && (
                    <p className="text-sm text-gray-500 mt-1">{need.location.address}</p>
                  )}
                </div>

                {need.affected_people && need.affected_people > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Personas afectadas</h3>
                    <div className="flex items-center text-gray-600">
                      <Users className="mr-2" size={18} />
                      {need.affected_people} personas
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Información del reporte</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="mr-2" size={16} />
                      Reportado: {new Date(need.created_at).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="mr-2" size={16} />
                      Actualizado: {new Date(need.updated_at).toLocaleDateString('es-CO')}
                    </div>
                    {need.reporter && (
                      <div className="flex items-center text-gray-600">
                        <User className="mr-2" size={16} />
                        Reportado por: {need.reporter.full_name}
                      </div>
                    )}
                  </div>
                </div>

                {isVerified && need.verified_by_user && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Verificación</h3>
                    <div className="flex items-center text-green-600 text-sm">
                      <Shield className="mr-2" size={16} />
                      Verificado por: {need.verified_by_user.full_name}
                    </div>
                    {need.verified_at && (
                      <div className="text-sm text-gray-500">
                        {new Date(need.verified_at).toLocaleDateString('es-CO')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Related Offers */}
            {relatedOffers.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-700 mb-3">Ayudas ofrecidas para esta necesidad</h3>
                <div className="space-y-2">
                  {relatedOffers.map((offer) => (
                    <div key={offer.id} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium">{offer.product}</p>
                        <p className="text-sm text-gray-600">
                          {offer.quantity} {offer.unit}
                          {offer.organization?.name && ` - ${offer.organization.name}`}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        offer.status === 'available' ? 'bg-green-100 text-green-700' :
                        offer.status === 'assigned' ? 'bg-yellow-100 text-yellow-700' :
                        offer.status === 'delivered' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {AID_STATUS_LABELS[offer.status as keyof typeof AID_STATUS_LABELS] ?? offer.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-4">
                <span className="text-gray-700 font-medium flex items-center">
                  <Share2 className="mr-2" size={18} />
                  Compartir:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShare('whatsapp')}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    aria-label="Compartir en WhatsApp"
                  >
                    <MessageCircle size={20} />
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                    aria-label="Compartir en X"
                  >
                    <Twitter size={20} />
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    aria-label="Compartir en Facebook"
                  >
                    <Facebook size={20} />
                  </button>
                  <button
                    onClick={() => handleShare('copy')}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    aria-label="Copiar enlace"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-4">
              <Button onClick={handleOfferHelp} className="flex-1">
                <Heart className="mr-2" size={18} />
                Ofrecer esta ayuda
              </Button>
              <Button
                variant="outline"
                onClick={handleViewOnMap}
                className="flex-1"
              >
                <MapPin className="mr-2" size={18} />
                Ver en el mapa
              </Button>
            </div>
          </div>
        </div>

        {/* Status History */}
        {history.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold text-gray-700 mb-4">Historial de actualizaciones</h3>
            <div className="space-y-3">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-800">
                      <span className="font-medium">{entry.user?.full_name || 'Usuario'}</span>
                      {' '}{entry.action}
                      {entry.new_status && (
                        <span className="text-gray-500">
                          {' → '}
                          {STATUS_LABELS[entry.new_status as keyof typeof STATUS_LABELS] ?? entry.new_status}
                        </span>
                      )}
                    </p>
                    {entry.notes && (
                      <p className="text-gray-500 text-xs mt-1">{entry.notes}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(entry.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Issue */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              toast.info('Función de reporte disponible próximamente');
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            <AlertTriangle className="inline mr-1" size={14} />
            Reportar información incorrecta
          </button>
        </div>
      </div>
    </div>
  );
};

export default NeedDetailPage;