# Steam Workshop Tools

Outils pour interagir avec le Steam Workshop, permettant de récupérer des informations sur les mods de Project Zomboid.

## Fonctionnalités

- Récupération des mods d'un créateur spécifique
- Filtrage des mods par jeu (Project Zomboid)
- Sauvegarde des informations dans un fichier JSON
- Génération de statistiques sur les mods (popularité, tags, etc.)

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/yourusername/steam-workshop-tools.git
cd steam-workshop-tools

# Installer les dépendances
npm install
```

## Utilisation

### Récupérer les mods d'un créateur

```bash
# Modifier la variable CREATOR_ID dans fetchCreatorMods.js si nécessaire
npm start
```

## Pipeline CI/CD

Ce projet utilise GitHub Actions pour automatiser le développement, les tests et le déploiement. La pipeline comprend :

### Qualité du code
- **ESLint** pour le linting du code JavaScript
- **SonarCloud** pour l'analyse statique approfondie
- **Trivy** pour le scan de vulnérabilités

### Packaging
- **npm pack** pour créer un package npm
- **Docker** pour construire une image conteneur

### Publication
- Les packages npm sont disponibles comme artefacts de build
- Les images Docker sont publiées sur GitHub Container Registry (ghcr.io)

## Comment contribuer

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/amazing-feature`)
3. Committez vos changements (`git commit -m 'Add some amazing feature'`)
4. Poussez vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails. 