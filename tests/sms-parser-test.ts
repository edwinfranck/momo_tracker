/**
 * Test du parser SMS avec les exemples réels fournis par l'utilisateur
 * Pour exécuter: npx ts-node tests/sms-parser-test.ts
 */

import { parseMTNMoMoSMS } from '../utils/smsParser';

const testSMS = [
    {
        message: "Retrait 4000F via WAD SERVICE GEST 1(2290150777120 - RBCCM/ABC/22 A 51015) 2025-11-25 21:27:14 Solde:10482F Frais:125F ID:11013738601",
        expectedType: "withdrawal",
        description: "Retrait d'argent"
    },
    {
        message: "Transfert 10000F de AEIG BULK (2290151774272) 2025-11-25 19:36:20 Ref:AEIGPmtForfaitComm Solde:14607F ID:11012760098",
        expectedType: "transfer_received",
        description: "Transfert reçu"
    },
    {
        message: "Transfert 5825F a WILFRIED GBEDANDE DJEMEKO(2290161072275) 2025-11-24 20:38:42 Frais: 50F Solde:4607F Ref: Food  ID: 11006892094",
        expectedType: "transfer_sent",
        description: "Transfert envoyé"
    },
    {
        message: "Vous avez recu un transfert de 10000FCFA de MFS ORABANK DIS SP  (2290150459863) le 2025-11-24 17:14:31. Reference: SEMOA. Nouveau solde: 10482 FCFA. ID de la transaction : 11005237542..",
        expectedType: "transfer_received",
        description: "Transfert reçu de la banque"
    },
    {
        message: "Paiement 5000F a MFS  DIRECT SBEE 2025-11-23 16:10:37 Frais:50F Solde:482F ID:10998744145 Ref:-",
        expectedType: "payment_bill",
        description: "Paiement de facture SBEE"
    },
    {
        message: "Vous avez recu un transfert de 10500FCFA de ONAFRIQ REGIONAL TRANSFER SP (2290167039646) le 2025-11-22 20:17:35. Reference: CI. Nouveau solde: 10557 FCFA. ID de la transaction : 10994319400..",
        expectedType: "uemoa_received",
        description: "Transfert UEMOA reçu (Côte d'Ivoire)"
    },
    {
        message: "Paiement 500F a MTN BUNDLES 2025-11-15 22:21:49 Frais:0F Solde:4572F ID:10951687251 Ref:Frommessage",
        expectedType: "payment_bundle",
        description: "Paiement forfait MTN"
    },
    {
        message: "Paiement 2900F a HOUNGNIBO LAURENCIA D.C LVC (2290150729245) 2025-11-15 11:21:55 Frais:0F Solde:5022F ID:10947266220",
        expectedType: "payment_p2m",
        description: "Paiement marchand LVC"
    },
    {
        message: "Paiement 2100F a LA VENDEUSE P2M (2290153420836) 2025-11-14 18:17:31 Frais:0F Solde:12997F ID:10943283215",
        expectedType: "payment_p2m",
        description: "Paiement marchand P2M"
    },
    {
        message: "Depot recu 3250F de NORBERT DOSSOU BLADON (2290167744314 - ) le 2025-11-12 20:48:52 Solde:4222F ID:10932256987Frais:0F.",
        expectedType: "deposit",
        description: "Dépôt reçu"
    },
    {
        message: "Paiement 100F a MTN BUNDLES 2025-11-11 11:55:12 Frais:0F Solde:5072F ID:10922831117 Ref:Frommessage",
        expectedType: "payment_bundle",
        description: "Paiement forfait MTN"
    },
    {
        message: "Vous avez recu un transfert de 45000FCFA de ONAFRIQ REGIONAL TRANSFER SP (2290167039646) le 2025-11-04 08:36:48. Reference: CI. Nouveau solde: 51609 FCFA. ID de la transaction : 10877632062..",
        expectedType: "uemoa_received",
        description: "Transfert UEMOA reçu (Côte d'Ivoire)"
    },
    {
        message: "Paiement 50000F a ONAFRIQ UEMOA OUT 2025-11-02 09:24:44 Frais:1000F Solde:23599F ID:10866266245 Ref:2250576066263",
        expectedType: "uemoa_sent",
        description: "Transfert UEMOA envoyé"
    },
    {
        message: "Paiement 120000F a ONAFRIQ UEMOA OUT 2025-10-31 15:08:01 Frais:2600F Solde:35689F ID:10854978601 Ref:2250576066263",
        expectedType: "uemoa_sent",
        description: "Transfert UEMOA envoyé"
    },
    // Tests de messages INVALIDES (ne doivent PAS être détectés)
    {
        message: "Grace à ton paiement via MoMopay tu as gagné des points de fidélité",
        expectedType: null,
        description: "❌ Message promotionnel (doit être REJETÉ)"
    },
    {
        message: "Merci d'avoir effectué un retrait à notre guichet automatique",
        expectedType: null,
        description: "❌ Message publicitaire (doit être REJETÉ)"
    },
    {
        message: "Votre transfert a été traité avec succès",
        expectedType: null,
        description: "❌ Message de confirmation générique (doit être REJETÉ)"
    },
];

console.log('🧪 Test du parser SMS MTN MoMo\n');
console.log('='.repeat(80));

let passedTests = 0;
let failedTests = 0;

testSMS.forEach((test, index) => {
    const result = parseMTNMoMoSMS(test.message);

    console.log(`\n📱 Test ${index + 1}: ${test.description}`);
    console.log(`Type attendu: ${test.expectedType ?? 'REJETÉ (null)'}`);

    // Si le type attendu est null, on s'attend à ce que le parsing échoue
    if (test.expectedType === null) {
        if (!result.success) {
            console.log(`✅ Correctement rejeté: ${result.error}`);
            passedTests++;
        } else {
            console.log(`❌ ÉCHEC: Message aurait dû être rejeté mais a été détecté comme: ${result.transaction?.type}`);
            failedTests++;
        }
    } else {
        // Tests normaux (expectedType !== null)
        if (result.success && result.transaction) {
            const { transaction } = result;
            const typeMatch = transaction.type === test.expectedType;

            console.log(`Type détecté: ${transaction.type} ${typeMatch ? '✅' : '❌'}`);
            console.log(`Montant: ${transaction.amount} FCFA`);
            console.log(`Frais: ${transaction.fee} FCFA`);
            console.log(`Solde: ${transaction.balance} FCFA`);
            console.log(`Contrepartie: ${transaction.counterparty}`);
            console.log(`ID Transaction: ${transaction.transactionId}`);

            if (typeMatch) {
                passedTests++;
            } else {
                failedTests++;
                console.log(`⚠️  ÉCHEC: Type incorrect!`);
            }
        } else {
            console.log(`❌ ÉCHEC: Parsing échoué - ${result.error}`);
            failedTests++;
        }
    }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 Résultats:`);
console.log(`✅ Tests réussis: ${passedTests}/${testSMS.length}`);
console.log(`❌ Tests échoués: ${failedTests}/${testSMS.length}`);
console.log(`📈 Taux de réussite: ${Math.round((passedTests / testSMS.length) * 100)}%`);

if (failedTests === 0) {
    console.log(`\n🎉 Tous les tests sont passés!`);
} else {
    console.log(`\n⚠️  Certains tests ont échoué, vérifiez les détails ci-dessus.`);
    process.exit(1);
}
