import LockScreen from "@/components/LockScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import TermsAndConditions from "@/components/TermsAndConditions";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isSecurityEnabled, isAuthenticated } = useSecurity();
  const {
    areTermsAccepted,
    isOnboardingCompleted,
    isLoading: onboardingLoading
  } = useOnboarding();

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Show Onboarding if not completed
  if (!isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  // Show Terms and Conditions if not accepted
  if (!areTermsAccepted) {
    return <TermsAndConditions />;
  }

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
      <OnboardingProvider>
        <SecurityProvider>
          <TransactionsProvider>
            <GestureHandlerRootView>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </TransactionsProvider>
        </SecurityProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
