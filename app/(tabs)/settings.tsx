import { useTheme, ThemeMode } from "@/contexts/ThemeContext";
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
  ChevronRight,
  Bell,
  Moon,
  Sun,
  Smartphone
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
  const { colors, themeMode, setTheme } = useTheme();
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

  const renderThemeOption = (mode: ThemeMode, icon: React.ReactNode, label: string) => {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          isSelected && { backgroundColor: `${colors.tint}20`, borderColor: colors.tint }
        ]}
        onPress={() => setTheme(mode)}
      >
        {icon}
        <Text style={[
          styles.themeOptionLabel,
          { color: isSelected ? colors.tint : colors.textSecondary }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Paramètres",
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>

        {/* Apparence Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Apparence</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.themeSelector}>
              {renderThemeOption("light", <Sun size={24} color={themeMode === "light" ? colors.tint : colors.textSecondary} />, "Clair")}
              {renderThemeOption("dark", <Moon size={24} color={themeMode === "dark" ? colors.tint : colors.textSecondary} />, "Sombre")}
              {renderThemeOption("system", <Smartphone size={24} color={themeMode === "system" ? colors.tint : colors.textSecondary} />, "Système")}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Synchronisation</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Dernière synchronisation</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
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
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Transactions stockées</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>{transactions.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.primaryButton, { backgroundColor: colors.tint }]}
            onPress={handleSyncSMS}
            disabled={isSyncing || isSaving}
          >
            <RefreshCw
              size={20}
              color={colors.text}
              style={isSyncing && { transform: [{ rotate: "180deg" }] }}
            />
            <Text style={[styles.primaryButtonText, { color: colors.text }]}>
              {isSyncing ? "Synchronisation..." : "Synchroniser les SMS"}
            </Text>
          </TouchableOpacity>

          {Platform.OS !== "android" && (
            <View style={[styles.warningCard, { backgroundColor: `${colors.warning}20` }]}>
              <AlertCircle size={20} color={colors.warning} />
              <Text style={[styles.warningText, { color: colors.warning }]}>
                {Platform.OS === "ios"
                  ? "La lecture de SMS n'est pas disponible sur iOS pour des raisons de sécurité."
                  : "La lecture de SMS n'est disponible que sur Android."}
              </Text>
            </View>
          )}

          {Platform.OS === "android" && (
            <View style={[styles.infoCard, { backgroundColor: `${colors.success}15` }]}>
              <Shield size={16} color={colors.success} />
              <Text style={[styles.infoCardText, { color: colors.success }]}>
                ✅ Synchronisation automatique activée ! Les nouvelles transactions
                MTN MoMo seront détectées en temps réel et vous recevrez une notification.
              </Text>
            </View>
          )}

          {/* Test Notification Button */}
          {Platform.OS === "android" && (
            <View style={{ gap: 12 }}>
              <TouchableOpacity
                style={[styles.button, styles.testButton, { backgroundColor: `${colors.info}20`, borderColor: colors.info }]}
                onPress={async () => {
                  try {
                    const { showTransactionNotification } = await import("@/utils/notificationService");
                    const testTransaction = {
                      id: "test-" + Date.now(),
                      type: "withdrawal" as const,
                      amount: 5000,
                      fee: 0,
                      balance: 45000,
                      counterparty: "Test ATM",
                      date: new Date(),
                      transactionId: "TEST123",
                      rawMessage: "Test notification",
                    };
                    await showTransactionNotification(testTransaction);
                    Alert.alert("Test envoyé", "Vérifiez votre barre de notification !");
                  } catch (error) {
                    console.error("Erreur test notification:", error);
                    Alert.alert("Erreur", "Impossible d'afficher la notification de test");
                  }
                }}
              >
                <AlertCircle size={20} color={colors.info} />
                <Text style={[styles.testButtonText, { color: colors.info }]}>
                  Tester notif native
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.testButton, { backgroundColor: `${colors.info}20`, borderColor: colors.info }]}
                onPress={async () => {
                  Alert.alert(
                    "Test In-App",
                    "Pour tester les notifications in-app, envoyez un SMS de test ou attendez une transaction réelle. Vous verrez la cloche sonner sur l'accueil !"
                  );
                }}
              >
                <Bell size={20} color={colors.info} />
                <Text style={[styles.testButtonText, { color: colors.info }]}>
                  Info notif in-app
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security & Privacy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sécurité & Confidentialité</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            {/* App Lock Toggle */}
            <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.tint}15` }]}>
                  <Lock size={20} color={colors.tint} />
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Verrouillage de l'app</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
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
                  false: colors.border,
                  true: colors.tint,
                }}
                thumbColor={colors.cardBackground}
              />
            </View>

            {/* Hide Amounts Toggle */}
            <View style={[styles.settingRow, styles.settingRowLast]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.tint}15` }]}>
                  {hideAmounts ? (
                    <EyeOff size={20} color={colors.tint} />
                  ) : (
                    <Eye size={20} color={colors.tint} />
                  )}
                </View>
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Masquer les montants</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    Afficher ••••••  au lieu des montants
                  </Text>
                </View>
              </View>
              <Switch
                value={hideAmounts}
                onValueChange={toggleHideAmounts}
                trackColor={{
                  false: colors.border,
                  true: colors.tint,
                }}
                thumbColor={colors.cardBackground}
              />
            </View>
          </View>

          {!isBiometricSupported && Platform.OS === "android" && (
            <View style={[styles.infoCard, { backgroundColor: `${colors.info}15` }]}>
              <Shield size={16} color={colors.info} />
              <Text style={[styles.infoCardText, { color: colors.info }]}>
                L'authentification biométrique n'est pas configurée sur cet appareil.
                Le code PIN du téléphone sera utilisé.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Statistiques</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total envoyé</Text>
              <Text style={[styles.infoValue, { color: colors.expense }]}>
                {stats.totalSent.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total reçu</Text>
              <Text style={[styles.infoValue, { color: colors.income }]}>
                {stats.totalReceived.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Total frais</Text>
              <Text style={[styles.infoValue, { color: colors.warning }]}>
                {stats.totalFees.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Solde actuel</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {stats.currentBalance.toLocaleString("fr-FR")} FCFA
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Données</Text>
          <TouchableOpacity
            style={[styles.button, styles.dangerButton, { backgroundColor: colors.error }]}
            onPress={handleClearData}
            disabled={isSaving || transactions.length === 0}
          >
            <Trash2 size={20} color={colors.cardBackground} />
            <Text style={[styles.dangerButtonText, { color: colors.cardBackground }]}>
              Supprimer toutes les transactions
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>À propos</Text>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <TouchableOpacity
              style={[styles.settingRow, { borderBottomColor: colors.border }]}
              onPress={() => router.push("/terms" as any)}
            >
              <View style={styles.settingLeft}>
                <View style={[styles.settingIconContainer, { backgroundColor: `${colors.tint}15` }]}>
                  <FileText size={20} color={colors.tint} />
                </View>
                <Text style={[styles.settingLabel, { color: colors.text }]}>Conditions d'Utilisation</Text>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} />
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
              <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                MTN MoMo Tracker vous aide à suivre et analyser vos transactions
                Mobile Money en lisant vos SMS de notification.
              </Text>
              <Text style={[styles.aboutText, styles.versionText, { color: colors.textSecondary }]}>
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
  },
  container: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginBottom: 12,
  },
  card: {
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  themeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  themeOptionLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,

  },
  infoLabel: {
    fontSize: 15,
    flex: 1,
    flexWrap: "wrap",
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "600" as const,
  },
  expenseText: {
    // color set dynamically
  },
  incomeText: {
    // color set dynamically
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  primaryButton: {
    // backgroundColor set dynamically
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  dangerButton: {
    // backgroundColor set dynamically
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    //flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  aboutText: {
    fontSize: 14,
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
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  infoCardText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  aboutContent: {
    padding: 16,
    paddingTop: 0,
  },
  testButton: {
    borderWidth: 1,
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
