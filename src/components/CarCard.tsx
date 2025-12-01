import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import type { Carro } from "../api/carros";

type Props = {
  carro: Carro;
  onPress?: () => void;
};

export default function CarCard({ carro, onPress }: Props) {
  const fotoPrincipal =
    carro.fotos && carro.fotos.length > 0
      ? carro.fotos.find((f) => f.principal) || carro.fotos[0]
      : null;

  const isDisponible = carro.estado === "disponible";

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: { width: 1, height: 4 },
      }}
    >
      {/* Imagen */}
      {fotoPrincipal?.url ? (
        <Image
          source={{ uri: fotoPrincipal.url }}
          className="h-48 w-full bg-gray-100 border-b border-gray-200"
          resizeMode="cover"
          style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
        />
      ) : (
        <View className="h-48 w-full items-center justify-center bg-gray-100">
          <MaterialIcons name="directions-car" size={36} color="#9CA3AF" />
          <Text className="mt-2 text-xs text-gray-500">Sin foto disponible</Text>
        </View>
      )}

      {/* Contenido */}
      <View className="px-4 py-3 flex-row">
        
        {/* IZQUIERDA */}
        <View className="flex-1 pr-3 justify-between">
          <View>
            <Text className="text-lg font-semibold text-gray-900" numberOfLines={1}>
              {carro.marca} {carro.modelo}
            </Text>

            <Text className="mt-0.5 text-xs text-gray-500">
              {carro.anio} · {carro.sucursal?.nombre ?? "Sucursal N/D"}
            </Text>
          </View>

          <View className="mt-2">
            <Text
              className={`w-28 rounded-full px-3 py-1 text-xs font-semibold ${
                isDisponible
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {carro.estado.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* DERECHA (CENTRADO VERTICALMENTE) */}
        <View className="flex-2 selection:justify-center items-end">
          <Text className="text-[10px] uppercase tracking-wide text-gray-400">
            Tarifa diaria
          </Text>
          <Text className="text-lg font-semibold text-blue-600">
            ${Number(carro.tarifa_diaria).toFixed(2)}
            <Text className="text-xs text-gray-500">/día</Text>
          </Text>
        </View>

      </View>
    </TouchableOpacity>
  );
}
