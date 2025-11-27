import Colors from "@/constants/colors";
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
    const { acceptTerms } = useOnboarding();

    const handleAccept = () => {
        // Accepter d'abord les termes
        acceptTerms();

        // Appeler le callback si fourni
        onAccept?.();
    };

    return (
        <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Shield size={48} color={Colors.light.tint} />
                    </View>
                    <Text style={styles.title}>Conditions d'Utilisation</Text>
                    <Text style={styles.subtitle}>
                        Politique de Confidentialité et Sécurité
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <FileText size={20} color={Colors.light.tint} />
                        <Text style={styles.sectionTitle}>À propos de l'application</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        MTN MoMo Tracker est une application de gestion financière personnelle
                        qui vous aide à suivre vos transactions Mobile Money en lisant vos
                        notifications SMS de MTN MoMo.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Lock size={20} color={Colors.light.tint} />
                        <Text style={styles.sectionTitle}>Confidentialité des données</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>Vos données restent privées :</Text>
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>
                            • Toutes vos données sont stockées{" "}
                            <Text style={styles.bold}>localement sur votre appareil uniquement</Text>
                        </Text>
                        <Text style={styles.bullet}>
                            • Aucune donnée n'est envoyée à des serveurs externes
                        </Text>
                        <Text style={styles.bullet}>
                            • Aucune connexion internet n'est requise pour le fonctionnement
                        </Text>
                        <Text style={styles.bullet}>
                            • Nous ne collectons aucune information personnelle
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Eye size={20} color={Colors.light.tint} />
                        <Text style={styles.sectionTitle}>Lecture des SMS</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        L'application demande la permission de lire vos SMS uniquement pour :
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>
                            • Identifier les SMS de notifications MTN MoMo
                        </Text>
                        <Text style={styles.bullet}>
                            • Extraire les informations de transactions (montant, destinataire, etc.)
                        </Text>
                        <Text style={styles.bullet}>
                            • Créer un historique de vos transactions
                        </Text>
                    </View>
                    <Text style={styles.paragraph}>
                        <Text style={styles.bold}>Important :</Text> L'application lit uniquement
                        les SMS provenant de MTN MoMo. Vos autres SMS ne sont ni lus ni stockés.
                    </Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Shield size={20} color={Colors.light.tint} />
                        <Text style={styles.sectionTitle}>Sécurité</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        Vous pouvez activer la sécurité biométrique (empreinte digitale)
                        ou le code PIN pour protéger l'accès à vos données financières.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Responsabilités</Text>
                    <Text style={styles.paragraph}>
                        L'application est fournie "telle quelle" à titre informatif. Nous nous
                        efforçons d'assurer l'exactitude des données extraites, mais ne pouvons
                        garantir une précision à 100%. Veuillez vérifier vos transactions importantes
                        avec votre relevé officiel MTN MoMo.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suppression des données</Text>
                    <Text style={styles.paragraph}>
                        Vous pouvez supprimer toutes vos données à tout moment depuis les
                        paramètres de l'application. La désinstallation de l'application
                        supprimera également toutes les données stockées.
                    </Text>
                </View>

                <View style={styles.highlightBox}>
                    <Text style={styles.highlightText}>
                        En acceptant ces conditions, vous confirmez avoir compris comment
                        l'application fonctionne et comment vos données sont utilisées.
                    </Text>
                </View>
            </ScrollView>

            {showAcceptButton && (
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={handleAccept}
                    >
                        <Text style={styles.acceptButtonText}>
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
        backgroundColor: Colors.light.background,
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
        backgroundColor: `${Colors.light.tint}15`,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: "700" as const,
        color: Colors.light.text,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.light.textSecondary,
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
        color: Colors.light.text,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 24,
        color: Colors.light.text,
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
        color: Colors.light.text,
        marginBottom: 8,
    },
    highlightBox: {
        backgroundColor: `${Colors.light.tint}15`,
        borderLeftWidth: 4,
        borderLeftColor: Colors.light.tint,
        padding: 16,
        borderRadius: 8,
        marginTop: 16,
    },
    highlightText: {
        fontSize: 14,
        lineHeight: 22,
        color: Colors.light.text,
        fontWeight: "500" as const,
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: Colors.light.background,
        borderTopWidth: 1,
        borderTopColor: Colors.light.border,
    },
    acceptButton: {
        backgroundColor: Colors.light.tint,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    acceptButtonText: {
        fontSize: 16,
        fontWeight: "600" as const,
        color: Colors.light.cardBackground,
    },
});
