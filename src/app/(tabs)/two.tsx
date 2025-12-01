// app/(tabs)/two.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { listReservas, type Reserva } from "../../api/reservas";
import ReservaCard from "../../components/ReservaCard";
import { useAuth } from "../../context/AuthContext";

export default function TabTwoScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReservas = useCallback(async () => {
    if (!user?.id) return;

    try {
      setError(null);
      setLoading(true);

      const res = await listReservas({
        usuario_id: user.id,
        page: 1,
      });

      setReservas(res.data);
    } catch (e: any) {
      console.log("Error cargando reservas", e?.response?.data || e?.message);
      setError("No se pudieron cargar tus reservas.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadReservas();
  }, [loadReservas]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReservas();
    setRefreshing(false);
  };

  const handleOpenReserva = (reserva: Reserva) => {
    router.push({
      pathname: "/reservas/[id]",
      params: { id: String(reserva.id), from: "two" },
    });
  };

  if (!user?.id) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="text-center text-sm text-gray-600">
          Debes iniciar sesión para ver tus reservas.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 pb-3 pt-4">
        <Ionicons name="clipboard-outline" size={22} color="#2563EB" />
        <View className="ml-2 flex-1">
          <Text className="text-lg font-bold text-gray-900">
            Mis reservas
          </Text>
          <Text className="text-xs text-gray-500">
            Revisa el historial y estado de tus reservas de autos.
          </Text>
        </View>
      </View>

      {/* CONTENIDO */}
      <View className="flex-1  pt-3">
        {error && (
          <View className="mb-3 rounded-lg bg-red-100 p-2">
            <Text className="text-center text-xs text-red-700">{error}</Text>
          </View>
        )}

        {loading && reservas.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" />
            <Text className="mt-2 text-sm text-gray-500">
              Cargando tus reservas...
            </Text>
          </View>
        ) : (
          <FlatList
            data={reservas}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <ReservaCard
                reserva={item}
                onPress={() => handleOpenReserva(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16, paddingTop: 8 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              !loading ? (
                <View className="mt-10 items-center">
                  <Ionicons
                    name="car-sport-outline"
                    size={32}
                    color="#9CA3AF"
                  />
                  <Text className="mt-2 text-center text-sm text-gray-500">
                    Aún no tienes reservas registradas.
                  </Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
