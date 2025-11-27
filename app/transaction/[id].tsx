import { useTheme } from "@/contexts/ThemeContext";
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
  const { colors } = useTheme();
  const { id } = useLocalSearchParams();
  const { transactions, deleteTransaction } = useTransactions();
  const router = useRouter();

  const transaction = transactions.find((t) => t.id === id);

  if (!transaction) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]}>
        <Stack.Screen options={{ title: "Transaction introuvable" }} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Transaction introuvable</Text>
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
    const categoryColors = colors.categoryColors as any;
    return categoryColors[type] || colors.info;
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]} edges={["top"]}>
      <Stack.Screen
        options={{
          title: "Détails",
          headerStyle: {
            backgroundColor: colors.cardBackground,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.header,
            { backgroundColor: getTransactionColor(transaction.type) },
          ]}
        >
          <Text style={[styles.headerLabel, { color: colors.cardBackground }]}>
            {TransactionTypeLabels[transaction.type]}
          </Text>
          <Text style={[styles.headerAmount, { color: colors.cardBackground }]}>
            {isIncome ? "+" : "-"}
            {formatCurrency(transaction.amount)}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations générales</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Tag size={20} color={getTransactionColor(transaction.type)} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Type</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {TransactionTypeLabels[transaction.type]}
                </Text>
              </View>
            </View>

            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <User size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
                  {isIncome ? "Expéditeur" : "Destinataire"}
                </Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{transaction.counterparty}</Text>
              </View>
            </View>

            {transaction.counterpartyPhone && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                  <Phone size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Téléphone</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {transaction.counterpartyPhone}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Calendar size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Date et heure</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatDate(transaction.date)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Détails financiers</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <DollarSign
                  size={20}
                  color={isIncome ? colors.income : colors.expense}
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Montant</Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: isIncome
                        ? colors.income
                        : colors.expense,
                    },
                  ]}
                >
                  {formatCurrency(transaction.amount)}
                </Text>
              </View>
            </View>

            {transaction.fee > 0 && (
              <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                  <DollarSign size={20} color={colors.warning} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Frais</Text>
                  <Text style={[styles.infoValue, { color: colors.warning }]}>
                    {formatCurrency(transaction.fee)}
                  </Text>
                </View>
              </View>
            )}

            <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Wallet size={20} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Solde après transaction</Text>
                <Text style={[styles.infoValue, { color: colors.info }]}>
                  {formatCurrency(transaction.balance)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Informations techniques</Text>

          <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.infoRow, { borderBottomColor: transaction.reference ? colors.border : "transparent" }]}>
              <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                <Hash size={20} color={colors.textSecondary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>ID Transaction</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{transaction.transactionId}</Text>
              </View>
            </View>

            {transaction.reference && (
              <View style={[styles.infoRow, { borderBottomColor: "transparent" }]}>
                <View style={[styles.infoIcon, { backgroundColor: colors.background }]}>
                  <FileText size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Référence</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>{transaction.reference}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {transaction.rawMessage && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Message original</Text>
            <View style={[styles.rawMessageCard, { backgroundColor: colors.cardBackground }]}>
              <Text style={[styles.rawMessageText, { color: colors.textSecondary }]}>
                {transaction.rawMessage}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={handleDelete}
          >
            <Trash2 size={20} color="#FFFFFF" />
            <Text style={[styles.deleteButtonText, { color: "#FFFFFF" }]}>Supprimer la transaction</Text>
          </TouchableOpacity>
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
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "600" as const,
  },
  header: {
    padding: 32,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    opacity: 0.9,
  },
  headerAmount: {
    fontSize: 42,
    fontWeight: "700" as const,
    marginTop: 8,
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
  infoCard: {
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
  rawMessageCard: {
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  rawMessageText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "monospace" as const,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 32,
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
  },
});
