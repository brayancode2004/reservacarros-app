// api/reservas.ts
import type { PaginatedResponse } from "./carros";
import { api, authHeaders } from "./client";

export type Reserva = {
  id: number;
  usuario_id: number;
  sucursal_retiro_id: number;
  sucursal_devolucion_id: number;
  fecha_inicio: string; // ISO o "YYYY-MM-DD HH:mm:ss"
  fecha_fin: string;
  precio_total: number;
  estado: string; // pendiente, confirmada, cancelada, completada
  created_at?: string;
  updated_at?: string;
  // opcionalmente, si el Resource incluye relaciones:
  carros?: any[];
  usuario?: any;
};

export type CarroReservaInput = {
  carro_id: number;
  dias?: number;
  tarifa_diaria?: number;
};

export type CreateReservaPayload = {
  usuario_id: number;
  sucursal_retiro_id: number;
  sucursal_devolucion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  carros: CarroReservaInput[];
};

// 🔹 index: en Laravel devuelves Resource::collection(paginate())
// => { data: Reserva[], meta, links }
export async function listReservas(params?: {
  usuario_id?: number;
  estado?: string;
  page?: number;
}) {
  const headers = await authHeaders();
  const { data } = await api.get<PaginatedResponse<Reserva>>("/reservas", {
    headers,
    params,
  });
  return data; // { data: Reserva[], meta, links }
}

// 🔹 show: devuelves new ReservaResource($reserva)
// => { data: Reserva }
export async function getReserva(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<{ data: Reserva }>(`/reservas/${id}`, {
    headers,
  });
  return data.data;
}

// 🔹 store: devuelves new ReservaResource($reserva)
// => { data: Reserva }
export async function createReserva(payload: CreateReservaPayload) {
  const headers = await authHeaders();
  const { data } = await api.post<{ data: Reserva }>("/reservas", payload, {
    headers,
  });
  return data.data;
}

// 🔹 update: igual, ReservaResource => { data: Reserva }
export async function updateReserva(id: number, payload: Partial<Reserva>) {
  const headers = await authHeaders();
  const { data } = await api.put<{ data: Reserva }>(`/reservas/${id}`, {
    headers,
  });
  return data.data;
}

// 🔹 destroy: noContent()
export async function deleteReserva(id: number) {
  const headers = await authHeaders();
  await api.delete(`/reservas/${id}`, { headers });
}

// Extra endpoints (many-to-many + recalcular)
// Todos ellos devuelven ReservaResource => { data: Reserva }
export async function attachCarros(
  reservaId: number,
  carros: CarroReservaInput[]
) {
  const headers = await authHeaders();
  const { data } = await api.post<{ data: Reserva }>(
    `/reservas/${reservaId}/carros`,
    { carros },
    { headers }
  );
  return data.data;
}

export async function detachCarro(reservaId: number, carroId: number) {
  const headers = await authHeaders();
  const { data } = await api.delete<{ data: Reserva }>(
    `/reservas/${reservaId}/carros/${carroId}`,
    { headers }
  );
  return data.data;
}

export async function recalcularReserva(reservaId: number) {
  const headers = await authHeaders();
  const { data } = await api.post<{ data: Reserva }>(
    `/reservas/${reservaId}/recalcular`,
    {},
    { headers }
  );
  return data.data;
}
