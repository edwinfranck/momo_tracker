import Colors from "@/constants/colors";
import { useTransactions } from "@/contexts/TransactionsContext";
import {
  Transaction,
  TransactionCategories,
  TransactionType,
  TransactionTypeLabels,
} from "@/types/transaction";
import { Stack, useRouter } from "expo-router";
import { Filter, Search } from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionsScreen() {
  const {
    filteredTransactions,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
  } = useTransactions();
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString("fr-FR")} FCFA`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getTransactionColor = (type: string) => {
    const colors = Colors.light.categoryColors as any;
    return colors[type] || Colors.light.info;
  };

  // Calculate totals based on filtered transactions
  const calculateTotals = () => {
    let totalReceived = 0;
    let totalSent = 0;
    let totalFees = 0;

    filteredTransactions.forEach((transaction) => {
      const isIncome =
        transaction.type === "transfer_received" ||
        transaction.type === "deposit" ||
        transaction.type === "uemoa_received";

      if (isIncome) {
        totalReceived += transaction.amount;
      } else {
        totalSent += transaction.amount;
      }
      totalFees += transaction.fee;
    });

    return {
      totalReceived,
      totalSent,
      totalFees,
      netBalance: totalReceived - totalSent - totalFees,
    };
  };

  const totals = calculateTotals();

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome =
      item.type === "transfer_received" ||
      item.type === "deposit" ||
      item.type === "uemoa_received";

    return (
      <TouchableOpacity
        style={styles.transactionItem}
        onPress={() => router.push(`/transaction/${item.id}` as any)}
      >
        <View
          style={[
            styles.transactionIcon,
            {
              backgroundColor: `${getTransactionColor(item.type)}20`,
            },
          ]}
        >
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 1,
              backgroundColor: getTransactionColor(item.type),
            }}
          />
        </View>
        <View style={styles.transactionContent}>
          <Text style={styles.transactionType}>
            {TransactionTypeLabels[item.type]}
          </Text>
          <Text style={styles.transactionCounterparty}>
            {item.counterparty}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
        <View style={styles.transactionAmountContainer}>
          <Text
            style={[
              styles.transactionAmount,
              {
                color: isIncome ? Colors.light.income : Colors.light.expense,
              },
            ]}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(item.amount)}
          </Text>
          {item.fee > 0 && (
            <Text style={styles.transactionFee}>
              Frais: {formatCurrency(item.fee)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Transactions",
          headerStyle: {
            backgroundColor: Colors.light.cardBackground,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.light.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher..."
              placeholderTextColor={Colors.light.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterButton,
              showFilters && styles.filterButtonActive,
            ]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter
              size={20}
              color={
                showFilters ? Colors.light.cardBackground : Colors.light.text
              }
            />
          </TouchableOpacity>
        </View>

        {showFilters && (
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={TransactionCategories}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    filterType === item.value && styles.filterChipActive,
                  ]}
                  onPress={() =>
                    setFilterType(item.value as TransactionType | "all")
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      filterType === item.value && styles.filterChipTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        )}

        <Text style={styles.resultsCount}>
          {filteredTransactions.length} transaction
          {filteredTransactions.length !== 1 ? "s" : ""}
        </Text>

        {filteredTransactions.length > 0 && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Résumé</Text>
            <View style={styles.summaryContent}>
              {(filterType === "all" ||
                filterType === "transfer_received" ||
                filterType === "deposit" ||
                filterType === "uemoa_received") && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total reçu</Text>
                    <Text style={[styles.summaryValue, styles.incomeText]}>
                      +{formatCurrency(totals.totalReceived)}
                    </Text>
                  </View>
                )}
              {(filterType === "all" ||
                filterType === "transfer_sent" ||
                filterType === "withdrawal" ||
                filterType === "payment" ||
                filterType === "uemoa_sent") && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total envoyé</Text>
                    <Text style={[styles.summaryValue, styles.expenseText]}>
                      -{formatCurrency(totals.totalSent)}
                    </Text>
                  </View>
                )}
              {totals.totalFees > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Frais totaux</Text>
                  <Text style={styles.summaryValue}>
                    {formatCurrency(totals.totalFees)}
                  </Text>
                </View>
              )}
              {filterType === "all" && (
                <View style={[styles.summaryRow, styles.netBalanceRow]}>
                  <Text style={[styles.summaryLabel, styles.netBalanceLabel]}>
                    Solde net
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      styles.netBalanceValue,
                      {
                        color:
                          totals.netBalance >= 0
                            ? Colors.light.income
                            : Colors.light.expense,
                      },
                    ]}
                  >
                    {totals.netBalance >= 0 ? "+" : ""}
                    {formatCurrency(Math.abs(totals.netBalance))}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        <FlatList
          data={filteredTransactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Aucune transaction trouvée
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery || filterType !== "all"
                  ? "Essayez de modifier vos filtres"
                  : "Synchronisez vos SMS MTN MoMo pour commencer"}
              </Text>
            </View>
          }
        />
      </View>
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
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
    backgroundColor: Colors.light.cardBackground,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.background,
    borderRadius: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.light.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 1,
    backgroundColor: Colors.light.background,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  filtersContainer: {
    backgroundColor: Colors.light.cardBackground,
    paddingBottom: 12,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 1,
    backgroundColor: Colors.light.background,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.light.tint,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.light.text,
  },
  filterChipTextActive: {
    color: Colors.light.text,
    fontWeight: "600" as const,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.cardBackground,
    padding: 16,
    borderRadius: 1,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
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
  transactionAmountContainer: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  transactionFee: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 64,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: Colors.light.cardBackground,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.light.text,
    marginBottom: 12,
  },
  summaryContent: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: "500" as const,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  incomeText: {
    color: Colors.light.income,
  },
  expenseText: {
    color: Colors.light.expense,
  },
  netBalanceRow: {
    borderTopWidth: 1,
    borderTopColor: `${Colors.light.textSecondary}20`,
    marginTop: 8,
    paddingTop: 12,
  },
  netBalanceLabel: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  netBalanceValue: {
    fontSize: 18,
    fontWeight: "700" as const,
  },
});
