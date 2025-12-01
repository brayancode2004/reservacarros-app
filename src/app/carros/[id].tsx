import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCarro, type Carro } from "../../api/carros";

export default function CarroDetalle() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [carro, setCarro] = useState<Carro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFotoId, setSelectedFotoId] = useState<number | null>(null);

  const carroId = id ? Number(id) : NaN;

  const loadCarro = useCallback(async () => {
    if (!carroId || Number.isNaN(carroId)) {
      setError("ID de carro no válido.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const data = await getCarro(carroId);
      setCarro(data);

      // Definir foto seleccionada inicial (principal o la primera)
      if (data.fotos && data.fotos.length > 0) {
        const principal = data.fotos.find((f) => f.principal) || data.fotos[0];
        setSelectedFotoId(principal.id);
      } else {
        setSelectedFotoId(null);
      }
    } catch (e: any) {
      console.log("Error cargando carro", e?.response?.data || e?.message);
      setError("No se pudo cargar la información del carro.");
    } finally {
      setLoading(false);
    }
  }, [carroId]);

  useEffect(() => {
    loadCarro();
  }, [loadCarro]);

  const selectedFoto =
    carro?.fotos && carro.fotos.length > 0
      ? carro.fotos.find((f) => f.id === selectedFotoId) ||
        carro.fotos.find((f) => f.principal) ||
        carro.fotos[0]
      : null;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-2 text-sm text-gray-500">
          Cargando información del carro...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !carro) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-3 text-center text-red-600">{error}</Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-600 px-4 py-2"
          onPress={loadCarro}
        >
          <Text className="font-semibold text-white">Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-3" onPress={() => router.back()}>
          <Text className="text-blue-600">Volver atrás</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleReservar = () => {
    router.push({
      pathname: "/reservas/setup",
      params: { id: String(carro.id) },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER CUSTOM */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-2 rounded-full p-1.5 bg-gray-100"
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text
            className="text-base font-semibold text-gray-900"
            numberOfLines={1}
          >
            {carro.marca} {carro.modelo}
          </Text>
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            Detalle del vehículo
          </Text>
        </View>
      </View>

      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Imagen seleccionada en grande */}
          <View className="bg-white">
            {selectedFoto?.url ? (
              <Image
                source={{ uri: selectedFoto.url }}
                className="h-56 w-full bg-gray-200"
                resizeMode="cover"
              />
            ) : (
              <View className="h-56 w-full items-center justify-center bg-gray-200">
                <Text className="text-xs text-gray-500">
                  Sin foto disponible
                </Text>
              </View>
            )}
          </View>

          {/* Carrusel de miniaturas */}
          {carro.fotos && carro.fotos.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="bg-white px-3 py-3"
            >
              {carro.fotos.map((f) => {
                const isSelected = f.id === selectedFoto?.id;
                return (
                  <TouchableOpacity
                    key={f.id}
                    onPress={() => setSelectedFotoId(f.id)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: f.url }}
                      className="mr-2 h-16 w-20 rounded-md bg-gray-200"
                      resizeMode="cover"
                      style={
                        isSelected
                          ? {
                              borderWidth: 2,
                              borderColor: "#2563EB",
                            }
                          : undefined
                      }
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          {/* Info principal */}
          <View className="mt-2 bg-white px-4 py-4">
            <Text className="text-2xl font-bold text-gray-900">
              {carro.marca} {carro.modelo}
            </Text>
            <Text className="mt-1 text-sm text-gray-500">
              Placa: <Text className="font-medium">{carro.placa}</Text>
            </Text>

            <View className="mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-400">Sucursal</Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {carro.sucursal?.nombre ?? "N/D"}
                </Text>
              </View>

              <View className="items-end">
                <Text className="text-xs text-gray-400">Tarifa diaria</Text>
                <Text className="text-xl font-bold text-blue-600">
                  ${Number(carro.tarifa_diaria).toFixed(2)}
                </Text>
              </View>
            </View>

            <View className="mt-3 flex-row items-center">
              <Text className="mr-1 text-xs text-gray-400">Estado:</Text>
              <Text
                className={`rounded-full px-2 py-1 text-xs font-semibold ${
                  carro.estado === "disponible"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {carro.estado.toUpperCase()}
              </Text>
            </View>

            <View className="mt-3">
              <Text className="text-xs text-gray-400">Año</Text>
              <Text className="text-sm font-medium text-gray-800">
                {carro.anio}
              </Text>
            </View>
          </View>

          {/* Placeholder para texto adicional */}
          <View className="mt-2 bg-white px-4 py-4">
            <Text className="text-sm text-gray-700">
              Todos nuestros vehículos son entregados con el tanque lleno y en
              óptimas condiciones. Al momento de la devolución, se debe retornar
              también con el tanque lleno. 
            </Text>
          </View>
        </ScrollView>

        {/* FOOTER FIJO PARA RESERVA */}
        <View className="absolute bottom-4 left-0 right-0 px-6">
          <View className="rounded-3xl border border-gray-200 bg-white px-4 pt-3 pb-4 shadow-md">
            <View className="mb-3 flex-row items-center justify-between">
              <View>
                <Text className="text-xs text-gray-400">Tarifa diaria</Text>
                <Text className="text-lg font-semibold text-blue-600">
                  ${Number(carro.tarifa_diaria).toFixed(2)}{" "}
                  <Text className="text-xs text-gray-500">/día</Text>
                </Text>
              </View>
              <Text className="text-xs text-gray-500">
                Impuestos y cargos pueden aplicar
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleReservar}
              className="flex-row items-center justify-center rounded-full py-3"
              style={{
                backgroundColor: "#2563EB",
                shadowColor: "#000",
                shadowOpacity: 0.25,
                shadowOffset: { width: 0, height: 4 },
                shadowRadius: 6,
                elevation: 6,
              }}
              activeOpacity={0.9}
            >
              <FontAwesome5 name="car-side" size={18} color="#FFFFFF" />
              <Text className="ml-3 text-base font-semibold text-white">
                Reservar este carro
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
