import { useTheme } from "@/contexts/ThemeContext";
import { useSecurity } from "@/contexts/SecurityContext";
import { useTransactions } from "@/contexts/TransactionsContext";
import { useNotifications } from "@/contexts/NotificationsContext";
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
  Eye,
  EyeOff,
  Bell,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { readMTNMoMoSMS } from "@/utils/smsReader";
import { hasAllPermissions, requestAllPermissions } from "@/utils/permissionsService";

const { width } = Dimensions.get("window");

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { stats, transactions, parseSMSMessages } = useTransactions();
  const { formatAmount, hideAmounts, toggleHideAmounts } = useSecurity();
  const { unreadCount } = useNotifications();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

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
    const categoryColors = colors.categoryColors as any;
    return categoryColors[type] || colors.info;
  };

  const onRefresh = async () => {
    setRefreshing(true);

    try {
      // Vérifier les permissions
      const hasPermission = await hasAllPermissions();

      if (!hasPermission) {
        const granted = await requestAllPermissions();
        if (!granted) {
          Alert.alert(
            'Permissions requises',
            'L\'application a besoin de lire vos SMS et d\'envoyer des notifications pour synchroniser vos transactions MTN MoMo.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      // Lire TOUS les SMS MTN MoMo (sans limite de temps)
      // maxCount: 999999 (pratiquement illimité)
      // daysBack: 3650 (10 ans)
      const messages = await readMTNMoMoSMS(999999, 3650);

      if (messages.length > 0) {
        const count = parseSMSMessages(messages);

        if (count > 0) {
          Alert.alert(
            'Synchronisation réussie',
            `${messages.length} SMS lu${messages.length !== 1 ? 's' : ''}\n${count} nouvelle${count !== 1 ? 's' : ''} transaction${count !== 1 ? 's' : ''} importée${count !== 1 ? 's' : ''}.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Synchronisation terminée',
            `${messages.length} SMS MTN MoMo trouvé${messages.length !== 1 ? 's' : ''}.\nAucune nouvelle transaction à importer.`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert(
          'Aucun SMS trouvé',
          'Aucun SMS MTN MoMo trouvé sur votre appareil.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la synchronisation.',
        [{ text: 'OK' }]
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.cardBackground }]} edges={["bottom"]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Tableau de bord",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: "700" as const,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/notifications" as any)}
              style={styles.notificationButton}
            >
              <Bell size={24} color={colors.text} />
              {unreadCount > 0 && (
                <View style={[styles.notificationBadge, { backgroundColor: colors.error }]}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.tint]}
            tintColor={colors.tint}
            title="Synchronisation..."
            titleColor={colors.textSecondary}
          />
        }
      >
        <View style={[styles.balanceCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.balanceHeader}>
            <Text style={[styles.balanceLabel, { color: colors.text }]}>Solde actuel</Text>
            <TouchableOpacity
              onPress={toggleHideAmounts}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {hideAmounts ? (
                <EyeOff size={20} color={colors.text} opacity={0.6} />
              ) : (
                <Eye size={20} color={colors.text} opacity={0.6} />
              )}
            </TouchableOpacity>
          </View>
          <Text style={[styles.balanceAmount, { color: colors.text }]}>
            {formatCurrency(stats.currentBalance)}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <ArrowDownCircle size={16} color={colors.expense} />
              <Text style={[styles.balanceStatText, { color: colors.text }]}>
                {stats.receivedCount} Djai reçus
              </Text>
            </View>
            <View style={styles.balanceStat}>
              <ArrowUpCircle size={16} color={colors.income} />
              <Text style={[styles.balanceStatText, { color: colors.text }]}>
                {stats.sentCount} Djai envoyés
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.incomeCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.expense }]}>
            <View style={styles.statIconContainer}>
              <TrendingDown size={24} color={colors.expense} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Djai reçu</Text>
            <Text style={[styles.statValue, { color: colors.expense }]}>
              {formatCurrency(stats.totalReceived)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.expenseCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.income }]}>
            <View style={styles.statIconContainer}>
              <TrendingUp size={24} color={colors.income} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Djai envoyé</Text>
            <Text style={[styles.statValue, { color: colors.income }]}>
              {formatCurrency(stats.totalSent)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.feesCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.warning }]}>
            <View style={styles.statIconContainer}>
              <DollarSign size={24} color={colors.warning} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total frais</Text>
            <Text style={[styles.statValue, { color: colors.warning }]}>
              {formatCurrency(stats.totalFees)}
            </Text>
          </View>

          <View style={[styles.statCard, styles.countCard, { backgroundColor: colors.cardBackground, borderLeftColor: colors.info }]}>
            <View style={styles.statIconContainer}>
              <Receipt size={24} color={colors.info} />
            </View>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Transactions</Text>
            <Text style={[styles.statValue, { color: colors.info }]}>
              {stats.transactionCount}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push("/transactions" as any)}>
              <Text style={[styles.seeAllText, { color: colors.tint }]}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Wallet size={48} color={colors.tabIconDefault} />
              <Text style={[styles.emptyStateText, { color: colors.text }]}>
                Aucune transaction trouvée
              </Text>
              <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
                Synchronisez vos SMS MTN MoMo pour commencer
              </Text>
              <TouchableOpacity
                style={[styles.syncButton, { backgroundColor: colors.tint }]}
                onPress={onRefresh}
              >
                <Text style={styles.syncButtonText}>Synchroniser mes SMS</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={[styles.transactionItem, { backgroundColor: colors.cardBackground }]}
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
                        borderRadius: 8,
                        backgroundColor: getTransactionColor(transaction.type),
                      }}
                    />
                  </View>
                  <View style={styles.transactionContent}>
                    <Text style={[styles.transactionType, { color: colors.text }]}>
                      {TransactionTypeLabels[transaction.type]}
                    </Text>
                    <Text style={[styles.transactionCounterparty, { color: colors.textSecondary }]}>
                      {hideAmounts ? "••••••" : transaction.counterparty}
                    </Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
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
                              ? colors.income
                              : colors.expense,
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
  },
  container: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.8,
    fontWeight: "500" as const,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
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
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  incomeCard: {
    borderLeftWidth: 4,
  },
  expenseCard: {
    borderLeftWidth: 4,
  },
  feesCard: {
    borderLeftWidth: 4,
  },
  countCard: {
    borderLeftWidth: 4,
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "700" as const,
    marginTop: 4,
  },
  incomeText: {
    // color set dynamically
  },
  expenseText: {
    // color set dynamically
  },
  feesText: {
    // color set dynamically
  },
  countText: {
    // color set dynamically
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
  },
  seeAllText: {
    fontSize: 14,
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
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  syncButton: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  syncButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    textAlign: "center",
  },
  transactionsList: {
    gap: 12,
    marginBottom: 24,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
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
  },
  transactionCounterparty: {
    fontSize: 13,
    marginTop: 2,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  eyeButton: {
    padding: 4,
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  transactionAmountText: {
    fontSize: 16,
    fontWeight: "700" as const,
  },
  notificationButton: {
    marginRight: 16,
    padding: 8,
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    borderRadius: 8,
    minWidth: 18,
    height: 18,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700" as const,
  },
});
