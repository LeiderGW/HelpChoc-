import { Priority, NeedCategory } from '../types';

interface PriorityFactors {
  coverage: number;
  affected_people: number;
  category: NeedCategory;
  days_old: number;
  urgency_level?: number;
}

const CRITICAL_CATEGORIES: NeedCategory[] = ['water', 'medicines', 'first_aid'];
const HIGH_CATEGORIES: NeedCategory[] = ['food', 'housing', 'hygiene'];

export function calculatePriority(factors: PriorityFactors): Priority {
  let score = 0;

  // Factor 1: Coverage percentage (0-100)
  if (factors.coverage < 20) score += 4;
  else if (factors.coverage < 40) score += 3;
  else if (factors.coverage < 60) score += 2;
  else if (factors.coverage < 80) score += 1;
  else if (factors.coverage >= 100) return 'covered';

  // Factor 2: Affected people
  if (factors.affected_people > 5000) score += 3;
  else if (factors.affected_people > 2000) score += 2;
  else if (factors.affected_people > 500) score += 1;

  // Factor 3: Category criticality
  if (CRITICAL_CATEGORIES.includes(factors.category)) score += 3;
  else if (HIGH_CATEGORIES.includes(factors.category)) score += 2;

  // Factor 4: Time elapsed (days)
  if (factors.days_old > 14) score += 3;
  else if (factors.days_old > 7) score += 2;
  else if (factors.days_old > 3) score += 1;

  // Factor 5: Urgency level (1-5)
  if (factors.urgency_level) {
    score += factors.urgency_level;
  }

  // Determine priority based on score
  if (score >= 10) return 'critical';
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    critical: 'Crítica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
    covered: 'Cubierta',
  };
  return labels[priority];
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-600 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-white',
    low: 'bg-green-500 text-white',
    covered: 'bg-gray-500 text-white',
  };
  return colors[priority];
}

export function getPriorityBgColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-yellow-50 border-yellow-200',
    low: 'bg-green-50 border-green-200',
    covered: 'bg-gray-50 border-gray-200',
  };
  return colors[priority];
}

export function getPriorityIcon(priority: Priority): string {
  const icons: Record<Priority, string> = {
    critical: '🔴',
    high: '🟠',
    medium: '🟡',
    low: '🟢',
    covered: '✅',
  };
  return icons[priority];
}

export function getPriorityEmoji(priority: Priority): string {
  const emojis: Record<Priority, string> = {
    critical: '🚨',
    high: '⚠️',
    medium: '📋',
    low: '📌',
    covered: '🎉',
  };
  return emojis[priority];
}

export function getPriorityDescription(priority: Priority): string {
  const descriptions: Record<Priority, string> = {
    critical: 'Requiere atención inmediata. Situación de vida o muerte.',
    high: 'Necesidad urgente. Afecta a muchas personas.',
    medium: 'Necesidad importante. Se requiere asistencia pronto.',
    low: 'Necesidad que puede esperar. No es urgente.',
    covered: 'Necesidad completamente cubierta.',
  };
  return descriptions[priority];
}

export function getPriorityActions(priority: Priority): string[] {
  const actions: Record<Priority, string[]> = {
    critical: ['Activar protocolo de emergencia', 'Movilizar recursos inmediatos', 'Contactar autoridades locales'],
    high: ['Priorizar asignación de recursos', 'Coordinar con organizaciones', 'Monitorear cada 4 horas'],
    medium: ['Planificar distribución', 'Buscar más recursos', 'Monitorear cada 12 horas'],
    low: ['Programar entrega', 'Actualizar inventario', 'Monitorear diariamente'],
    covered: ['Cerrar necesidad', 'Actualizar estado', 'Enviar notificación de cumplimiento'],
  };
  return actions[priority];
}