FROM node:18-alpine

WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du reste des fichiers
COPY . .

# Commande par défaut lors du lancement du conteneur
CMD ["node", "fetchCreatorMods.js"] 