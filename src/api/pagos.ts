import { api, authHeaders } from "./client";

export type Pago = {
  id: number;
  reserva_id: number;
  monto: number;
  metodo: string;       // tarjeta, efectivo, transferencia...
  fecha_pago?: string;  // ISO o "YYYY-MM-DD HH:mm:ss"
  referencia?: string | null;
  estado: string;       // pagado, pendiente, fallido
  created_at?: string;
  updated_at?: string;
};

export async function listPagos(params?: { reserva_id?: number; page?: number }) {
  const headers = await authHeaders();
  const { data } = await api.get<Pago[]>("/pagos", { headers, params });
  return data;
}

export async function getPago(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<Pago>(`/pagos/${id}`, { headers });
  return data;
}

export async function createPago(payload: Omit<Pago, "id"|"created_at"|"updated_at">) {
  const headers = await authHeaders();
  const { data } = await api.post<Pago>("/pagos", payload, { headers });
  return data;
}

export async function updatePago(id: number, payload: Partial<Pago>) {
  const headers = await authHeaders();
  const { data } = await api.put<Pago>(`/pagos/${id}`, payload, { headers });
  return data;
}

export async function deletePago(id: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/pagos/${id}`, { headers });
  return data;
}
