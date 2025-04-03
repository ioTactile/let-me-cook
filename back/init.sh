#!/bin/bash

# Démarrer les conteneurs Docker
docker-compose up -d

# Attendre que la base de données soit prête
echo "Attente de la base de données..."
sleep 10

# Installer les dépendances
pnpm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init