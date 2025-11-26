import { Transaction, TransactionStats, TransactionType } from "@/types/transaction";
import { SMSMessage } from "@/utils/smsReader";
import { parseMTNMoMoSMS } from "@/utils/smsParser";
import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

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

export const [TransactionsProvider, useTransactions] = createContextHook(() => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "all">("all");

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

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

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

    return filtered;
  }, [transactions, filterType, searchQuery]);

  return {
    transactions,
    filteredTransactions,
    stats,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    addTransaction,
    addMultipleTransactions,
    parseSMSMessages,
    deleteTransaction,
    clearAllTransactions,
    isLoading: transactionsQuery.isLoading,
    isSaving: saveMutation.isPending,
  };
});
