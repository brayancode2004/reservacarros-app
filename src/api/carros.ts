import { api, authHeaders } from "./client";

export type Carro = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tarifa_diaria: number;
  estado?: string;
  sucursal_id: number;
  created_at?: string;
  updated_at?: string;
};

export async function listCarros(params?: {
  search?: string; estado?: string; sucursal_id?: number; page?: number;
}) {
  const headers = await authHeaders();
  const { data } = await api.get<Carro[]>("/carros", { headers, params });
  return data;
}

export async function getCarro(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<Carro>(`/carros/${id}`, { headers });
  return data;
}

export async function createCarro(payload: Omit<Carro,"id"|"created_at"|"updated_at">) {
  const headers = await authHeaders();
  const { data } = await api.post<Carro>("/carros", payload, { headers });
  return data;
}

export async function updateCarro(id: number, payload: Partial<Carro>) {
  const headers = await authHeaders();
  const { data } = await api.put<Carro>(`/carros/${id}`, payload, { headers });
  return data;
}

export async function deleteCarro(id: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/carros/${id}`, { headers });
  return data;
}
