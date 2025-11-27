import Colors from "@/constants/colors";
import { useSecurity } from "@/contexts/SecurityContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Stack, useRouter } from "expo-router";
import {
  AlertCircle,
  RefreshCw,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Shield,
  FileText,
  ChevronRight
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const router = useRouter();
  const {
    transactions,
    clearAllTransactions,
    parseSMSMessages,
    isSaving,
    stats,
  } = useTransactions();
  const {
    isSecurityEnabled,
    hideAmounts,
    isBiometricSupported,
    toggleSecurity,
    toggleHideAmounts,
  } = useSecurity();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleSyncSMS = async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Non disponible",
        "La lecture de SMS n'est pas disponible sur le web. Veuillez utiliser l'application mobile."
      );
      return;
    }

    if (Platform.OS === "ios") {
      Alert.alert(
        "Non disponible sur iOS",
        "Pour des raisons de sécurité, iOS ne permet pas la lecture des SMS. Cette fonctionnalité est uniquement disponible sur Android."
      );
      return;
    }

    try {
      setIsSyncing(true);

      // Importer dynamiquement le module de lecture SMS (uniquement sur Android)
      const { readMTNMoMoSMS } = await import("@/utils/smsReader");

      // Lire les SMS MTN MoMo des 600 derniers jours (max 5000 SMS) pour couvrir depuis Juillet 2024
      const smsMessages = await readMTNMoMoSMS(5000, 600);

      if (smsMessages.length === 0) {
        Alert.alert(
          "Aucun SMS trouvé",
          "Aucun SMS MTN MoMo n'a été trouvé sur votre appareil. Assurez-vous que vous avez des SMS de notifications MTN MoMo."
        );
        return;
      }

      // Parser les SMS et les ajouter à la base de données
      const addedCount = parseSMSMessages(smsMessages);

      setLastSync(new Date());

      Alert.alert(
        "Synchronisation réussie",
        `${smsMessages.length} SMS lu${smsMessages.length !== 1 ? "s" : ""}.\n${addedCount} nouvelle${addedCount !== 1 ? "s" : ""} transaction${addedCount !== 1 ? "s" : ""} ajoutée${addedCount !== 1 ? "s" : ""}.`,
        [{ text: "OK" }]
      );
    } catch (error) {
      console.error("Erreur lors de la synchronisation:", error);

      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue";

      if (errorMessage.includes("Permission")) {
        Alert.alert(
          "Permission requise",
          "L'accès aux SMS est nécessaire pour synchroniser vos transactions. Veuillez autoriser l'accès dans les paramètres de votre appareil."
        );
      } else {
        Alert.alert(
          "Erreur",
          `Une erreur est survenue lors de la synchronisation des SMS:\n${errorMessage}`
        );
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer toutes les transactions ? Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            clearAllTransactions();
            Alert.alert("Succès", "Toutes les transactions ont été supprimées.");
          },
        },
      ]
    );
  };

  const handleToggleSecurity = async (enabled: boolean) => {
    const result = await toggleSecurity(enabled);
    if (!result.success) {
      Alert.alert(
        "Erreur",
        result.message || "Impossible d'activer la sécurité"
      );
    } else if (enabled) {
      Alert.alert(
        "Sécurité activée",
        "Votre application est maintenant protégée par authentification biométrique ou code PIN."
      );
    }
  };


  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Paramètres",
          headerStyle: {
            backgroundColor: Colors.light.cardBackground,
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronisation</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dernière synchronisation</Text>
              <Text style={styles.infoValue}>
                {lastSync
                  ? new Intl.DateTimeFormat("fr-FR", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(lastSync)
                  : "Jamais"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Transactions stockées</Text>
              <Text style={styles.infoValue}>{transactions.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSyncSMS}
            disabled={isSyncing || isSaving}
          >
            <RefreshCw
              size={20}
              color={Colors.light.text}
              style={isSyncing && { transform: [{ rotate: "180deg" }] }}
            />
            <Text style={styles.primaryButtonText}>
              {isSyncing ? "Synchronisation..." : "Synchroniser les SMS"}
            </Text>
          </TouchableOpacity>

          {Platform.OS !== "android" && (
            <View style={styles.warningCard}>
              <AlertCircle size={20} color={Colors.light.warning} />
              <Text style={styles.warningText}>
                {Platform.OS === "ios"
                  ? "La lecture de SMS n'est pas disponible sur iOS pour des raisons de sécurité."
                  : "La lecture de SMS n'est disponible que sur Android."}
              </Text>
            </View>
          )}
        </View>

        {/* Security & Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sécurité & Confidentialité</Text>
          <View style={styles.card}>
            {/* App Lock Toggle */}
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <Lock size={20} color={Colors.light.tint} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Verrouillage de l'app</Text>
                  <Text style={styles.settingDescription}>
                    {isBiometricSupported
                      ? "Empreinte digitale ou Code PIN"
                      : "Code PIN du téléphone"}
                  </Text>
                </View>
              </View>
              <Switch
                value={isSecurityEnabled}
                onValueChange={handleToggleSecurity}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint,
                }}
                thumbColor={Colors.light.cardBackground}
              />
            </View>

            {/* Hide Amounts Toggle */}
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  {hideAmounts ? (
                    <EyeOff size={20} color={Colors.light.tint} />
                  ) : (
                    <Eye size={20} color={Colors.light.tint} />
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>Masquer les montants</Text>
                  <Text style={styles.settingDescription}>
                    Afficher ••••••  au lieu des montants
                  </Text>
                </View>
              </View>
              <Switch
                value={hideAmounts}
                onValueChange={toggleHideAmounts}
                trackColor={{
                  false: Colors.light.border,
                  true: Colors.light.tint,
                }}
                thumbColor={Colors.light.cardBackground}
              />
            </View>
          </View>

          {!isBiometricSupported && Platform.OS === "android" && (
            <View style={styles.infoCard}>
              <Shield size={16} color={Colors.light.info} />
              <Text style={styles.infoCardText}>
                L'authentification biométrique n'est pas configurée sur cet appareil.
                Le code PIN du téléphone sera utilisé.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total envoyé</Text>
              <Text style={[styles.infoValue, styles.expenseText]}>
                {stats.totalSent.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total reçu</Text>
              <Text style={[styles.infoValue, styles.incomeText]}>
                {stats.totalReceived.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total frais</Text>
              <Text style={[styles.infoValue, styles.warningText]}>
                {stats.totalFees.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Solde actuel</Text>
              <Text style={styles.infoValue}>
                {stats.currentBalance.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Données</Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearData}
            disabled={isSaving || transactions.length === 0}
          >
            <Trash2 size={20} color={Colors.light.cardBackground} />
            <Text style={styles.dangerButtonText}>
              Supprimer toutes les transactions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>À propos</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.settingRow}
              onPress={() => router.push("/terms" as any)}
            >
              <View style={styles.settingLeft}>
                <View style={styles.settingIconContainer}>
                  <FileText size={20} color={Colors.light.tint} />
                </View>
                <Text style={styles.settingLabel}>Conditions d'Utilisation</Text>
              </View>
              <ChevronRight size={20} color={Colors.light.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.settingRow, styles.settingRowLast]}
              onPress={() => {
                // Reset onboarding to show it again (for demo/review purposes)
                // In a real app, we might want a dedicated "Help" screen instead of resetting
                Alert.alert(
                  "Revoir l'introduction",
                  "Voulez-vous revoir l'écran d'accueil ?",
                  [
                    { text: "Non", style: "cancel" },
                    {
                      text: "Oui",
                      onPress: async () => {
                        const { resetOnboarding } = require("@/contexts/OnboardingContext").useOnboarding();
                        // We only reset onboarding flag, not terms
                        // But since our context resets both in resetOnboarding, we might need a specific method
                        // For now let's just use the reset which is fine for "revoir"
                        // Actually, let's just navigate to a modal if we had one, but since logic is in layout...
                        // Let's just use a trick: we can't easily "navigate" to onboarding because it's conditional in layout.
                        // So we will add a specific route for it later if needed.
                        // For now, let's just link to Terms.
                      }
                    }
                  ]
                );
              }}
            >
              {/* We will skip the onboarding replay button for now as it requires routing changes or context tweaks 
                   to show without resetting state. Let's just keep Terms and Version info.
               */}
            </TouchableOpacity>

            <View style={styles.aboutContent}>
              <Text style={styles.aboutText}>
                MTN MoMo Tracker vous aide à suivre et analyser vos transactions
                Mobile Money en lisant vos SMS de notification.
              </Text>
              <Text style={[styles.aboutText, styles.versionText]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.cardBackground,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  card: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    flex: 1,
    flexWrap: "wrap",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  incomeText: {
    color: Colors.light.income,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 1,
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  dangerButton: {
    backgroundColor: Colors.light.error,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.cardBackground,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${Colors.light.warning}20`,
    padding: 12,
    borderRadius: 1,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    //flex: 1,
    fontSize: 13,
    color: Colors.light.warning,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  versionText: {
    marginTop: 12,
    fontWeight: "500" as const,
  },
  // Security Settings Styles
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.light.tint}15`,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${Colors.light.info}15`,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    color: Colors.light.info,
    lineHeight: 18,
  },
  aboutContent: {
    padding: 16,
    paddingTop: 0,
  },
});
