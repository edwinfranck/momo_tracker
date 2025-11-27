import LockScreen from "@/components/LockScreen";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isSecurityEnabled, isAuthenticated } = useSecurity();

  // Show lock screen if security is enabled and not authenticated
  if (isSecurityEnabled && !isAuthenticated) {
    return <LockScreen />;
  }

  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="transaction/[id]"
        options={{
          title: "Détails",
          presentation: "card"
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SecurityProvider>
        <TransactionsProvider>
          <GestureHandlerRootView>
            <RootLayoutNav />
          </GestureHandlerRootView>
        </TransactionsProvider>
      </SecurityProvider>
    </QueryClientProvider>
  );
}
