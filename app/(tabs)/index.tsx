import Colors from "@/constants/colors";
import { useSecurity } from "@/contexts/SecurityContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { TransactionTypeLabels } from "@/types/transaction";
import { Stack, useRouter } from "expo-router";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react-native";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { stats, transactions } = useTransactions();
  const { formatAmount } = useSecurity();
  const router = useRouter();

  const recentTransactions = transactions.slice(0, 5);

  const formatCurrency = (amount: number) => {
    return formatAmount(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionColor = (type: string) => {
    const colors = Colors.light.categoryColors as any;
    return colors[type] || Colors.light.info;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Tableau de bord",
          headerStyle: {
            backgroundColor: Colors.light.background,
          },
          headerTintColor: Colors.light.text,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: "700" as const,
          },
        }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Solde actuel</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(stats.currentBalance)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <ArrowUpCircle size={16} color={Colors.light.income} />
              <Text style={styles.balanceStatText}>
                {stats.receivedCount} reçus
              </Text>
            </View>
            <View style={styles.balanceStat}>
              <ArrowDownCircle size={16} color={Colors.light.expense} />
              <Text style={styles.balanceStatText}>
                {stats.sentCount} envoyés
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.incomeCard]}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={Colors.light.income} />
            </View>
            <Text style={styles.statLabel}>Total reçu</Text>
            <Text style={[styles.statValue, styles.incomeText]}>
              {formatCurrency(stats.totalReceived)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.expenseCard]}>
            <View style={styles.statIconContainer}>
              <TrendingDown size={24} color={Colors.light.expense} />
            </View>
            <Text style={styles.statLabel}>Total envoyé</Text>
            <Text style={[styles.statValue, styles.expenseText]}>
              {formatCurrency(stats.totalSent)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.feesCard]}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={Colors.light.warning} />
            </View>
            <Text style={styles.statLabel}>Total frais</Text>
            <Text style={[styles.statValue, styles.feesText]}>
              {formatCurrency(stats.totalFees)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.countCard]}>
            <View style={styles.statIconContainer}>
              <Receipt size={24} color={Colors.light.info} />
            </View>
            <Text style={styles.statLabel}>Transactions</Text>
            <Text style={[styles.statValue, styles.countText]}>
              {stats.transactionCount}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push("/transactions" as any)}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet size={48} color={Colors.light.tabIconDefault} />
              <Text style={styles.emptyStateText}>
                Aucune transaction trouvée
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Synchronisez vos SMS MTN MoMo pour commencer
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() =>
                    router.push(`/transaction/${transaction.id}` as any)
                  }
                >
                  <View
                    style={[
                      styles.transactionIcon,
                      {
                        backgroundColor: `${getTransactionColor(transaction.type)}20`,
                      },
                    ]}
                  >
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 1,
                        backgroundColor: getTransactionColor(transaction.type),
                      }}
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={styles.transactionType}>
                      {TransactionTypeLabels[transaction.type]}
                    </Text>
                    <Text style={styles.transactionCounterparty}>
                      {transaction.counterparty}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {formatDate(transaction.date)}
                    </Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text
                      style={[
                        styles.transactionAmountText,
                        {
                          color:
                            transaction.type === "transfer_received" ||
                              transaction.type === "deposit" ||
                              transaction.type === "uemoa_received"
                              ? Colors.light.income
                              : Colors.light.expense,
                        },
                      ]}
                    >
                      {transaction.type === "transfer_received" ||
                        transaction.type === "deposit" ||
                        transaction.type === "uemoa_received"
                        ? "+"
                        : "-"}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  balanceCard: {
    backgroundColor: Colors.light.background,
    margin: 16,
    padding: 24,
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: Colors.light.text,
    opacity: 0.8,
    fontWeight: "500" as const,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: Colors.light.text,
    marginTop: 8,
  },
  balanceStats: {
    flexDirection: "row",
    marginTop: 16,
    gap: 16,
  },
  balanceStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceStatText: {
    fontSize: 13,
    color: Colors.light.text,
    fontWeight: "500" as const,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    width: (width - 44) / 2,
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.income,
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.expense,
  },
  feesCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.warning,
  },
  countCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.info,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 4,
  },
  incomeText: {
    color: Colors.light.income,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  feesText: {
    color: Colors.light.warning,
  },
  countText: {
    color: Colors.light.info,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.light.text,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: "600" as const,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  transactionsList: {
    gap: 12,
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionContent: {
    flex: 1,
  },
  transactionType: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  transactionCounterparty: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
});
