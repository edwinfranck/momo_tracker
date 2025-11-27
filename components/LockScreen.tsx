import Colors from "@/constants/colors";
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
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <Lock size={64} color={Colors.light.tint} />
                </View>

                <Text style={styles.title}>Application verrouillée</Text>
                <Text style={styles.subtitle}>
                    Authentifiez-vous pour accéder à vos transactions
                </Text>

                <TouchableOpacity
                    style={styles.unlockButton}
                    onPress={handleAuthenticate}
                    disabled={isAuthenticating}
                >
                    {isAuthenticating ? (
                        <ActivityIndicator color={Colors.light.cardBackground} />
                    ) : (
                        <>
                            <Lock size={20} color={Colors.light.cardBackground} />
                            <Text style={styles.unlockButtonText}>Déverrouiller</Text>
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
        backgroundColor: Colors.light.background,
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
        backgroundColor: `${Colors.light.tint}20`,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: "700" as const,
        color: Colors.light.text,
        marginBottom: 12,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
        textAlign: "center",
        marginBottom: 48,
        lineHeight: 24,
    },
    unlockButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.light.tint,
        paddingVertical: 16,
        paddingHorizontal: 32,
        borderRadius: 12,
        gap: 8,
        minWidth: 200,
    },
    unlockButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: Colors.light.cardBackground,
    },
});
