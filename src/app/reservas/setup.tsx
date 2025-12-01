import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/context/AuthContext";
import { getCarro, type Carro } from "../../api/carros";
import {
  createReserva,
  type CreateReservaPayload,
} from "../../api/reservas";
import { listSucursales, type Sucursal } from "../../api/sucursales";

export default function SetupReserva() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const carroId = id ? Number(id) : NaN;

  const [carro, setCarro] = useState<Carro | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);

  const [sucursalRetiroId, setSucursalRetiroId] = useState<number | null>(null);
  const [sucursalDevolucionId, setSucursalDevolucionId] =
    useState<number | null>(null);

  const [fechaInicio, setFechaInicio] = useState<Date>(new Date());
  const [fechaFin, setFechaFin] = useState<Date>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });

  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper formato fecha
  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  // días de alquiler (mínimo 1)
  const dias = useMemo(() => {
    const start = new Date(
      fechaInicio.getFullYear(),
      fechaInicio.getMonth(),
      fechaInicio.getDate()
    );
    const end = new Date(
      fechaFin.getFullYear(),
      fechaFin.getMonth(),
      fechaFin.getDate()
    );
    const diffMs = end.getTime() - start.getTime();
    let d = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (d < 1) d = 1;
    return d;
  }, [fechaInicio, fechaFin]);

  const total = useMemo(() => {
    if (!carro?.tarifa_diaria) return 0;
    const tarifa = Number(carro.tarifa_diaria);
    if (Number.isNaN(tarifa)) return 0;
    return tarifa * dias;
  }, [carro, dias]);

  // Cargar carro y sucursales
  const loadData = useCallback(async () => {
    if (!carroId || Number.isNaN(carroId)) {
      setError("ID de carro no válido.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const [carroData, sucursalesData] = await Promise.all([
        getCarro(carroId),
        listSucursales(),
      ]);

      setCarro(carroData);
      setSucursales(sucursalesData);

      // Sucursal del carro por defecto para ambas
      if (carroData.sucursal?.id) {
        setSucursalRetiroId(carroData.sucursal?.id);
        setSucursalDevolucionId(carroData.sucursal_id);
      }
    } catch (e: any) {
      console.log(
        "Error cargando datos de reserva",
        e?.response?.data || e?.message
      );
      setError("No se pudo cargar la información para la reserva.");
    } finally {
      setLoading(false);
    }
  }, [carroId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // handlers datepicker
  const onChangeInicio = (event: DateTimePickerEvent, date?: Date) => {
    // Siempre cerramos el picker cuando hay cambio o dismiss
    setShowPickerInicio(false);
    setShowPickerFin(false);

    if (event.type === "dismissed" || !date) return;

    setFechaInicio(date);
    if (date > fechaFin) {
      const newEnd = new Date(date);
      newEnd.setDate(newEnd.getDate() + 1);
      setFechaFin(newEnd);
    }
  };

  const onChangeFin = (event: DateTimePickerEvent, date?: Date) => {
    setShowPickerFin(false);
    setShowPickerInicio(false);

    if (event.type === "dismissed" || !date) return;
    setFechaFin(date);
  };

  const formatForApi = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      ` ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
  };

  const handleIrAPagar = async () => {
    if (!carro) return;

    if (!user?.id) {
      Alert.alert(
        "Sesión requerida",
        "No se encontró el usuario actual. Vuelve a iniciar sesión."
      );
      return;
    }

    if (!sucursalRetiroId || !sucursalDevolucionId) {
      Alert.alert(
        "Sucursal requerida",
        "Selecciona sucursal de retiro y devolución."
      );
      return;
    }

    try {
      setSaving(true);

      const payload: CreateReservaPayload = {
        usuario_id: user.id,
        sucursal_retiro_id: sucursalRetiroId,
        sucursal_devolucion_id: sucursalDevolucionId,
        fecha_inicio: formatForApi(fechaInicio),
        fecha_fin: formatForApi(fechaFin),
        carros: [
          {
            carro_id: carro.id,
            dias,
          },
        ],
      };

      const reserva = await createReserva(payload);

      router.push({
        pathname: "/reservas/paywall",
        params: {
          reservaId: String(reserva.id),
          total: total.toFixed(2), // para mostrar el monto en el paywall
        },
      });
    } catch (e: any) {
      console.log(
        "Error creando reserva",
        e?.response?.data || e?.message
      );
      Alert.alert(
        "Error",
        "No se pudo crear la reserva. Intenta nuevamente."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-2 text-sm text-gray-500">
          Cargando datos de la reserva...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !carro) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-6">
        <Text className="mb-2 text-center text-red-600">{error}</Text>
        <TouchableOpacity
          className="rounded-lg bg-blue-600 px-4 py-2"
          onPress={loadData}
        >
          <Text className="font-semibold text-white">Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-3" onPress={() => router.back()}>
          <Text className="text-blue-600">Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const sucursalRetiro = sucursales.find((s) => s.id === sucursalRetiroId);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="flex-row items-center border-b border-gray-100 bg-white px-4 py-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mr-2 rounded-full bg-gray-100 p-1.5"
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            Configurar reserva
          </Text>
          <Text className="text-xs text-gray-500">
            Completa los datos para continuar
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen de carro */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <Text className="mb-1 text-xs text-gray-400">
            Carro seleccionado
          </Text>
          <Text className="text-lg font-semibold text-gray-900">
            {carro.marca} {carro.modelo}
          </Text>
          <Text className="mt-1 text-sm text-gray-500">
            Placa: <Text className="font-medium">{carro.placa}</Text>
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-gray-400">Tarifa diaria</Text>
              <Text className="text-base font-semibold text-blue-600">
                $
                {carro.tarifa_diaria != null
                  ? Number(carro.tarifa_diaria).toFixed(2)
                  : "0.00"}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-xs text-gray-400">Sucursal actual</Text>
              <Text className="text-sm font-medium text-gray-800">
                {carro.sucursal?.nombre ?? "N/D"}
              </Text>
            </View>
          </View>
        </View>

        {/* Sucursales */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <Text className="mb-3 text-base font-semibold text-gray-900">
            Sucursales
          </Text>

          {/* Sucursal de retiro (FIXED) */}
          <View className="mb-3">
            <Text className="mb-1 text-xs text-gray-400">
              Sucursal de retiro (fija)
            </Text>
            <View className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <Text className="text-sm font-medium text-gray-800">
                {sucursalRetiro?.nombre ?? carro.sucursal?.nombre ?? "N/D"}
              </Text>
              <Text className="text-[10px] font-semibold uppercase text-gray-400">
                No editable
              </Text>
            </View>
          </View>

          {/* Sucursal de devolución (editable) */}
          <Text className="mb-1 text-xs text-gray-400">
            Sucursal de devolución
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-1"
          >
            {sucursales.map((s) => {
              const selected = sucursalDevolucionId === s.id;
              return (
                <TouchableOpacity
                  key={`dev-${s.id}`}
                  onPress={() => setSucursalDevolucionId(s.id)}
                  className={`mr-2 rounded-full border px-3 py-1.5 ${
                    selected
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      selected ? "text-white" : "text-gray-700"
                    }`}
                  >
                    {s.nombre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Fechas */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <Text className="mb-3 text-base font-semibold text-gray-900">
            Fechas de la reserva
          </Text>

          <View className="mb-3 flex-row justify-between">
            {/* Fecha inicio */}
            <View className="mr-2 flex-1">
              <Text className="mb-1 text-xs text-gray-400">
                Fecha de inicio
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-300 px-3 py-2"
                onPress={() => {
                  setShowPickerInicio(true);
                  setShowPickerFin(false);
                }}
              >
                <Text className="text-sm text-gray-800">
                  {formatDate(fechaInicio)}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Fecha fin */}
            <View className="ml-2 flex-1">
              <Text className="mb-1 text-xs text-gray-400">
                Fecha de fin
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-between rounded-lg border border-gray-300 px-3 py-2"
                onPress={() => {
                  setShowPickerFin(true);
                  setShowPickerInicio(false);
                }}
              >
                <Text className="text-sm text-gray-800">
                  {formatDate(fechaFin)}
                </Text>
                <Ionicons name="calendar-outline" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Solo 1 datepicker a la vez */}
          {showPickerInicio && (
            <DateTimePicker
              value={fechaInicio}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeInicio}
            />
          )}

          {showPickerFin && (
            <DateTimePicker
              value={fechaFin}
              mode="date"
              display={Platform.OS === "ios" ? "inline" : "default"}
              onChange={onChangeFin}
            />
          )}

          <Text className="mt-2 text-xs text-gray-500">
            Duración:{" "}
            <Text className="font-semibold">
              {dias} día{dias !== 1 ? "s" : ""}
            </Text>
          </Text>
        </View>

        {/* Resumen */}
        <View className="mb-4 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900">
              Total estimado
            </Text>
            <Text className="text-2xl font-bold text-blue-600">
              ${total.toFixed(2)}
            </Text>
          </View>
          <Text className="text-xs text-gray-500">
            Este monto es un estimado según la tarifa diaria y los días
            seleccionados. En la siguiente pantalla podrás confirmar y realizar
            el pago.
          </Text>
        </View>

        {/* Botón */}
        <TouchableOpacity
          disabled={saving}
          className={`items-center rounded-full py-3 ${
            saving ? "bg-blue-300" : "bg-blue-600"
          }`}
          onPress={handleIrAPagar}
          activeOpacity={0.9}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? "Creando reserva..." : "Ir a pagar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
