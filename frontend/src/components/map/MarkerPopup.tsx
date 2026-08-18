import React from 'react';
import { Building2, CheckCircle, Clock, MapPin, Package, Phone, User, X } from 'lucide-react';
import Button from '../common/Button';
import { getPriorityColor, getPriorityLabel } from '../../utils/priorityCalculator';

interface MarkerPopupProps {
  data: any;
  onClose: () => void;
  onViewDetails: () => void;
}

const MarkerPopup: React.FC<MarkerPopupProps> = ({
  data,
  onClose,
  onViewDetails,
}) => {
  const isNeed = data?.type === 'need';
  const isCenter = data?.type === 'center';
  const isOffer = data?.type === 'offer';

  return (
    <div className="p-4 max-w-sm">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{data?.title || data?.name || data?.product}</h3>
          <p className="text-sm text-gray-500">{data?.description || data?.category || data?.type}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-2">
        {isNeed && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Prioridad:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${getPriorityColor(data.priority)}`}>
                {getPriorityLabel(data.priority)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Necesitado:</span>
              <span className="font-medium">{data.quantity_needed} {data.unit}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Recibido:</span>
              <span className="font-medium text-green-600">{data.quantity_received} {data.unit}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Pendiente:</span>
              <span className="font-medium text-red-600">{data.quantity_needed - data.quantity_received} {data.unit}</span>
            </div>
            {data.municipality && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="mr-1" size={14} />
                {data.municipality}
                {data.department && `, ${data.department}`}
              </div>
            )}
            {data.verification_status === 'verified' && (
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <CheckCircle size={12} aria-hidden="true" />
                Verificado
              </div>
            )}
          </>
        )}

        {isCenter && (
          <>
            {data.address && (
              <div className="flex items-start text-sm text-gray-600">
                <MapPin className="mr-1 flex-shrink-0 mt-0.5" size={14} />
                <span>{data.address}</span>
              </div>
            )}
            {data.schedule && (
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="mr-1" size={14} />
                {data.schedule}
              </div>
            )}
            {data.contact_phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="mr-1" size={14} />
                {data.contact_phone}
              </div>
            )}
            {data.responsible_person && (
              <div className="flex items-center text-sm text-gray-600">
                <User className="mr-1" size={14} />
                {data.responsible_person}
              </div>
            )}
            <div className="text-xs text-gray-400">
              {data.status === 'active' ? 'Activo' : data.status === 'temporary' ? 'Temporal' : 'Cerrado'}
            </div>
          </>
        )}

        {isOffer && (
          <>
            <div className="flex items-center text-sm text-gray-600">
              <Package className="mr-1" size={14} />
              {data.quantity} {data.unit} disponibles
            </div>
            {data.organization?.name && (
              <div className="flex items-center text-sm text-gray-600">
                <Building2 className="mr-1" size={14} aria-hidden="true" />
                {data.organization.name}
              </div>
            )}
            {data.contact_info && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="mr-1" size={14} aria-hidden="true" />
                {data.contact_info}
              </div>
            )}
            <div className="text-xs text-gray-400">
              Estado: {data.status === 'available' ? 'Disponible' : data.status}
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="mt-4">
        <Button
          size="sm"
          fullWidth
          onClick={onViewDetails}
        >
          Ver detalles
        </Button>
      </div>
    </div>
  );
};

export default MarkerPopup;