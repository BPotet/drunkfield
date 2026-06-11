# DrunkField — Phase 1 Implementation Plan

## Wave 0 — Project Scaffold (no deps, fully parallel)

- **`package.json` + `vite.config.ts` + `tsconfig.json`** — M
  - React 18 + TS template; deps: zustand, idb-keyval, uuid, react-router-dom
  - devDeps: tailwindcss, vite-plugin-pwa, vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom
  - vite.config: `@vitejs/plugin-react` + `vite-plugin-pwa` en mode **injectManifest** (`swSrc: 'src/sw/reminder.ts'`, `swDest: 'sw.js'`); vitest block (`environment: 'jsdom'`, `setupFiles: ['src/setupTests.ts']`)

- **`tailwind.config.js` + `postcss.config.js` + `src/index.css`** — S
  - content glob `src/**/*.{ts,tsx}`; directives @tailwind dans index.css

- **`public/manifest.json`** — S
  - name "DrunkField", display standalone, theme_color #16a34a, icons 192+512

- **`public/icons/icon-192.png` + `icon-512.png`** — S
  - Icônes vertes simples avec "DF"

- **`src/setupTests.ts`** — S
  - Import @testing-library/jest-dom; mock global idb-keyval (get/set/del/keys stubs)

- **`index.html`** — S
  - theme-color meta, link manifest

---

## Wave 1 — Data Layer (dépend Wave 0 package.json; tâches parallèles)

- **`src/lib/db.ts`** — S
  - `dbGet<T>`, `dbSet<T>`, `dbDel`, `dbGetAll<T>(prefix)` sur idb-keyval
  - Convention clés: `members:{id}`, `drinks:{id}`, `ratings:{id}`, `settings`

- **`src/lib/widmark.ts`** — S
  - `computeBAC(drinks, member, nowMs): number | null` (null si weightKg absent)
  - Élimination par boisson (0.15 g/L/h depuis chaque boisson, floor 0)
  - Constants: `R_MALE = 0.68`, `R_FEMALE = 0.55`

- **`src/stores/membersStore.ts`** — M
  - Zustand: `{ members: Member[] }` + addMember, updateMember, removeMember
  - Hydratation depuis IndexedDB au init; chaque mutation appelle dbSet/dbDel
  - Exporte interface `Member`

- **`src/stores/drinksStore.ts`** — M
  - Même pattern; `{ drinks: Drink[] }` + addDrink, removeDrink
  - Exporte interface `Drink`

- **`src/stores/ratingsStore.ts`** — S
  - `{ ratings: DrunkRating[] }` + addRating
  - Exporte interface `DrunkRating`

- **`src/stores/settingsStore.ts`** — S
  - `{ settings: Settings }` + updateSettings(partial)
  - Défaut: `{ reminderIntervalMin: 30, pushPermissionGranted: false }`
  - Exporte interface `Settings`

---

## Wave 2 — Tests unitaires data layer (dépend Wave 1; parallèle avec Wave 3)

- **`src/lib/widmark.test.ts`** — S
  - 0 boissons → BAC 0; boisson connue → valeur g/L vérifiée; 2h plus tôt → élimination; null sans poids; r différent par sexe

- **`src/stores/membersStore.test.ts`** — S
  - addMember incrémente + appelle dbSet; removeMember retire + dbDel; hydratation au init

- **`src/stores/drinksStore.test.ts`** — S
  - Même pattern que membersStore.test

---

## Wave 3 — Shell + Routing (dépend Wave 0; parallèle Wave 2)

- **`src/main.tsx`** — S
  - Monte App dans #root; importe index.css; registerSW depuis virtual:pwa-register

- **`src/App.tsx`** — M
  - BrowserRouter + Routes: `/`→HomeScreen, `/drinks`→DrinkLogScreen, `/members`→MembersScreen, `/rate`→RatingScreen, `/settings`→SettingsScreen
  - Bottom nav fixe (5 onglets)

---

## Wave 4 — Composants réutilisables (dépend Wave 1 + Wave 3; parallèles)

- **`src/components/MemberCard.tsx`** — S
  - Props: member, bac (number|null), lastRating
  - Affiche emoji + nom, BAC en g/L ou "?", score ivresse, disclaimer médical

- **`src/components/DrinkForm.tsx`** — M
  - Champs: membre (select), nom boisson, % alcool (0–100), volume cL
  - Validation + submit → drinksStore.addDrink + reset

- **`src/components/RatingModal.tsx`** — S
  - Overlay: slider 0–10 + "Valider" → ratingsStore.addRating + onClose

---

## Wave 5 — Screens (dépend Wave 4; parallèles)

- **`src/screens/HomeScreen.tsx`** — M
  - Calcule BAC par membre via computeBAC; trie desc; liste MemberCard; bouton + vers /drinks; disclaimer banner

- **`src/screens/DrinkLogScreen.tsx`** — S
  - DrinkForm + liste boissons du jour par membre + delete

- **`src/screens/MembersScreen.tsx`** — M
  - Liste membres + edit/delete; formulaire ajout (nom + emoji picker 20 emojis); champs poids/sexe optionnels

- **`src/screens/RatingScreen.tsx`** — S
  - Sélecteur membre (ou ?memberId= depuis notif); RatingModal inline; redirect / après save

- **`src/screens/SettingsScreen.tsx`** — M
  - Intervalle rappels; bouton "Activer rappels" → Notification.permission + postMessage SW; bouton install PWA

---

## Wave 6 — Service Worker (dépend Wave 0 vite config; indépendant UI)

- **`src/sw/reminder.ts`** — L
  - SW custom (injectManifest): precache Workbox manifest; setInterval/setTimeout loop → showNotification
  - Message handler: `SET_INTERVAL` → restart timer; `STOP` → clear
  - notificationclick → clients.openWindow('/rate?memberId=...')

---

## Wave 7 — Tests d'intégration (dépend Waves 4 + 5)

- **`src/components/DrinkForm.test.tsx`** — M
- **`src/screens/HomeScreen.test.tsx`** — M
- **`src/components/RatingModal.test.tsx`** — S

---

## Wave 8 — Finitions (dépend tout)

- **Onboarding**: si members.length === 0 → redirect /members avec message bienvenue
- **Install prompt**: hook useInstallPrompt, bouton dans SettingsScreen

---

## Décisions clés

| Décision | Raison |
|---|---|
| injectManifest (pas generateSW) | Logique setInterval + message-passing nécessite SW custom |
| Élimination par boisson | Plus précis qu'un offset global sur session longue |
| null BAC si poids manquant | Sécurité + incite à compléter le profil |
| Pas de localStorage fallback | Évite dual-state bugs |
| Bottom nav permanent | Festival mobile-first, navigation directe |
