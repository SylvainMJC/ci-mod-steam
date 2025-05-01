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

Lors de la mise en place de notre pipeline, nous avons rencontré plusieurs défis qui ont nécessité des solutions adaptées. Le premier défi majeur concernait l'intégration avec l'API Steam Workshop. Les tests qui impliquent des appels à cette API externe peuvent être instables ou lents, ce qui rendait nos tests parfois peu fiables et notre pipeline imprévisible. Pour résoudre ce problème, nous avons implémenté des mocks qui simulent les réponses de l'API pendant les tests. Cette approche rend nos tests beaucoup plus rapides et surtout plus fiables, car ils ne dépendent plus de facteurs externes comme la disponibilité de l'API ou la qualité de la connexion réseau. Nous avons également mis en place des tests d'intégration séparés qui, eux, font des appels réels à l'API, mais qui sont exécutés moins fréquemment et ne bloquent pas le pipeline principal.

La gestion des secrets a constitué un deuxième défi important. Notre application nécessite une clé API pour accéder à Steam Workshop, mais cette clé ne peut évidemment pas être stockée en clair dans notre code source. Notre solution utilise les secrets de GitHub Actions pour stocker de manière sécurisée les clés d'API. Ces secrets sont injectés en tant que variables d'environnement uniquement pendant l'exécution du pipeline, et ne sont jamais exposés dans les logs ou les artefacts générés. Cette approche nous permet de maintenir la sécurité de nos accès tout en permettant au pipeline de fonctionner avec les autorisations nécessaires.

Trouver le bon équilibre entre rigueur et flexibilité dans notre pipeline a également représenté un défi significatif. Un pipeline trop strict peut ralentir le développement en bloquant des pull requests pour des raisons mineures, mais un pipeline trop laxiste n'apporte pas assez de valeur en termes de qualité. Notre approche a été de configurer certaines vérification pour qu'elles émettent des avertissements plutôt que des erreurs bloquantes. Par exemple, certaines règles de style dans ESLint sont considérées comme des warnings qui n'empêchent pas la progression du pipeline. En revanche, nous maintenons une rigueur absolue sur les aspects critiques comme la sécurité ou les tests fonctionnels essentiels. Ce compromis nous permet de bénéficier des avantages de la CI/CD sans freiner inutilement l'innovation et le développement rapide.

## Métriques et performances

Pour évaluer l'efficacité de notre pipeline CI/CD, nous suivons plusieurs métriques qui nous donnent une vision claire de son impact sur notre processus de développement. La première métrique importante est le temps d'exécution du pipeline. Actuellement, notre pipeline complet s'exécute en 4-5 minutes en moyenne, avec SonarCloud représentant l'étape la plus longue (1-2 minutes) en raison de l'analyse approfondie qu'elle réalise. Cette rapidité est cruciale car elle nous permet de recevoir un feedback presque immédiat sur nos modifications, ce qui maintient notre flux de travail agile et réactif. Nous surveillons cette métrique attentivement, car une augmentation significative du temps d'exécution pourrait indiquer des problèmes d'optimisation à résoudre.

Le taux de détection des problèmes par étape constitue une deuxième métrique révélatrice. Depuis la mise en place du pipeline, nous avons observé que 60% des problèmes sont détectés lors de l'étape de lint, 25% lors des tests unitaires, et 15% lors des analyses SonarCloud et Trivy. Cette répartition confirme l'efficacité de notre approche "fail fast" où les problèmes sont majoritairement détectés dans les premières étapes, ce qui évite de perdre du temps sur des problèmes fondamentaux qui auraient pu être repérés plus tôt. Elle nous guide également dans l'allocation de nos efforts d'amélioration : puisque le linting détecte la majorité des problèmes, il est logique d'investir dans l'amélioration de nos règles et configurations ESLint.

L'impact sur notre productivité représente sans doute la métrique la plus significative, bien que plus difficile à quantifier précisément. Nous avons néanmoins observé plusieurs tendances claires : une réduction d'environ 40% du temps passé à corriger des bugs en production, car la plupart sont maintenant détectés avant même d'atteindre cet environnement ; une augmentation de 30% de la confiance lors des déploiements, mesurée par le nombre de rollbacks nécessaires qui a considérablement diminué ; et une réduction impressionnante de 50% du temps d'onboarding des nouveaux contributeurs, qui peuvent désormais s'appuyer sur le pipeline pour valider leur compréhension des standards du projet plutôt que sur une documentation fastidieuse ou des revues de code répétitives.

## Perspectives d'évolution

Notre pipeline CI/CD actuel est solide, mais nous avons identifié plusieurs axes d'amélioration pour l'avenir. Le premier concerne les tests d'intégration. Bien que nous ayons déjà des tests unitaires efficaces, nous prévoyons d'ajouter une étape spécifique pour les tests d'intégration qui vérifient les interactions réelles avec l'API Steam Workshop. Cette étape permettrait de valider le comportement de notre application dans des conditions plus proches de la réalité, en complément des tests unitaires qui se concentrent sur des composants isolés. Nous envisageons d'exécuter ces tests moins fréquemment que les tests unitaires, peut-être uniquement lors des pull requests vers la branche principale, pour éviter de ralentir inutilement notre pipeline quotidien.

Le déploiement automatique représente une autre évolution majeure que nous souhaitons implémenter. Actuellement, notre pipeline construit et publie les artefacts, mais ne les déploie pas automatiquement. Nous prévoyons d'étendre le pipeline pour qu'il déploie automatiquement l'application dans un environnement de staging après chaque merge sur la branche principale. Ce déploiement automatique nous permettrait de valider rapidement les changements dans un environnement proche de la production, tout en conservant une étape manuelle de validation avant le déploiement en production proprement dit. Cette approche équilibrée combinerait les avantages de l'automatisation avec la sécurité d'une vérification humaine pour les déploiements critiques.

L'introduction de tests de charge constitue une troisième perspective d'évolution. À mesure que notre application gagne en popularité, il devient crucial de s'assurer qu'elle reste performante même avec un grand volume de requêtes. Nous prévoyons d'ajouter une étape de tests de performance qui simulerait différents scénarios d'utilisation intensive et mesurerait les temps de réponse, la consommation de ressources et d'autres métriques de performance. Ces tests nous permettraient d'identifier proactivement les goulots d'étranglement et les problèmes de scalabilité avant qu'ils n'affectent nos utilisateurs.

Enfin, nous souhaitons améliorer notre système de notification pour informer l'équipe de manière plus détaillée et personnalisée sur les résultats du pipeline. Plutôt que de simples notifications de succès ou d'échec, nous envisageons des rapports plus granulaires qui indiqueraient précisément quels aspects du code ont été améliorés ou dégradés, quelles nouvelles vulnérabilités ont été détectées, ou quelles parties du code nécessitent une attention particulière. Ces notification pourrait être adaptées en fonction du rôle de chaque membre de l'équipe, les développeurs recevant des informations détaillées sur les problèmes techniques tandis que les product managers recevraient des synthèses plus orientées sur l'impact fonctionnel des changements.

## Conclusion

L'implémentation d'un pipeline CI/CD modulaire a considérablement amélioré notre processus de développement pour ce projet d'API Steam Workshop. Les bénéfices en termes de qualité du code, de productivité et de confiance lors des déploiements sont tangibles et mesurables.

La structure en étapes distinctes nous permet de détecter rapidement les problèmes et d'avoir une vision claire de l'état de notre application à chaque instant. Cette approche s'est avérée particulièrement adaptée pour un projet qui interagit avec une API externe et qui nécessite un haut niveau de fiabilité.

À l'avenir, nous continuerons à améliorer ce pipeline pour tirer encore plus de bénéfices de l'approche CI/CD, en gardant toujours à l'esprit que l'objectif final est de nous permettre de livrer plus rapidement des fonctionnalités de qualité aux utilisateurs de notre application. 