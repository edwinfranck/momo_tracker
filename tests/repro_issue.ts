
import { parseMTNMoMoSMS } from '../utils/smsParser';

const testMessages = [
    {
        message: "Transfert effectue pour 5000 FCFA a 22997000000. ID: 1234567890. Solde: 10000 FCFA. Frais: 0 FCFA.",
        description: "Transfert effectué pour (suspected format)"
    },
    {
        message: "RETRAIT GAB XOF 10000 EFFECTUE A GAB_UBA_COTONOU LE 2025-11-26 10:00:00. ID: 9876543210. SOLDE: 50000.",
        description: "Retrait GAB XOF (suspected format)"
    },
    {
        message: "RETRAIT GAB XOF 60000 EFECTUE A ST MICHEL .SOLDE DISPO 48635",
        description: "Retrait GAB XOF (User provided example)"
    }
];

console.log('🧪 Reproduction Test\n');

testMessages.forEach((test, index) => {
    const result = parseMTNMoMoSMS(test.message);
    console.log(`\nTest ${index + 1}: ${test.description}`);
    console.log(`Message: ${test.message}`);
    console.log(`Success: ${result.success}`);
    if (result.success && result.transaction) {
        console.log(`Type: ${result.transaction.type}`);
        console.log(`Amount: ${result.transaction.amount}`);
        console.log(`Counterparty: ${result.transaction.counterparty}`);
    } else {
        console.log(`Error: ${result.error}`);
    }
});
