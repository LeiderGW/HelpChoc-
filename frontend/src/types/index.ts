// User types
export type UserRole = 'admin' | 'organization' | 'volunteer' | 'visitor';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  organization_id?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Need types
export type NeedCategory = 
  | 'water' | 'food' | 'medicines' | 'first_aid' | 'clothing'
  | 'mattresses' | 'hygiene' | 'cleaning' | 'housing' | 'tools'
  | 'transport' | 'energy' | 'communications' | 'other';

export type Priority = 'critical' | 'high' | 'medium' | 'low' | 'covered';
export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'insufficient_info';
export type NeedStatus = 'pending' | 'verified' | 'rejected' | 'insufficient_info' | 'fulfilled';

export interface Need {
  id: string;
  category: NeedCategory;
  product: string;
  description?: string;
  quantity_needed: number;
  quantity_received: number;
  unit: string;
  location_id?: string;
  municipality_id?: string;
  department_id?: string;
  priority: Priority;
  status: NeedStatus;
  reporter_id?: string;
  affected_people?: number;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // Computed
  quantity_pending?: number;
  coverage_percentage?: number;
  location?: Location;
  municipality?: Municipality;
  department?: Department;
  reporter?: User;
}

// Aid Offer types
export interface AidOffer {
  id: string;
  need_id?: string;
  organization_id?: string;
  user_id?: string;
  product: string;
  quantity: number;
  unit: string;
  location_id?: string;
  availability_date?: string;
  estimated_delivery_date?: string;
  contact_info?: string;
  notes?: string;
  status: 'available' | 'assigned' | 'in_transit' | 'delivered' | 'cancelled';
  created_at: string;
  updated_at: string;
  need?: Need;
  organization?: Organization;
  user?: User;
}

// Location types
export interface Location {
  id: string;
  municipality_id: string;
  address?: string;
  latitude: number;
  longitude: number;
  place_name?: string;
  created_at: string;
}

export interface Municipality {
  id: string;
  department_id: string;
  name: string;
  code?: string;
  department?: Department;
}

export interface Department {
  id: string;
  name: string;
  code?: string;
}

// Collection Center types
export interface CollectionCenter {
  id: string;
  name: string;
  type: 'collection' | 'delivery' | 'shelter' | 'medical' | 'other';
  address: string;
  municipality_id: string;
  department_id: string;
  latitude: number;
  longitude: number;
  schedule?: string;
  responsible_person?: string;
  contact_phone?: string;
  status: 'active' | 'closed' | 'temporary';
  created_at: string;
  updated_at: string;
  municipality?: Municipality;
  department?: Department;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  logo_url?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  link?: string;
  created_at: string;
}

// Status History types
export interface StatusHistory {
  id: string;
  need_id: string;
  user_id: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  quantity_change?: number;
  notes?: string;
  created_at: string;
  user?: User;
}

// Filter types
export interface NeedFilters {
  department?: string;
  municipality?: string;
  category?: NeedCategory;
  priority?: Priority;
  status?: NeedStatus;
  search?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}