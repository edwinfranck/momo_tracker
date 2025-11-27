import { Platform, Alert, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ALL_PERMISSIONS_GRANTED_KEY = '@all_permissions_granted';

/**
 * Demande TOUTES les permissions nécessaires (SMS + RECEIVE_SMS + NOTIFICATIONS)
 */
export async function requestAllPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        console.log('Permissions are only required on Android');
        return false;
    }

    try {
        console.log('📱 Demande de toutes les permissions...');

        // Liste des permissions à demander
        const permissions = [
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ];

        // Ajouter POST_NOTIFICATIONS pour Android 13+
        if (Platform.Version >= 33) {
            permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any);
        }

        // Demander toutes les permissions en une seule fois
        const results = await PermissionsAndroid.requestMultiple(permissions);

        console.log('📊 Résultats des permissions:', results);

        // Vérifier que TOUTES les permissions sont accordées
        const allGranted = Object.values(results).every(
            result => result === PermissionsAndroid.RESULTS.GRANTED
        );

        if (allGranted) {
            console.log('✅ Toutes les permissions accordées !');
            await AsyncStorage.setItem(ALL_PERMISSIONS_GRANTED_KEY, 'true');
            return true;
        } else {
            console.warn('⚠️ Certaines permissions ont été refusées');
            await AsyncStorage.setItem(ALL_PERMISSIONS_GRANTED_KEY, 'false');

            // Afficher les permissions refusées
            const denied = Object.entries(results)
                .filter(([_, result]) => result !== PermissionsAndroid.RESULTS.GRANTED)
                .map(([permission]) => permission);

            console.log('❌ Permissions refusées:', denied);

            Alert.alert(
                'Permissions requises',
                'L\'application a besoin d\'accéder à vos SMS et notifications pour fonctionner correctement.\n\n' +
                '• SMS : Pour lire vos transactions MTN MoMo\n' +
                '• Notifications : Pour vous alerter des nouvelles transactions\n\n' +
                'Sans ces permissions, vous devrez synchroniser manuellement.',
                [{ text: 'OK' }]
            );

            return false;
        }
    } catch (error) {
        console.error('❌ Erreur lors de la demande de permissions:', error);
        return false;
    }
}

/**
 * Vérifie si toutes les permissions sont accordées
 */
export async function hasAllPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        const permissions = [
            PermissionsAndroid.PERMISSIONS.READ_SMS,
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
        ];

        // Ajouter POST_NOTIFICATIONS pour Android 13+
        if (Platform.Version >= 33) {
            permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS as any);
        }

        // Vérifier toutes les permissions
        const results = await Promise.all(
            permissions.map(p => PermissionsAndroid.check(p))
        );

        const allGranted = results.every(result => result === true);

        console.log('🔍 Vérification des permissions:', {
            READ_SMS: results[0],
            RECEIVE_SMS: results[1],
            POST_NOTIFICATIONS: results[2] !== undefined ? results[2] : 'N/A',
            allGranted
        });

        return allGranted;
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des permissions:', error);
        return false;
    }
}

/**
 * Vérifie uniquement les permissions SMS (READ + RECEIVE)
 */
export async function hasSMSPermission(): Promise<boolean> {
    if (Platform.OS !== 'android') {
        return false;
    }

    try {
        const readSMS = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.READ_SMS
        );
        const receiveSMS = await PermissionsAndroid.check(
            PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
        );

        const hasPermissions = readSMS && receiveSMS;

        console.log('🔍 Permissions SMS:', { readSMS, receiveSMS, hasPermissions });

        return hasPermissions;
    } catch (error) {
        console.error('❌ Erreur lors de la vérification des permissions SMS:', error);
        return false;
    }
}

/**
 * Demande uniquement les permissions SMS avec dialogue
 */
export async function requestSMSPermissionWithDialog(): Promise<boolean> {
    return await requestAllPermissions();
}

/**
 * Réinitialise les états de permissions (pour debug)
 */
export async function resetPermissionState(): Promise<void> {
    await AsyncStorage.removeItem(ALL_PERMISSIONS_GRANTED_KEY);
    console.log('🔄 États des permissions réinitialisés');
}
