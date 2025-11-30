import { api, authHeaders } from "./client";

export type CarroFoto = {
  id: number;
  carro_id: number;
  url: string;
  principal: boolean;
  orden: number;
  created_at?: string;
  updated_at?: string;
};

export async function listCarroFotos(carroId: number) {
  const headers = await authHeaders();
  const { data } = await api.get<CarroFoto[]>(`/carros/${carroId}/fotos`, { headers });
  return data;
}

export async function addCarroFoto(carroId: number, payload: { url: string; principal?: boolean; orden?: number; }) {
  const headers = await authHeaders();
  const { data } = await api.post<CarroFoto>(`/carros/${carroId}/fotos`, payload, { headers });
  return data;
}

export async function deleteCarroFoto(carroId: number, fotoId: number) {
  const headers = await authHeaders();
  const { data } = await api.delete(`/carros/${carroId}/fotos/${fotoId}`, { headers });
  return data;
}

export async function setCarroFotoPrincipal(carroId: number, fotoId: number) {
  const headers = await authHeaders();
  const { data } = await api.patch(`/carros/${carroId}/fotos/${fotoId}/principal`, {}, { headers });
  return data;
}
