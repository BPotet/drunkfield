# DrunkField — STATE.md

> Artefact de session GSD. Mis à jour à chaque transition de phase.

---

## État courant

```
Phase    : 1 — MVP Festival
Étape    : DISCUSS ✅  PLAN ✅  EXECUTE ✅ → VERIFY (prochaine)
Branche  : claude/greenfield-drinking-tracker-rwzoeo
Dernier  : 2026-06-11
```

---

## Phase 1 — MVP Festival

### Décisions issues de la discussion

| Sujet | Décision |
|---|---|
| Taille groupe | 5–10 membres |
| Identité membre | Prénom + emoji (local, pas de compte) |
| Rappels ivresse | Push notification périodique (service worker) |
| Scope Phase 1 | Tout : PWA installable + membres + boissons + dashboard + rappels |

### Scope Phase 1 (périmètre validé)

1. **Setup PWA installable** — Vite + React + Tailwind, manifest.json, service worker Workbox, icône, installable sur home screen
2. **Gestion membres** — CRUD membres (prénom + emoji), persisté IndexedDB, 5–10 membres max
3. **Logger une boisson** — formulaire (boisson, %, volume en cL, qui boit, timestamp auto), persisté IndexedDB
4. **Dashboard groupe** — liste membres avec alcoolémie estimée (Widmark), tri par niveau d'ivresse
5. **Rappels périodiques** — push notification SW toutes les 30 min (configurable), pop-up pour noter ivresse 0–10

### Hors scope Phase 1

- Partage multi-appareils (QR code) → V2
- Historique / stats → V2
- Calcul Widmark précis (poids/sexe) → optionnel en Phase 1, valeur par défaut sinon
- Thème Greenfield → V2

---

## Phases suivantes (backlog)

- Phase 2 : Partage QR code + sync multi-appareils
- Phase 3 : Stats post-festival + thème Greenfield
