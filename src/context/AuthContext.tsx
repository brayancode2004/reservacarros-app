import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import {
    login as apiLogin,
    logout as apiLogout,
    register as apiRegister,
    profile,
} from "../api/auth";
import { getToken } from "../api/client";

type AuthContextValue = {
  isLoggedIn: boolean;
  loading: boolean;
  user: any | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadInitialAuth = async () => {
    try {
      const token = await getToken();

      if (!token) {
        setIsLoggedIn(false);
        setUser(null);
        return;
      }

      // Opcional: pegamos al /profile para traer datos del usuario
      try {
        const data = await profile();
        // asumo que tu API devuelve { user: {...} } o el user directo
        setUser((data as any).user ?? data);
        setIsLoggedIn(true);
      } catch (err) {
        console.warn("Error cargando profile, limpiando sesión...", err);
        setIsLoggedIn(false);
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await apiLogin({ email, password });
    setIsLoggedIn(true);
    setUser((res as any).user ?? null);
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    const res = await apiRegister({
      name,
      email,
      password,
      password_confirmation: passwordConfirm,
    });
    setIsLoggedIn(true);
    setUser((res as any).user ?? null);
  };

  const signOut = async () => {
    await apiLogout();
    setIsLoggedIn(false);
    setUser(null);
  };

  const refreshAuth = async () => {
    setLoading(true);
    await loadInitialAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        loading,
        user,
        signIn,
        signUp,
        signOut,
        refreshAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return ctx;
}
