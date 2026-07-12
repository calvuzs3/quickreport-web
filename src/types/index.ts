// ─── Shared sync fields ───────────────────────────────────────────────────────

export interface SyncFields {
  created_at: number; // epoch ms
  updated_at: number; // epoch ms
  synced_at: number | null;
  is_deleted: boolean;
}

// ─── Island type definition (master data) ──────────────────────────────────────

export interface IslandType extends SyncFields {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon_name: string | null;
  maintenance_interval_days: number;
  sort_order: number;
  is_active: boolean;
}

// ─── Address (mirrors net.calvuz.qreport.app.app.domain.model.Address in the
// Android app; serialized as JSON in headquarters_json / address_json) ────────

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
}

export interface Address {
  street?: string | null;
  streetNumber?: string | null;
  postalCode?: string | null;
  city?: string | null;
  province?: string | null;
  country?: string;
  coordinates?: GeoCoordinates | null;
  notes?: string | null;
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

// ─── Checkup master data ──────────────────────────────────────────────────────

export interface ModuleType extends SyncFields {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon_name: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CriticalityLevel extends SyncFields {
  id: string;
  code: string;
  label: string;
  priority: number;
  color_hex: string;
  icon_emoji: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface CheckupStatus extends SyncFields {
  id: string;
  code: string;
  label: string;
  color_hex: string;
  icon_emoji: string | null;
  sort_order: number;
  is_active: boolean;
  blocks_deletion: boolean;
  marks_completion: boolean;
}

export interface CheckItemTemplate extends SyncFields {
  id: string;
  module_type_id: string;
  category: string;
  description: string;
  criticality_id: string;
  order_index: number;
  is_active: boolean;
}

// ─── Checkup ──────────────────────────────────────────────────────────────────

export interface Checkup {
  id: string;
  client_company_name: string;
  client_contact_person: string;
  client_site: string;
  client_address: string;
  island_serial_number: string;
  island_model: string;
  technician_name: string;
  technician_company: string;
  checkup_date: number;
  island_type: string;
  status: string;
  created_at: number;
  updated_at: number;
  completed_at: number | null;
  is_deleted: boolean;
}

// ─── Users (admin management) ────────────────────────────────────────────────

export type UserRole = "ADMIN" | "TECHNICIAN";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at: number; // epoch ms
  updated_at: number; // epoch ms
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  role?: UserRole;
  is_active?: boolean;
  password?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  role: string;
}