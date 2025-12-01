import type { PaginatedResponse } from "./carros";
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

// Para crear pago no necesitamos id ni timestamps
export type CreatePagoPayload = {
  reserva_id: number;
  monto: number;
  metodo: string;
  fecha_pago?: string;
  referencia?: string | null;
  estado?: string; // opcional: default 'pagado' en BD
};

export async function listPagos(params?: { reserva_id?: number; page?: number }) {
  const headers = await authHeaders();
  const { data } = await api.get<PaginatedResponse<Pago>>("/pagos", {
    headers,
    params,
  });
  return data; // { data: Pago[], meta, links }
}

export async function getPago(id: number) {
  const headers = await authHeaders();
  const { data } = await api.get<{ data: Pago }>(`/pagos/${id}`, { headers });
  return data.data;
}

export async function createPago(payload: CreatePagoPayload) {
  const headers = await authHeaders();
  const { data } = await api.post<{ data: Pago }>("/pagos", payload, {
    headers,
  });
  return data.data;
}

export async function updatePago(id: number, payload: Partial<Pago>) {
  const headers = await authHeaders();
  const { data } = await api.put<{ data: Pago }>(`/pagos/${id}`, {
    headers,
  });
  return data.data;
}

export async function deletePago(id: number) {
  const headers = await authHeaders();
  await api.delete(`/pagos/${id}`, { headers });
}
