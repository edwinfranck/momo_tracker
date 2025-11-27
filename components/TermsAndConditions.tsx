import { useTheme } from "@/contexts/ThemeContext";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { Shield, Lock, Eye, FileText } from "lucide-react-native";
import React from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface TermsAndConditionsProps {
    onAccept?: () => void;
    showAcceptButton?: boolean;
}

export default function TermsAndConditions({
    onAccept,
    showAcceptButton = true
}: TermsAndConditionsProps) {
    const { colors } = useTheme();
    const { acceptTerms } = useOnboarding();

    const handleAccept = () => {
        acceptTerms();
        onAccept?.();
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={[styles.iconContainer, { backgroundColor: `${colors.tint}15` }]}>
                        <Shield size={48} color={colors.tint} />
                    </View>
                    <Text style={[styles.title, { color: colors.text }]}>Conditions d'Utilisation</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Politique de Confidentialité & Sécurité
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FileText size={20} color={colors.tint} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos de l'application</Text>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        MTN MoMo Tracker est une application de gestion financière personnelle
                        qui vous aide à suivre vos transactions Mobile Money en lisant vos
                        notifications SMS de MTN MoMo.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Lock size={20} color={colors.tint} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Confidentialité des données</Text>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        <Text style={styles.bold}>Vos données restent privées :</Text>
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Toutes vos données sont stockées{" "}
                            <Text style={styles.bold}>localement sur votre appareil uniquement</Text>
                        </Text>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Aucune donnée n'est envoyée à des serveurs externes
                        </Text>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Aucune connexion internet n'est requise pour le fonctionnement
                        </Text>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Nous ne collectons aucune information personnelle
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Eye size={20} color={colors.tint} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Lecture des SMS</Text>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        L'application demande la permission de lire vos SMS uniquement pour :
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Identifier les SMS de notifications MTN MoMo
                        </Text>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Extraire les informations de transactions (montant, destinataire, etc.)
                        </Text>
                        <Text style={[styles.bullet, { color: colors.text }]}>
                            • Créer un historique de vos transactions
                        </Text>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        <Text style={styles.bold}>Important :</Text> L'application lit uniquement
                        les SMS provenant de MTN MoMo. Vos autres SMS ne sont ni lus ni stockés.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={20} color={colors.tint} />
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sécurité</Text>
                    </View>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        Vous pouvez activer la sécurité biométrique (empreinte digitale)
                        ou le code PIN pour protéger l'accès à vos données financières.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Responsabilités</Text>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        L'application est fournie "telle quelle" à titre informatif. Nous nous
                        efforçons d'assurer l'exactitude des données extraites, mais ne pouvons
                        garantir une précision à 100%. Veuillez vérifier vos transactions importantes
                        avec votre relevé officiel MTN MoMo.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Suppression des données</Text>
                    <Text style={[styles.paragraph, { color: colors.text }]}>
                        Vous pouvez supprimer toutes vos données à tout moment depuis les
                        paramètres de l'application. La désinstallation de l'application
                        supprimera également toutes les données stockées.
                    </Text>
                </View>

                <View style={[styles.highlightBox, { backgroundColor: `${colors.tint}15`, borderLeftColor: colors.tint }]}>
                    <Text style={[styles.highlightText, { color: colors.text }]}>
                        En acceptant ces conditions, vous confirmez avoir compris comment
                        l'application fonctionne et comment vos données sont utilisées.
                    </Text>
                </View>
            </ScrollView>

            {showAcceptButton && (
                <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
                    <TouchableOpacity
                        style={[styles.acceptButton, { backgroundColor: colors.tint }]}
                        onPress={handleAccept}
                    >
                        <Text style={[styles.acceptButtonText, { color: colors.cardBackground }]}>
                            J'accepte les Conditions d'Utilisation
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        alignItems: "center",
        marginBottom: 32,
    },
    iconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "700" as const,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "700" as const,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 12,
    },
    bold: {
        fontWeight: "600" as const,
    },
    bulletList: {
        marginLeft: 8,
        marginBottom: 12,
    },
    bullet: {
        fontSize: 15,
        lineHeight: 24,
        marginBottom: 8,
    },
    highlightBox: {
        borderLeftWidth: 4,
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    highlightText: {
        fontSize: 14,
        lineHeight: 22,
        fontWeight: "500" as const,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        borderTopWidth: 1,
    },
    acceptButton: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
    },
});
