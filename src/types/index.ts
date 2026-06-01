// ─── Shared sync fields ───────────────────────────────────────────────────────

export interface SyncFields {
  created_at: number; // epoch ms
  updated_at: number; // epoch ms
  synced_at: number | null;
  is_deleted: boolean;
}

// ─── Entities ─────────────────────────────────────────────────────────────────

export interface Client extends SyncFields {
  id: string;
  company_name: string;
  notes: string | null;
  headquarters_json: string | null; // JSON string
  is_active: boolean;
}

export interface Contact extends SyncFields {
  id: string;
  client_id: string;
  first_name: string;
  last_name: string | null;
  title: string | null;
  role: string | null;
  department: string | null;
  phone: string | null;
  mobile_phone: string | null;
  email: string | null;
  alternative_email: string | null;
  is_primary: boolean;
  preferred_contact_method: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Contract extends SyncFields {
  id: string;
  client_id: string;
  name: string | null;
  description: string | null;
  start_date: number; // epoch ms
  end_date: number; // epoch ms
  has_priority: boolean;
  has_remote_assistance: boolean;
  has_maintenance: boolean;
  notes: string | null;
  is_active: boolean;
}

export interface Facility extends SyncFields {
  id: string;
  client_id: string;
  name: string;
  code: string | null;
  notes: string | null;
  facility_type: string;
  address_json: string | null; // JSON string
  is_primary: boolean;
  is_active: boolean;
}

export interface FacilityIsland extends SyncFields {
  id: string;
  facility_id: string;
  commissioning_number: string | null;
  island_type: string;
  serial_number: string;
  model_number: string | null;
  model: string | null;
  installation_date: number | null;
  warranty_expiration: number | null;
  operating_hours: number;
  cycle_count: number;
  last_maintenance_date: number | null;
  next_scheduled_maintenance: number | null;
  custom_name: string | null;
  location: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface MechanicalUnit extends SyncFields {
  id: string;
  island_id: string;
  unit_type: string | null;
  name: string;
  serial_number: string | null;
  model: string | null;
  notes: string | null;
  is_active: boolean;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ApiList<T> {
  data: T[];
  total: number;
}

export interface ApiError {
  error: string;
  status: number;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}