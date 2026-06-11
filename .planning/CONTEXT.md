# DrunkField — CONTEXT.md Phase 1

> Contexte technique et décisions d'architecture pour la Phase 1.

---

## Stack retenue

```
React 18 + Vite 5
Tailwind CSS 3
Vite PWA Plugin (Workbox)
Zustand + idb-keyval (persistance IndexedDB)
Vitest + @testing-library/react
```

## Structure de données (IndexedDB)

### Store `members`
```ts
interface Member {
  id: string          // uuid
  name: string        // prénom
  emoji: string       // avatar emoji
  weightKg?: number   // pour Widmark (optionnel)
  sex?: 'M' | 'F'     // pour Widmark (optionnel)
  createdAt: number   // timestamp ms
}
```

### Store `drinks`
```ts
interface Drink {
  id: string
  memberId: string
  name: string        // ex: "Leffe Blonde"
  alcoholPercent: number  // 0–100
  volumeCl: number    // volume en centilitres
  timestamp: number   // ms
}
```

### Store `ratings`
```ts
interface DrunkRating {
  id: string
  memberId: string
  score: number       // 0–10
  timestamp: number
}
```

### Store `settings`
```ts
interface Settings {
  reminderIntervalMin: number  // défaut: 30
  pushPermissionGranted: boolean
}
```

## Formule Widmark (simplifiée)

```
BAC = (alcoolPur_g / (poidsKg * r)) - (0.15 * heures)

alcoolPur_g = volume_dl * (alcool% / 100) * 0.789 * 10
r = 0.68 pour H, 0.55 pour F (défaut 0.68 si inconnu)
```

Affichage : g/L avec disclaimer médical systématique.
Si poids/sexe inconnus → afficher "?" avec invite à compléter le profil.

## Service Worker — rappels

- Enregistrement SW via Vite PWA plugin (generateSW mode).
- Permission push demandée après clic utilisateur explicite ("Activer les rappels").
- `setInterval` dans le SW (ou `setTimeout` récursif) toutes les `reminderIntervalMin` minutes.
- Notif cliquable → ouvre l'app sur l'écran de notation d'ivresse.
- Fallback : si push refusé, timer in-app (visible uniquement si app ouverte).

## Architecture composants (cible)

```
App
├── OnboardingScreen    — setup membres au premier lancement
├── HomeScreen          — dashboard groupe (alcoolémie, classement)
│   └── MemberCard      — carte par membre avec BAC estimé
├── DrinkLogScreen      — formulaire logger une boisson
├── RatingScreen        — noter son ivresse (ouvert depuis notif)
├── MembersScreen       — CRUD membres
└── SettingsScreen      — intervalle rappels, profil poids/sexe
```

## Fichiers clés à créer en Phase 1

```
src/
  stores/
    membersStore.ts
    drinksStore.ts
    ratingsStore.ts
    settingsStore.ts
  lib/
    widmark.ts          — calcul BAC
    db.ts               — idb-keyval helpers
  components/
    MemberCard.tsx
    DrinkForm.tsx
    RatingModal.tsx
  screens/
    HomeScreen.tsx
    DrinkLogScreen.tsx
    MembersScreen.tsx
    RatingScreen.tsx
    SettingsScreen.tsx
  sw/
    reminder.ts         — logique timer dans le SW
public/
  manifest.json
  icons/                — icônes PWA (192, 512)
```
