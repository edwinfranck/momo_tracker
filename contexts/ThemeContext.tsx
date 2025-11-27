import Colors from "@/constants/colors";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { useColorScheme as useDeviceColorScheme } from "react-native";

const THEME_STORAGE_KEY = "@momo_tracker_theme";

export type ThemeMode = "light" | "dark" | "system";

export const [ThemeProvider, useTheme] = createContextHook(() => {
    const deviceColorScheme = useDeviceColorScheme();
    const [themeMode, setThemeMode] = useState<ThemeMode>("system");
    const [isLoaded, setIsLoaded] = useState(false);

    // Charger la préférence de thème au démarrage
    useEffect(() => {
        loadThemePreference();
    }, []);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
                setThemeMode(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error("Failed to load theme preference:", error);
        } finally {
            setIsLoaded(true);
        }
    };

    const setTheme = async (mode: ThemeMode) => {
        setThemeMode(mode);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error("Failed to save theme preference:", error);
        }
    };

    // Déterminer le schéma de couleurs actif (light ou dark)
    const activeColorScheme =
        themeMode === "system"
            ? deviceColorScheme || "light"
            : themeMode;

    // Obtenir les couleurs actuelles
    const colors = Colors[activeColorScheme];

    return {
        themeMode,
        activeColorScheme,
        colors,
        setTheme,
        isLoaded,
    };
});
