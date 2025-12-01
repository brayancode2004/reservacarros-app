import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text } from "react-native";

interface UserAvatarProps {
  name?: string;
  size?: number;
}

export default function UserAvatar({ name = "?", size = 96 }: UserAvatarProps) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <LinearGradient
      colors={["#60A5FA", "#2563EB"]} // azul claro → azul fuerte
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: "white",
          fontWeight: "bold",
          fontSize: size * 0.43,
        }}
      >
        {initial}
      </Text>
    </LinearGradient>
  );
}
