import LockScreen from "@/components/LockScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import PermissionsScreen from "@/components/PermissionsScreen";
import TermsAndConditions from "@/components/TermsAndConditions";
import { OnboardingProvider, useOnboarding } from "@/contexts/OnboardingContext";
import { SecurityProvider, useSecurity } from "@/contexts/SecurityContext";
import { TransactionsProvider } from "@/contexts/TransactionsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
// import * as ScreenCapture from "expo-screen-capture"; // À décommenter après installation
import React, { useEffect } from "react";
import { ActivityIndicator, View, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isSecurityEnabled, isAuthenticated } = useSecurity();
  const {
    areTermsAccepted,
    isOnboardingCompleted,
    arePermissionsRequested,
    isLoading: onboardingLoading,
    markPermissionsRequested,
  } = useOnboarding();

  const { colors, activeColorScheme } = useTheme();

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 1. Show Permissions Screen FIRST (before onboarding)
  if (!arePermissionsRequested) {
    return <PermissionsScreen onComplete={markPermissionsRequested} />;
  }

  // 2. Show Onboarding if not completed
  if (!isOnboardingCompleted) {
    return <OnboardingScreen />;
  }

  // 3. Show Terms and Conditions if not accepted
  if (!areTermsAccepted) {
    return <TermsAndConditions />;
  }

  // 4. Show lock screen if security is enabled and not authenticated
  if (isSecurityEnabled && !isAuthenticated) {
    return <LockScreen />;
  }



  return (
    <>
      <StatusBar style={activeColorScheme === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerBackTitle: "Retour",
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="transaction/[id]"
          options={{
            title: "Détails",
            presentation: "card",
          }}
        />
        <Stack.Screen
          name="notifications"
          options={{
            title: "Notifications",
            presentation: "card",
          }}
        />
      </Stack>
    </>
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
          <ThemeProvider>
            <NotificationsProvider>
              <TransactionsProvider>
                <GestureHandlerRootView>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </TransactionsProvider>
            </NotificationsProvider>
          </ThemeProvider>
        </SecurityProvider>
      </OnboardingProvider>
    </QueryClientProvider>
  );
}
