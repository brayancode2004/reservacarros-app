// app/(tabs)/user.tsx
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const { user, signOut, loading } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white px-6 pt-10">
      <View className="items-center mb-8">
        <UserAvatar name={user?.name} size={110} />
        <Text className="mt-4 text-2xl font-bold text-gray-900">
          {user?.name}
        </Text>
        <Text className="mt-1 text-gray-500">{user?.email}</Text>
      </View>

      <View className="mt-20">
        <Pressable
        onPress={handleLogout}
        className="flex-row items-center justify-center rounded-xl bg-red-500 py-3"
        style={({ pressed }) => ({
            opacity: pressed ? 0.8 : 1,
        })}
        >
            <MaterialIcons name="logout" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-base">Cerrar sesión</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
