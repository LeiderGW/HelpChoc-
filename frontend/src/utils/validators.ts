import { z } from 'zod';
import {
  loginSchema,
  registerSchema,
  needSchema,
  aidOfferSchema,
  centerSchema,
  profileSchema,
  organizationSchema,
  contactSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../lib/validations';

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 7 && cleaned.length <= 15;
};

export const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const validateCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

export const validateNeedQuantity = (quantity: number): boolean => {
  return quantity > 0 && Number.isInteger(quantity);
};

export const validatePriority = (priority: string): boolean => {
  return ['critical', 'high', 'medium', 'low', 'covered'].includes(priority);
};

export const validateNeedCategory = (category: string): boolean => {
  return [
    'water', 'food', 'medicines', 'first_aid', 'clothing',
    'mattresses', 'hygiene', 'cleaning', 'housing',
    'tools', 'transport', 'energy', 'communications', 'other'
  ].includes(category);
};

export const validateAidStatus = (status: string): boolean => {
  return ['available', 'assigned', 'in_transit', 'delivered', 'cancelled'].includes(status);
};

export const validateCenterType = (type: string): boolean => {
  return ['collection', 'delivery', 'shelter', 'medical', 'other'].includes(type);
};

export const validateCenterStatus = (status: string): boolean => {
  return ['active', 'closed', 'temporary'].includes(status);
};

export const validateUserRole = (role: string): boolean => {
  return ['admin', 'organization', 'volunteer', 'visitor'].includes(role);
};

// Zod validation functions
export const validateLogin = (data: unknown) => loginSchema.safeParse(data);
export const validateRegister = (data: unknown) => registerSchema.safeParse(data);
export const validateNeed = (data: unknown) => needSchema.safeParse(data);
export const validateAidOffer = (data: unknown) => aidOfferSchema.safeParse(data);
export const validateCenter = (data: unknown) => centerSchema.safeParse(data);
export const validateProfile = (data: unknown) => profileSchema.safeParse(data);
export const validateOrganization = (data: unknown) => organizationSchema.safeParse(data);
export const validateContact = (data: unknown) => contactSchema.safeParse(data);
export const validateForgotPassword = (data: unknown) => forgotPasswordSchema.safeParse(data);
export const validateResetPassword = (data: unknown) => resetPasswordSchema.safeParse(data);

// Sanitization functions
export const sanitizeString = (str: string): string => {
  return str
    .trim()
    .replace(/[<>]/g, '') // Remove HTML tags
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

export const sanitizePhone = (phone: string): string => {
  return phone.replace(/\s/g, '');
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
};

export const sanitizeNumber = (num: number): number => {
  return Math.max(0, Math.round(num));
};

export const sanitizeText = (text: string, maxLength: number = 1000): string => {
  return text.slice(0, maxLength);
};