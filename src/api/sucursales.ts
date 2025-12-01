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

// Puedes reutilizar el mismo tipo que usaste en carros.ts,
// o declararlo aquí otra vez:
type PaginatedResponse<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    next: string | null;
    prev: string | null;
  };
};

export async function listSucursales(params?: { search?: string; page?: number }) {
  const headers = await authHeaders();

  // 👇 OJO: ahora asumimos que el backend devuelve paginado
  const { data } = await api.get<PaginatedResponse<Sucursal>>("/sucursales", {
    headers,
    params,
  });

  // devolvemos SOLO el array de sucursales
  return data.data;
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
