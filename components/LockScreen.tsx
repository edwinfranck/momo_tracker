import { useTheme } from "@/contexts/ThemeContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { Lock } from "lucide-react-native";
import React, { useEffect } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LockScreen() {
    const { colors } = useTheme();
    const { authenticate, isAuthenticated } = useSecurity();
    const [isAuthenticating, setIsAuthenticating] = React.useState(false);

    useEffect(() => {
        // Auto-trigger authentication when screen mounts
        handleAuthenticate();
    }, []);

    const handleAuthenticate = async () => {
        if (isAuthenticated) return;

        setIsAuthenticating(true);
        await authenticate();
        setIsAuthenticating(false);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.tint}20` }]}>
                    <Lock size={64} color={colors.tint} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>Ton DJAI est verrouillé</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Authentifiez-vous pour accéder à vos transactions
                </Text>

                <TouchableOpacity
                    style={[styles.unlockButton, { backgroundColor: colors.tint }]}
                    onPress={handleAuthenticate}
                    disabled={isAuthenticating}
                >
                    {isAuthenticating ? (
                        <ActivityIndicator color={colors.cardBackground} />
                    ) : (
                        <>
                            <Lock size={20} color={colors.cardBackground} />
                            <Text style={[styles.unlockButtonText, { color: colors.cardBackground }]}>Déverrouiller</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
    },
    iconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700" as const,
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 48,
        lineHeight: 24,
    },
    unlockButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
        minWidth: 200,
    },
    unlockButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
    },
});
