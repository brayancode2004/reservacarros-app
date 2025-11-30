import { api, authHeaders } from "./client";

export type Sucursal = {
  id: number;
  nombre: string;
  direccion?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function listSucursales(params?: { search?: string; page?: number }) {
  const headers = await authHeaders();
  const { data } = await api.get<Sucursal[]>("/sucursales", { headers, params });
  return data;
}

export async function getSucursal(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<Sucursal>(`/sucursales/${id}`, { headers });
  return data;
}

export async function createSucursal(payload: Omit<Sucursal, "id" | "created_at" | "updated_at">) {
  const headers = await authHeaders();
  const { data } = await api.post<Sucursal>("/sucursales", payload, { headers });
  return data;
}

export async function updateSucursal(id: number, payload: Partial<Sucursal>) {
  const headers = await authHeaders();
  const { data } = await api.put<Sucursal>(`/sucursales/${id}`, payload, { headers });
  return data;
}

export async function deleteSucursal(id: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/sucursales/${id}`, { headers });
  return data;
}
