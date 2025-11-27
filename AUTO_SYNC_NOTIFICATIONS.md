# 🔔 Synchronisation Automatique et Notifications

## Vue d'ensemble

L'application **MTN MoMo Tracker** dispose maintenant d'un système de **synchronisation automatique en temps réel** qui détecte automatiquement les nouveaux SMS MTN MoMo et affiche des notifications natives.

## ✨ Fonctionnalités

### 🎧 Listener SMS Automatique

- **Écoute en temps réel** : L'application écoute automatiquement tous les nouveaux SMS entrants
- **Filtrage intelligent** : Seuls les SMS MTN MoMo sont traités
- **Parsing automatique** : Les transactions sont automatiquement extraites et sauvegardées
- **Détection de doublons** : Les transactions déjà existantes ne sont pas ajoutées à nouveau

### 📱 Notifications Natives

Lorsqu'un nouveau SMS MTN MoMo est détecté, vous recevez une **notification système** contenant :

- 🎯 **Titre** : Type de transaction avec emoji (ex: "💸 Retrait détecté")
- 💰 **Montant** : Le montant de la transaction
- 📊 **Nouveau solde** : Votre solde actualisé après la transaction
- 🔔 **Son et vibration** : Pour vous alerter immédiatement
- 👆 **Action au clic** : Ouvre l'application (fonctionnalité future)

#### Exemples de notifications :

```
💸 Retrait détecté
Montant: 5,000 FCFA
Nouveau solde: 45,000 FCFA
```

```
📥 Transfert reçu détecté
Montant: 10,000 FCFA
Nouveau solde: 55,000 FCFA
```

```
💰 Dépôt reçu détecté
Montant: 25,000 FCFA
Nouveau solde: 80,000 FCFA
```

## 🚀 Comment ça marche ?

### Au démarrage de l'application

1. ✅ L'application démarre le **listener SMS** automatiquement
2. ✅ Demande la **permission de notifications** si nécessaire
3. ✅ Configure le **canal de notification Android** avec haute priorité

### Quand vous recevez un SMS MTN MoMo

1. 📱 Le système détecte le nouveau SMS
2. 🔍 Vérifie que c'est bien un SMS MTN MoMo (Retrait, Dépôt, Transfert, etc.)
3. 🧠 Parse automatiquement le contenu pour extraire les informations
4. 💾 Sauvegarde la transaction dans la base de données locale
5. 🔔 Affiche une notification native avec les détails
6. 📊 Met à jour le solde et les statistiques en temps réel

### Avantages vs bouton "Synchroniser les SMS"

| Ancienne méthode (Manuelle) | Nouvelle méthode (Automatique) |
|------------------------------|--------------------------------|
| ❌ Nécessite d'ouvrir l'app | ✅ Fonctionne en arrière-plan |
| ❌ Cliquer sur "Synchroniser" | ✅ Détection automatique |
| ❌ Pas de notification | ✅ Notification instantanée |
| ❌ Mise à jour retardée | ✅ Mise à jour en temps réel |
| ❌ Peut oublier de synchroniser | ✅ Toujours à jour |

## 📋 Permissions Requises

L'application nécessite les permissions Android suivantes :

- `READ_SMS` : Lire les SMS existants pour la synchronisation manuelle
- `RECEIVE_SMS` : Recevoir et écouter les nouveaux SMS entrants
- `POST_NOTIFICATIONS` : Afficher des notifications système

## 🔧 Architecture Technique

### Fichiers créés/modifiés

1. **`utils/notificationService.ts`**
   - Gestion des notifications natives
   - Configuration du canal Android
   - Formatage des messages de notification

2. **`utils/smsListener.ts`**
   - Écoute des SMS entrants via DeviceEventEmitter
   - Filtrage des SMS MTN MoMo
   - Callbacks pour les nouveaux SMS

3. **`contexts/TransactionsContext.tsx`**
   - Démarrage automatique du listener au montage
   - Gestion des nouveaux SMS détectés
   - Intégration avec le système de notifications

4. **`app.json`**
   - Ajout des permissions Android
   - Configuration du plugin expo-notifications

## 🎯 Utilisation

### Aucune action requise !

Une fois l'application installée et les permissions accordées :

1. ✅ **Au premier lancement** : Acceptez les permissions SMS et Notifications
2. ✅ **C'est tout !** Le système fonctionne automatiquement en arrière-plan

### Synchronisation manuelle toujours disponible

Le bouton "**Synchroniser les SMS**" dans les paramètres reste disponible pour :

- 📥 Importer les SMS historiques (avant l'installation de l'app)
- 🔄 Re-synchroniser en cas de problème
- 📊 Vérifier manuellement les nouvelles transactions

## 🧪 Test du système

### Pour tester la fonctionnalité :

1. 🔨 Rebuild l'application : `npm run android`
2. 📱 Installez l'app sur votre téléphone Android
3. ✅ Acceptez les permissions (SMS + Notifications)
4. 💸 Effectuez une transaction MTN MoMo réelle
5. 📨 Attendez de recevoir le SMS de notification MTN
6. 🔔 Vous devriez recevoir une notification de l'app immédiatement !
7. 📊 Ouvrez l'app pour voir la transaction ajoutée automatiquement

## ⚠️ Notes importantes

- ✅ **Android uniquement** : Cette fonctionnalité n'est disponible que sur Android (iOS ne permet pas la lecture de SMS pour des raisons de sécurité)
- 🔋 **Impact sur la batterie** : Minimal, le listener utilise des événements natifs optimisés
- 📶 **Fonctionne hors ligne** : Aucune connexion internet requise
- 🔒 **Confidentialité** : Tout reste local, aucune donnée n'est envoyée à des serveurs externes

## 🐛 Dépannage

### Si les notifications ne s'affichent pas :

1. Vérifiez que les permissions sont accordées dans les paramètres Android
2. Assurez-vous que les notifications de l'app ne sont pas désactivées
3. Vérifiez les logs de la console pour voir si le SMS est détecté
4. Essayez de redémarrer l'application

### Si le listener ne démarre pas :

1. Vérifiez que vous êtes bien sur Android (pas iOS ou Web)
2. Consultez les logs pour voir les messages de démarrage du listener
3. Assurez-vous que la permission READ_SMS est accordée

## 🚧 Améliorations futures possibles

- [ ] Ouvrir directement les détails de la transaction au clic sur notification
- [ ] Permettre de désactiver/activer le listener depuis les paramètres
- [ ] Statistiques de synchronisation automatique (nombre de SMS détectés)
- [ ] Badge sur l'icône de l'app pour les nouvelles transactions
- [ ] Centre de notifications in-app pour voir l'historique des notifications

## 📞 Support

Si vous rencontrez des problèmes, vérifiez d'abord les logs de la console et le fichier `SMS_SYNC_GUIDE.md` pour plus d'informations sur la synchronisation SMS.
