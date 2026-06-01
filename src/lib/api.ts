import { cookies } from "next/headers";
import type {
  Client,
  Contact,
  Contract,
  Facility,
  FacilityIsland,
  MechanicalUnit,
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