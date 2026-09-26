# Let Me Cook — API

Backend REST de l’application *Let Me Cook*. Architecture **hexagonale** (ports / adapters), TypeScript, Prisma 7, PostgreSQL + pgvector, Redis, OpenAI.

La documentation d’ensemble du monorepo se trouve dans le [README racine](../README.md).

---

## Stack

- **Runtime** : Node.js ≥ 22, Express 5, TypeScript 5.9  
- **Données** : Prisma 7 + `@prisma/adapter-pg`, PostgreSQL, pgvector  
- **Cache / sessions** : Redis 6, `connect-redis`, `express-session`  
- **Auth** : JWT + bcrypt  
- **IA** : SDK OpenAI (embeddings, chat)  
- **Tests** : Jest + ts-jest  

---

## Architecture

```
src/
├── domain/                 # AppError, enums métier
├── application/
│   ├── ports/              # Contrats (repos, AI, cache, session)
│   └── services/           # Cas d’usage (DI)
├── infrastructure/
│   ├── prisma/             # Adapters persistence
│   ├── openai/             # Adapter IA
│   ├── redis/              # Client + cache
│   ├── session/            # Adapter session Express
│   └── container.ts        # Composition root
├── controllers/            # Adaptateurs HTTP
├── routes/
├── middleware/
└── index.ts                # Bootstrap
```

Les contrôleurs n’accèdent jamais à Prisma ou OpenAI directement : ils passent par les services exportés du container.

---

## Prérequis

- Node.js ≥ 22  
- Docker (PostgreSQL + Redis)  
- Variables d’environnement (voir ci-dessous)  

---

## Installation

```bash
# Depuis back/
cp .env.example .env   # ou créer .env manuellement
docker compose up -d postgres redis
npm install
npx prisma migrate dev
npm run dev
```

Serveur : `http://localhost:8000`.

---

## Variables d’environnement

| Variable | Obligatoire | Description |
|----------|:-----------:|-------------|
| `DATABASE_URL` | oui | URL PostgreSQL |
| `REDIS_URL` | non | Défaut `redis://localhost:6379` |
| `JWT_SECRET` | oui | Secret JWT |
| `SESSION_SECRET` | recommandé | Secret sessions |
| `OPENAI_API_KEY` | oui* | Requis pour IA / embeddings |
| `PORT` | non | Défaut `8000` |
| `FRONTEND_URL` | non | CORS |
| `NODE_ENV` | non | `development` / `production` |

\*L’API démarre sans clé OpenAI, mais les endpoints IA et embeddings échoueront à l’appel.

---

## Scripts npm

| Script | Description |
|--------|-------------|
| `npm run dev` | Développement (nodemon) |
| `npm run build` | Compile vers `dist/` |
| `npm start` | Exécute `dist/index.js` |
| `npm test` | Tests unitaires |
| `npm run test:watch` | Tests en watch |
| `npm run lint` | ESLint |
| `npm run prisma:generate` | Génère le client Prisma |
| `npm run prisma:migrate` | Migrations dev |
| `npm run prisma:studio` | Prisma Studio |
| `npm run deploy` | Stack prod (`docker-compose.prod.yml`) |

---

## Endpoints

Préfixe : `/api`. Auth : `Authorization: Bearer <token>`.

### Auth

| Méthode | Route | Auth |
|---------|-------|:----:|
| `POST` | `/auth/register` | — |
| `POST` | `/auth/login` | — |
| `POST` | `/auth/logout` | oui |
| `GET` | `/auth/me` | oui |

### Ressources protégées

| Préfixe | Opérations |
|---------|------------|
| `/fridge` | CRUD + `GET /expiring?days=` |
| `/appliances` | CRUD |
| `/recipes` | CRUD + `POST /similar` |
| `/shopping-lists` | CRUD listes / items, `frequent-items`, `search-items`, `validate` |
| `/ai` | Suggestions recettes, analyse, génération de liste |

Exemples complets : [`rest-client.http`](./rest-client.http).

---

## Docker

### Développement

```bash
docker compose up -d              # postgres, redis, pgadmin, API
docker compose up -d postgres redis   # infra seule
```

- PostgreSQL : `localhost:5432`  
- Redis : `localhost:6379`  
- pgAdmin : `localhost:5050`  
- API : `localhost:8000`  

### Production

```bash
npm run deploy
npm run deploy:logs
npm run deploy:down
```

Fichiers : `Dockerfile.prod`, `docker-compose.prod.yml`, `nginx.conf`.

---

## Tests

```bash
npm test
```

Couverture ciblée : erreurs domaine, `route-param`, services applicatifs avec repositories mockés.

---

## Prisma

```bash
npx prisma migrate dev
npx prisma generate      # aussi en postinstall
npx prisma studio
```

Config CLI : [`prisma.config.ts`](./prisma.config.ts). Client généré : `src/generated/prisma` (gitignoré).
