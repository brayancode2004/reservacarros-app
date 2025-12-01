// src/components/ReservaCard.tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import type { Reserva } from "../api/reservas";

type Props = {
  reserva: Reserva;
  onPress: () => void;
};

function formatDate(value?: string) {
  if (!value) return "N/D";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("es-NI", {
    day: "2-digit",
    month: "2-digit",
  });
}

function formatMoney(value?: number) {
  if (value == null) return "N/D";
  return `$${Number(value).toFixed(2)}`;
}

function EstadoBadge({ estado }: { estado: Reserva["estado"] | string }) {
  let bg = "bg-gray-100";
  let text = "text-gray-800";
  let icon: keyof typeof Ionicons.glyphMap = "time-outline";
  let label = (estado || "").toUpperCase();

  if (estado === "pendiente") {
    bg = "bg-amber-100";
    text = "text-amber-800";
    icon = "time-outline";
    label = "Pendiente";
  } else if (estado === "confirmada") {
    bg = "bg-green-100";
    text = "text-green-800";
    icon = "checkmark-circle-outline";
    label = "Confirmada";
  } else if (estado === "cancelada") {
    bg = "bg-red-100";
    text = "text-red-800";
    icon = "close-circle-outline";
    label = "Cancelada";
  } else if (estado === "completada") {
    bg = "bg-blue-100";
    text = "text-blue-800";
    icon = "flag-outline";
    label = "Completada";
  }

  return (
    <View
      className={`flex-row items-center gap-1 rounded-full px-3 py-1 ${bg}`}
    >
      <Ionicons name={icon} size={14} color="#4B5563" />
      <Text className={`text-[11px] font-semibold ${text}`}>{label}</Text>
    </View>
  );
}

export default function ReservaCard({ reserva, onPress }: Props) {
  const firstCar = (reserva.carros as any)?.[0];
  const tituloCarro = firstCar
    ? `${firstCar.marca ?? ""} ${firstCar.modelo ?? ""}`.trim() ||
      `Carro #${firstCar.id}`
    : `Reserva #${reserva.id}`;

  const sucursalRetiroName =
    (reserva as any).sucursal_retiro?.nombre ??
    (reserva as any).sucursal?.nombre ??
    null;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="mb-4 rounded-2xl bg-white"
      style={{
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 5,
        shadowOffset: { width: 1, height: 2 },
      }}
    >
      <View className="px-4 py-3">
        {/* FILA SUPERIOR */}
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[11px] font-semibold text-gray-400">
              Reserva #{reserva.id}
            </Text>
            <View className="mt-1 flex-row items-center gap-1.5">
              <Ionicons name="car-sport-outline" size={16} color="#1D4ED8" />
              <Text
                className="flex-1 text-sm font-semibold text-gray-900"
                numberOfLines={1}
              >
                {tituloCarro}
              </Text>
            </View>
            {sucursalRetiroName && (
              <Text className="mt-0.5 text-[11px] text-gray-500">
                Retiro en{" "}
                <Text className="font-medium">{sucursalRetiroName}</Text>
              </Text>
            )}
          </View>

          <EstadoBadge estado={reserva.estado} />
        </View>

        {/* TIMELINE SIMPLE DE FECHAS */}
        <View className="mt-3 flex-row">
          {/* Línea / bullets */}
          <View className="mr-3 items-center">
            <View className="h-3 w-3 rounded-full bg-blue-600" />
            <View className="w-[2px] flex-1 bg-blue-100" />
            <View className="h-3 w-3 rounded-full bg-emerald-400" />
          </View>

          {/* Fechas */}
          <View className="flex-1 justify-between gap-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] text-gray-400">Inicio</Text>
                <Text className="text-xs font-medium text-gray-800">
                  {formatDate(reserva.fecha_inicio)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            </View>

            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[10px] text-gray-400">Fin</Text>
                <Text className="text-xs font-medium text-gray-800">
                  {formatDate(reserva.fecha_fin)}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={14} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* TOTAL + CTA */}
        <View className="mt-3 flex-row items-center justify-between">
          <View>
            <Text className="text-[10px] text-gray-400">Total</Text>
            <Text className="text-base font-bold text-blue-600">
              {formatMoney(reserva.precio_total)}
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="mr-1 text-[11px] font-medium text-blue-600">
              Ver detalle
            </Text>
            <Ionicons name="chevron-forward" size={16} color="#2563EB" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
