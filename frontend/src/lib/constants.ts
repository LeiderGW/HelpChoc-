import { NeedCategory } from '../types';

export const APP_NAME = 'AyudaMapa';
export const APP_DESCRIPTION = 'Plataforma de coordinación y distribución de ayudas humanitarias';
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export const NEED_CATEGORIES: { value: NeedCategory; label: string; icon: string; color: string }[] = [
  { value: 'water', label: 'Agua', icon: '💧', color: '#3B82F6' },
  { value: 'food', label: 'Alimentos', icon: '🍞', color: '#F59E0B' },
  { value: 'medicines', label: 'Medicamentos', icon: '💊', color: '#EF4444' },
  { value: 'first_aid', label: 'Primeros Auxilios', icon: '🩹', color: '#EF4444' },
  { value: 'clothing', label: 'Ropa', icon: '👕', color: '#8B5CF6' },
  { value: 'mattresses', label: 'Colchonetas', icon: '🛏️', color: '#EC4899' },
  { value: 'hygiene', label: 'Higiene', icon: '🧼', color: '#14B8A6' },
  { value: 'cleaning', label: 'Aseo', icon: '🧹', color: '#10B981' },
  { value: 'housing', label: 'Vivienda', icon: '🏠', color: '#F59E0B' },
  { value: 'tools', label: 'Herramientas', icon: '🔧', color: '#6B7280' },
  { value: 'transport', label: 'Transporte', icon: '🚗', color: '#3B82F6' },
  { value: 'energy', label: 'Energía', icon: '⚡', color: '#F59E0B' },
  { value: 'communications', label: 'Comunicaciones', icon: '📡', color: '#8B5CF6' },
  { value: 'other', label: 'Otros', icon: '📦', color: '#6B7280' },
];

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

export const PRIORITY_ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🟢',
  covered: '✅',
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