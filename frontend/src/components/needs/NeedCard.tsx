import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico inválido'),
  phone: z.string().optional(),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const needSchema = z.object({
  category: z.string().min(1, 'Categoría requerida'),
  product: z.string().min(2, 'Producto requerido'),
  description: z.string().optional(),
  quantity_needed: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad de medida requerida'),
  municipality: z.string().min(1, 'Municipio requerido'),
  department: z.string().min(1, 'Departamento requerido'),
  address: z.string().optional(),
  affected_people: z.number().optional(),
});

export const aidOfferSchema = z.object({
  product: z.string().min(2, 'Producto requerido'),
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

export const centerSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  type: z.string().min(1, 'Tipo requerido'),
  address: z.string().min(5, 'Dirección requerida'),
  municipality: z.string().min(1, 'Municipio requerido'),
  department: z.string().min(1, 'Departamento requerido'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  schedule: z.string().optional(),
  responsible_person: z.string().optional(),
  contact_phone: z.string().optional(),
  status: z.string().default('active'),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
});