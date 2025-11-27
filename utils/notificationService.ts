import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Transaction } from '@/types/transaction';

/**
 * Configure le comportement des notifications
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
 * Demande la permission d'afficher des notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FFCC00',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    return finalStatus === 'granted';
}

/**
 * Affiche une notification pour une nouvelle transaction
 */
export async function showTransactionNotification(transaction: Transaction): Promise<void> {
    try {
        const hasPermission = await requestNotificationPermission();
        if (!hasPermission) {
            console.warn('Permission de notification refusée');
            return;
        }

        // Formatage du type de transaction
        let typeLabel = '';
        let emoji = '';

        switch (transaction.type) {
            case 'withdrawal':
                typeLabel = 'Retrait';
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
                typeLabel = 'Paiement';
                emoji = '🛒';
                break;
            default:
                typeLabel = 'Transaction';
                emoji = '💳';
        }

        const amount = transaction.amount.toLocaleString('fr-FR');
        const balance = transaction.balance.toLocaleString('fr-FR');

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `${emoji} ${typeLabel} détecté`,
                body: `Montant: ${amount} FCFA\nNouveau solde: ${balance} FCFA`,
                data: {
                    transactionId: transaction.id,
                    type: transaction.type,
                },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Afficher immédiatement
        });

        console.log('✅ Notification affichée pour la transaction:', transaction.id);
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification:', error);
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
            },
            trigger: null,
        });
    } catch (error) {
        console.error('Erreur lors de l\'affichage de la notification de sync:', error);
    }
}

/**
 * Annule toutes les notifications en attente
 */
export async function cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
}
