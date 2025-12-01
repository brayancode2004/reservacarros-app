import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { updateReserva } from "@/src/api/reservas";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { createPago, type CreatePagoPayload } from "../../api/pagos";

export default function Paywall() {
  const router = useRouter();
  const { reservaId, total } = useLocalSearchParams<{
    reservaId: string;
    total: string;
  }>();

  const reservaIdNum = Number(reservaId);
  const totalNum = Number(total || 0);

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);

  // helpers de formato
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.slice(i, i + 4));
    }
    return parts.join(" ");
  };

  const handleCardNumberChange = (text: string) => {
    setCardNumber(formatCardNumber(text));
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  };

  const handleExpiryChange = (text: string) => {
    setExpiry(formatExpiry(text));
  };

  const handleCvvChange = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 4);
    setCvv(digits);
  };

    const handlePay = async () => {
    if (!reservaIdNum || Number.isNaN(reservaIdNum)) {
        Alert.alert(
        "Error",
        "La reserva no es válida. Vuelve a intentarlo desde el catálogo."
        );
        return;
    }

    const rawCard = cardNumber.replace(/\s/g, "");
    const expiryDigits = expiry.replace(/\D/g, "");

    if (!rawCard || !cardName || !expiry || !cvv) {
        Alert.alert("Datos incompletos", "Completa los datos de la tarjeta.");
        return;
    }

    if (rawCard.length < 16) {
        Alert.alert("Número inválido", "El número de tarjeta debe tener 16 dígitos.");
        return;
    }

    if (expiryDigits.length < 4) {
        Alert.alert(
        "Fecha inválida",
        "La fecha de expiración debe tener formato MM/AA."
        );
        return;
    }

    if (cvv.length < 3) {
        Alert.alert("CVV inválido", "El CVV debe tener al menos 3 dígitos.");
        return;
    }

    try {
        setProcessing(true);

        // 💳 Simulación de pasarela
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const referenciaFake =
        "FAKE-" +
        Math.floor(Math.random() * 1_000_000)
            .toString()
            .padStart(6, "0");

        const payload: CreatePagoPayload = {
        reserva_id: reservaIdNum,
        monto: totalNum,
        metodo: "tarjeta",
        fecha_pago: new Date().toISOString(),
        referencia: referenciaFake,
        estado: "pagado",
        };

        // 1) Crear pago
        await createPago(payload);

        // 2) Marcar reserva como confirmada
        await updateReserva(reservaIdNum, { estado: "confirmada" });

        Alert.alert(
        "Pago exitoso 🎉",
        "Tu reserva ha sido pagada y confirmada.",
        [
            {
            text: "Aceptar",
            onPress: () => {
                router.replace({
                pathname: "/reservas/[id]",
                params: { id: String(reservaIdNum), from: "paywall" },
                });
            },
            },
        ]
        );

    } catch (e: any) {
        console.log("Error creando pago / confirmando reserva", e?.response?.data || e?.message);
        Alert.alert(
        "Error",
        "No se pudo procesar el pago. Intenta nuevamente."
        );
    } finally {
        setProcessing(false);
    }
    };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAwareScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumen de la reserva */}
        <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <Text className="text-xs font-semibold text-gray-400">
            RESUMEN DE PAGO
          </Text>
          <Text className="mt-2 text-sm text-gray-600">
            Reserva #{reservaIdNum || "N/D"}
          </Text>

          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-base text-gray-800">Total a pagar</Text>
            <Text className="text-2xl font-bold text-blue-600">
              ${totalNum.toFixed(2)}
            </Text>
          </View>

          <Text className="mt-2 text-xs text-gray-400">
            Esta es una simulación de pasarela de pago solo para fines
            académicos.
          </Text>
        </View>

        {/* Tarjeta preview */}
        <LinearGradient
          colors={["#2563EB", "#1D4ED8"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 4,
          }}
        >
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-xs text-blue-100 font-medium">
                Tarjeta de crédito
              </Text>
              <Text className="text-sm text-white font-semibold mt-1">
                Simulación segura
              </Text>
            </View>
            <MaterialCommunityIcons
              name="credit-card-outline"
              size={28}
              color="#E5E7EB"
            />
          </View>

          <Text className="text-lg tracking-[3px] text-white font-semibold mb-4">
            {cardNumber || "4242 4242 4242 4242"}
          </Text>

          <View className="flex-row justify-between items-end">
            <View>
              <Text className="text-[10px] text-blue-100 uppercase">
                Titular
              </Text>
              <Text
                className="text-sm text-white font-semibold mt-1"
                numberOfLines={1}
              >
                {cardName || "NOMBRE DEL TITULAR"}
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[10px] text-blue-100 uppercase">
                Expira
              </Text>
              <Text className="text-sm text-white font-semibold mt-1">
                {expiry || "MM/AA"}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Datos de tarjeta */}
        <View className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
          <Text className="mb-3 text-base font-semibold text-gray-900">
            Paga con tarjeta
          </Text>

          {/* Número */}
          <Text className="mb-1 text-xs text-gray-500">Número de tarjeta</Text>
          <View className="mb-3 flex-row items-center rounded-lg border border-gray-200 px-3 py-2">
            <Ionicons name="card-outline" size={18} color="#9CA3AF" />
            <TextInput
              value={cardNumber}
              onChangeText={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              className="ml-2 flex-1 text-sm text-gray-900"
              style={{ lineHeight: 0}}
            />
          </View>

          {/* Nombre */}
          <Text className="mb-1 text-xs text-gray-500">Nombre en la tarjeta</Text>
          <View className="mb-3 flex-row items-center rounded-lg border border-gray-200 px-3 py-2">
            <Ionicons name="person-outline" size={18} color="#9CA3AF" />
            <TextInput
              value={cardName}
              onChangeText={setCardName}
              placeholder="Nombre completo"
              autoCapitalize="characters"
              className="ml-2 flex-1 text-sm text-gray-900"
              style={{ lineHeight: 0}}
            />
          </View>

          {/* Expiry + CVV */}
          <View className="mb-3 flex-row gap-3">
            <View className="flex-1">
              <Text className="mb-1 text-xs text-gray-500">
                Fecha de expiración
              </Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 px-3 py-2">
                <Ionicons name="calendar-outline" size={18} color="#9CA3AF" />
                <TextInput
                  value={expiry}
                  onChangeText={handleExpiryChange}
                  placeholder="MM/AA"
                  keyboardType="number-pad"
                  className="ml-2 flex-1 text-sm text-gray-900"
                  maxLength={5}
                  style={{ lineHeight: 0}}
                />
              </View>
            </View>

            <View className="w-24">
              <Text className="mb-1 text-xs text-gray-500">CVV</Text>
              <View className="flex-row items-center rounded-lg border border-gray-200 px-3 py-2">
                <Ionicons name="lock-closed-outline" size={18} color="#9CA3AF" />
                <TextInput
                  value={cvv}
                  onChangeText={handleCvvChange}
                  placeholder="123"
                  secureTextEntry
                  keyboardType="number-pad"
                  className="ml-2 flex-1 text-sm text-gray-900"
                  maxLength={4}
                  style={{ lineHeight: 0}}
                />
              </View>
            </View>
          </View>

          <Text className="mt-1 text-[11px] text-gray-400">
            No se realizará ningún cargo real. Este flujo es solo demostrativo
            para la clase de Servicios Web.
          </Text>

          {/* Botón pagar */}
          <TouchableOpacity
            disabled={processing}
            onPress={handlePay}
            className={`mt-4 items-center rounded-full py-3 ${
              processing ? "bg-blue-300" : "bg-blue-600"
            }`}
            activeOpacity={0.9}
          >
            {processing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View className="flex-row items-center gap-2">
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                <Text className="text-sm font-semibold text-white">
                  Pagar ahora
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            className="mt-3 items-center"
            onPress={() => router.replace('/(tabs)/two')}
          >
            <Text className="text-xs text-gray-500">Cancelar y Salir</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
