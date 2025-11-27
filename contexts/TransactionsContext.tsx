import { Transaction, TransactionStats, TransactionType } from "@/types/transaction";
import { SMSMessage } from "@/utils/smsReader";
import { parseMTNMoMoSMS } from "@/utils/smsParser";
import { startSMSListener, stopSMSListener } from "@/utils/smsListener";
import { useNotifications } from "@/contexts/NotificationsContext";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "@mtn_momo_transactions";

async function loadTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
    }
    return [];
  } catch (error) {
    console.error("Error loading transactions:", error);
    return [];
  }
}

async function saveTransactions(transactions: Transaction[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving transactions:", error);
  }
}

export type PeriodFilter = "all" | "today" | "7days" | "30days" | "3months" | "6months" | "1year";
export type SortBy = "date_desc" | "date_asc" | "amount_desc" | "amount_asc";

export const [TransactionsProvider, useTransactions] = createContextHook(() => {
  const { addNotification } = useNotifications();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

  // Advanced filters
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [minAmount, setMinAmount] = useState<number | null>(null);
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("date_desc");

  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: loadTransactions,
  });

  const saveMutation = useMutation({
    mutationFn: saveTransactions,
  });

  useEffect(() => {
    if (transactionsQuery.data) {
      setTransactions(transactionsQuery.data);
    }
  }, [transactionsQuery.data]);

  // Démarrer le listener SMS automatiquement au montage du composant
  useEffect(() => {
    if (Platform.OS === 'android') {
      console.log('🚀 Initialisation du listener SMS automatique...');

      // Handler pour les nouveaux SMS
      const handleNewSMS = async (sms: SMSMessage) => {
        console.log('📨 Nouveau SMS MTN MoMo détecté!');

        // Parser le SMS
        const result = parseMTNMoMoSMS(sms.body, sms.date);

        if (result.success && result.transaction) {
          console.log('✅ Transaction parsée avec succès:', result.transaction);

          // Vérifier que la transaction n'existe pas déjà
          const exists = transactions.some(t => t.id === result.transaction!.id);

          if (!exists) {
            // Ajouter la transaction
            addTransaction(result.transaction);

            // Ajouter la notification in-app
            let title = "Nouvelle transaction";
            let emoji = "💳";

            switch (result.transaction.type) {
              case 'withdrawal':
                title = "Retrait effectué";
                emoji = "💸";
                break;
              case 'deposit':
                title = "Dépôt reçu";
                emoji = "💰";
                break;
              case 'transfer_received':
                title = "Transfert reçu";
                emoji = "📥";
                break;
              case 'transfer_sent':
                title = "Transfert envoyé";
                emoji = "📤";
                break;
              case 'payment':
              case 'payment_bill':
              case 'payment_bundle':
              case 'payment_p2m':
                title = "Paiement effectué";
                emoji = "🛒";
                break;
            }

            addNotification({
              type: "transaction",
              title: `${emoji} ${title}`,
              message: `${result.transaction.amount.toLocaleString('fr-FR')} FCFA • ${result.transaction.counterparty}`,
              transactionId: result.transaction.id,
              transaction: result.transaction
            });
          } else {
            console.log('ℹ️ Transaction déjà existante, ignorée');
          }
        } else {
          console.warn('⚠️ Échec du parsing du SMS:', result.error);
        }
      };

      // Démarrer le listener
      startSMSListener(handleNewSMS);

      // Nettoyer le listener au démontage
      return () => {
        console.log('🛑 Arrêt du listener SMS');
        stopSMSListener();
      };
    }
  }, [transactions]); // Dépendance sur transactions pour vérifier les doublons

  const addTransaction = (transaction: Transaction) => {
    console.log("Adding transaction:", transaction);
    const updated = [transaction, ...transactions];
    setTransactions(updated);
    saveMutation.mutate(updated);
  };

  const addMultipleTransactions = (newTransactions: Transaction[]) => {
    console.log("Adding multiple transactions:", newTransactions.length);

    const existingIds = new Set(transactions.map((t) => t.id));
    const uniqueTransactions = newTransactions.filter(
      (t) => !existingIds.has(t.id)
    );

    if (uniqueTransactions.length === 0) {
      console.log("No new transactions to add");
      return 0;
    }

    const updated = [...uniqueTransactions, ...transactions].sort(
      (a, b) => b.date.getTime() - a.date.getTime()
    );

    setTransactions(updated);
    saveMutation.mutate(updated);

    return uniqueTransactions.length;
  };

  const parseSMSMessages = (messages: (string | SMSMessage)[]): number => {
    console.log("Parsing SMS messages:", messages.length);
    const parsed: Transaction[] = [];

    for (const message of messages) {
      let body: string;
      let timestamp: number | undefined;

      if (typeof message === 'string') {
        body = message;
      } else {
        body = message.body;
        timestamp = message.date;
      }

      const result = parseMTNMoMoSMS(body, timestamp);
      if (result.success && result.transaction) {
        parsed.push(result.transaction);
      }
    }

    return addMultipleTransactions(parsed);
  };

  const deleteTransaction = (id: string) => {
    console.log("Deleting transaction:", id);
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    saveMutation.mutate(updated);
  };

  const clearAllTransactions = () => {
    console.log("Clearing all transactions");
    setTransactions([]);
    saveMutation.mutate([]);
  };

  const stats: TransactionStats = useMemo(() => {
    const totalSent = transactions
      .filter(
        (t) =>
          t.type === "transfer_sent" ||
          t.type === "withdrawal" ||
          t.type === "payment" ||
          t.type === "payment_bundle" ||
          t.type === "payment_bill" ||
          t.type === "payment_p2m" ||
          t.type === "uemoa_sent"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalReceived = transactions
      .filter(
        (t) =>
          t.type === "transfer_received" ||
          t.type === "deposit" ||
          t.type === "uemoa_received"
      )
      .reduce((sum, t) => sum + t.amount, 0);

    const totalFees = transactions.reduce((sum, t) => sum + t.fee, 0);

    const currentBalance =
      transactions.length > 0 ? transactions[0].balance : 0;

    const sentCount = transactions.filter(
      (t) =>
        t.type === "transfer_sent" ||
        t.type === "withdrawal" ||
        t.type === "payment" ||
        t.type === "payment_bundle" ||
        t.type === "payment_bill" ||
        t.type === "payment_p2m" ||
        t.type === "uemoa_sent"
    ).length;

    const receivedCount = transactions.filter(
      (t) =>
        t.type === "transfer_received" ||
        t.type === "deposit" ||
        t.type === "uemoa_received"
    ).length;

    return {
      totalSent,
      totalReceived,
      totalFees,
      currentBalance,
      transactionCount: transactions.length,
      sentCount,
      receivedCount,
    };
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    // Filter by transaction type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    // Filter by period
    if (periodFilter !== "all") {
      const now = new Date();
      const startDate = new Date();

      switch (periodFilter) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "7days":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          startDate.setDate(now.getDate() - 30);
          break;
        case "3months":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6months":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1year":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((t) => t.date >= startDate);
    }

    // Filter by amount range
    if (minAmount !== null) {
      filtered = filtered.filter((t) => t.amount >= minAmount);
    }
    if (maxAmount !== null) {
      filtered = filtered.filter((t) => t.amount <= maxAmount);
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.counterparty.toLowerCase().includes(query) ||
          t.reference?.toLowerCase().includes(query) ||
          t.transactionId.includes(query) ||
          t.amount.toString().includes(query)
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case "date_desc":
        sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
        break;
      case "date_asc":
        sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
        break;
      case "amount_desc":
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case "amount_asc":
        sorted.sort((a, b) => a.amount - b.amount);
        break;
    }

    return sorted;
  }, [transactions, filterType, periodFilter, minAmount, maxAmount, searchQuery, sortBy]);

  return {
    transactions,
    filteredTransactions,
    stats,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    // Advanced filters
    periodFilter,
    setPeriodFilter,
    minAmount,
    setMinAmount,
    maxAmount,
    setMaxAmount,
    sortBy,
    setSortBy,
    addTransaction,
    addMultipleTransactions,
    parseSMSMessages,
    deleteTransaction,
    clearAllTransactions,
    isLoading: transactionsQuery.isLoading,
    isSaving: saveMutation.isPending,
  };
});
