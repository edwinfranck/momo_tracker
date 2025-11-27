import createContextHook from "@nkzw/create-context-hook";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const SECURITY_ENABLED_KEY = "security_enabled";
const HIDE_AMOUNTS_KEY = "hide_amounts";

export const [SecurityProvider, useSecurity] = createContextHook(() => {
    const [isSecurityEnabled, setIsSecurityEnabled] = useState(false);
    const [hideAmounts, setHideAmounts] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);

    // Load settings on mount
    useEffect(() => {
        loadSettings();
        checkBiometricSupport();
    }, []);

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);
    };

    const loadSettings = async () => {
        try {
            const securityEnabled = await SecureStore.getItemAsync(SECURITY_ENABLED_KEY);
            const hideAmountsValue = await SecureStore.getItemAsync(HIDE_AMOUNTS_KEY);

            setIsSecurityEnabled(securityEnabled === "true");
            setHideAmounts(hideAmountsValue === "true");

            // If security is enabled, require authentication
            if (securityEnabled === "true") {
                setIsAuthenticated(false);
            } else {
                setIsAuthenticated(true);
            }
        } catch (error) {
            console.error("Error loading security settings:", error);
            setIsAuthenticated(true); // Default to unlocked if error
        }
    };

    const toggleSecurity = async (enabled: boolean) => {
        try {
            if (enabled) {
                // Verify biometric/PIN is available before enabling
                const result = await authenticate();
                if (!result.success) {
                    return { success: false, message: result.message };
                }
            }

            await SecureStore.setItemAsync(SECURITY_ENABLED_KEY, enabled.toString());
            setIsSecurityEnabled(enabled);
            setIsAuthenticated(!enabled); // If disabled, auto-authenticate

            return { success: true };
        } catch (error) {
            console.error("Error toggling security:", error);
            return { success: false, message: "Une erreur est survenue" };
        }
    };

    const toggleHideAmounts = async () => {
        try {
            const newValue = !hideAmounts;
            await SecureStore.setItemAsync(HIDE_AMOUNTS_KEY, newValue.toString());
            setHideAmounts(newValue);
        } catch (error) {
            console.error("Error toggling hide amounts:", error);
        }
    };

    const authenticate = async (): Promise<{ success: boolean; message?: string }> => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: "Authentifiez-vous pour accéder",
                fallbackLabel: "Utiliser le code PIN",
                cancelLabel: "Annuler",
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsAuthenticated(true);
                return { success: true };
            } else {
                return {
                    success: false,
                    message: "Authentification échouée",
                };
            }
        } catch (error) {
            console.error("Authentication error:", error);
            return {
                success: false,
                message: "Une erreur est survenue lors de l'authentification",
            };
        }
    };

    const lockApp = () => {
        if (isSecurityEnabled) {
            setIsAuthenticated(false);
        }
    };

    const formatAmount = (amount: number, currency = "FCFA") => {
        if (hideAmounts) {
            return "••••••";
        }
        return `${amount.toLocaleString("fr-FR")} ${currency}`;
    };

    return {
        isSecurityEnabled,
        hideAmounts,
        isAuthenticated,
        isBiometricSupported,
        toggleSecurity,
        toggleHideAmounts,
        authenticate,
        lockApp,
        formatAmount,
    };
});
