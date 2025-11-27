# Améliorations de Synchronisation et Permissions SMS

## Modifications Effectuées

### 1. Service de Gestion des Permissions SMS
**Fichier:** `utils/permissionsService.ts`

- Nouveau service centralisé pour gérer les permissions SMS
- Demande les permissions avec un dialogue explicatif
- Suivi de l'état des permissions dans AsyncStorage
- Gestion des refus avec messages informatifs

### 2. Demande Automatique de Permissions
**Fichier:** `components/TermsAndConditions.tsx`

- Les permissions SMS sont maintenant demandées automatiquement après l'acceptation des conditions d'utilisation
- L'utilisateur reçoit une explication claire de pourquoi les permissions sont nécessaires

### 3. Synchronisation Automatique Initiale
**Fichier:** `contexts/AutoSyncContext.tsx`

- Nouveau contexte pour gérer la synchronisation automatique
- Après l'onboarding et l'acceptation des termes, l'application synchronise automatiquement les SMS des 6 derniers mois (180 jours)
- La synchronisation initiale ne se fait qu'une seule fois
- Limite de 500 SMS pour éviter les problèmes de performance

**Intégration:** Ajouté dans `app/_layout.tsx`

### 4. Pull-to-Refresh sur le Tableau de Bord
**Fichier:** `app/(tabs)/index.tsx`

- Ajout d'un `RefreshControl` sur le `ScrollView` du tableau de bord
- L'utilisateur peut maintenant tirer vers le bas pour synchroniser manuellement
- Lit les SMS des 30 derniers jours (limite de 200 SMS)
- Affiche des dialogues informatifs pour :
  - Succès de synchronisation avec nombre de nouvelles transactions
  - Aucune nouvelle transaction trouvée
  - Aucun SMS trouvé
  - Erreurs de synchronisation
- Demande les permissions si elles n'ont pas été accordées

### 5. Suppression des Notifications Expo
**Fichier:** `contexts/TransactionsContext.tsx`

- Suppression de l'import et de l'utilisation de `showTransactionNotification`
- Cette fonction ne fonctionne plus dans Expo Go depuis SDK 53
- Les notifications in-app continuent de fonctionner normalement

## Flux d'Utilisation

### Premier Lancement

1. **Onboarding** : L'utilisateur voit les écrans d'introduction
2. **Conditions d'Utilisation** : L'utilisateur accepte les termes
3. **Permissions SMS** : Dialogue automatique demandant l'accès aux SMS
4. **Synchronisation Initiale** : 
   - Si les permissions sont accordées : synchronisation automatique des SMS des 6 derniers mois
   - Si refusées : l'utilisateur peut synchroniser manuellement plus tard
5. **Tableau de Bord** : Affichage des transactions importées

### Utilisation Quotidienne

1. **Détection Automatique** : Les nouveaux SMS MTN MoMo sont automatiquement détectés et ajoutés (si permissions accordées)
2. **Synchronisation Manuelle** : 
   - Tirer vers le bas sur le tableau de bord
   - Synchronise les 30 derniers jours
   - Affiche un message avec le résultat

## Configuration des Limites

| Type de Sync | Nombre de SMS | Jours en Arrière |
|-------------|---------------|------------------|
| Initiale (auto) | 500 max | 180 jours (6 mois) |
| Manuelle (pull-to-refresh) | 200 max | 30 jours (1 mois) |
| Listener temps réel | Illimité | Temps réel |

## Gestion des Erreurs

- **Permission refusée** : Message explicatif + possibilité de synchroniser manuellement
- **Aucun SMS trouvé** : Dialogue informatif
- **Erreur de lecture** : Dialogue d'erreur avec log console
- **SMS déjà importés** : Détection de doublons automatique

## Points d'Amélioration Futurs

1. **Synchronisation en arrière-plan** : Utiliser `expo-task-manager` pour synchroniser périodiquement
2. **Progression de synchronisation** : Afficher une barre de progression pour les grandes synchronisations
3. **Paramètres de synchronisation** : Permettre à l'utilisateur de configurer les limites
4. **Statistiques de sync** : Afficher la date de dernière synchronisation

## Notes Techniques

- **Expo Go SDK 53** : Les notifications push ne sont plus supportées dans Expo Go, d'où la suppression
- **Development Build** : Pour utiliser les notifications push, il faudra créer un development build
- **Permissions Android** : Les permissions SMS nécessitent Android (pas d'équivalent iOS)
- **AsyncStorage** : Utilisé pour persister les états de permissions et de synchronisation

## Tests Recommandés

1. ✅ Premier lancement complet (onboarding → termes → permissions → sync)
2. ✅ Refus de permissions → synchronisation manuelle
3. ✅ Pull-to-refresh avec nouvelles transactions
4. ✅ Pull-to-refresh sans nouvelles transactions
5. ✅ Détection automatique de nouveaux SMS (si permissions accordées)
6. ✅ Pas de doublons après synchronisation multiple
