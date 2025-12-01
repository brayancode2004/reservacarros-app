import { api, authHeaders } from "./client";

export type Carro = {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  anio: number;
  tarifa_diaria: number;
  estado: string;
  sucursal_id: number;
  sucursal?: {
    id: number;
    nombre: string;
  };
  fotos?: Array<{
    id: number;
    url: string;
    principal: boolean;
    orden: number;
  }>;
};

export type PaginatedResponse<T> = {
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


export async function listCarros(params?: {
  search?: string;
  estado?: string;
  sucursal_id?: number;
  page?: number;
}) {
  const headers = await authHeaders();
  const { data } = await api.get<PaginatedResponse<Carro>>("/carros", {
    headers,
    params,
  });
  return data; // aquí viene { data: Carro[], meta, links }
}

export async function getCarro(id: number) {
  const headers = await authHeaders();

  const { data } = await api.get<{ data: Carro }>(`/carros/${id}`, { headers });

  return data.data; 
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
