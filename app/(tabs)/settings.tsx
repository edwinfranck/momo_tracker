import Colors from "@/constants/colors";
import { useTransactions } from "@/contexts/TransactionsContext";
import { Stack } from "expo-router";
import { AlertCircle, RefreshCw, Trash2 } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  const {
    transactions,
    clearAllTransactions,
    parseSMSMessages,
    isSaving,
    stats,
  } = useTransactions();
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
      const { readMTNMoMoSMSBodies } = await import("@/utils/smsReader");

      // Lire les SMS MTN MoMo des 90 derniers jours (max 200 SMS)
      const smsMessages = await readMTNMoMoSMSBodies(200, 90);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
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
            <Text style={styles.aboutText}>
              MTN MoMo Tracker vous aide à suivre et analyser vos transactions
              Mobile Money en lisant vos SMS de notification.
            </Text>
            <Text style={[styles.aboutText, styles.versionText]}>
              Version 1.0.0
            </Text>
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
    borderRadius: 12,
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
    borderRadius: 12,
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
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  warningText: {
    flex: 1,
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
});
