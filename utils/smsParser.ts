import { Transaction, TransactionType } from "@/types/transaction";

interface ParseResult {
  success: boolean;
  transaction?: Transaction;
  error?: string;
}

function extractPhone(text: string): string | undefined {
  const phoneMatch = text.match(/\((\d{10,13})\)/);
  return phoneMatch ? phoneMatch[1] : undefined;
}

function extractAmount(text: string): number {
  // Format standard: 4000F
  let amountMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)F/);
  if (amountMatch) {
    return parseFloat(amountMatch[1].replace(',', ''));
  }

  // Format avec espace: 5000 FCFA
  amountMatch = text.match(/(\d+(?:,\d+)?(?:\.\d+)?)\s*FCFA/i);
  if (amountMatch) {
    return parseFloat(amountMatch[1].replace(',', ''));
  }

  // Format XOF: XOF 10000
  amountMatch = text.match(/XOF\s*(\d+(?:,\d+)?(?:\.\d+)?)/i);
  if (amountMatch) {
    return parseFloat(amountMatch[1].replace(',', ''));
  }

  return 0;
}

function extractFee(text: string): number {
  const feeMatch = text.match(/Frais:\s*(\d+(?:,\d+)?(?:\.\d+)?)F/i);
  if (feeMatch) {
    return parseFloat(feeMatch[1].replace(',', ''));
  }
  return 0;
}

function extractBalance(text: string): number {
  // Format standard: Solde:10000F
  let balanceMatch = text.match(/Solde:\s*(\d+(?:,\d+)?(?:\.\d+)?)F/i);
  if (balanceMatch) {
    return parseFloat(balanceMatch[1].replace(',', ''));
  }

  // Format: Nouveau solde: 1382 FCFA
  balanceMatch = text.match(/Nouveau solde:\s*(\d+(?:,\d+)?(?:\.\d+)?)/i);
  if (balanceMatch) {
    return parseFloat(balanceMatch[1].replace(',', ''));
  }

  // Format GAB: SOLDE DISPO 48635
  balanceMatch = text.match(/SOLDE(?:\s+DISPO)?\s*(\d+(?:,\d+)?(?:\.\d+)?)/i);
  if (balanceMatch) {
    return parseFloat(balanceMatch[1].replace(',', ''));
  }

  return 0;
}

function extractDate(text: string): Date | null {
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
  if (dateMatch) {
    return new Date(dateMatch[1]);
  }

  const dateMatch2 = text.match(/le\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
  if (dateMatch2) {
    return new Date(dateMatch2[1]);
  }

  return null;
}

function extractTransactionId(text: string): string | null {
  // Format: ID de la transaction : 10974007799
  const idMatchLong = text.match(/ID de la transaction\s*[:\s]\s*(\d+)/i);
  if (idMatchLong) return idMatchLong[1];

  // Format standard: ID: 123456
  const idMatch = text.match(/ID[:\s]*(\d+)/i);
  return idMatch ? idMatch[1] : null;
}

function extractReference(text: string): string | undefined {
  const refMatch = text.match(/Ref(?:erence)?[:\s]+([^\s.]+)/i);
  return refMatch ? refMatch[1] : undefined;
}

function extractCounterparty(text: string, type: TransactionType): string {
  // Cas spécifique RETRAIT GAB
  if (type === "withdrawal" && text.toUpperCase().includes("RETRAIT GAB")) {
    // Gère "EFFECTUE A" ou "EFECTUE A", suivi du lieu, jusqu'à "LE" ou ".SOLDE" ou fin de ligne
    const gabMatch = text.match(/EF{1,2}ECTUE A\s+(.+?)(?:\s+LE|\.|\s+SOLDE|$)/i);
    if (gabMatch) {
      return gabMatch[1].trim();
    }
  }

  // Cas spécifique: "Vous avez recu un transfert de 1000FCFA de MFS ORABANK DIS SP"
  // On cherche le deuxième "de" qui précède le nom, jusqu'à la parenthèse ou un point
  const transferMatch = text.match(/transfert de\s+\d+(?:[.,]\d+)?\s*(?:F|FCFA|XOF)?\s+de\s+([^(.]+)/i);
  if (transferMatch) {
    return transferMatch[1].trim();
  }

  const patterns = [
    /(?:de|a|à)\s+([^(]+?)\s*\(/i,
    /(?:de|a|à)\s+([^(\d]+?)(?:\s+\d{4}-|\s+Frais:)/i,
    // Fallback pour "Transfert effectué ... a ..." sans parenthèses
    /\b(?:a|à)\s+([^.]+?)(?:\.|\s+ID:)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Nettoyage supplémentaire si on a capturé "1000FCFA de ..." par erreur avec le pattern générique
      const cleanMatch = match[1].trim();
      if (cleanMatch.match(/^\d+(?:[.,]\d+)?\s*(?:F|FCFA|XOF)?\s+de\s+(.+)/i)) {
        return cleanMatch.replace(/^\d+(?:[.,]\d+)?\s*(?:F|FCFA|XOF)?\s+de\s+/i, '');
      }
      return cleanMatch;
    }
  }

  if (type === "payment_bundle") return "MTN BUNDLES";
  if (type === "payment_bill") return "Facture";
  if (type === "uemoa_sent" || type === "uemoa_received") return "ONAFRIQ UEMOA";

  return "Inconnu";
}

function detectTransactionType(message: string): TransactionType | null {
  const lowerMessage = message.toLowerCase();
  const trimmedMessage = lowerMessage.trim();

  // Filtrage strict : le message doit commencer par un des mots-clés valides
  // Cela évite les faux positifs comme "Grace à ton paiement via MoMopay..."

  // 1. Retrait - Doit commencer par "Retrait"
  if (trimmedMessage.startsWith("retrait ")) {
    return "withdrawal";
  }

  // 2. Dépôt reçu - Doit commencer par "Depot recu"
  if (trimmedMessage.startsWith("depot recu ")) {
    return "deposit";
  }

  // 3. Transfert reçu via formule "Vous avez recu un transfert de"
  if (trimmedMessage.startsWith("vous avez recu un transfert")) {
    // Vérifier si c'est un transfert UEMOA (ONAFRIQ REGIONAL)
    if (lowerMessage.includes("onafriq regional") ||
      (lowerMessage.includes("onafriq") && lowerMessage.includes("reference:"))) {
      return "uemoa_received";
    }
    // Sinon c'est un transfert normal (ex: de la banque)
    return "transfer_received";
  }

  // 4. Transfert - Doit commencer par "Transfert"
  if (trimmedMessage.startsWith("transfert ")) {
    // "Transfert effectue pour" = envoyé
    if (lowerMessage.includes("transfert effectue pour")) {
      return "transfer_sent";
    }
    // "Transfert ... a ...=" envoyé
    if (lowerMessage.includes(" a ")) {
      return "transfer_sent";
    }
    // "Transfert effectue..." = envoyé
    if (lowerMessage.includes("transfert effectue")) {
      return "transfer_sent";
    }
    // "Transfert ... de ..." = reçu
    if (lowerMessage.includes(" de ")) {
      // Vérifier si c'est UEMOA
      if (lowerMessage.includes("onafriq") || lowerMessage.includes("uemoa")) {
        return "uemoa_received";
      }
      return "transfer_received";
    }
  }

  // 5. Paiements - Doit commencer par "Paiement"
  if (trimmedMessage.startsWith("paiement ")) {
    // 5a. Paiement UEMOA sortant - "Paiement ... a ONAFRIQ UEMOA OUT"
    if ((lowerMessage.includes("onafriq") && lowerMessage.includes("out")) ||
      (lowerMessage.includes("onafriq uemoa") && lowerMessage.includes(" a "))) {
      return "uemoa_sent";
    }

    // 5b. Paiement de forfait MTN - "Paiement ... a MTN BUNDLES"
    if (lowerMessage.includes("mtn bundle") || lowerMessage.includes("mtn bundles")) {
      return "payment_bundle";
    }

    // 5c. Paiement de facture - "Paiement ... a MFS DIRECT SBEE"
    if (lowerMessage.includes("sbee") ||
      lowerMessage.includes("direct sbee") ||
      (lowerMessage.includes("mfs") && lowerMessage.includes("direct"))) {
      return "payment_bill";
    }

    // 5d. Paiement marchand (P2M/LVC) - avec code *880*41#
    if (lowerMessage.includes("p2m") ||
      lowerMessage.includes("lvc") ||
      lowerMessage.includes(" p2m ") ||
      lowerMessage.includes(" lvc ")) {
      return "payment_p2m";
    }

    // 5e. Autre paiement générique
    return "payment";
  }

  // Type non reconnu - SMS ne commence pas par un mot-clé valide
  return null;
}

// Compteur global pour garantir l'unicité des IDs
let transactionCounter = 0;

export function parseMTNMoMoSMS(message: string, timestamp?: number): ParseResult {
  try {
    const type = detectTransactionType(message);

    if (!type) {
      return {
        success: false,
        error: "Type de transaction non reconnu",
      };
    }

    const amount = extractAmount(message);
    const fee = extractFee(message);
    const balance = extractBalance(message);
    let date = extractDate(message);

    if (!date) {
      if (timestamp) {
        date = new Date(timestamp);
      } else {
        date = new Date();
      }
    }
    const transactionId = extractTransactionId(message);
    const reference = extractReference(message);
    const counterpartyPhone = extractPhone(message);
    const counterparty = extractCounterparty(message, type);

    // Générer un hash simple du message pour garantir l'unicité
    const messageHash = message.split('').reduce((hash, char) => {
      return ((hash << 5) - hash) + char.charCodeAt(0);
    }, 0);

    // Générer un ID unique et déterministe
    // Si on a un ID de transaction, on l'utilise
    // Sinon on utilise le hash du message + la date
    let uniqueId: string;
    if (transactionId && transactionId !== Date.now().toString()) {
      uniqueId = transactionId;
    } else {
      uniqueId = `hash-${Math.abs(messageHash)}-${date.getTime()}`;
    }

    const transaction: Transaction = {
      id: uniqueId,
      type,
      amount,
      fee,
      balance,
      counterparty,
      counterpartyPhone,
      date,
      reference,
      transactionId: transactionId || "UNKNOWN",
      rawMessage: message,
    };

    return {
      success: true,
      transaction,
    };
  } catch (error) {
    console.error("Error parsing SMS:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Erreur inconnue",
    };
  }
}

export function parseMultipleSMS(messages: string[]): Transaction[] {
  const transactions: Transaction[] = [];

  for (const message of messages) {
    const result = parseMTNMoMoSMS(message);
    if (result.success && result.transaction) {
      transactions.push(result.transaction);
    }
  }

  transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return transactions;
}
