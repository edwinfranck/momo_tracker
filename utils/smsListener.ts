import { Platform, DeviceEventEmitter, NativeEventEmitter, NativeModules } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';
import { SMSMessage } from './smsReader';

export type SMSListenerCallback = (sms: SMSMessage) => void;

let smsListener: any = null;

/**
 * Démarre l'écoute des SMS entrants
 * @param callback Fonction appelée quand un nouveau SMS MTN MoMo est reçu
 */
export function startSMSListener(callback: SMSListenerCallback): void {
    if (Platform.OS !== 'android') {
        console.warn('SMS listening is only available on Android');
        return;
    }

    // Arrêter l'ancien listener s'il existe
    stopSMSListener();

    console.log('🎧 Démarrage du listener SMS...');

    // Écouter les nouveaux SMS
    smsListener = DeviceEventEmitter.addListener(
        'com.github.talut:sms_received',
        (message: any) => {
            try {
                console.log('📱 Nouveau SMS reçu:', message);

                // Vérifier si c'est un SMS MTN MoMo
                if (message && message.body) {
                    const body = message.body.trim().toLowerCase();

                    const isMTNMoMo = (
                        body.startsWith('retrait ') ||
                        body.startsWith('depot recu ') ||
                        body.startsWith('vous avez recu un transfert') ||
                        body.startsWith('transfert ') ||
                        body.startsWith('paiement ')
                    );

                    if (isMTNMoMo) {
                        console.log('✅ SMS MTN MoMo détecté!');

                        // Créer un objet SMSMessage compatible
                        const smsMessage: SMSMessage = {
                            _id: message._id || String(Date.now()),
                            address: message.address || message.originatingAddress || 'Unknown',
                            body: message.body,
                            date: message.timestamp || Date.now(),
                            type: 1, // Type 1 = Inbox
                        };

                        callback(smsMessage);
                    } else {
                        console.log('ℹ️ SMS ignoré (non MTN MoMo)');
                    }
                }
            } catch (error) {
                console.error('Erreur lors du traitement du SMS:', error);
            }
        }
    );

    console.log('✅ Listener SMS démarré avec succès');
}

/**
 * Arrête l'écoute des SMS
 */
export function stopSMSListener(): void {
    if (smsListener) {
        console.log('🛑 Arrêt du listener SMS...');
        smsListener.remove();
        smsListener = null;
    }
}

/**
 * Vérifie si le listener est actif
 */
export function isSMSListenerActive(): boolean {
    return smsListener !== null;
}
