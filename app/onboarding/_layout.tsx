import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="disclaimer" />
      <Stack.Screen name="medication" />
      <Stack.Screen name="demographics" />
      <Stack.Screen name="duration" />
      <Stack.Screen name="goals" />
      <Stack.Screen name="symptoms" />
      <Stack.Screen name="struggles" />
      <Stack.Screen name="value" />
    </Stack>
  );
}
