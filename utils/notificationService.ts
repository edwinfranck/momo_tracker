import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Transaction } from '@/types/transaction';

/**
 * Configure le comportement des notifications LOCALES (pas push)
 * Ceci fonctionne dans Expo Go contrairement aux notifications push
 */
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

/**
 * Initialise le canal de notifications Android
 * IMPORTANT : Doit être appelé au démarrage de l'app
 */
export async function initializeNotifications(): Promise<void> {
    if (Platform.OS === 'android') {
        try {
            // Créer un canal de notifications pour Android
            await Notifications.setNotificationChannelAsync('momo-transactions', {
                name: 'Transactions MTN MoMo',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FFCC00',
                sound: 'default',
                enableVibrate: true,
                enableLights: true,
                showBadge: true,
            });

            console.log('✅ Canal de notifications créé avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la création du canal de notifications:', error);
        }
    }
}

/**
 * Demande la permission d'afficher des notifications
 * Sur Android 13+, c'est obligatoire
 */
export async function requestNotificationPermission(): Promise<boolean> {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.warn('⚠️ Permission de notification refusée');
            return false;
        }

        console.log('✅ Permission de notification accordée');
        return true;
    } catch (error) {
        console.error('❌ Erreur lors de la demande de permission de notification:', error);
        return false;
    }
}

/**
 * Affiche une notification locale pour une nouvelle transaction
 * Fonctionne MÊME dans Expo Go car c'est une notification locale
 */
export async function showTransactionNotification(transaction: Transaction): Promise<void> {
    try {
        // Vérifier/demander les permissions
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.warn('⚠️ Impossible d\'afficher la notification : permission refusée');
            return;
        }

        // Formatage du type de transaction
        let typeLabel = '';
        let emoji = '';

        switch (transaction.type) {
            case 'withdrawal':
                typeLabel = 'Retrait effectué';
                emoji = '💸';
                break;
            case 'deposit':
                typeLabel = 'Dépôt reçu';
                emoji = '💰';
                break;
            case 'transfer_sent':
                typeLabel = 'Transfert envoyé';
                emoji = '📤';
                break;
            case 'transfer_received':
                typeLabel = 'Transfert reçu';
                emoji = '📥';
                break;
            case 'payment':
            case 'payment_bill':
            case 'payment_bundle':
            case 'payment_p2m':
                typeLabel = 'Paiement effectué';
                emoji = '🛒';
                break;
            case 'uemoa_sent':
                typeLabel = 'Transfert UEMOA envoyé';
                emoji = '🌍';
                break;
            case 'uemoa_received':
                typeLabel = 'Transfert UEMOA reçu';
                emoji = '🌍';
                break;
            default:
                typeLabel = 'Nouvelle transaction';
                emoji = '💳';
        }

        const amount = transaction.amount.toLocaleString('fr-FR');
        const balance = transaction.balance.toLocaleString('fr-FR');

        // Afficher la notification locale
        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${emoji} ${typeLabel}`,
                body: `Montant: ${amount} FCFA\nNouveau solde: ${balance} FCFA`,
                data: {
                    transactionId: transaction.id,
                    type: transaction.type,
                    amount: transaction.amount,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                vibrate: [0, 250, 250, 250],
                // Utiliser le canal créé
                ...(Platform.OS === 'android' && {
                    channelId: 'momo-transactions',
                }),
            },
            trigger: null, // Afficher immédiatement
        });

        console.log('✅ Notification affichée pour la transaction:', transaction.id);
    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage de la notification:', error);
    }
}

/**
 * Affiche une notification de synchronisation
 */
export async function showSyncNotification(newCount: number): Promise<void> {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            return;
        }

        if (newCount === 0) {
            return; // Ne pas notifier s'il n'y a pas de nouvelles transactions
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🔄 Synchronisation terminée',
                body: `${newCount} nouvelle${newCount !== 1 ? 's' : ''} transaction${newCount !== 1 ? 's' : ''} ajoutée${newCount !== 1 ? 's' : ''}.`,
                sound: true,
                priority: Notifications.AndroidNotificationPriority.DEFAULT,
                ...(Platform.OS === 'android' && {
                    channelId: 'momo-transactions',
                }),
            },
            trigger: null,
        });

        console.log('✅ Notification de synchronisation affichée');
    } catch (error) {
        console.error('❌ Erreur lors de l\'affichage de la notification de sync:', error);
    }
}

/**
 * Annule toutes les notifications en attente
 */
export async function cancelAllNotifications(): Promise<void> {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('✅ Toutes les notifications annulées');
    } catch (error) {
        console.error('❌ Erreur lors de l\'annulation des notifications:', error);
    }
}

/**
 * Teste l'affichage d'une notification
 * Utile pour vérifier que les permissions et le canal sont configurés
 */
export async function testNotification(): Promise<void> {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.warn('⚠️ Permission de notification refusée');
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '🧪 Test de Notification',
                body: 'Si vous voyez ceci, les notifications fonctionnent ! 🎉',
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
                ...(Platform.OS === 'android' && {
                    channelId: 'momo-transactions',
                }),
            },
            trigger: null,
        });

        console.log('✅ Notification de test envoyée');
    } catch (error) {
        console.error('❌ Erreur lors du test de notification:', error);
    }
}
