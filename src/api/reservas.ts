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
};

export async function listReservas(params?: {
  usuario_id?: number; estado?: string; page?: number;
}) {
  const headers = await authHeaders();
  const { data } = await api.get<Reserva[]>("/reservas", { headers, params });
  return data;
}

export async function getReserva(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<Reserva>(`/reservas/${id}`, { headers });
  return data;
}

export async function createReserva(payload: {
  usuario_id: number;
  sucursal_retiro_id: number;
  sucursal_devolucion_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  carros: Array<{ carro_id: number; dias?: number; tarifa_diaria?: number }>;
}) {
  const headers = await authHeaders();
  const { data } = await api.post<Reserva>("/reservas", payload, { headers });
  return data;
}

export async function updateReserva(id: number, payload: Partial<Reserva>) {
  const headers = await authHeaders();
  const { data } = await api.put<Reserva>(`/reservas/${id}`, payload, { headers });
  return data;
}

export async function deleteReserva(id: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/reservas/${id}`, { headers });
  return data;
}

// Extra endpoints (many-to-many + recalcular)
export async function attachCarros(reservaId: number, carros: Array<{ carro_id: number; dias?: number; tarifa_diaria?: number }>) {
  const headers = await authHeaders();
  const { data } = await api.post(`/reservas/${reservaId}/carros`, { carros }, { headers });
  return data;
}

export async function detachCarro(reservaId: number, carroId: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/reservas/${reservaId}/carros/${carroId}`, { headers });
  return data;
}

export async function recalcularReserva(reservaId: number) {
  const headers = await authHeaders();
  const { data } = await api.post(`/reservas/${reservaId}/recalcular`, {}, { headers });
  return data;
}
