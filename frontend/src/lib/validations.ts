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
  role: z.enum(['volunteer', 'organization']).default('volunteer'),
  organization_id: z.string().optional(),
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
  municipality_id: z.string().min(1, 'Municipio requerido'),
  department_id: z.string().min(1, 'Departamento requerido'),
  address: z.string().optional(),
  affected_people: z.number().optional(),
});

export const aidOfferSchema = z.object({
  product: z.string().min(2, 'Producto requerido'),
  quantity: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  unit: z.string().min(1, 'Unidad de medida requerida'),
  need_id: z.string().optional(),
  municipality_id: z.string().optional(),
  department_id: z.string().optional(),
  address: z.string().optional(),
  availability_date: z.string().optional(),
  estimated_delivery_date: z.string().optional(),
  contact_info: z.string().min(5, 'Información de contacto requerida'),
  notes: z.string().optional(),
});

export const centerSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  type: z.enum(['collection', 'delivery', 'shelter', 'medical', 'other']),
  address: z.string().min(5, 'Dirección requerida'),
  municipality_id: z.string().min(1, 'Municipio requerido'),
  department_id: z.string().min(1, 'Departamento requerido'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  schedule: z.string().optional(),
  responsible_person: z.string().optional(),
  contact_phone: z.string().optional(),
  status: z.enum(['active', 'closed', 'temporary']).default('active'),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phone: z.string().optional(),
  avatar_url: z.string().optional(),
});

export const organizationSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  email: z.string().email('Correo electrónico inválido').optional(),
  phone: z.string().optional(),
  website: z.string().url('URL inválida').optional(),
  logo_url: z.string().optional(),
});

export const notificationSchema = z.object({
  title: z.string().min(1, 'Título requerido'),
  message: z.string().min(1, 'Mensaje requerido'),
  type: z.enum(['info', 'warning', 'success', 'error']),
  link: z.string().optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Correo electrónico inválido'),
  subject: z.string().min(3, 'Asunto requerido'),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});