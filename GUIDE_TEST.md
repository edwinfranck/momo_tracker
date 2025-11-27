# 🔔 Guide de Test - Synchronisation Automatique

## ❌ Pourquoi ça n'a pas fonctionné ?

Vous avez testé avec de l'argent réel (100F de bundle) mais **l'application installée sur votre téléphone est l'ANCIENNE VERSION** qui n'a pas les nouvelles fonctionnalités.

**Les changements sont dans le code mais pas dans l'APK !**

## ✅ Solution : Rebuild Obligatoire

### Étape 1 : Rebuild l'application

```bash
cd /home/edwin/projects/momo_tracker
npm run android
```

**⏱️ Durée** : 3-5 minutes

**📱 Résultat** : L'APK sera automatiquement installé sur votre téléphone connecté

### Étape 2 : Vérifier les permissions

Quand l'app s'ouvre, elle va demander :
1. ✅ **Permission SMS** → Acceptez
2. ✅ **Permission Notifications** → Acceptez

### Étape 3 : TEST SANS ARGENT ! 🎁

**J'ai ajouté un bouton de test spécialement pour vous !**

1. Ouvrez l'app
2. Allez dans **Paramètres**
3. Cherchez le bouton **"🔵 Tester la notification"**
4. Cliquez dessus
5. ✅ Vous devriez voir une notification de test apparaître !

```
┌─────────────────────────────────────┐
│ MTN MoMo Tracker                    │
│ 💸 Retrait détecté                  │
│ Montant: 5,000 FCFA                 │
│ Nouveau solde: 45,000 FCFA          │
└─────────────────────────────────────┘
```

### Étape 4 : Test en conditions réelles (optionnel)

Si vous voulez tester avec un vrai SMS, utilisez une **petite transaction** :
- Achat de bundle 50F ou 100F
- Vous recevrez le SMS MTN
- **IMMÉDIATEMENT** la notification de l'app apparaîtra
- Le solde sera mis à jour automatiquement

## 🎯 Résumé de ce qui a été ajouté

### 1. Synchronisation Automatique
- ✅ Listener SMS en temps réel
- ✅ Détection automatique des transactions
- ✅ Sauvegarde automatique
- ✅ Mise à jour du solde en temps réel

### 2. Notifications Natives
- ✅ Notification pour chaque transaction
- ✅ Affichage du type (💸 Retrait, 💰 Dépôt, etc.)
- ✅ Montant de la transaction
- ✅ Nouveau solde
- ✅ Son et vibration

### 3. Bouton de Test (NOUVEAU !)
- ✅ Tester les notifications SANS dépenser d'argent
- ✅ Vérifier que tout fonctionne
- ✅ Accessible dans Paramètres

## 📋 Checklist Complète

Avant de dire "ça ne marche pas", vérifiez :

- [ ] J'ai exécuté `npm run android`
- [ ] L'APK s'est installé sur mon téléphone
- [ ] J'ai accepté la permission SMS
- [ ] J'ai accepté la permission Notifications
- [ ] J'ai cliqué sur "Tester la notification"
- [ ] J'ai vu la notification de test

Si tout ça est fait et que la notification de test apparaît → **ÇA MARCHE !** 🎉

Sinon, regardez les logs :
```bash
npx react-native log-android
```

Cherchez :
```
🚀 Initialisation du listener SMS automatique...
✅ Listener SMS démarré avec succès
✅ Notification affichée pour la transaction
```

## 💡 Pour l'Avenir

**Ne testez PLUS avec de l'argent réel !**

Utilisez :
1. Le bouton "Tester la notification" pour vérifier le système
2. Le bouton "Synchroniser les SMS" pour importer l'historique
3. Pour les vrais tests SMS, attendez vos vraies transactions quotidiennes

## 🔄 Prochaine Commande

**EXÉCUTEZ MAINTENANT :**

```bash
npm run android
```

Puis testez avec le bouton de test ! 🚀
