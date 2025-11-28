# 📋 Instructions - Activer la Protection Screenshots

## ✅ Modifications déjà effectuées

1. ✅ TransactionsScreen - Summary supprimé
2. ✅ TransactionsScreen - Bouton "Retour en haut" ajouté
3. ✅ TransactionsScreen - Indicateur de scroll activé
4. ✅ Settings - Section "Statistiques" supprimée
5. ⏳ Protection screenshots - **En attente d'installation**

## 🔧 Étapes pour activer la protection screenshots

### Étape 1 : Installer le package

```bash
npx expo install expo-screen-capture
```

### Étape 2 : Décommenter les imports dans `_layout.tsx`

Ouvrir `/home/edwin/projects/momo_tracker/app/_layout.tsx`

**Ligne 14** - Décommenter :
```typescript
// AVANT
// import * as ScreenCapture from "expo-screen-capture"; // À décommenter après installation

// APRÈS
import * as ScreenCapture from "expo-screen-capture";
```

### Étape 3 : Ajouter le code de protection

Dans le fichier `app/_layout.tsx`, dans la fonction `RootLayoutNav()`, **ajouter ce useEffect** après la ligne 32 (après les autres hooks) :

```typescript
function RootLayoutNav() {
  const { isSecurityEnabled, isAuthenticated } = useSecurity();
  const {
    areTermsAccepted,
    isOnboardingCompleted,
    arePermissionsRequested,
    isLoading: onboardingLoading,
    markPermissionsRequested,
  } = useOnboarding();

  const { colors, activeColorScheme } = useTheme();

  // ⬇️⬇️⬇️ AJOUTER CE CODE ICI ⬇️⬇️⬇️
  // Activer la protection contre les screenshots
  useEffect(() => {
    if (Platform.OS === 'android') {
      ScreenCapture.preventScreenCaptureAsync()
        .then(() => console.log('✅ Protection screenshots activée'))
        .catch((err) => console.error('❌ Erreur protection screenshots:', err));
    }

    return () => {
      if (Platform.OS === 'android') {
        ScreenCapture.allowScreenCaptureAsync()
          .catch((err) => console.error('❌ Erreur désactivation protection:', err));
      }
    };
  }, []);
  // ⬆️⬆️⬆️ FIN DU CODE À AJOUTER ⬆️⬆️⬆️

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // ... reste du code ...
}
```

### Étape 4 : Rebuild l'application

```bash
npm run android
```

⚠️ **Important** : Un rebuild complet est nécessaire car `expo-screen-capture` utilise des modules natifs.

## 🧪 Tester la protection

### Test 1 : Screenshots bloqués

1. Lancez l'application
2. Naviguez vers n'importe quelle page (Dashboard, Transactions, etc.)
3. Essayez de faire un screenshot :
   - **Android** : Power + Volume bas
4. **Résultat attendu** :
   - ❌ Le screenshot ne se fait pas
   - ✅ Message système : "Impossible de capturer l'écran"
   - ✅ Aucun fichier sauvegardé dans la galerie

### Test 2 : Vérifier les logs

Dans les logs de l'application, vous devriez voir :
```
✅ Protection screenshots activée
```

Si vous voyez une erreur :
```
❌ Erreur protection screenshots: [erreur]
```
Vérifiez que le package est bien installé et que vous avez rebuild.

## 📝 Code complet du useEffect

Voici le code complet à copier-coller :

```typescript
// Activer la protection contre les screenshots
useEffect(() => {
  if (Platform.OS === 'android') {
    ScreenCapture.preventScreenCaptureAsync()
      .then(() => console.log('✅ Protection screenshots activée'))
      .catch((err) => console.error('❌ Erreur protection screenshots:', err));
  }

  return () => {
    // Nettoyer lors du démontage (optionnel, généralement pas nécessaire)
    if (Platform.OS === 'android') {
      ScreenCapture.allowScreenCaptureAsync()
        .catch((err) => console.error('❌ Erreur désactivation protection:', err));
    }
  };
}, []);
```

## 🎯 Résumé

### Ce qui fonctionne déjà (sans rebuild)
- ✅ TransactionsScreen sans summary
- ✅ Bouton "Retour en haut" fonctionnel
- ✅ Indicateur de scroll visible
- ✅ Settings sans section statistiques

### Ce qui nécessite installation + rebuild
- ⏳ Protection screenshots (suivre les étapes ci-dessus)

## 💡 Note sur iOS

Sur iOS, la protection screenshots n'est pas possible via API. Ce que vous pouvez faire :
- Détecter quand un screenshot est pris
- Afficher un message à l'utilisateur
- Masquer temporairement le contenu sensible

Mais vous **ne pouvez pas bloquer** le screenshot lui-même.

## 🚀 Commandes rapides

```bash
# 1. Installer
npx expo install expo-screen-capture

# 2. Décommenter l'import dans _layout.tsx
# 3. Ajouter le useEffect (voir ci-dessus)

# 4. Rebuild
npm run android
```

---

**Après ces étapes, votre application sera complètement protégée contre les screenshots ! 🔒**
