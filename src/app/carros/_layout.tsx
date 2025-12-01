import { Stack } from 'expo-router'
import React from 'react'

export default function Carroslayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='[id]' />
    </Stack>
  )
}
