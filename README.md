# 📱 MoMo Tracker

**MoMo Tracker** est une application mobile intelligente et sécurisée conçue pour vous aider à suivre et gérer vos transactions **MTN Mobile Money (MoMo)** automatiquement en analysant vos SMS.

Plus besoin de noter vos dépenses manuellement ou de calculer vos frais : MoMo Tracker le fait pour vous, tout en garantissant une confidentialité totale puisque vos données restent sur votre téléphone.

---

## ✨ Fonctionnalités Principales

### 📊 Tableau de Bord Financier
- **Vue d'ensemble instantanée** : Visualisez vos entrées, sorties, frais et solde net en un coup d'œil.
- **Badges récapitulatifs** : Un résumé compact et horizontal pour ne pas encombrer l'écran.
- **Graphiques d'évolution** : Suivez vos dépenses sur 7 jours ou 6 mois avec des graphiques en bâtons interactifs.

### 📩 Synchronisation Automatique
- **Analyse des SMS** : Importe et catégorise automatiquement vos SMS MTN MoMo.
- **Support complet** : Gère les transferts (envoyés/reçus), paiements, retraits, dépôts, et transactions UEMOA/ONAFRIQ.
- **Détection intelligente** : Extrait précisément les montants, frais, destinataires et soldes.

### 🔍 Gestion des Transactions
- **Historique détaillé** : Liste complète de toutes vos opérations.
- **Filtres avancés** : Filtrez par période (aujourd'hui, 7 jours, mois...), type de transaction, ou montant.
- **Export PDF** : Générez des relevés professionnels filtrés par période et type de transaction.
- **Recherche** : Retrouvez facilement une transaction par nom, numéro ou ID.

### 🔒 Sécurité & Confidentialité
- **Mode Privé (👁️)** : Masquez d'un clic tous les montants et informations sensibles (noms, numéros) pour utiliser l'app en public.
- **Verrouillage Biométrique** : Sécurisez l'accès à l'application via FaceID, TouchID ou code PIN.
- **Protection Screenshots** : Empêche les captures d'écran sur Android pour éviter les fuites de données.
- **Offline First** : Vos données sont stockées localement sur votre appareil. Aucune donnée n'est envoyée sur un serveur externe.

### 🎨 Expérience Utilisateur
- **Thème Sombre/Clair** : S'adapte aux préférences de votre système.
- **Interface Moderne** : Design épuré, animations fluides et navigation intuitive.

---

## 🛠️ Stack Technique

Ce projet est construit avec les technologies modernes de l'écosystème React Native :

- **Framework** : [React Native](https://reactnative.dev/) avec [Expo](https://expo.dev/) (SDK 54)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Navigation** : [Expo Router](https://docs.expo.dev/router/introduction/)
- **Gestion d'état** : [Zustand](https://github.com/pmndrs/zustand) & [TanStack Query](https://tanstack.com/query/latest)
- **Stockage** : AsyncStorage
- **UI/UX** : Lucide React Native (icônes), Expo Linear Gradient
- **Fonctionnalités natives** :
  - `react-native-get-sms-android` (Lecture SMS)
  - `expo-local-authentication` (Biométrie)
  - `expo-screen-capture` (Protection écran)

---

## 🚀 Installation et Démarrage

### Prérequis
- Node.js installé.
- Un appareil Android (pour tester la lecture des SMS) ou un émulateur.

### Étapes

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/momo-tracker.git
   cd momo-tracker
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Lancer l'application**
   ```bash
   npm run android
   ```
   *Note : Pour tester la lecture des SMS, vous devez utiliser un appareil Android physique ou un émulateur avec des SMS simulés.*

---

## 📱 Structure du Projet

```
momo_tracker/
├── app/                 # Pages et routing (Expo Router)
│   ├── (tabs)/          # Écrans principaux (Dashboard, Transactions, Settings)
│   ├── transaction/     # Page de détail d'une transaction
│   └── _layout.tsx      # Layout principal et providers
├── components/          # Composants réutilisables (Cards, Badges, etc.)
├── contexts/            # Contextes React (Transactions, Security, Theme...)
├── utils/               # Utilitaires (smsParser.ts, formatters...)
├── assets/              # Images et polices
└── constants/           # Couleurs et configurations
```

---

## 🛡️ Permissions

L'application nécessite les permissions suivantes pour fonctionner correctement :
- **READ_SMS** : Pour lire et importer vos transactions MoMo.
- **USE_BIOMETRIC** : Pour sécuriser l'accès à l'application.

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request pour suggérer des améliorations.

1. Forker le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---

*Développé avec ❤️ pour simplifier la gestion de vos finances MoMo.*
