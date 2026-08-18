import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { toast } from 'sonner';

const offerSchema = z.object({
  product: z.string().min(2, 'Producto requerido (mínimo 2 caracteres)'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad de medida requerida'),
  need_id: z.string().optional(),
  municipality: z.string().optional(),
  department: z.string().optional(),
  availability_date: z.string().optional(),
  estimated_delivery_date: z.string().optional(),
  contact_info: z.string().min(5, 'Información de contacto requerida'),
  notes: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface AidOfferFormProps {
  needId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const AidOfferForm: React.FC<AidOfferFormProps> = ({
  needId,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [needs, setNeeds] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
     
      quantity: 1,
      need_id: needId || '',
      unit: 'unidades',
    },
  });
  //  department: '',

  const watchedDepartment = watch('department');
  const watchedNeedId = watch('need_id');

  useEffect(() => {
    fetchNeeds();
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (watchedDepartment) {
      fetchMunicipalities(watchedDepartment);
    }
  }, [watchedDepartment]);

  useEffect(() => {
    if (watchedNeedId) {
      const need = needs.find(n => n.id === watchedNeedId);
      if (need) {
        setValue('product', need.product);
        setValue('unit', need.unit);
      }
    }
  }, [watchedNeedId, needs, setValue]);

  const fetchNeeds = async () => {
    try {
      const { data } = await supabase
        .from('needs')
        .select(`
          *,
          municipality:municipalities(name),
          department:departments(name)
        `)
        .neq('status', 'fulfilled')
        .order('priority', { ascending: false })
        .limit(50);
      setNeeds(data || []);
    } catch (error) {
      console.error('Error fetching needs:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      setDepartments(data || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchMunicipalities = async (departmentId: string) => {
    try {
      const { data } = await supabase
        .from('municipalities')
        .select('*')
        .eq('department_id', departmentId)
        .order('name');
      setMunicipalities(data || []);
    } catch (error) {
      console.error('Error fetching municipalities:', error);
    }
  };


  
  const onSubmit = async (data: OfferFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para ofrecer ayuda');
      return;
    }

    setLoading(true);

    try {
      let locationId = null;

      if (data.municipality) {
        const { data: municipalityData } = await supabase
          .from('municipalities')
          .select('id, department_id')
          .eq('name', data.municipality)
          .single();

        if (municipalityData) {
          const { data: locationData } = await supabase
            .from('locations')
            .insert([
              {
                municipality_id: municipalityData.id,
              },
            ])
            .select()
            .single();
          if (locationData) {
            locationId = locationData.id;
          }
        }
      }

      const offerData = {
        product: data.product,
        quantity: data.quantity,
        unit: data.unit,
        need_id: data.need_id || null,
        user_id: user.id,
        location_id: locationId,
        availability_date: data.availability_date || null,
        estimated_delivery_date: data.estimated_delivery_date || null,
        contact_info: data.contact_info,
        notes: data.notes || '',
        status: 'available',
      };

      const { error } = await supabase
        .from('aid_offers')
        .insert([offerData]);

      if (error) throw error;

      toast.success('Ayuda ofrecida exitosamente');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error offering help:', error);
      toast.error(error.message || 'Error al ofrecer ayuda');
    } finally {
      setLoading(false);
    }
  };

  const units = ['unidades', 'litros', 'kg', 'toneladas', 'paquetes', 'cajas', 'botellas', 'sacos', 'kits', 'otro'];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Need Association */}
      <Controller
        name="need_id"
        control={control}
        render={({ field }) => (
          <Select
            {...field}
            label="Asociar a una necesidad (opcional)"
            options={needs.map(n => ({
              value: n.id,
              label: `${n.product} - ${n.quantity_needed} ${n.unit}${n.priority === 'critical' ? ' (crítica)' : ''}`,
            }))}
            placeholder="Sin asociar (ofrezco ayuda general)"
          />
        )}
      />


      {/* Product */}
      <Controller
        name="product"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Producto / Ayuda que ofreces *"
            placeholder="Ej: Agua potable en botellas"
            error={errors.product?.message}
          />
        )}
      />

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="quantity"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              min="1"
              label="Cantidad que ofreces *"
              error={errors.quantity?.message}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          )}
        />
        <Controller
          name="unit"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Unidad *"
              options={units.map(u => ({ value: u, label: u }))}
              error={errors.unit?.message}
            />
          )}
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="department"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Departamento (opcional)"
              options={departments.map(d => ({ value: d.id, label: d.name }))}
              placeholder="Seleccionar"
              onChange={(e) => {
                field.onChange(e);
                setValue('municipality', '');
              }}
            />
          )}
        />
        <Controller
          name="municipality"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Municipio (opcional)"
              options={municipalities.map(m => ({ value: m.name, label: m.name }))}
              placeholder="Seleccionar"
              disabled={!watchedDepartment}
            />
          )}
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="availability_date"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              label="Fecha de disponibilidad"
            />
          )}
        />
        <Controller
          name="estimated_delivery_date"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="date"
              label="Fecha estimada de entrega"
            />
          )}
        />
      </div>

      {/* Contact Info */}
      <Controller
        name="contact_info"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Información de contacto *"
            placeholder="Teléfono, correo, o cómo contactarte"
            error={errors.contact_info?.message}
          />
        )}
      />

      {/* Notes */}
      <Controller
        name="notes"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones adicionales
            </label>
            <textarea
              {...field}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detalles adicionales sobre tu ayuda"
            />
          </div>
        )}
      />

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          variant="success"
          loading={loading}
          className="flex-1"
        >
          Ofrecer Ayuda
        </Button>
      </div>
    </form>
  );
};

export default AidOfferForm;

