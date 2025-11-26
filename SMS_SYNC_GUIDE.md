# Lecture des SMS MTN MoMo - Guide d'utilisation

## ✨ Fonctionnalité de Synchronisation SMS

L'application MTN MoMo Tracker peut maintenant lire vos **vrais SMS** de notifications MTN MoMo directement depuis votre appareil Android !

## 📱 Plateforme supportée

- ✅ **Android** : Lecture complète des SMS
- ❌ **iOS** : Non disponible (restrictions de sécurité d'Apple)
- ❌ **Web** : Non disponible

## 🚀 Comment ça marche

### 1. Permissions requises

L'application demande la permission `READ_SMS` pour lire vos SMS. Cette permission est nécessaire pour :
- Lire les SMS de notification MTN MoMo
- Parser les informations de transaction
- Synchroniser automatiquement vos transactions

### 2. Utilisation

1. Ouvrez l'application sur votre appareil Android
2. Allez dans l'onglet **Paramètres** (⚙️)
3. Appuyez sur le bouton **"Synchroniser les SMS"**
4. Autorisez l'accès aux SMS si c'est la première fois
5. L'application va :
   - Lire tous les SMS des 90 derniers jours
   - Filtrer uniquement les SMS MTN MoMo
   - Parser et importer les transactions
   - Afficher le résultat dans un dialogue

### 3. Filtrage intelligent

L'application filtre automatiquement les SMS pertinents basés sur :
- Le numéro de l'expéditeur (contient "MTN", "229", etc.)
- Le contenu du message (mots-clés : "momo", "transfert", "retrait", "depot", "paiement", "solde")

## 🔧 Configuration

### Paramètres de synchronisation

Par défaut, la synchronisation lit :
- **Maximum** : 200 SMS
- **Période** : 90 jours en arrière

Ces paramètres peuvent être ajustés dans `app/(tabs)/settings.tsx` :

```typescript
const smsMessages = await readMTNMoMoSMSBodies(200, 90);
//                                             ^^^  ^^
//                                             max  jours
```

## 🛠️ Build de l'application

Pour tester sur un appareil réel Android :

### Option 1 : Build de développement (recommandé pour test)

```bash
# Installer l'application sur un appareil connecté
npx expo run:android
```

### Option 2 : Build de production

```bash
# Créer un APK pour installation
eas build --platform android --profile preview
```

## 📝 Types de transactions supportées

L'application reconnaît et parse les types suivants :
- 💸 **Retraits** : Retrait d'argent via agent
- 💰 **Dépôts** : Dépôt reçu
- 📤 **Transferts envoyés** : Argent envoyé à un contact
- 📥 **Transferts reçus** : Argent reçu d'un contact
- 💳 **Paiements** : Paiement de factures, bundles, etc.
- 🌍 **Transferts UEMOA** : Transferts internationaux (région UEMOA)

## 🔒 Sécurité et confidentialité

- ✅ Toutes les données restent **100% locales** sur votre appareil
- ✅ Aucune donnée n'est envoyée à un serveur externe
- ✅ L'application ne lit que les SMS MTN MoMo
- ✅ Stockage sécurisé avec AsyncStorage

## 🐛 Dépannage

### "Permission de lecture des SMS refusée"
➡️ Allez dans **Paramètres** → **Applications** → **MTN MoMo Tracker** → **Permissions** → Activez **SMS**

### "Aucun SMS trouvé"
➡️ Vérifiez que :
- Vous avez des SMS de notifications MTN MoMo dans votre boîte de réception
- Les SMS ne sont pas trop anciens (> 90 jours)
- Vous avez autorisé la permission de lecture des SMS

### L'application ne lit pas tous mes SMS
➡️ Augmentez la limite dans le code :
```typescript
const smsMessages = await readMTNMoMoSMSBodies(500, 180);
//                                             500 SMS, 180 jours
```

## 📚 Modules utilisés

- **`react-native-get-sms-android`** : Lecture des SMS sur Android
- **`@react-native-async-storage/async-storage`** : Stockage local
- **`expo`** : Framework React Native

## 💡 Notes importantes

1. **Première utilisation** : La première synchronisation peut prendre quelques secondes selon le nombre de SMS
2. **Doublons** : L'application évite automatiquement les doublons grâce aux IDs de transaction
3. **Performance** : Limiter à 200-500 SMS max pour des performances optimales
4. **Build natif requis** : La lecture SMS ne fonctionne pas avec Expo Go, vous devez builder l'application

## 🎯 Prochaines améliorations possibles

- [ ] Synchronisation automatique en arrière-plan
- [ ] Configuration personnalisable des filtres SMS
- [ ] Support de plusieurs opérateurs mobiles
- [ ] Détection automatique des nouveaux SMS
- [ ] Export des transactions en CSV/Excel
