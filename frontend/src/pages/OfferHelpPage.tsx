import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
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

const OfferHelpPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [needs, setNeeds] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selectedNeed, setSelectedNeed] = useState<any>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      quantity: 1,
    },
  });

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
      setSelectedNeed(need);
      if (need) {
        setValue('product', need.product);
        setValue('unit', need.unit);
      }
    }
  }, [watchedNeedId, needs]);

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

      // If location provided, create location
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
                address: data.notes || '',
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
      navigate('/ayudas');
    } catch (error: any) {
      console.error('Error offering help:', error);
      toast.error(error.message || 'Error al ofrecer ayuda');
    } finally {
      setLoading(false);
    }
  };

  const units = ['unidades', 'litros', 'kg', 'toneladas', 'paquetes', 'cajas', 'botellas', 'otro'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🤝</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Ofrecer Ayuda</h1>
            <p className="text-gray-600 mt-2">
              Registra la ayuda que puedes ofrecer para las comunidades afectadas
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Need Association */}
            <div>
              <label htmlFor="need_id" className="block text-sm font-medium text-gray-700 mb-1">
                Asociar a una necesidad (opcional)
              </label>
              <Controller
                name="need_id"
                control={control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Sin asociar (ofrezco ayuda general)</option>
                    {needs.map((need) => (
                      <option key={need.id} value={need.id}>
                        {need.product} - {need.quantity_needed} {need.unit} 
                        {need.municipality ? ` (${need.municipality.name})` : ''}
                        {need.priority === 'critical' ? ' 🔴' : ''}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            {selectedNeed && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">
                  <strong>Necesidad seleccionada:</strong> {selectedNeed.product}
                </p>
                <p className="text-sm text-blue-600">
                  Cantidad necesitada: {selectedNeed.quantity_needed} {selectedNeed.unit}
                </p>
                <p className="text-sm text-blue-600">
                  Prioridad: {selectedNeed.priority.toUpperCase()}
                </p>
              </div>
            )}

            {/* Product */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                Producto / Ayuda que ofreces *
              </label>
              <Controller
                name="product"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Agua potable en botellas"
                  />
                )}
              />
              {errors.product && (
                <p className="mt-1 text-sm text-red-600">{errors.product.message}</p>
              )}
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad que ofreces *
                </label>
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="number"
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  )}
                />
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                  Unidad *
                </label>
                <Controller
                  name="unit"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccionar</option>
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.unit && (
                  <p className="mt-1 text-sm text-red-600">{errors.unit.message}</p>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento (opcional)
                </label>
                <Controller
                  name="department"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        setValue('municipality', '');
                      }}
                    >
                      <option value="">Seleccionar</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
              <div>
                <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">
                  Municipio (opcional)
                </label>
                <Controller
                  name="municipality"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={!watchedDepartment}
                    >
                      <option value="">Seleccionar</option>
                      {municipalities.map((mun) => (
                        <option key={mun.id} value={mun.name}>
                          {mun.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="availability_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de disponibilidad
                </label>
                <Controller
                  name="availability_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
              </div>
              <div>
                <label htmlFor="estimated_delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha estimada de entrega
                </label>
                <Controller
                  name="estimated_delivery_date"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  )}
                />
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-1">
                Información de contacto *
              </label>
              <Controller
                name="contact_info"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Teléfono, correo, o cómo contactarte"
                  />
                )}
              />
              {errors.contact_info && (
                <p className="mt-1 text-sm text-red-600">{errors.contact_info.message}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Observaciones adicionales
              </label>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Detalles adicionales sobre tu ayuda"
                  />
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="success"
                loading={loading}
                className="flex-2"
              >
                Ofrecer Ayuda
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              * Campos obligatorios. Tu oferta será visible para las organizaciones y comunidades.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfferHelpPage;