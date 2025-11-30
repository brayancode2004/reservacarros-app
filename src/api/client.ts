import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const BASE_URL = "http://127.0.0.1:8000/api"; // cámbialo para device real (IP de tu PC en la red)

export const TOKEN_KEY = "@rc_token";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Helpers para token
export async function getToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// Headers con token (evitamos interceptores async)
export async function authHeaders() {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Util simple para manejar errores de axios
export function getErrorMessage(err: any): string {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.errors) {
    // Laravel validation
    const errors = err.response.data.errors;
    const first = Object.values(errors)?.[0] as string[] | undefined;
    if (first?.length) return first[0];
  }
  return err?.message ?? "Error de red";
}
