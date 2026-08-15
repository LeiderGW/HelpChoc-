import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { NeedCategory } from '../types';
import Button from '../components/common/Button';
import { toast } from 'sonner';

const needSchema = z.object({
  category: z.string().min(1, 'Categoría requerida'),
  product: z.string().min(2, 'Producto requerido (mínimo 2 caracteres)'),
  description: z.string().optional(),
  quantity_needed: z.number().min(1, 'Cantidad requerida debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad de medida requerida'),
  municipality: z.string().min(1, 'Municipio requerido'),
  department: z.string().min(1, 'Departamento requerido'),
  address: z.string().optional(),
  affected_people: z.number().optional(),
});

type NeedFormData = z.infer<typeof needSchema>;

const ReportNeedPage: React.FC = () => {
  const { user, appUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<NeedFormData>({
    resolver: zodResolver(needSchema),
    defaultValues: {
      quantity_needed: 1,
      affected_people: 0,
    },
  });

  const watchedDepartment = watch('department');

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
      // Get municipality and department IDs
      const { data: municipalityData } = await supabase
        .from('municipalities')
        .select('id, department_id')
        .eq('name', data.municipality)
        .single();

      if (!municipalityData) {
        toast.error('Municipio no encontrado');
        setLoading(false);
        return;
      }

      // Create location if address provided
      let locationId = null;
      if (data.address) {
        const { data: locationData } = await supabase
          .from('locations')
          .insert([
            {
              municipality_id: municipalityData.id,
              address: data.address,
            },
          ])
          .select()
          .single();
        if (locationData) {
          locationId = locationData.id;
        }
      }

      // Create need
      const needData = {
        category: data.category as NeedCategory,
        product: data.product,
        description: data.description || '',
        quantity_needed: data.quantity_needed,
        quantity_received: 0,
        unit: data.unit,
        municipality_id: municipalityData.id,
        department_id: municipalityData.department_id,
        location_id: locationId,
        affected_people: data.affected_people || 0,
        reporter_id: user.id,
      };

      const { data: createdNeed, error } = await supabase
        .from('needs')
        .insert([needData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Necesidad reportada exitosamente');
      navigate(`/necesidades/${createdNeed.id}`);
    } catch (error: any) {
      console.error('Error reporting need:', error);
      toast.error(error.message || 'Error al reportar la necesidad');
    } finally {
      setLoading(false);
    }
  };

  const categories: { value: NeedCategory; label: string; icon: string }[] = [
    { value: 'water', label: 'Agua', icon: '💧' },
    { value: 'food', label: 'Alimentos', icon: '🍞' },
    { value: 'medicines', label: 'Medicamentos', icon: '💊' },
    { value: 'first_aid', label: 'Primeros Auxilios', icon: '🩹' },
    { value: 'clothing', label: 'Ropa', icon: '👕' },
    { value: 'mattresses', label: 'Colchonetas', icon: '🛏️' },
    { value: 'hygiene', label: 'Higiene', icon: '🧼' },
    { value: 'cleaning', label: 'Aseo', icon: '🧹' },
    { value: 'housing', label: 'Vivienda', icon: '🏠' },
    { value: 'tools', label: 'Herramientas', icon: '🔧' },
    { value: 'transport', label: 'Transporte', icon: '🚗' },
    { value: 'energy', label: 'Energía', icon: '⚡' },
    { value: 'communications', label: 'Comunicaciones', icon: '📡' },
    { value: 'other', label: 'Otros', icon: '📦' },
  ];

  const units = ['unidades', 'litros', 'kg', 'toneladas', 'paquetes', 'cajas', 'botellas', 'otro'];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">⚠️</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Reportar Necesidad</h1>
            <p className="text-gray-600 mt-2">
              Describe la necesidad que tienes o que has identificado en tu comunidad
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {categories.map((cat) => (
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
                )}
              />
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Product */}
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                Producto / Necesidad *
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe la situación, cantidad de personas afectadas, etc."
                  />
                )}
              />
            </div>

            {/* Quantity and Unit */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity_needed" className="block text-sm font-medium text-gray-700 mb-1">
                  Cantidad necesaria *
                </label>
                <Controller
                  name="quantity_needed"
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
                {errors.quantity_needed && (
                  <p className="mt-1 text-sm text-red-600">{errors.quantity_needed.message}</p>
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
                  Departamento *
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
                        setSelectedDepartment(e.target.value);
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
                {errors.department && (
                  <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                )}
              </div>
              <div>
                <label htmlFor="municipality" className="block text-sm font-medium text-gray-700 mb-1">
                  Municipio *
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
                {errors.municipality && (
                  <p className="mt-1 text-sm text-red-600">{errors.municipality.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Dirección (opcional)
              </label>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección específica o punto de referencia"
                  />
                )}
              />
            </div>

            {/* Affected People */}
            <div>
              <label htmlFor="affected_people" className="block text-sm font-medium text-gray-700 mb-1">
                Personas afectadas (opcional)
              </label>
              <Controller
                name="affected_people"
                control={control}
                render={({ field }) => (
                  <input
                    {...field}
                    type="number"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Número aproximado de personas afectadas"
                    onChange={(e) => field.onChange(Number(e.target.value))}
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
                variant="danger"
                loading={loading}
                className="flex-2"
              >
                Reportar Necesidad
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              * Campos obligatorios. Tu reporte será verificado por nuestro equipo.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportNeedPage;