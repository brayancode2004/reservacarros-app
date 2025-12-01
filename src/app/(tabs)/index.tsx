import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { cortarStringEnPrimerEspacio } from "@/src/utils/functions";
import { listCarros, type Carro } from "../../api/carros";
import { listSucursales, type Sucursal } from "../../api/sucursales";
import CarCard from "../../components/CarCard";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | null>(
    null
  );

  const [carros, setCarros] = useState<Carro[]>([]);
  const [loadingCarros, setLoadingCarros] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar sucursales
  const loadSucursales = useCallback(async () => {
    try {
      setLoadingSucursales(true);
      const data = await listSucursales();
      setSucursales(data);
    } catch (e) {
      console.log("Error cargando sucursales", e);
    } finally {
      setLoadingSucursales(false);
    }
  }, []);

  // Cargar carros
  const loadCarros = useCallback(async () => {
    try {
      setError(null);
      setLoadingCarros(true);

      const res = await listCarros({
        sucursal_id: selectedSucursalId ?? undefined,
      });

      // listCarros devuelve PaginatedResponse<Carro>
      setCarros(res.data);
    } catch (e: any) {
      console.log("Error cargando carros", e?.response?.data || e?.message);
      setError("No se pudieron cargar los carros.");
    } finally {
      setLoadingCarros(false);
    }
  }, [selectedSucursalId]);

  useEffect(() => {
    loadSucursales();
  }, [loadSucursales]);

  useEffect(() => {
    loadCarros();
  }, [loadCarros]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadCarros(), loadSucursales()]);
    setRefreshing(false);
  };

  const renderSucursalChips = () => {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mt-3"
      >
        {/* Todas */}
        <TouchableOpacity
          onPress={() => setSelectedSucursalId(null)}
          className={`mr-2 rounded-full border px-4 py-2 ${
            selectedSucursalId === null
              ? "border-blue-600 bg-blue-600"
              : "border-gray-300 bg-white"
          }`}
        >
          <Text
            className={`text-sm font-medium ${
              selectedSucursalId === null ? "text-white" : "text-gray-700"
            }`}
          >
            Todas
          </Text>
        </TouchableOpacity>

        {sucursales.map((s) => {
          const selected = selectedSucursalId === s.id;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => setSelectedSucursalId(s.id)}
              className={`mr-2 rounded-full border px-4 py-2 ${
                selected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  selected ? "text-white" : "text-gray-700"
                }`}
              >
                {s.nombre}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  };

  const handleCarPress = (carro: Carro) => {
    router.push({
      pathname: "/carros/[id]",
      params: { id: String(carro.id) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      {/* HEADER */}
      <View className="border-b border-gray-100 bg-white px-4 pb-4 ">
        <View className="flex-row items-center gap-4">
        <UserAvatar name={user?.name} size={55} />
        <View>
          {user && (
            <Text className="font-semibold text-xl">
              Hey, {cortarStringEnPrimerEspacio(user?.name || 'Usuario')} 👋!
            </Text>
          )}
          <Text className="text-gray-500 font-normal text-lg leading-5">Listo para rentar?</Text>
        </View>
      </View>



        {loadingSucursales ? (
          <View className="mt-3 flex-row items-center">
            <ActivityIndicator size="small" />
            <Text className="ml-2 text-xs text-gray-500">
              Cargando sucursales...
            </Text>
          </View>
        ) : (
          renderSucursalChips()
        )}
      </View>

      {/* CONTENIDO */}
      <View className="flex-1 pt-3">
        {error && (
          <View className="mb-3 rounded-lg bg-red-100 p-2">
            <Text className="text-center text-xs text-red-700">{error}</Text>
          </View>
        )}

        {loadingCarros && carros.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="mt-2 text-sm text-gray-500">
              Cargando carros...
            </Text>
          </View>
        ) : (
          <FlatList
            data={carros}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <CarCard carro={item} onPress={() => handleCarPress(item)} />
            )}
            showsVerticalScrollIndicator={false}
            style={{ paddingTop: 8}}
            contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 23 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
              !loadingCarros ? (
                <View className="mt-10 items-center">
                  <Text className="text-sm text-gray-500">
                    No hay carros para esta sucursal.
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
