import React, { useState, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { toast } from 'sonner';

interface AidAssignmentProps {
  offerId: string;
  needId: string;
  onAssigned?: () => void;
  onCancel?: () => void;
}

const AidAssignment: React.FC<AidAssignmentProps> = ({
  offerId,
  needId,
  onAssigned,
  onCancel,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [offer, setOffer] = useState<any>(null);
  const [need, setNeed] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [offerId, needId]);

  const fetchData = async () => {
    try {
      // Fetch offer
      const { data: offerData } = await supabase
        .from('aid_offers')
        .select('*')
        .eq('id', offerId)
        .single();

      setOffer(offerData);

      // Fetch need
      const { data: needData } = await supabase
        .from('needs')
        .select('*')
        .eq('id', needId)
        .single();

      setNeed(needData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAssign = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return;
    }

    if (quantity <= 0) {
      toast.error('La cantidad debe ser mayor a 0');
      return;
    }

    if (quantity > (offer?.quantity || 0)) {
      toast.error('No hay suficiente cantidad disponible');
      return;
    }

    setLoading(true);

    try {
      // Update offer
      const { error: offerError } = await supabase
        .from('aid_offers')
        .update({
          status: 'assigned',
          need_id: needId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', offerId);

      if (offerError) throw offerError;

      // Create assignment
      const { error: assignmentError } = await supabase
        .from('aid_assignments')
        .insert([{
          need_id: needId,
          offer_id: offerId,
          quantity_assigned: quantity,
          status: 'assigned',
          assigned_by: user.id,
          assigned_at: new Date().toISOString(),
        }]);

      if (assignmentError) throw assignmentError;

      // Update need
      if (need) {
        const { error: needError } = await supabase
          .from('needs')
          .update({
            quantity_received: (need.quantity_received || 0) + quantity,
            updated_at: new Date().toISOString(),
          })
          .eq('id', needId);

        if (needError) throw needError;
      }

      toast.success('Ayuda asignada exitosamente');
      onAssigned?.();
    } catch (error: any) {
      console.error('Error assigning aid:', error);
      toast.error(error.message || 'Error al asignar la ayuda');
    } finally {
      setLoading(false);
    }
  };

  if (!offer || !need) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Ayuda disponible:</span>
          <span className="font-medium">{offer.quantity} {offer.unit}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Necesidad:</span>
          <span className="font-medium">{need.product}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Pendiente:</span>
          <span className="font-medium text-red-600">
            {need.quantity_needed - need.quantity_received} {need.unit}
          </span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cantidad a asignar
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max={offer.quantity}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">de {offer.quantity} {offer.unit}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAssign}
          loading={loading}
          className="flex-1"
        >
          Asignar ayuda
        </Button>
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

export default AidAssignment;