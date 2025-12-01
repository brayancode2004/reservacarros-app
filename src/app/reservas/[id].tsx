import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getReserva, type Reserva } from "../../api/reservas";

export default function ReservaSummary() {
  const router = useRouter();
  const { id, from } = useLocalSearchParams<{ id: string, from: string }>();

  const reservaId = id ? Number(id) : NaN;

  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReserva = useCallback(async () => {
    if (!reservaId || Number.isNaN(reservaId)) {
      setError("ID de reserva no válido.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);
      const data = await getReserva(reservaId);
      setReserva(data);
    } catch (e: any) {
      console.log("Error cargando reserva", e?.response?.data || e?.message);
      setError("No se pudo cargar la información de la reserva.");
    } finally {
      setLoading(false);
    }
  }, [reservaId]);

  useEffect(() => {
    loadReserva();
  }, [loadReserva]);

  const formatDate = (value?: string) => {
    if (!value) return "N/D";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("es-NI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatMoney = (value?: number) => {
    if (value == null) return "N/D";
    return `$${Number(value).toFixed(2)}`;
  };

  const handleIrAPagar = () => {
    if (!reserva) return;

    if (reserva.estado !== "pendiente") {
      Alert.alert("No disponible", "Esta reserva ya no está pendiente de pago.");
      return;
    }

    router.push({
      pathname: "/reservas/paywall",
      params: {
        reservaId: String(reserva.id),
        total: reserva.precio_total.toString(),
      },
    });
  };

  const renderEstadoBadge = (estado: Reserva["estado"]) => {
    let bg = "bg-gray-100";
    let text = "text-gray-800";
    let icon: keyof typeof Ionicons.glyphMap = "time-outline";
    let label = estado.toUpperCase();

    if (estado === "pendiente") {
      bg = "bg-amber-100";
      text = "text-amber-800";
      icon = "time-outline";
      label = "Pendiente de pago";
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
      <View className={`self-start rounded-full px-3 py-1 flex-row items-center gap-1.5 ${bg}`}>
        <Ionicons name={icon} size={14} color="#4B5563" />
        <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" />
        <Text className="mt-2 text-sm text-gray-500">
          Cargando información de la reserva...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !reserva) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-center text-red-600">{error}</Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-600 px-4 py-2"
          onPress={loadReserva}
        >
          <Text className="font-semibold text-white">Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-3" onPress={() => router.back()}>
          <Text className="text-blue-600">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const puedePagar = reserva.estado === "pendiente";

  const nombreSucursalRetiro =
    (reserva as any).sucursal_retiro?.nombre ??
    `Sucursal #${reserva.sucursal_retiro_id}`;
  const nombreSucursalDevolucion =
    (reserva as any).sucursal_devolucion?.nombre ??
    `Sucursal #${reserva.sucursal_devolucion_id}`;

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
        onPress={() => {
            if (from === 'paywall') {
              router.replace('/(tabs)/two');
            } else {
              router.back();
            }
        }}
          className="mr-2 rounded-full bg-gray-100 p-1.5"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            Resumen de reserva
          </Text>
          <Text className="text-xs text-gray-500">
            #{reserva.id} · ¡Todo listo para tu viaje! 🚗
          </Text>
        </View>

        {renderEstadoBadge(reserva.estado)}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* CARD PRINCIPAL */}
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-xs font-semibold text-gray-400">
                RESERVA
              </Text>
              <Text className="mt-1 text-sm font-semibold text-gray-900">
                {reserva.usuario?.name ?? "Tu reserva de carro"}
              </Text>
            </View>
            <Ionicons name="car-sport-outline" size={24} color="#2563EB" />
          </View>

          <View className="mt-1 flex-row items-end justify-between">
            <View>
              <Text className="text-xs text-gray-400">Total</Text>
              <Text className="text-2xl font-bold text-blue-600">
                {formatMoney(reserva.precio_total)}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-[11px] text-gray-400">Estado</Text>
              <Text className="mt-0.5 text-xs font-semibold text-gray-800">
                {reserva.estado.charAt(0).toUpperCase() +
                  reserva.estado.slice(1)}
              </Text>
            </View>
          </View>

          <Text className="mt-3 text-[11px] text-gray-500">
            Este es un resumen visual de tu reserva. Puedes revisar las
            sucursales, fechas y los carros incluidos antes de continuar.
          </Text>
        </View>

        {/* SUCURSALES + FECHAS (TIMELINE) */}
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="mb-3 flex-row items-center gap-2">
            <Ionicons name="location-outline" size={18} color="#2563EB" />
            <Text className="text-sm font-semibold text-gray-900">
              Ruta de tu reserva
            </Text>
          </View>

          <View className="flex-row">
            {/* Línea / timeline */}
            <View className="items-center mr-3">
              <View className="h-3 w-3 rounded-full bg-blue-600" />
              <View className="w-[2px] flex-1 bg-blue-100" />
              <View className="h-3 w-3 rounded-full bg-emerald-500" />
            </View>

            {/* Info */}
            <View className="flex-1 gap-4">
              <View>
                <Text className="text-[11px] text-gray-400">
                  Sucursal de retiro
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {nombreSucursalRetiro}
                </Text>
                <Text className="mt-1 text-[11px] text-gray-500">
                  {formatDate(reserva.fecha_inicio)}
                </Text>
              </View>

              <View>
                <Text className="text-[11px] text-gray-400">
                  Sucursal de devolución
                </Text>
                <Text className="text-sm font-medium text-gray-900">
                  {nombreSucursalDevolucion}
                </Text>
                <Text className="mt-1 text-[11px] text-gray-500">
                  {formatDate(reserva.fecha_fin)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CARROS EN LA RESERVA */}
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="mb-3 flex-row items-center gap-2">
            <Ionicons name="clipboard-outline" size={18} color="#2563EB" />
            <Text className="text-sm font-semibold text-gray-900">
              Carros en la reserva
            </Text>
          </View>

          {(!reserva.carros || reserva.carros.length === 0) && (
            <Text className="mt-1 text-xs text-gray-500">
              No hay información de carros asociada.
            </Text>
          )}

          {reserva.carros && reserva.carros.length > 0 && (
            <View className="mt-1 gap-3">
              {reserva.carros.map((carro: any) => (
                <View
                  key={carro.id}
                  className="rounded-xl border border-gray-100 bg-slate-50 px-3 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-2">
                      <Text className="text-sm font-semibold text-gray-900">
                        {carro.marca} {carro.modelo}
                      </Text>
                      <Text className="text-[11px] text-gray-500 mt-0.5">
                        Placa:{" "}
                        <Text className="font-medium">{carro.placa}</Text>
                      </Text>
                    </View>
                    <Ionicons
                      name="car-outline"
                      size={20}
                      color="#6B7280"
                    />
                  </View>

                  {carro.pivot && (
                    <View className="mt-3 flex-row justify-between">
                      <View>
                        <Text className="text-[10px] text-gray-400">Días</Text>
                        <Text className="text-xs font-medium text-gray-800">
                          {carro.pivot.dias}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-[10px] text-gray-400">
                          Tarifa diaria
                        </Text>
                        <Text className="text-xs font-medium text-gray-800">
                          {formatMoney(carro.pivot.tarifa_diaria)}
                        </Text>
                      </View>
                      <View>
                        <Text className="text-[10px] text-gray-400">
                          Subtotal
                        </Text>
                        <Text className="text-xs font-semibold text-blue-600">
                          {formatMoney(carro.pivot.subtotal)}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View className="border-t border-gray-100 bg-white px-4 py-3">
        {puedePagar ? (
          <TouchableOpacity
            className="flex-row items-center justify-center rounded-full bg-blue-600 py-3"
            onPress={handleIrAPagar}
            activeOpacity={0.9}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color="#FFFFFF"
            />
            <Text className="ml-2 text-sm font-semibold text-white">
              Ir a pagar {formatMoney(reserva.precio_total)}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="flex-row items-center justify-center">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color="#6B7280"
            />
            <Text className="ml-1 text-[11px] text-gray-500">
              Esta reserva ya sido pagada.
            </Text>
          </View>
        )}

      </View>
    </SafeAreaView>
  );
}
