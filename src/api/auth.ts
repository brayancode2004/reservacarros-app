import { api, authHeaders, clearToken, getErrorMessage, setToken } from "./client";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function register(payload: RegisterPayload) {
  const { data } = await api.post("/register", payload);
  // data: { success, message, token, user }
  if (data?.token) await setToken(data.token);
  return data;
}

export async function login(payload: LoginPayload) {
  const { data } = await api.post("/login", payload);
  if (data?.token) await setToken(data.token);
  return data;
}

export async function profile() {
  const headers = await authHeaders();
  const { data } = await api.get("/profile", { headers });
  return data;
}

export async function logout() {
  const headers = await authHeaders();
  try {
    await api.post("/logout", {}, { headers });
  } catch (err) {
    // si falla el endpoint, igual limpiamos token
    console.warn("logout endpoint error:", getErrorMessage(err));
  } finally {
    await clearToken();
  }
}
