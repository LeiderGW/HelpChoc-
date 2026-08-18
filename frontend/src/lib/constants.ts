import {
  BedDouble, Brush, Car, Droplet, HeartPulse, Home, Package, Pill,
  Radio, Shirt, ShowerHead, Utensils, Wrench, Zap, type LucideIcon,
} from 'lucide-react';
import { NeedCategory } from '../types';

export const APP_NAME = 'AyudaMapa';
export const APP_DESCRIPTION = 'Plataforma de coordinación y distribución de ayudas humanitarias';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

/**
 * El icono es un componente de lucide, no un emoji.
 *
 * Los emojis los dibuja el sistema operativo: cambian de forma, color y peso
 * entre Android, iOS y Windows, no heredan el color del texto y no se pueden
 * alinear con el resto de la interfaz. Toda la navegación del sitio ya usaba
 * lucide; esto pone las categorías en el mismo sistema.
 */
export const NEED_CATEGORIES: { value: NeedCategory; label: string; icon: LucideIcon; color: string }[] = [
  { value: 'water', label: 'Agua', icon: Droplet, color: '#3B82F6' },
  { value: 'food', label: 'Alimentos', icon: Utensils, color: '#F59E0B' },
  { value: 'medicines', label: 'Medicamentos', icon: Pill, color: '#EF4444' },
  { value: 'first_aid', label: 'Primeros Auxilios', icon: HeartPulse, color: '#EF4444' },
  { value: 'clothing', label: 'Ropa', icon: Shirt, color: '#8B5CF6' },
  { value: 'mattresses', label: 'Colchonetas', icon: BedDouble, color: '#EC4899' },
  { value: 'hygiene', label: 'Higiene', icon: ShowerHead, color: '#14B8A6' },
  { value: 'cleaning', label: 'Aseo', icon: Brush, color: '#10B981' },
  { value: 'housing', label: 'Vivienda', icon: Home, color: '#F59E0B' },
  { value: 'tools', label: 'Herramientas', icon: Wrench, color: '#6B7280' },
  { value: 'transport', label: 'Transporte', icon: Car, color: '#3B82F6' },
  { value: 'energy', label: 'Energía', icon: Zap, color: '#F59E0B' },
  { value: 'communications', label: 'Comunicaciones', icon: Radio, color: '#8B5CF6' },
  { value: 'other', label: 'Otros', icon: Package, color: '#6B7280' },
];

/** Categoría por valor, para no repetir el `find` en cada pantalla. */
export function categoriaDe(valor: string) {
  return NEED_CATEGORIES.find(c => c.value === valor);
}

/**
 * Nombre en español de una categoría. La base guarda el valor en inglés
 * ('food', 'first_aid'), que es lo correcto para una columna, pero varias
 * pantallas lo estaban imprimiendo tal cual en una interfaz en español.
 */
export function etiquetaCategoria(valor: string): string {
  return categoriaDe(valor)?.label ?? valor;
}

export const PRIORITY_LABELS = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
  covered: 'Cubierta',
} as const;

export const PRIORITY_COLORS = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
  covered: 'bg-gray-500',
} as const;

// PRIORITY_ICONS (círculos de emoji) se eliminó: el color de la prioridad ya
// lo lleva PRIORITY_COLORS y el nombre lo lleva PRIORITY_LABELS.

/** Nombre legible del rol; la base lo guarda en inglés y en minúscula. */
export const ROLE_LABELS = {
  admin: 'Administrador',
  organization: 'Organización',
  volunteer: 'Voluntario',
  visitor: 'Visitante',
} as const;

export const STATUS_LABELS = {
  pending: 'Pendiente',
  verified: 'Verificado',
  rejected: 'Rechazado',
  insufficient_info: 'Información Insuficiente',
  fulfilled: 'Cubierto',
} as const;

export const AID_STATUS_LABELS = {
  available: 'Disponible',
  assigned: 'Asignada',
  in_transit: 'En Tránsito',
  delivered: 'Entregada',
  cancelled: 'Cancelada',
} as const;

export const CENTER_TYPES = {
  collection: 'Centro de Acopio',
  delivery: 'Punto de Entrega',
  shelter: 'Refugio',
  medical: 'Centro Médico',
  other: 'Otro',
} as const;

export const CENTER_STATUS = {
  active: 'Activo',
  closed: 'Cerrado',
  temporary: 'Temporal',
} as const;

export const UNITS = [
  'unidades',
  'litros',
  'kg',
  'toneladas',
  'paquetes',
  'cajas',
  'botellas',
  'sacos',
  'kits',
  'otro',
] as const;

export const ROUTES = {
  HOME: '/',
  MAP: '/mapa',
  NEEDS: '/necesidades',
  NEED_DETAIL: '/necesidades/:id',
  OFFERS: '/ayudas',
  OFFER_HELP: '/ofrecer-ayuda',
  REPORT_NEED: '/reportar-necesidad',
  CENTERS: '/puntos-entrega',
  DASHBOARD: '/estadisticas',
  LOGIN: '/login',
  REGISTER: '/register',
  PROFILE: '/perfil',
  ABOUT: '/about',
  CONTACT: '/contact',
  PRIVACY: '/privacy',
  TERMS: '/terms',
  FAQ: '/faq',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const API_ENDPOINTS = {
  NEEDS: '/api/needs',
  OFFERS: '/api/offers',
  CENTERS: '/api/centers',
  USERS: '/api/users',
  ORGANIZATIONS: '/api/organizations',
  NOTIFICATIONS: '/api/notifications',
  STATISTICS: '/api/statistics',
} as const;

export const MAP_CONFIG = {
  DEFAULT_CENTER: [-74.0721, 4.7110] as [number, number],
  DEFAULT_ZOOM: 5,
  MIN_ZOOM: 3,
  MAX_ZOOM: 18,
  STYLE: 'mapbox://styles/mapbox/light-v11',
} as const;

export const STORAGE_KEYS = {
  THEME: 'ayudamapa-theme',
  TOKEN: 'ayudamapa-token',
  USER: 'ayudamapa-user',
  SETTINGS: 'ayudamapa-settings',
} as const;

export const COLORS = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  emergency: {
    critical: '#DC2626',
    high: '#F97316',
    medium: '#EAB308',
    low: '#22C55E',
    covered: '#6B7280',
  },
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;