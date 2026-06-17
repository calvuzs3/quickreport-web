// ─── Shared sync fields ───────────────────────────────────────────────────────

export interface SyncFields {
  created_at: number; // epoch ms
  updated_at: number; // epoch ms
  synced_at: number | null;
  is_deleted: boolean;
}

// ─── Island type definition (server-authoritative) ────────────────────────────

export interface IslandType {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon_name: string | null;
  maintenance_interval_days: number;
  sort_order: number;
  is_active: boolean;
  created_at: number;
  updated_at: number;
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
  island_type_id: string | null;
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

export interface MaintenanceLog {
  id: string;
  island_id: string;
  operation_type: string;
  custom_operation_label: string | null;
  mechanical_unit_id: string | null;
  component_label: string | null;
  description: string;
  technician_name: string;
  technician_company: string | null;
  operating_hours_at_event: number | null;
  cycle_count_at_event: number | null;
  outcome: string;
  duration_minutes: number | null;
  notes: string | null;
  performed_at: number;
  created_at: number;
  updated_at: number;
  synced_at: number | null;
  is_active: boolean;
  is_deleted: boolean;
}

export const OPERATION_TYPES = [
  "ROUTINE_INSPECTION", "OIL_CHANGE", "FILTER_REPLACEMENT", "LUBRICATION",
  "CALIBRATION", "COMPONENT_REPLACEMENT", "ENCODER_REPLACEMENT",
  "MOTOR_REPLACEMENT", "REDUCER_REPLACEMENT", "SENSOR_REPLACEMENT",
  "CABLE_REPLACEMENT", "ELECTRICAL_REPAIR", "SOFTWARE_UPDATE",
  "PARAMETER_TUNING", "EMERGENCY_REPAIR", "REVAMPING", "INSTALLATION", "OTHER",
] as const;

export const OUTCOMES = [
  "COMPLETED", "PARTIAL", "DEFERRED", "REQUIRES_PARTS",
] as const;

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