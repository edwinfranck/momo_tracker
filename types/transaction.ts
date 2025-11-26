export type TransactionType = 
  | "transfer_sent"
  | "transfer_received"
  | "withdrawal"
  | "deposit"
  | "payment"
  | "payment_bundle"
  | "payment_bill"
  | "payment_p2m"
  | "uemoa_sent"
  | "uemoa_received";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  fee: number;
  balance: number;
  counterparty: string;
  counterpartyPhone?: string;
  date: Date;
  reference?: string;
  transactionId: string;
  rawMessage: string;
}

export interface TransactionStats {
  totalSent: number;
  totalReceived: number;
  totalFees: number;
  currentBalance: number;
  transactionCount: number;
  sentCount: number;
  receivedCount: number;
}

export const TransactionTypeLabels: Record<TransactionType, string> = {
  transfer_sent: "Transfert envoyé",
  transfer_received: "Transfert reçu",
  withdrawal: "Retrait",
  deposit: "Dépôt",
  payment: "Paiement",
  payment_bundle: "Forfait MTN",
  payment_bill: "Facture",
  payment_p2m: "Paiement P2M",
  uemoa_sent: "Envoi UEMOA",
  uemoa_received: "Reçu UEMOA",
};

export const TransactionCategories = [
  { value: "all" as const, label: "Toutes" },
  { value: "transfer_sent" as const, label: "Transferts envoyés" },
  { value: "transfer_received" as const, label: "Transferts reçus" },
  { value: "withdrawal" as const, label: "Retraits" },
  { value: "deposit" as const, label: "Dépôts" },
  { value: "payment" as const, label: "Paiements" },
  { value: "uemoa_sent" as const, label: "Envois UEMOA" },
  { value: "uemoa_received" as const, label: "Reçus UEMOA" },
];
