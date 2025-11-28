import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction, TransactionTypeLabels } from '@/types/transaction';

interface GeneratePDFParams {
    transactions: Transaction[];
    startDate?: Date;
    endDate?: Date;
    filterType: string;
}

export const generateTransactionPDF = async ({
    transactions,
    startDate,
    endDate,
    filterType,
}: GeneratePDFParams) => {

    // Calcul des totaux pour le résumé
    let totalIncome = 0;
    let totalExpense = 0;
    let totalFees = 0;

    const formattedTransactions = transactions.map(t => {
        const isIncome = ['transfer_received', 'deposit', 'uemoa_received'].includes(t.type);
        if (isIncome) totalIncome += t.amount;
        else totalExpense += t.amount;

        totalFees += t.fee;

        return {
            ...t,
            dateFormatted: new Date(t.date).toLocaleDateString('fr-FR', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }),
            amountFormatted: t.amount.toLocaleString('fr-FR') + ' FCFA',
            typeLabel: TransactionTypeLabels[t.type] || t.type,
            isIncome
        };
    });

    const netBalance = totalIncome - totalExpense - totalFees;
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Relevé MoMo Tracker</title>
        <style>
          body { font-family: 'Helvetica', sans-serif; color: #333; padding: 20px; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #004d40; padding-bottom: 10px; }
          .logo { font-size: 24px; font-weight: bold; color: #004d40; }
          .date { font-size: 12px; color: #666; }
          .summary-box { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 30px; display: flex; justify-content: space-between; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .summary-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
          .income { color: #2e7d32; }
          .expense { color: #c62828; }
          .net { color: #004d40; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { text-align: left; padding: 10px; background-color: #e0f2f1; color: #004d40; border-bottom: 1px solid #b2dfdb; }
          td { padding: 10px; border-bottom: 1px solid #eee; }
          .amount-col { text-align: right; font-weight: bold; }
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MoMo Tracker</div>
          <div class="text-right">
            <div style="font-weight: bold;">RELEVÉ DE TRANSACTIONS</div>
            <div class="date">Généré le ${dateStr}</div>
          </div>
        </div>

        <div class="summary-box">
          <div class="summary-item">
            <div class="summary-label">Total Reçu</div>
            <div class="summary-value income">+${totalIncome.toLocaleString('fr-FR')} FCFA</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Envoyé</div>
            <div class="summary-value expense">-${totalExpense.toLocaleString('fr-FR')} FCFA</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Frais</div>
            <div class="summary-value">-${totalFees.toLocaleString('fr-FR')} FCFA</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Solde Période</div>
            <div class="summary-value net">${netBalance > 0 ? '+' : ''}${netBalance.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Tiers</th>
              <th class="amount-col">Montant</th>
            </tr>
          </thead>
          <tbody>
            ${formattedTransactions.map(t => `
              <tr>
                <td>${t.dateFormatted}</td>
                <td>${t.typeLabel}</td>
                <td>
                  <div>${t.counterparty}</div>
                  ${t.fee > 0 ? `<div style="font-size: 10px; color: #666;">Frais: ${t.fee}</div>` : ''}
                </td>
                <td class="amount-col ${t.isIncome ? 'income' : 'expense'}">
                  ${t.isIncome ? '+' : '-'}${t.amountFormatted}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          Ce document est généré automatiquement par MoMo Tracker. Il ne constitue pas une preuve légale officielle.
        </div>
      </body>
    </html>
  `;

    try {
        const { uri } = await Print.printToFileAsync({
            html: htmlContent,
            base64: false
        });

        await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        throw error;
    }
};
