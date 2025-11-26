import Colors from "@/constants/colors";
import { useTransactions } from "@/contexts/TransactionsContext";
import { TransactionTypeLabels } from "@/types/transaction";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  Calendar,
  DollarSign,
  FileText,
  Hash,
  Phone,
  Tag,
  Trash2,
  User,
  Wallet,
} from "lucide-react-native";
import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams();
  const { transactions, deleteTransaction } = useTransactions();
  const router = useRouter();

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: "Transaction introuvable" }} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Transaction introuvable</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  const getTransactionColor = (type: string) => {
    const colors = Colors.light.categoryColors as any;
    return colors[type] || Colors.light.info;
  };

  const isIncome =
    transaction.type === "transfer_received" ||
    transaction.type === "deposit" ||
    transaction.type === "uemoa_received";

  const handleDelete = () => {
    Alert.alert(
      "Confirmer la suppression",
      "Êtes-vous sûr de vouloir supprimer cette transaction ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            deleteTransaction(transaction.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Détails",
          headerStyle: {
            backgroundColor: Colors.light.cardBackground,
          },
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.header,
            { backgroundColor: getTransactionColor(transaction.type) },
          ]}
        >
          <Text style={styles.headerLabel}>
            {TransactionTypeLabels[transaction.type]}
          </Text>
          <Text style={styles.headerAmount}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations générales</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Tag size={20} color={getTransactionColor(transaction.type)} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Type</Text>
                <Text style={styles.infoValue}>
                  {TransactionTypeLabels[transaction.type]}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <User size={20} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  {isIncome ? "Expéditeur" : "Destinataire"}
                </Text>
                <Text style={styles.infoValue}>{transaction.counterparty}</Text>
              </View>
            </View>

            {transaction.counterpartyPhone && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Phone size={20} color={Colors.light.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Téléphone</Text>
                  <Text style={styles.infoValue}>
                    {transaction.counterpartyPhone}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Calendar size={20} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date et heure</Text>
                <Text style={styles.infoValue}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails financiers</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <DollarSign
                  size={20}
                  color={isIncome ? Colors.light.income : Colors.light.expense}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Montant</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isIncome
                        ? Colors.light.income
                        : Colors.light.expense,
                    },
                  ]}
                >
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            </View>

            {transaction.fee > 0 && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <DollarSign size={20} color={Colors.light.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Frais</Text>
                  <Text style={[styles.infoValue, { color: Colors.light.warning }]}>
                    {formatCurrency(transaction.fee)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Wallet size={20} color={Colors.light.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Solde après transaction</Text>
                <Text style={[styles.infoValue, { color: Colors.light.info }]}>
                  {formatCurrency(transaction.balance)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations techniques</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Hash size={20} color={Colors.light.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>ID Transaction</Text>
                <Text style={styles.infoValue}>{transaction.transactionId}</Text>
              </View>
            </View>

            {transaction.reference && (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <FileText size={20} color={Colors.light.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Référence</Text>
                  <Text style={styles.infoValue}>{transaction.reference}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {transaction.rawMessage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Message original</Text>
            <View style={styles.rawMessageCard}>
              <Text style={styles.rawMessageText}>
                {transaction.rawMessage}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={20} color={Colors.light.cardBackground} />
            <Text style={styles.deleteButtonText}>Supprimer la transaction</Text>
          </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.textSecondary,
  },
  header: {
    padding: 32,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    opacity: 0.8,
  },
  headerAmount: {
    fontSize: 42,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
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
  infoCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    //elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  rawMessageCard: {
    backgroundColor: Colors.light.cardBackground,
    borderRadius: 1,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    //elevation: 1,
  },
  rawMessageText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    fontFamily: "monospace" as const,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.error,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 1,
    marginBottom: 32,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.cardBackground,
  },
});
