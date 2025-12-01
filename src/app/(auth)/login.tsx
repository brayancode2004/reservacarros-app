import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { getErrorMessage } from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    try {
      setLoading(true);
      await signIn(email, password);
      router.replace("/(tabs)");
    } catch (err: any) {
      console.log("LOGIN ERROR", err?.response?.data || err?.message);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const goToRegister = () => {
    router.push("/(auth)/register");
  };

  return (
    <View className="flex-1 bg-white">
      <KeyboardAwareScrollView
        enableOnAndroid
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={24}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
        }}
      >
        <View className="w-full max-w-md self-center">
          {/* Header / branding */}
          <View className="mb-8 items-center">
            <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Text className="text-2xl">🚗</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-900">
              Reserva de carros
            </Text>
            <Text className="mt-1 text-center text-sm text-gray-500">
              Inicia sesión para gestionar tus reservas
            </Text>
          </View>

          {/* Card */}
          <View className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            {error && (
              <Text className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-xs text-red-700">
                {error}
              </Text>
            )}

            <View className="mb-4">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Correo electrónico
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base"
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ lineHeight: 0}}
              />
            </View>

            <View className="mb-2">
              <Text className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contraseña
              </Text>
              <TextInput
                className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-base"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                style={{ lineHeight: 0}}
              />
            </View>

            <View className="mb-4 items-end">
              <Text className="text-xs text-gray-400">
                (Proyecto académico – demo)
              </Text>
            </View>

            <Pressable
              className="mt-1 items-center rounded-xl bg-blue-600 py-3"
              style={({ pressed }) => ({
                opacity: pressed || loading ? 0.7 : 1,
              })}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Iniciar sesión
                </Text>
              )}
            </Pressable>
          </View>

          {/* Link abajo */}
          <View className="mt-6 items-center">
            <Text className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <Text
                className="font-semibold text-blue-600"
                onPress={goToRegister}
              >
                Regístrate
              </Text>
            </Text>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}
