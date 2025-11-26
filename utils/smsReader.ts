import { PermissionsAndroid, Platform } from 'react-native';
import SmsAndroid from 'react-native-get-sms-android';

export interface SMSMessage {
    _id: string;
    address: string;
    body: string;
    date: number;
    type: number;
}

/**
 * Demande la permission de lecture des SMS sur Android
 */
export async function requestSMSPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        console.log('SMS reading is only available on Android');
        return false;
    }

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            {
                title: 'Permission de lecture des SMS',
                message: 'MTN MoMo Tracker a besoin d\'accéder à vos SMS pour analyser vos transactions Mobile Money.',
                buttonNeutral: 'Plus tard',
                buttonNegative: 'Refuser',
                buttonPositive: 'Autoriser',
            }
        );

        return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
        console.error('Error requesting SMS permission:', err);
        return false;
    }
}

/**
 * Vérifie si la permission de lecture des SMS est accordée
 */
export async function checkSMSPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        const hasPermission = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        return hasPermission;
    } catch (err) {
        console.error('Error checking SMS permission:', err);
        return false;
    }
}

/**
 * Lit les SMS MTN MoMo depuis l'appareil
 * @param maxCount Nombre maximum de SMS à récupérer (par défaut: 100)
 * @param daysBack Nombre de jours en arrière à chercher (par défaut: 90)
 * @returns Promise avec la liste des SMS MTN MoMo
 */
export async function readMTNMoMoSMS(
    maxCount: number = 100,
    daysBack: number = 90
): Promise<SMSMessage[]> {
    if (Platform.OS !== 'android') {
        throw new Error('SMS reading is only available on Android');
    }

    // Vérifier d'abord si on a la permission
    const hasPermission = await checkSMSPermission();
    if (!hasPermission) {
        const granted = await requestSMSPermission();
        if (!granted) {
            throw new Error('Permission de lecture des SMS refusée');
        }
    }

    return new Promise((resolve, reject) => {
        const minDate = Date.now() - (daysBack * 24 * 60 * 60 * 1000);

        const filter = {
            box: 'inbox', // Boîte de réception
            indexFrom: 0,
            maxCount: maxCount,
            minDate: minDate,
        };

        SmsAndroid.list(
            JSON.stringify(filter),
            (fail: string) => {
                console.error('Failed to list SMS:', fail);
                reject(new Error(fail));
            },
            (count: number, smsList: string) => {
                try {
                    const messages: SMSMessage[] = JSON.parse(smsList);

                    // Filtrer uniquement les SMS MTN MoMo valides
                    // Utilisation de la même logique stricte que le parser
                    const mtnMessages = messages.filter((sms) => {
                        const body = sms.body.trim().toLowerCase();

                        // Le message DOIT commencer par un des mots-clés valides
                        return (
                            body.startsWith('retrait ') ||
                            body.startsWith('depot recu ') ||
                            body.startsWith('vous avez recu un transfert') ||
                            body.startsWith('transfert ') ||
                            body.startsWith('paiement ')
                        );
                    });

                    console.log(`Found ${mtnMessages.length} MTN MoMo SMS out of ${count} total SMS`);
                    resolve(mtnMessages);
                } catch (err) {
                    console.error('Error parsing SMS list:', err);
                    reject(err);
                }
            }
        );
    });
}

/**
 * Lit les SMS MTN MoMo et retourne uniquement les corps de message
 * @param maxCount Nombre maximum de SMS à récupérer
 * @param daysBack Nombre de jours en arrière à chercher
 * @returns Promise avec la liste des corps de message
 */
export async function readMTNMoMoSMSBodies(
    maxCount: number = 100,
    daysBack: number = 90
): Promise<string[]> {
    const messages = await readMTNMoMoSMS(maxCount, daysBack);
    return messages.map((sms) => sms.body);
}
