import { useTheme } from "@/contexts/ThemeContext";
import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  ArrowRightLeft,
  Settings,
  Bell
} from "lucide-react-native";
import React from "react";
import { Pressable, View, StyleSheet, Platform, useColorScheme } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Mapping des icônes pour chaque route
const icons: Record<string, any> = {
  index: LayoutDashboard,
  transactions: ArrowRightLeft,
  notifications: Bell,
  settings: Settings,
};

// Labels personnalisés pour chaque route
const labels: Record<string, string> = {
  index: "Accueil",
  transactions: "Transac.",
  notifications: "Notifs",
  settings: "Paramètres",
};

export default function TabLayout() {
  const { colors } = useTheme();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 70,
          backgroundColor: colors.cardBackground,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },


      }}
      tabBar={({ state, descriptors, navigation }) => {
        return (
          <View
            style={[
              styles.tabBarContainer,
              {
                backgroundColor: colors.cardBackground,
                borderTopColor: colors.border,
              }
            ]}
          >
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const Icon = icons[route.name] || LayoutDashboard;
              const label = labels[route.name] || route.name;

              // Couleur de l'icône et du texte
              // En mode sombre, le jaune (#FFCC00) passe bien sur fond noir
              // En mode clair, on fonce le jaune pour le contraste
              const activeColor = isDark
                ? colors.tint
                : (colors.tint === "#FFCC00" ? "#B45309" : colors.tint);

              const inactiveColor = colors.textSecondary;

              return (
                <View
                  key={route.key}
                  style={styles.tabItemContainer}
                >
                  <AnimatedPressable
                    onPress={() => {
                      const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                      });

                      if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                      }
                    }}
                    layout={LinearTransition.springify().mass(0.5)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[
                      styles.tabItem,
                      {
                        backgroundColor: isFocused
                          ? `${colors.tint}25` // 25 = ~15% d'opacité
                          : "transparent",
                        paddingHorizontal: isFocused ? 20 : 0,
                      }
                    ]}
                  >
                    <Icon
                      size={24}
                      color={isFocused ? activeColor : inactiveColor}
                    />

                    {isFocused && (
                      <Animated.Text
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        style={[
                          styles.tabLabel,
                          { color: activeColor }
                        ]}
                        numberOfLines={1}
                      >
                        {label}
                      </Animated.Text>
                    )}
                  </AnimatedPressable>
                </View>
              );
            })}
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tableau de bord",
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Notifications",
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Paramètres",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: Platform.OS === 'ios' ? 85 : 70,
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
    //borderTopWidth: 1,
    elevation: 0, // Supprime l'ombre sur Android
  },
  tabItemContainer: {
    //flex: 1,
    height: "100%",
    alignItems: "center",
    //justifyContent: "center",
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 44,
    borderRadius: 8, // Pillule parfaite
    minWidth: 44,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
});
