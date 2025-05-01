# Pipeline CI/CD GitHub Actions pour le projet Node.js ci-mod-steam

Ce document décrit la mise en place d’une pipeline **GitHub Actions** complète pour le projet Node.js [ci-mod-steam](https://github.com/SylvainMJC/ci-mod-steam). L’objectif est d’automatiser la qualité du code et le déploiement en intégrant plusieurs outils populaires :

- **ESLint** pour le *linting* JavaScript/TypeScript (analyse statique basique).
- **SonarCloud** pour l’analyse statique approfondie (qualité et sécurité).
- **Trivy** pour le scan de vulnérabilités.
- **Packaging** de l’application (en tant que package npm et/ou image Docker).
- **Publication** des artefacts résultants (package `.tgz` ou image Docker) sur GitHub Actions ou le registre GHCR.

Chaque étape est commentée et illustrée par un extrait de workflow YAML. Les explications s’appuient sur des sources officielles (documentation GitHub Actions, ESLint, SonarCloud, Trivy, etc.). Le code de la pipeline est à intégrer dans le dépôt, par exemple dans un fichier `.github/workflows/ci.yml`. 

## 1. Objectifs du pipeline CI/CD

La pipeline CI/CD vise à **automatiser** et **fiabiliser** la chaîne de production logicielle du projet. Ses principaux objectifs sont :

- **Qualité du code** : détecter automatiquement les erreurs de syntaxe, les mauvaises pratiques ou les vulnérabilités dès chaque commit. L’outil **ESLint** analyse le code source pour trouver les problèmes de style et les bugs fréquents. Par exemple, la documentation officielle d’ESLint rappelle qu’on peut *« exécuter ESLint dans votre pipeline d’intégration continue »* afin de repérer rapidement les problèmes de code.
- **Analyse statique avancée** : utiliser **SonarCloud** pour mesurer la couverture de code, détecter les *code smells*, bugs et vulnérabilités de sécurité. SonarCloud s’intègre avec GitHub Actions pour fournir des rapports détaillés dans SonarCloud et dans l’interface GitHub.
- **Sécurité** : scanner les dépendances et le code pour trouver des vulnérabilités (via **Trivy**). Par exemple, l’action [aquasecurity/trivy-action](https://github.com/aquasecurity/trivy-action) permet de scanner le système de fichiers (`fs`) ou des images Docker pour des packages vulnérables.
- **Packaging** : assembler le projet en un artefact déployable. Pour npm, on crée un package `.tgz` via `npm pack`. Pour Docker, on peut construire une image contenant l’application. 
- **Publication des artefacts** : stocker les fichiers construits (package npm ou image Docker) afin qu’ils soient réutilisables en déploiement. On utilise pour cela les artefacts GitHub Actions (`actions/upload-artifact`) ou le **GitHub Container Registry** (GHCR) pour les images Docker.

Cette pipeline est déclenchée à chaque push (et/ou pull request), garantissant que chaque modification du code est validée par ces étapes automatiques. Elle apporte aux développeurs un **contrôle continu** de la qualité, évitant d’introduire des erreurs en production et facilitant les revues de code grâce aux rapports SonarCloud et aux annotations (lint, test).

## 2. Contexte et pertinence pour le projet

Le projet **ci-mod-steam** est une application Node.js (éventuellement en TypeScript) liée à la gestion de mods Steam. Dans ce contexte, un pipeline CI permet :

- **Détection précoce de bugs** : grâce au linting ESLint et à SonarCloud, les bugs et code smells sont repérés immédiatement, avant qu’ils ne deviennent critiques en production.
- **Standardisation du code** : l’utilisation d’ESLint impose des règles de style et des bonnes pratiques communes à toute l’équipe. Comme le souligne la documentation ESLint, c’est un outil *« qui aide à trouver et corriger les problèmes dans votre code JavaScript »*, qu’on utilise en local ou en CI.
- **Sécurité renforcée** : Trivy scrute les dépendances (et l’image Docker, si utilisée) pour des vulnérabilités connues. Cela complète l’analyse de SonarCloud en ajoutant une dimension sécurité des bibliothèques tierces.
- **Livraison automatique** : le packaging automatisé (npm `.tgz` ou image Docker) facilite la publication des releases. On peut ainsi déployer facilement l’application ou l’archiver pour d’autres usages.
- **Traçabilité et audit** : chaque exécution de la pipeline produit des logs, des rapports SonarCloud et des artefacts téléchargeables, assurant un historique clair de chaque build.

En résumé, la pipeline renforce la qualité du code et accélère le cycle de développement/déploiement, ce qui est particulièrement pertinent pour un projet collaboratif comme ci-mod-steam.

## 3. Mise en place détaillée de la pipeline

Ci-dessous, chaque étape de la pipeline est décrite avec un exemple de configuration YAML issu du fichier `.github/workflows/ci.yml`. Il s’agit d’un exemple fusionnant les étapes pour montrer le contexte global. L’utilisateur devra adapter les noms de versions ou chemins si nécessaire.

```yaml
name: CI

on:
  push:
    branches: ['main']
  pull_request:

jobs:
  build:
    name: Lint, Analyse, Package
    runs-on: ubuntu-latest

    steps:
      # 1. Récupération du code source
      - name: Checkout code
        uses: actions/checkout@v4

      # 2. Installation de Node.js (préciser la version requise)
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'  # par exemple Node.js 18 LTS

      # 3. Installation des dépendances npm
      - name: Install dependencies
        run: npm ci

      # 4. Linting du code avec ESLint
      - name: ESLint
        run: npm run lint
        # Note: la commande 'npm run lint' doit être configurée dans package.json (ex: "lint": "eslint src/**").
```

### 3.1. Linting avec ESLint

L’étape de linting exécute ESLint pour analyser le code JavaScript/TypeScript. Elle s’appuie sur la configuration (fichier `.eslintrc`) du projet. Par exemple, on peut ajouter dans `package.json` un script :

```json
"scripts": {
  "lint": "eslint 'src/**/*.{js,ts}'"
}
```

L’action GitHub associe alors ce script :

```yaml
      - name: ESLint
        run: npm run lint
```

Comme le rappelle la documentation d’ESLint, **ESLint analyse statiquement le code et peut être intégré dans le pipeline CI** pour détecter rapidement les problèmes de code. L’exécution arrêtera le workflow en cas d’erreurs (et échouera la build si des problèmes majeurs sont trouvés).

> **Astuce** : on peut activer la validation de code en poussant `rules` spécifiques dans `.eslintrc.json` et demander à ESLint de faire des *auto-fix* (`eslint --fix`) pour corriger automatiquement certains problèmes.

### 3.2. Analyse statique avec SonarCloud

Après le linting, on lance **SonarCloud** pour une analyse statique plus poussée (qualité, bugs, couverture de code). SonarCloud nécessite un compte (ici *SylvainMJC*) et un *project key*. Nous utilisons le jeton donné (`SONAR_TOKEN = 4e4f248c6bad50b07e8496b7b8bde554808a0162`), qu’on stocke comme *secret* GitHub (`Settings > Secrets > Actions`).

Dans le workflow, on utilise l’action officielle SonarCloud :

```yaml
      - name: SonarCloud Scan
        uses: sonarsource/sonarcloud-github-action@v1.6.0
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.organization=SylvainMJC
            -Dsonar.projectKey=SylvainMJC_ci-mod-steam
            -Dsonar.sources=.
```

Ici :

- `sonarsource/sonarcloud-github-action` est l’action GitHub de SonarCloud (version `v1.6.0` utilisée en exemple).
- La variable d’environnement `SONAR_TOKEN` (définie par `${{ secrets.SONAR_TOKEN }}`) contient le token sécurisé pour l’authentification.
- On passe en `args` les paramètres d’analyse : l’organisation SonarCloud (`-Dsonar.organization`), la clé du projet (`-Dsonar.projectKey`), et le chemin des sources (`sonar.sources=.`).

Ces paramètres peuvent aussi être définis dans un fichier `sonar-project.properties`, mais les passer en `args` évite de modifier les fichiers de projet. SonarCloud affichera alors les résultats (bugs, code smells, duplication, etc.) sur son interface, et pourra échouer le build si le *Quality Gate* n’est pas respecté.

### 3.3. Scan de sécurité avec Trivy

Ensuite, on inclut un scan de vulnérabilités avec **Trivy** (de Aqua Security). Trivy peut scanner le système de fichiers (`fs` scan) ou une image Docker. Ici nous scannons simplement le code et les dépendances dans le répertoire de travail :

```yaml
      - name: Security scan with Trivy
        uses: aquasecurity/trivy-action@v0.28.0
        with:
          scan-type: 'fs'
          scan-ref: '.'
          ignore-unfixed: true
          vuln-type: 'os,library'
          severity: 'CRITICAL,HIGH'
```

### 3.4 Packaging de l’application

```yaml
      # Packaging npm
      - name: Pack npm package
        run: npm pack

      - name: Upload npm package as artifact
        uses: actions/upload-artifact@v4
        with:
          name: npm-package
          path: '*.tgz'
```

En exécutant `npm pack`, on génère un fichier `ci-mod-steam-<version>.tgz`. L’action `upload-artifact` permet de le rendre disponible dans les artefacts GitHub pour téléchargement ultérieur.

### 3.5 Packaging en image Docker (optionnel)

```yaml
      - name: Log in to GitHub Container Registry
        uses: docker/login-action@v2
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ghcr.io/${{ github.repository }}:latest
```

Cette étape construit une image Docker à partir du `Dockerfile` et la pousse sur GHCR (`ghcr.io/<owner>/<repo>:latest`). Le `GITHUB_TOKEN` fournit les permissions nécessaires.

## 4. Publication des artefacts

- **Package npm** : téléchargeable via la page des artefacts du workflow (`npm-package`).
- **Image Docker** : disponible sur GHCR à l’adresse `ghcr.io/SylvainMJC/ci-mod-steam:latest`.

## 5. Apports de la pipeline pour le développement

- **Feedback immédiat** : chaque commit déclenche les outils de qualité (lint, SonarCloud, Trivy), évitant les régressions.
- **Qualité et sécurité** : détection des mauvaises pratiques, bugs, vulnérabilités dans le code et ses dépendances.
- **Automatisation du packaging** : artefacts prêts à l’emploi (npm `.tgz`, image Docker), facilitant les tests et déploiements.
- **Documentation intégrée** : le workflow YAML explique les étapes, aidant les nouveaux contributeurs.


## 6. Conclusion

Cette pipeline GitHub Actions centralise la qualité, la sécurité et la livraison pour le projet ci-mod-steam.  
Elle standardise les bonnes pratiques DevOps et facilite la collaboration, tout en assurant un feedback rapide à chaque étape du développement.

**Sources officielles :**
- Documentation GitHub Actions (checkout, setup-node, upload-artifact)  
- ESLint : intégration en CI (ESLint docs)  
- SonarCloud : sonarsource/sonarcloud-github-action (usage du secret SONAR_TOKEN)  
- Trivy : aquasecurity/trivy-action (mode fs)  
- Docker : docker/login-action et docker/build-push-action (GitHub Container Registry)
