import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Calendar, Heart, MapPin, Package, User } from 'lucide-react';
import { AidOffer } from '../../types';
import { formatDate, formatRelativeTime } from '../../utils/formatters';
import Badge from '../common/Badge';
import Button from '../common/Button';

interface AidOfferCardProps {
  offer: AidOffer;
  onSelect?: (offer: AidOffer) => void;
  showActions?: boolean;
}

const AidOfferCard: React.FC<AidOfferCardProps> = ({
  offer,
  onSelect,
  showActions = true,
}) => {
  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'available':
        return 'success';
      case 'assigned':
        return 'warning';
      case 'in_transit':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'info';
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'assigned':
        return 'Asignada';
      case 'in_transit':
        return 'En Tránsito';
      case 'delivered':
        return 'Entregada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Package className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{offer.product}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-sm text-gray-600">
                  {offer.quantity} {offer.unit}
                </span>
                <Badge variant={getStatusVariant(offer.status)} size="sm">
                  {getStatusLabel(offer.status)}
                </Badge>
                {offer.need && (
                  <Link
                    to={`/necesidades/${offer.need_id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Asociada a: {offer.need.product}
                  </Link>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            {offer.user && (
              <div className="flex items-center">
                <User className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>{offer.user.full_name}</span>
              </div>
            )}
            {offer.organization && (
              <div className="flex items-center">
                <Building2 className="mr-1" size={14} aria-hidden="true" />
                <span>{offer.organization.name}</span>
              </div>
            )}
            {offer.availability_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>Disponible: {formatDate(offer.availability_date)}</span>
              </div>
            )}
            {offer.estimated_delivery_date && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>Entrega estimada: {formatDate(offer.estimated_delivery_date)}</span>
              </div>
            )}
          </div>

          {offer.notes && (
            <p className="mt-2 text-sm text-gray-500">{offer.notes}</p>
          )}

          {offer.contact_info && (
            <div className="mt-2 text-sm text-gray-600">
              <span className="font-medium">Contacto:</span> {offer.contact_info}
            </div>
          )}

          <div className="mt-2 text-xs text-gray-400">
            <span>Actualizado: {formatRelativeTime(offer.updated_at)}</span>
          </div>
        </div>

        {showActions && (
          <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2">
            {offer.status === 'available' && (
              <Button
                size="sm"
                variant="success"
                onClick={() => onSelect?.(offer)}
                className="w-full"
              >
                <Heart className="mr-1" size={16} />
                Solicitar
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = `/ayudas/${offer.id}`}
              className="w-full"
            >
              Ver detalles
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AidOfferCard;