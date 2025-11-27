import { useTheme } from "@/contexts/ThemeContext";
import { requestAllPermissions, hasAllPermissions } from "@/utils/permissionsService";
import { Shield, MessageSquare, Bell, CheckCircle } from "lucide-react-native";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface PermissionsScreenProps {
    onComplete: () => void;
}

export default function PermissionsScreen({ onComplete }: PermissionsScreenProps) {
    const { colors } = useTheme();
    const [isRequesting, setIsRequesting] = useState(false);

    const handleRequestPermissions = async () => {
        setIsRequesting(true);

        try {
            const granted = await requestAllPermissions();

            if (granted) {
                console.log('✅ Toutes les permissions accordées, passage à l\'onboarding');
            } else {
                console.log('⚠️ Certaines permissions refusées, mais on continue');
            }

            // Continuer vers l'onboarding dans tous les cas
            // L'utilisateur pourra synchroniser manuellement s'il refuse les permissions
            onComplete();
        } catch (error) {
            console.error('Erreur lors de la demande de permissions:', error);
            // Continuer quand même
            onComplete();
        } finally {
            setIsRequesting(false);
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.tint}15` }]}>
                    <Shield size={80} color={colors.tint} />
                </View>

                <Text style={[styles.title, { color: colors.text }]}>
                    Permissions Requises
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Pour que ton app fonctionne correctement, on a besoin de quelques autorisations
                </Text>

                <View style={styles.permissionsList}>
                    <View style={styles.permissionItem}>
                        <View style={[styles.permissionIcon, { backgroundColor: `${colors.income}15` }]}>
                            <MessageSquare size={24} color={colors.income} />
                        </View>
                        <View style={styles.permissionText}>
                            <Text style={[styles.permissionTitle, { color: colors.text }]}>
                                Lire les SMS
                            </Text>
                            <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                                Pour récupérer tes transactions MTN MoMo automatiquement.
                                On lit SEULEMENT les SMS de Mobile Money, rien d'autre.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.permissionItem}>
                        <View style={[styles.permissionIcon, { backgroundColor: `${colors.warning}15` }]}>
                            <MessageSquare size={24} color={colors.warning} />
                        </View>
                        <View style={styles.permissionText}>
                            <Text style={[styles.permissionTitle, { color: colors.text }]}>
                                Recevoir les SMS
                            </Text>
                            <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                                Pour détecter les nouvelles transactions en temps réel quand tu reçois un SMS MTN MoMo.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.permissionItem}>
                        <View style={[styles.permissionIcon, { backgroundColor: `${colors.expense}15` }]}>
                            <Bell size={24} color={colors.expense} />
                        </View>
                        <View style={styles.permissionText}>
                            <Text style={[styles.permissionTitle, { color: colors.text }]}>
                                Notifications
                            </Text>
                            <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                                Pour te notifier quand une nouvelle transaction est détectée.
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.noteBox, { backgroundColor: `${colors.success}15`, borderLeftColor: colors.success }]}>
                    <CheckCircle size={20} color={colors.success} />
                    <Text style={[styles.noteText, { color: colors.text }]}>
                        Toutes tes données restent sur ton téléphone. Rien n'est envoyé sur Internet.
                    </Text>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.continueButton, { backgroundColor: colors.tint }]}
                    onPress={handleRequestPermissions}
                    disabled={isRequesting}
                >
                    {isRequesting ? (
                        <ActivityIndicator color={colors.cardBackground} />
                    ) : (
                        <Text style={[styles.continueButtonText, { color: colors.cardBackground }]}>
                            Autoriser les Permissions
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.skipButton}
                    onPress={onComplete}
                    disabled={isRequesting}
                >
                    <Text style={[styles.skipText, { color: colors.textSecondary }]}>
                        Passer (synchronisation manuelle uniquement)
                    </Text>
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
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    iconContainer: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        marginBottom: 32,
    },
    title: {
        fontSize: 28,
        fontWeight: "700" as const,
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
        textAlign: "center",
        marginBottom: 40,
    },
    permissionsList: {
        gap: 20,
        marginBottom: 32,
    },
    permissionItem: {
        flexDirection: "row",
        gap: 16,
    },
    permissionIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    permissionText: {
        flex: 1,
    },
    permissionTitle: {
        fontSize: 16,
        fontWeight: "600" as const,
        marginBottom: 4,
    },
    permissionDescription: {
        fontSize: 14,
        lineHeight: 20,
    },
    noteBox: {
        flexDirection: "row",
        gap: 12,
        padding: 16,
        borderRadius: 8,
        borderLeftWidth: 4,
        alignItems: "center",
    },
    noteText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: "500" as const,
    },
    footer: {
        padding: 24,
        gap: 12,
    },
    continueButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    continueButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
    },
    skipButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    skipText: {
        fontSize: 14,
        fontWeight: "500" as const,
    },
});
