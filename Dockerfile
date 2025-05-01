FROM node:18-alpine

WORKDIR /app

# Ajout de labels pour les métadonnées
LABEL maintainer="Developer"
LABEL description="Application Node.js pour interagir avec Steam Workshop API"

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm ci --only=production

# Copie du reste des fichiers
COPY . .

# Création d'un volume pour persister les logs et les fichiers de sortie
VOLUME [ "/app/output" ]

# Définition d'une variable d'environnement pour le script à exécuter
ENV APP_SCRIPT=fetchCreatorMods.js

# Commande par défaut lors du lancement du conteneur
CMD ["sh", "-c", "node ${APP_SCRIPT}"] 