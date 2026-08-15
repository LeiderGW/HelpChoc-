import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { NEED_CATEGORIES, UNITS } from '../../lib/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Select from '../common/Select';
import { toast } from 'sonner';

const needSchema = z.object({
  category: z.string().min(1, 'Categoría requerida'),
  product: z.string().min(2, 'Producto requerido (mínimo 2 caracteres)'),
  description: z.string().optional(),
  quantity_needed: z.number().min(1, 'Cantidad requerida debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad de medida requerida'),
  municipality_id: z.string().min(1, 'Municipio requerido'),
  department_id: z.string().min(1, 'Departamento requerido'),
  address: z.string().optional(),
  affected_people: z.number().optional(),
});

type NeedFormData = z.infer<typeof needSchema>;

interface NeedFormProps {
  initialData?: Partial<NeedFormData>;
  onSuccess?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
}

const NeedForm: React.FC<NeedFormProps> = ({
  initialData,
  onSuccess,
  onCancel,
  isEditing = false,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState(initialData?.department_id || '');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<NeedFormData>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      category: initialData?.category || '',
      product: initialData?.product || '',
      description: initialData?.description || '',
      quantity_needed: initialData?.quantity_needed || 1,
      unit: initialData?.unit || 'unidades',
      municipality_id: initialData?.municipality_id || '',
      department_id: initialData?.department_id || '',
      address: initialData?.address || '',
      affected_people: initialData?.affected_people || 0,
    },
  });

  const watchedDepartment = watch('department_id');

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (watchedDepartment) {
      fetchMunicipalities(watchedDepartment);
    }
  }, [watchedDepartment]);

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

  const onSubmit = async (data: NeedFormData) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reportar una necesidad');
      return;
    }

    setLoading(true);

    try {
      let locationId = null;

      if (data.address) {
        const { data: locationData } = await supabase
          .from('locations')
          .insert([
            {
              municipality_id: data.municipality_id,
              address: data.address,
            },
          ])
          .select()
          .single();

        if (locationData) {
          locationId = locationData.id;
        }
      }

      const needData = {
        category: data.category,
        product: data.product,
        description: data.description || '',
        quantity_needed: data.quantity_needed,
        quantity_received: 0,
        unit: data.unit,
        municipality_id: data.municipality_id,
        department_id: data.department_id,
        location_id: locationId,
        affected_people: data.affected_people || 0,
        reporter_id: user.id,
      };

      let error;
      if (isEditing && initialData?.id) {
        const { error: updateError } = await supabase
          .from('needs')
          .update({ ...needData, updated_at: new Date().toISOString() })
          .eq('id', initialData.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('needs')
          .insert([needData]);
        error = insertError;
      }

      if (error) throw error;

      toast.success(isEditing ? 'Necesidad actualizada exitosamente' : 'Necesidad reportada exitosamente');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting need:', error);
      toast.error(error.message || 'Error al procesar la necesidad');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Category */}
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {NEED_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => field.onChange(cat.value)}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    field.value === cat.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <div className="text-2xl">{cat.icon}</div>
                  <div className="text-xs mt-1">{cat.label}</div>
                </button>
              ))}
            </div>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
        )}
      />

      {/* Product */}
      <Controller
        name="product"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Producto / Necesidad *"
            placeholder="Ej: Agua potable en botellas"
            error={errors.product?.message}
          />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              {...field}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe la situación, cantidad de personas afectadas, etc."
            />
          </div>
        )}
      />

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="quantity_needed"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              min="1"
              label="Cantidad necesaria *"
              error={errors.quantity_needed?.message}
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
              options={UNITS.map(u => ({ value: u, label: u }))}
              error={errors.unit?.message}
            />
          )}
        />
      </div>

      {/* Location */}
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="department_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Departamento *"
              options={departments.map(d => ({ value: d.id, label: d.name }))}
              placeholder="Seleccionar"
              error={errors.department_id?.message}
              onChange={(e) => {
                field.onChange(e);
                setSelectedDepartment(e.target.value);
                setValue('municipality_id', '');
              }}
            />
          )}
        />
        <Controller
          name="municipality_id"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              label="Municipio *"
              options={municipalities.map(m => ({ value: m.id, label: m.name }))}
              placeholder="Seleccionar"
              disabled={!watchedDepartment}
              error={errors.municipality_id?.message}
            />
          )}
        />
      </div>

      {/* Address */}
      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            label="Dirección (opcional)"
            placeholder="Dirección específica o punto de referencia"
          />
        )}
      />

      {/* Affected People */}
      <Controller
        name="affected_people"
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            type="number"
            min="0"
            label="Personas afectadas (opcional)"
            placeholder="Número aproximado de personas afectadas"
            onChange={(e) => field.onChange(Number(e.target.value))}
          />
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
          variant="danger"
          loading={loading}
          className="flex-1"
        >
          {isEditing ? 'Actualizar Necesidad' : 'Reportar Necesidad'}
        </Button>
      </div>
    </form>
  );
};

export default NeedForm;