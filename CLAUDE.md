# DrunkField — CLAUDE.md

> Context-engineering file for Claude Code (GSD methodology).
> Read this file at the start of every session before touching code.

---

## Project Brief

**DrunkField** est une Progressive Web App (PWA) conçue pour le festival **Greenfield**.

Elle permet à un groupe d'amis ("le groupe DrunkField") de :

1. **Logger les binches** — enregistrer chaque boisson consommée avec son pourcentage d'alcool, le membre du groupe qui la boit, et l'heure.
2. **Suivre le taux d'alcool estimé** par membre au fil du temps (courbe d'ivresse).
3. **Rappels périodiques** — notifier chaque membre (push notification PWA) de noter sa **note personnelle d'ivresse** (0–10) à intervalles réguliers (toutes les 30 min par défaut).
4. **Tableau de bord groupe** — voir qui est le plus bourré en temps réel.

L'app est **offline-first** (festival = mauvais réseau), installable sur mobile, sans backend obligatoire (localStorage/IndexedDB en V1).

---

## Tech Stack (cible)

| Couche | Choix |
|---|---|
| Framework UI | React + Vite |
| PWA | Vite PWA plugin (Workbox) |
| State | Zustand (persisté IndexedDB) |
| Styling | Tailwind CSS |
| Notifications | Web Push API / service worker |
| Tests | Vitest + Testing Library |
| Déploiement | GitHub Pages / Netlify (statique) |

---

## Architecture Decisions

- **Offline-first** : tout l'état est local (IndexedDB via idb-keyval). Pas de serveur en V1.
- **Multi-membres sans compte** : les membres du groupe sont créés localement (nom + avatar emoji). Un seul appareil par membre, ou partage par QR code en V2.
- **Calcul alcoolémie** : formule de Widmark simplifiée (poids, sexe, boissons, temps). Affiché à titre indicatif avec disclaimer médical.
- **Service Worker** : gère le cache offline et déclenche les rappels périodiques via `setInterval` dans le SW (ou Background Sync si supporté).
- **Pas de tracking** : aucune donnée ne quitte l'appareil en V1.

---

## Project State

```
Phase courante : 0 — Greenfield (repo vide, pas encore démarré)
Dernier ship   : —
Prochain step  : /gsd-discuss-phase → définir Phase 1 (setup + squelette PWA)
```

Fichier d'état détaillé : `.planning/STATE.md` (créé à la première phase)

---

## GSD Workflow

Ce projet suit la boucle **Discuss → Plan → Execute → Verify → Ship** de GSD Core.

```
1. DISCUSS   Clarifier les exigences de la phase avec l'utilisateur
2. PLAN      Décomposer en tâches, identifier les fichiers clés, estimer la complexité
3. EXECUTE   Implémenter en parallèle dans des sous-agents isolés
4. VERIFY    Tester manuellement le golden path + edge cases, lancer les tests
5. SHIP      Commit propre + push sur la branche de feature + PR si demandée
```

**Règles d'exécution :**
- Les gros travaux tournent dans des sous-agents frais (Agent tool) pour préserver le contexte principal.
- `STATE.md` et `CONTEXT.md` dans `.planning/` survivent aux limites de session.
- Ne pas implémenter sans avoir validé le plan avec l'utilisateur.
- Ne pas passer à SHIP sans avoir passé VERIFY.

---

## Commands (GSD Skills disponibles)

| Commande | Action |
|---|---|
| `/gsd-discuss-phase` | Lancer la phase de discussion pour la prochaine feature |
| `/gsd-plan-phase` | Rechercher, planifier, décomposer une phase |
| `/gsd-execute-phase` | Implémenter les tâches planifiées |
| `/gsd-verify-work` | Vérifier le travail livré (tests + smoke test UI) |
| `/gsd-ship` | Commit + push + PR optionnelle |
| `/gsd-progress` | Afficher l'état et avancer à la prochaine étape |
| `/gsd-capture` | Capturer une idée ou une tâche dans le backlog |
| `/gsd-debug` | Debug systématique avec état persisté |
| `/code-review` | Revue de code sur le diff courant |
| `/verify` | Vérifier qu'une feature fonctionne dans l'app réelle |

---

## Behavioral Guidelines

### 1. Think Before Coding

Before implementing: state assumptions explicitly, surface tradeoffs, ask if anything is unclear. Don't pick silently between interpretations.

### 2. Simplicity First

Minimum code that solves the problem. No speculative features, no abstractions for single-use code, no error handling for impossible scenarios. If it could be 50 lines, don't write 200.

### 3. Surgical Changes

Touch only what the task requires. Don't improve adjacent code. Match existing style. If your changes create unused imports/variables, remove them — don't touch pre-existing dead code unless asked.

### 4. Goal-Driven Execution

For multi-step tasks, state a brief plan with verifiable success criteria before starting. Loop until verified.

---

## Conventions

### Git

- Branche de dev : `claude/greenfield-drinking-tracker-rwzoeo`
- Format de commit : `type(scope): message` (ex: `feat(drinks): add alcohol percentage input`)
- Push : toujours `git push -u origin <branch>`
- Ne jamais push sur `main` directement.

### Code

- Pas de commentaires sauf pour les invariants non-évidents (formule Widmark, logique SW).
- Pas de features au-delà du scope de la phase courante.
- Valider uniquement aux frontières système (entrée utilisateur, calculs alcoolémie).
- Le disclaimer médical doit toujours être visible sur les écrans d'alcoolémie.

### PWA / Notifications

- Demander la permission push uniquement après une action utilisateur explicite.
- L'intervalle de rappel est configurable par l'utilisateur (défaut : 30 min).
- Le service worker ne doit jamais bloquer le thread principal.

### Tests

- Tester la logique métier (calcul Widmark, gestion des membres) avec Vitest.
- Tester les composants critiques (formulaire boisson, dashboard) avec Testing Library.
- Pas de tests E2E en V1 (festival context, keep it simple).

---

## Backlog Rapide

- [ ] V1 : Setup Vite + React + Tailwind + PWA plugin
- [ ] V1 : Gestion des membres du groupe (CRUD, emoji avatar)
- [ ] V1 : Logger une boisson (nom, %, volume, membre, heure)
- [ ] V1 : Calcul alcoolémie estimée par membre (Widmark)
- [ ] V1 : Rappels périodiques + saisie note d'ivresse (0–10)
- [ ] V1 : Dashboard groupe (classement ivresse en temps réel)
- [ ] V1 : Offline-first + installable (manifest, service worker)
- [ ] V2 : Partage QR code entre appareils
- [ ] V2 : Historique / stats post-festival
- [ ] V2 : Thème Greenfield (couleurs, branding)

---

## Disclaimer

> Cette app est conçue pour s'amuser en groupe et ne fournit **aucun conseil médical**.
> Les estimations d'alcoolémie sont approximatives. Ne jamais conduire après avoir bu.
> Boire avec modération.
