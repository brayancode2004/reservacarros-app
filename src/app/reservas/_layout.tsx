import { Stack } from 'expo-router'
import React from 'react'

export default function Reservalayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='setup' />
      <Stack.Screen name='paywall' />
    </Stack>
  )
}
