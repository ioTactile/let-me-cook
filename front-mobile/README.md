# Let Me Cook — Mobile

Application Expo (SDK 57) / React Native pour _Let Me Cook_.

Documentation monorepo : [README racine](../README.md).

---

## Stack

Expo Router · React 19 · React Native 0.86 · React Query · Zustand · Zod 4 · React Native Paper · Axios

---

## Installation

```bash
cp .env.example .env.development
# API_URL=http://<IP-LAN>:8000/api
npm install
npm start
```

| Script               | Description  |
| -------------------- | ------------ |
| `npm start`          | Metro / Expo |
| `npm run android`    | Android      |
| `npm run ios`        | iOS          |
| `npm run web`        | Web          |
| `npm test`           | Jest         |
| `npm run test:watch` | Jest watch   |

---

## Organisation

| Dossier                   | Rôle                                       |
| ------------------------- | ------------------------------------------ |
| `app/`                    | Routes Expo Router, mutations, schemas Zod |
| `hooks/`                  | Queries React Query                        |
| `services/api.service.ts` | Client HTTP (réponses déjà unwrap)         |
| `stores/`                 | Auth & feedback UI                         |
| `lib/query-keys.ts`       | Clés de cache partagées                    |
| `types/`                  | Modèles & DTOs API                         |

Flux typique : **écran → hook / mutation → `api.service` → API**.

---

## Variables

| Variable  | Fichier            | Exemple                        |
| --------- | ------------------ | ------------------------------ |
| `API_URL` | `.env.development` | `http://192.168.1.55:8000/api` |

Sur appareil physique, `localhost` ne pointe pas vers votre machine : utilisez l’IP du réseau local.
