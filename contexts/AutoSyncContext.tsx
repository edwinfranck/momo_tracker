import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { hasAllPermissions } from '@/utils/permissionsService';
import { readMTNMoMoSMS } from '@/utils/smsReader';
import { useTransactions } from './TransactionsContext';
import { useOnboarding } from './OnboardingContext';

const INITIAL_SYNC_COMPLETED_KEY = '@initial_sync_completed';

export const [AutoSyncProvider, useAutoSync] = createContextHook(() => {
    const [isInitialSyncCompleted, setIsInitialSyncCompleted] = useState<boolean | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncError, setSyncError] = useState<string | null>(null);
    const { parseSMSMessages } = useTransactions();
    const { areTermsAccepted, isOnboardingCompleted } = useOnboarding();

    // Charger l'état de la synchronisation initiale
    useEffect(() => {
        loadInitialSyncStatus();
    }, []);

    // Effectuer la synchronisation initiale automatiquement après l'onboarding
    useEffect(() => {
        if (
            Platform.OS === 'android' &&
            isOnboardingCompleted &&
            areTermsAccepted &&
            isInitialSyncCompleted === false &&
            !isSyncing
        ) {
            console.log('🔄 Démarrage de la synchronisation initiale automatique...');
            performInitialSync();
        }
    }, [isOnboardingCompleted, areTermsAccepted, isInitialSyncCompleted, isSyncing]);

    const loadInitialSyncStatus = async () => {
        try {
            const value = await AsyncStorage.getItem(INITIAL_SYNC_COMPLETED_KEY);
            setIsInitialSyncCompleted(value === 'true');
        } catch (error) {
            console.error('Error loading initial sync status:', error);
            setIsInitialSyncCompleted(false);
        }
    };

    const performInitialSync = async () => {
        try {
            setIsSyncing(true);
            setSyncError(null);

            // Vérifier les permissions
            const hasPermission = await hasAllPermissions();
            if (!hasPermission) {
                console.log('⚠️ Permissions non accordées, synchronisation annulée');
                setSyncError('Permissions non accordées');
                return;
            }

            console.log('📱 Lecture de TOUS les SMS MTN MoMo (sans limite)...');

            // Lire TOUS les SMS MTN MoMo historiques
            // maxCount: 999999 (pratiquement illimité)
            // daysBack: 3650 (10 ans)
            const messages = await readMTNMoMoSMS(999999, 3650);

            console.log(`📊 ${messages.length} SMS MTN MoMo trouvés au total`);

            if (messages.length > 0) {
                const count = parseSMSMessages(messages);
                console.log(`✅ Synchronisation initiale terminée: ${count} nouvelles transactions importées sur ${messages.length} SMS trouvés`);
            } else {
                console.log('ℹ️ Aucun SMS MTN MoMo trouvé');
            }

            // Marquer la synchronisation initiale comme terminée
            await AsyncStorage.setItem(INITIAL_SYNC_COMPLETED_KEY, 'true');
            setIsInitialSyncCompleted(true);
        } catch (error) {
            console.error('Erreur lors de la synchronisation initiale:', error);
            setSyncError(error instanceof Error ? error.message : 'Erreur inconnue');
        } finally {
            setIsSyncing(false);
        }
    };

    const resetInitialSync = async () => {
        try {
            await AsyncStorage.removeItem(INITIAL_SYNC_COMPLETED_KEY);
            setIsInitialSyncCompleted(false);
        } catch (error) {
            console.error('Error resetting initial sync:', error);
        }
    };

    return {
        isInitialSyncCompleted,
        isSyncing,
        syncError,
        performInitialSync,
        resetInitialSync,
    };
});
