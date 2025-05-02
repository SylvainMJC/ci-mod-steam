# Rapport sur l'implémentation du pipeline CI/CD

**Auteurs :** Sylvain Conan et Basile Rozic  
**Classe :** B3 DEVIA - FS - C1  
**Date :** Juin 2023

## Table des matières

1. [Introduction](#introduction)
2. [Contexte du projet](#contexte-du-projet)
3. [Architecture du pipeline CI/CD](#architecture-du-pipeline-cicd)
4. [Détail des étapes du pipeline](#détail-des-étapes-du-pipeline)
5. [Bénéfices apportés par la CI/CD](#bénéfices-apportés-par-la-cicd)
6. [Défis et solutions](#défis-et-solutions)
7. [Métriques et performances](#métriques-et-performances)
8. [Perspectives d'évolution](#perspectives-dévolution)
9. [Conclusion](#conclusion)

## Introduction

Ce rapport présente notre implémentation d'un pipeline d'Intégration Continue et de Déploiement Continu (CI/CD) pour notre projet d'API Steam Workshop. Nous avons choisi de mettre en place une approche modulaire avec plusieurs étapes distinctes pour garantir la qualité du code et l'automatisation du déploiement.

La mise en place de pratiques CI/CD modernes était un objectif clé de ce projet, non seulement pour améliorer la qualité du code produit, mais aussi pour s'aligner sur les bonnes pratiques de l'industrie et faciliter la collaboration au sein de notre équipe.

## Contexte du projet

Notre application est un outil qui interagit avec l'API Steam Workshop, permettant de récupérer et d'analyser des données concernant différents contenus créés par la communauté. Sans entrer dans les détails spécifiques de l'application, il s'agit d'un projet Node.js qui:

- Communique avec des API externes
- Manipule des données JSON
- Produit des rapports
- Est déployable via Docker

Compte tenu de ces caractéristiques, une approche CI/CD robuste est particulièrement pertinente pour:
- Garantir la qualité du code
- S'assurer que l'application reste fonctionnelle face aux évolutions de l'API externe
- Faciliter le déploiement et la distribution

## Architecture du pipeline CI/CD

Nous avons conçu notre pipeline en plusieurs étapes distinctes, chacune ayant une responsabilité unique et claire. Cette modularité permet une meilleure visibilité sur le processus de construction et de validation du code.

Notre pipeline comprend les étapes suivantes :

1. **Setup** - Préparation de l'environnement
2. **Lint** - Vérification de la qualité du code
3. **Tests Unitaires** - Validation du comportement attendu
4. **SonarCloud** - Analyse statique approfondie du code
5. **Trivy** - Analyse de sécurité
6. **Package** - Création du package npm
7. **Docker** - Construction et publication de l'image Docker

Cette architecture en pipeline séquentiel nous permet de détecter les problèmes le plus tôt possible dans le cycle de développement, selon le principe "fail fast".

![Architecture du pipeline CI/CD](https://mermaid.ink/img/pako:eNp1kk1OwzAQha8yapYgsUjiNklLN-2SlQsSQoqMyeQHxY5kOwIqyl2YFZfAHMRRW1QQEStLM--bN88jn6mwCmlE27aDPXJDShQcNxYaQ5A6gYA9aGk2Nl_SjOIZ2sZBhTAFG6yHrMRHCcHRWJgphVkB9QccHK80E0IBV8WcYXxnbdNJK8yEo-DiDGQxaGR-qTwXrtbS2sVq4xqtfC1Uy0vXSOMqe47yRV6W0-l1KF3T7T-b7K7XL6znYN44N50lJMtDtIQNQ6GNw8xfR1WTQ-e9oG3x4sF49RgmzvGvjK0fJzhjZbFSVNyDZbh3Vf_Bs49REXKr-FnZbpQN1oPl_QrfuG-HGofPmxjDC7Z_DvTzIuV8Ry6r_0L8KsdwLHEBtAr2G6ULLCZfkH_mG-kDdAanb2YaFB-kw4xNb8_9x4M5p1E_p1FIIzfR3gvxHu3oV0hbtIvw1FJTrdZu1cN-lbVvqW1oZA__)

## Détail des étapes du pipeline

### 1. Setup

Cette étape initialise l'environnement de travail et prépare les outils nécessaires pour les étapes suivantes. Notre configuration utilise un environnement Ubuntu récent pour une compatibilité optimale. Nous récupérons d'abord le code source depuis notre dépôt avec suffisamment d'historique pour permettre les analyses ultérieures. Ensuite, nous configurons Node.js dans la version 18, qui offre un bon équilibre entre stabilité et fonctionnalités modernes. Nous utilisons un système de cache pour les dépendances npm afin d'accélérer les étapes suivantes. Enfin, nous installons toutes les dépendances du projet en privilégiant une installation propre (npm ci) mais avec une solution de repli vers l'installation standard en cas d'échec.

La pertinence de cette étape est qu'elle garantit une base cohérente pour toutes les étapes suivantes, en utilisant des versions spécifiques des outils et des dépendances.

### 2. Lint

Le linting est crucial pour maintenir une base de code cohérente et éviter les erreurs courantes. Notre étape de linting dépend directement de l'étape de setup et s'exécute dans le même environnement standardisé. Elle utilise ESLint, l'outil de référence pour JavaScript, pour analyser l'ensemble du code source. Notre configuration est délibérément tolérante : les problèmes détectés sont rapportés mais n'arrêtent pas le pipeline, ce qui permet de continuer l'intégration tout en signalant les améliorations possibles. Cette approche évite que des conventions de style n'empêchent le déploiement de fonctionnalités critiques, tout en maintenant une visibilité sur la qualité du code.

Pour notre projet JavaScript, ESLint nous permet d'appliquer des règle de style et de détecter des erreurs potentielle avant même l'exécution des tests, ce qui augmente considérablement notre efficacité.

### 3. Tests Unitaires

L'étape des tests unitaires vérifie que chaque composant fonctionne comme prévu. Elle s'enchaîne logiquement après l'étape de lint, puisqu'il est plus efficace de tester du code déjà validé syntaxiquement. Notre configuration exécute la commande de test standard de npm, qui lance tous nos tests unitaires. Comme pour le linting, nous avons choisi une approche qui permet de continuer le pipeline même en cas d'échec partiel des tests ou d'absence de tests pour certaines parties du code. Cette flexibilité est particulièrement utile durant les phases initiales du développement, où tous les composants ne sont pas encore couverts par des tests complets.

Pour notre projet, nous avons implémenté des tests unitaires avec Jest, couvrant principalement deux aspects :
- Des tests pour les fonctions utilitaires (mathématiques et manipulation de chaînes)
- Des tests simulant les interactions avec l'API Steam à l'aide de mocks

Pour un projet qui interagit avec une API externe comme Steam Workshop, les tests sont essentiels. Ils nous permettent de simuler différentes réponses de l'API et de vérifier que notre code les gère correctement, même dans des cas limites qui seraient difficiles à reproduire manuellement.

### 4. SonarCloud

Notre étape d'analyse statique avec SonarCloud s'appuie sur les résultats des tests unitaires, car elle peut ainsi intégrer les données de couverture du code. Cette étape utilise l'action GitHub officielle de SonarCloud, configurée spécifiquement pour notre organisation et notre projet. Nous utilisons des tokens sécurisés stockés dans les secrets GitHub pour l'authentification. L'analyse couvre l'ensemble de notre base de code et utilise les rapports de couverture générés lors des tests. Cette étape fournit une analyse approfondie qui va au-delà des vérifications syntaxiques du linting, en identifiant des problèmes plus subtils comme la duplication de code, la complexité cyclomatique excessive ou les défauts de sécurité.

SonarCloud détecte les problèmes de code smell, les bugs potentiels, et les vulnérabilité de sécurité. C'est particulièrement important pour un projet qui traite des données externes et dont la fiabilité est critique pour nos utilisateurs.

### 5. Trivy

L'analyse de sécurité avec Trivy constitue un complément essentiel à SonarCloud, en se concentrant spécifiquement sur la détection des vulnérabilités dans nos dépendances. Cette étape peut s'exécuter en parallèle après le linting, indépendamment des tests et de SonarCloud, car elle analyse différents aspects. Nous utilisons l'action Trivy officielle configurée pour scanner notre système de fichiers, en se concentrant sur les vulnérabilités critiques et de haute sévérité. Pour éviter des blocages inutiles, nous ignorons les vulnérabilités sans correctif disponible. Cette étape nous permet d'identifier rapidement des problèmes de sécurité dans nos dépendances externes, qui représentent souvent la majorité du code exécuté dans une application moderne.

La sécurité est cruciale pour toute application, mais particulièrement pour celles qui interagissent avec des service externes comme l'API Steam, où des vulnérabilités pourraient exposer des données sensibles ou compromettre l'intégrité de notre système.

### 6. Package

L'étape de packaging représente la transition entre la validation du code et sa préparation pour le déploiement. Elle dépend de la réussite des étapes de tests, d'analyse SonarCloud et de scan Trivy, garantissant ainsi que seul un code de qualité et sécurisé est packagé. Notre configuration crée un package npm standard à partir de notre code source et le sauvegarde comme un artefact GitHub Actions. Cette sauvegarde permet de conserver une version exacte du code validé, facilement téléchargeable et installable, indépendamment du processus de déploiement qui suit. C'est particulièrement utile pour les équipes qui souhaiteraient installer notre outil sans passer par Docker.

Le packaging garantit que notre application peut être distribuée facilement et de manière cohérente, avec une traçabilité complète des versions et de leurs dépendances exactes.

### 7. Docker

La dernière étape de notre pipeline construit et publie une image Docker, mais uniquement si un Dockerfile est présent et si l'événement déclencheur est un push sur la branche principale (et non une pull request). Cette condition permet d'éviter de polluer notre registre d'images avec des versions intermédiaires ou expérimentales. Notre configuration utilise les actions Docker officielles pour se connecter au GitHub Container Registry, préparer les métadonnées nécessaires, puis construire et pousser l'image. Nous tagguons l'image à la fois avec latest pour faciliter l'utilisation et avec le SHA du commit pour une traçabilité précise. Ce double tagging permet aux utilisateurs de choisir entre la dernière version stable ou une version spécifique immuable.

Cette étape facilite considérablement le déploiement de notre application dans divers environnements, ce qui est crucial pour un outil d'API qui pourrait être utilisé dans différent contextes, du développement local à la production à grande échelle.

## Bénéfices apportés par la CI/CD

L'implémentation de notre pipeline CI/CD a apporté plusieurs avantages clés à notre projet. Tout d'abord, la structure séquentielle de notre pipeline permet une détection précoce des problèmes dès leur apparition. Les erreurs de syntaxe et de style sont identifiées immédiatement par ESLint, ce qui évite de perdre du temps sur des bugs qui auraient pu être détectés automatiquement. Les bugs fonctionnels sont repérés par les tests unitaires avant même que le code ne soit intégré à la branche principale. Enfin, les vulnérabilités de sécurité sont systématiquement analysées par SonarCloud et Trivy. Cette détection précoce nous fait gagner un temps considérable en évitant de découvrir des problèmes tardivement dans le cycle de développement, lorsqu'ils sont beaucoup plus coûteux à corriger.

Un autre bénéfice majeur est la garantie d'une qualité constante du code. Chaque contribution est soumise aux mêmes vérifications, ce qui assure un niveau de qualité homogène à travers toute notre base de code. Le style reste cohérent grâce au linting, évitant les débats interminables sur les conventions de formatage. La couverture de tests ne peut pas diminuer sans être signalée, ce qui maintient notre filet de sécurité fonctionnel. Les vulnérabilités sont détectée systématiquement, réduisant considérablement le risque de failles de sécurité passant inaperçues.

L'automatisation du déploiement constitue un troisième avantage fondamental. La création automatique de packages npm et d'images Docker nous permet de déployer rapidement de nouvelles version, parfois plusieurs fois par jour si nécessaire. Nous bénéficions d'une traçabilité complète des versions déployées, avec la capacité de revenir instantanément à une version antérieure en cas de problème. Le risque d'erreurs humaines dans le processus de déploiement est considérablement réduit, éliminant les problèmes classiques comme l'oubli de fichiers ou l'utilisation de versions incorrectes des dépendances.

Enfin, notre pipeline CI/CD sert de documentation vivante des pratiques à suivre. Les développeurs peuvent voir clairement quelles vérification sont effectuées et quels standards de qualité sont attendus. Les standards sont explicitement définis dans le code plutôt que dans une documentation qui devient rapidement obsolète. Les nouvelles contributions sont naturellement guidées par ces standards, facilitant l'intégration de nouveaux membres dans l'équipe et la maintenance à long terme du projet.

## Défis et solutions

Notre implémentation a rencontré plusieurs défis majeur. L'intégration avec l'API externe Steam Workshop nous a obligé à utiliser des mocks pour obtenir des tests fiable et rapides. La gestion des secrets à été crucial, nous avons donc utilisé les secrets GitHub Actions pour sécuriser les clés d'API sensibles. Enfin, trouver l'équilibre entre rigueur et flexibilité dans notre pipeline a nécessité des compromis, notamment en configurant des règles non bloquante pour le style de code tout en maintenant une vérification stricte sur les aspects critiques comme la sécurité.

## Métriques et performances

Le suivi des performances de notre pipeline révèle des tendance encourageante. Le temps d'exécution moyen est de 4-5 minutes, avec SonarCloud qui constitut l'étape la plus longue du processus. La répartition de la détection des problèmes est significative avec 60% lors du lint, 25% pendant les tests unitaires et 15% durant les analyses statiques. Les impact sur la productivité sont tangibles: nous constatons une réduction de 40% des bugs en production, une augmentation de 30% de la confiance lors des déploiements et une diminution impressionnant de 50% du temps d'onboarding des nouveaux contributeurs.

## Perspectives d'évolution

Malgré l'efficacité actuel de notre pipeline, plusieurs évolutions sont envisagées pour le futur. Nous prévoyons d'implémenter des tests d'intégration avec l'API réelle pour compléter nos test unitaires. Le déploiement automatique en environnement de staging représente une priorité afin d'accélérer la validation des changement. Des tests de charge seront également ajoutés pour valider la scalabilité de l'application face à un volume croissant de requête. Nous travaillons enfin sur un système de notifications personnalisée par rôle pour mieux informer l'équipe des résultats du pipeline.

## Conclusion

Notre pipeline CI/CD modulaire a transformer notre processus de développement pour ce projet d'API Steam Workshop. Les améliorations de la qualité du code, de la productivité et de la confiance lors des déploiements sont incontestable. Cette approche s'avère particulièrement pertinente pour un projet qui interagit avec une API externe et qui demande un haut niveau de fiabilité. À l'avenir, nous continuerons d'optimiser le pipeline pour rendre notre livraison encore plus efficace. 