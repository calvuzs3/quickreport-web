import { cookies } from "next/headers";
import type {
  Client,
  Contact,
  Contract,
  Facility,
  FacilityIsland,
  IslandType,
  MechanicalUnit,
  MaintenanceLog,
  ModuleType,
  CriticalityLevel,
  CheckupStatus,
  CheckItemTemplate,
  Checkup,
  ApiList,
} from "@/types";

const KTOR_URL = process.env.KTOR_API_URL ?? "http://192.168.0.191:8080";

// ─── Token helper ─────────────────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get("qreport_token")?.value ?? null;
}

// ─── Base fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();

  const res = await fetch(`${KTOR_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<string> {
  const data = await apiFetch<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
  return data.token;
}

// ─── Module Types ─────────────────────────────────────────────────────────────

export async function getModuleTypes(includeInactive = false): Promise<ApiList<ModuleType>> {
  const q = includeInactive ? "?all=true" : "";
  return apiFetch<ApiList<ModuleType>>(`/api/module-types${q}`);
}

export async function getModuleType(id: string): Promise<ModuleType> {
  return apiFetch<ModuleType>(`/api/module-types/${id}`);
}

export async function createModuleType(data: Partial<ModuleType>): Promise<ModuleType> {
  return apiFetch<ModuleType>("/api/module-types", { method: "POST", body: JSON.stringify(data) });
}

export async function updateModuleType(id: string, data: Partial<ModuleType>): Promise<ModuleType> {
  return apiFetch<ModuleType>(`/api/module-types/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteModuleType(id: string): Promise<void> {
  await apiFetch(`/api/module-types/${id}`, { method: "DELETE" });
}

// ─── Criticality Levels ───────────────────────────────────────────────────────

export async function getCriticalityLevels(includeInactive = false): Promise<ApiList<CriticalityLevel>> {
  const q = includeInactive ? "?all=true" : "";
  return apiFetch<ApiList<CriticalityLevel>>(`/api/criticality-levels${q}`);
}

export async function getCriticalityLevel(id: string): Promise<CriticalityLevel> {
  return apiFetch<CriticalityLevel>(`/api/criticality-levels/${id}`);
}

export async function createCriticalityLevel(data: Partial<CriticalityLevel>): Promise<CriticalityLevel> {
  return apiFetch<CriticalityLevel>("/api/criticality-levels", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCriticalityLevel(id: string, data: Partial<CriticalityLevel>): Promise<CriticalityLevel> {
  return apiFetch<CriticalityLevel>(`/api/criticality-levels/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCriticalityLevel(id: string): Promise<void> {
  await apiFetch(`/api/criticality-levels/${id}`, { method: "DELETE" });
}

// ─── Checkup Statuses ─────────────────────────────────────────────────────────

export async function getCheckupStatuses(includeInactive = false): Promise<ApiList<CheckupStatus>> {
  const q = includeInactive ? "?all=true" : "";
  return apiFetch<ApiList<CheckupStatus>>(`/api/checkup-statuses${q}`);
}

export async function getCheckupStatus(id: string): Promise<CheckupStatus> {
  return apiFetch<CheckupStatus>(`/api/checkup-statuses/${id}`);
}

export async function createCheckupStatus(data: Partial<CheckupStatus>): Promise<CheckupStatus> {
  return apiFetch<CheckupStatus>("/api/checkup-statuses", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCheckupStatus(id: string, data: Partial<CheckupStatus>): Promise<CheckupStatus> {
  return apiFetch<CheckupStatus>(`/api/checkup-statuses/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCheckupStatus(id: string): Promise<void> {
  await apiFetch(`/api/checkup-statuses/${id}`, { method: "DELETE" });
}

// ─── Check Item Templates ─────────────────────────────────────────────────────

export async function getCheckItemTemplates(moduleTypeId?: string): Promise<ApiList<CheckItemTemplate>> {
  const q = moduleTypeId ? `?moduleTypeId=${moduleTypeId}` : "";
  return apiFetch<ApiList<CheckItemTemplate>>(`/api/check-item-templates${q}`);
}

export async function getCheckItemTemplate(id: string): Promise<CheckItemTemplate> {
  return apiFetch<CheckItemTemplate>(`/api/check-item-templates/${id}`);
}

export async function createCheckItemTemplate(data: Partial<CheckItemTemplate>): Promise<CheckItemTemplate> {
  return apiFetch<CheckItemTemplate>("/api/check-item-templates", { method: "POST", body: JSON.stringify(data) });
}

export async function updateCheckItemTemplate(id: string, data: Partial<CheckItemTemplate>): Promise<CheckItemTemplate> {
  return apiFetch<CheckItemTemplate>(`/api/check-item-templates/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deleteCheckItemTemplate(id: string): Promise<void> {
  await apiFetch(`/api/check-item-templates/${id}`, { method: "DELETE" });
}

// ─── Island Types ─────────────────────────────────────────────────────────────

export async function getIslandTypes(includeInactive = false): Promise<ApiList<IslandType>> {
  const q = includeInactive ? "?all=true" : "";
  return apiFetch<ApiList<IslandType>>(`/api/island-types${q}`);
}

export async function getIslandType(id: string): Promise<IslandType> {
  return apiFetch<IslandType>(`/api/island-types/${id}`);
}

export async function createIslandType(
  data: Partial<IslandType>
): Promise<IslandType> {
  return apiFetch<IslandType>("/api/island-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateIslandType(
  id: string,
  data: Partial<IslandType>
): Promise<IslandType> {
  return apiFetch<IslandType>(`/api/island-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteIslandType(id: string): Promise<void> {
  await apiFetch(`/api/island-types/${id}`, { method: "DELETE" });
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<ApiList<Client>> {
  return apiFetch<ApiList<Client>>("/api/clients");
}

export async function getClient(id: string): Promise<Client> {
  return apiFetch<Client>(`/api/clients/${id}`);
}

export async function createClient(
  data: Partial<Client>
): Promise<Client> {
  return apiFetch<Client>("/api/clients", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateClient(
  id: string,
  data: Partial<Client>
): Promise<Client> {
  return apiFetch<Client>(`/api/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteClient(id: string): Promise<void> {
  await apiFetch(`/api/clients/${id}`, { method: "DELETE" });
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

export async function getContacts(clientId?: string): Promise<ApiList<Contact>> {
  const q = clientId ? `?clientId=${clientId}` : "";
  return apiFetch<ApiList<Contact>>(`/api/contacts${q}`);
}

export async function getContact(id: string): Promise<Contact> {
  return apiFetch<Contact>(`/api/contacts/${id}`);
}

export async function createContact(data: Partial<Contact>): Promise<Contact> {
  return apiFetch<Contact>("/api/contacts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContact(
  id: string,
  data: Partial<Contact>
): Promise<Contact> {
  return apiFetch<Contact>(`/api/contacts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContact(id: string): Promise<void> {
  await apiFetch(`/api/contacts/${id}`, { method: "DELETE" });
}

// ─── Contracts ────────────────────────────────────────────────────────────────

export async function getContracts(clientId?: string): Promise<ApiList<Contract>> {
  const q = clientId ? `?clientId=${clientId}` : "";
  return apiFetch<ApiList<Contract>>(`/api/contracts${q}`);
}

export async function getContract(id: string): Promise<Contract> {
  return apiFetch<Contract>(`/api/contracts/${id}`);
}

export async function createContract(
  data: Partial<Contract>
): Promise<Contract> {
  return apiFetch<Contract>("/api/contracts", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateContract(
  id: string,
  data: Partial<Contract>
): Promise<Contract> {
  return apiFetch<Contract>(`/api/contracts/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteContract(id: string): Promise<void> {
  await apiFetch(`/api/contracts/${id}`, { method: "DELETE" });
}

// ─── Facilities ───────────────────────────────────────────────────────────────

export async function getFacilities(clientId?: string): Promise<ApiList<Facility>> {
  const q = clientId ? `?clientId=${clientId}` : "";
  return apiFetch<ApiList<Facility>>(`/api/facilities${q}`);
}

export async function getFacility(id: string): Promise<Facility> {
  return apiFetch<Facility>(`/api/facilities/${id}`);
}

export async function createFacility(
  data: Partial<Facility>
): Promise<Facility> {
  return apiFetch<Facility>("/api/facilities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFacility(
  id: string,
  data: Partial<Facility>
): Promise<Facility> {
  return apiFetch<Facility>(`/api/facilities/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFacility(id: string): Promise<void> {
  await apiFetch(`/api/facilities/${id}`, { method: "DELETE" });
}

// ─── Islands ──────────────────────────────────────────────────────────────────

export async function getIslands(
  facilityId?: string
): Promise<ApiList<FacilityIsland>> {
  const q = facilityId ? `?facilityId=${facilityId}` : "";
  return apiFetch<ApiList<FacilityIsland>>(`/api/islands${q}`);
}

export async function getIsland(id: string): Promise<FacilityIsland> {
  return apiFetch<FacilityIsland>(`/api/islands/${id}`);
}

export async function createIsland(
  data: Partial<FacilityIsland>
): Promise<FacilityIsland> {
  return apiFetch<FacilityIsland>("/api/islands", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateIsland(
  id: string,
  data: Partial<FacilityIsland>
): Promise<FacilityIsland> {
  return apiFetch<FacilityIsland>(`/api/islands/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteIsland(id: string): Promise<void> {
  await apiFetch(`/api/islands/${id}`, { method: "DELETE" });
}

// ─── Mechanical Units ─────────────────────────────────────────────────────────

export async function getMechanicalUnits(
  islandId?: string
): Promise<ApiList<MechanicalUnit>> {
  const q = islandId ? `?islandId=${islandId}` : "";
  return apiFetch<ApiList<MechanicalUnit>>(`/api/mechanical-units${q}`);
}

export async function getMechanicalUnit(id: string): Promise<MechanicalUnit> {
  return apiFetch<MechanicalUnit>(`/api/mechanical-units/${id}`);
}

export async function createMechanicalUnit(
  data: Partial<MechanicalUnit>
): Promise<MechanicalUnit> {
  return apiFetch<MechanicalUnit>("/api/mechanical-units", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMechanicalUnit(
  id: string,
  data: Partial<MechanicalUnit>
): Promise<MechanicalUnit> {
  return apiFetch<MechanicalUnit>(`/api/mechanical-units/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMechanicalUnit(id: string): Promise<void> {
  await apiFetch(`/api/mechanical-units/${id}`, { method: "DELETE" });
}

// ─── Maintenance Logs ─────────────────────────────────────────────────────────

export async function getMaintenanceLogs(
  islandId?: string
): Promise<ApiList<MaintenanceLog>> {
  const q = islandId ? `?islandId=${islandId}` : "";
  return apiFetch<ApiList<MaintenanceLog>>(`/api/maintenance-logs${q}`);
}

export async function getMaintenanceLog(id: string): Promise<MaintenanceLog> {
  return apiFetch<MaintenanceLog>(`/api/maintenance-logs/${id}`);
}

export async function createMaintenanceLog(
  data: Partial<MaintenanceLog>
): Promise<MaintenanceLog> {
  return apiFetch<MaintenanceLog>("/api/maintenance-logs", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMaintenanceLog(
  id: string,
  data: Partial<MaintenanceLog>
): Promise<MaintenanceLog> {
  return apiFetch<MaintenanceLog>(`/api/maintenance-logs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteMaintenanceLog(id: string): Promise<void> {
  await apiFetch(`/api/maintenance-logs/${id}`, { method: "DELETE" });
}

// ─── Checkups (read-only) ─────────────────────────────────────────────────────

export async function getCheckups(clientId?: string, islandId?: string): Promise<ApiList<Checkup>> {
  const params = new URLSearchParams();
  if (clientId) params.set("clientId", clientId);
  if (islandId) params.set("islandId", islandId);
  const q = params.size > 0 ? `?${params.toString()}` : "";
  return apiFetch<ApiList<Checkup>>(`/api/checkups${q}`);
}