# Instructions générales — Workspace DemoWorkspace

## Présentation du projet

Application **twitter-app** : réseau social minimaliste (style Twitter) développé en **Angular 20**.
- Fil d'actualité avec filtrage et like de posts
- Liste de contacts avec filtrage et tri
- UI construite avec **Angular Material v20**

## Stack technique

| Couche | Technologie |
|---|---|
| Framework | Angular 20 (standalone, signals) |
| Langage | TypeScript 5 — mode `strict` activé |
| UI | Angular Material v20 + Angular CDK |
| Styles | SCSS |
| Formulaires | FormsModule (ngModel) |
| Tests | Jasmine / Karma (`ng test`) |
| Formatage | Prettier (singleQuote, printWidth 100) |
| Build | Angular CLI / esbuild |

## Structure du projet

```
twitter-app/
  src/app/
    core/
      models/     # Interfaces TypeScript : User, Post, Contact
      services/   # Services avec état géré par signal()
    features/
      feed/       # Page fil d'actualité (lazy-loaded)
      contacts/   # Page contacts (lazy-loaded)
    shared/
      components/ # Composants réutilisables : post-card, contact-card, navbar
```

## Règles générales de développement

### TypeScript
- Le mode `strict` est activé : toutes les propriétés doivent être typées, pas de `any`.
- Utiliser des `interface` pour les modèles de données (pas des `class`).
- Activer `noImplicitReturns`, `noFallthroughCasesInSwitch` — les respecter.
- Target ES2022, module `preserve`.

### Composants Angular
- **Toujours standalone** — ne jamais créer de `NgModule`.
- Utiliser `inject()` pour l'injection de dépendances (pas de constructeur).
- Inputs : `input()` / `input.required()` — pas le décorateur `@Input()`.
- Outputs : `output()` — pas le décorateur `@Output()`.
- Accéder aux inputs comme des signals : `this.post()`.

### State et réactivité
- Privilégier `signal()` et `computed()` pour tout état local ou dérivé.
- Les services exposent leur état via `signal()` et des méthodes de mutation (`update`, `set`).
- Éviter `BehaviorSubject` et `Observable` pour l'état interne des composants.

### Templates
- Utiliser la **nouvelle syntaxe de control flow** : `@if`, `@for`, `@empty` — jamais `*ngIf` ni `*ngFor`.
- Toujours spécifier `track` avec un identifiant unique dans `@for`.
- `strictTemplates` est activé — les templates sont vérifiés au compile time.

### Routing
- Toutes les routes de features sont **lazy-loadées** via `loadComponent`.
- `withComponentInputBinding()` est activé — les paramètres de route sont accessibles en `input()`.

### Styles
- Un fichier `.scss` par composant, sans styles globaux sauf `styles.scss`.
- Pas d'inline styles.

### Tests
- Un fichier `.spec.ts` par composant, créé avec le composant.
- Utiliser `TestBed.configureTestingModule` avec `imports: [MonComposant]` (standalone).
- Lancer les tests : `ng test` depuis `twitter-app/`.

## Commandes utiles

```bash
# Démarrer le serveur de développement
cd twitter-app
npm.cmd start          # ou : ng serve

# Lancer les tests
ng test

# Build de production
ng build
```

## Conventions de nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers | kebab-case | `post-card.component.ts` |
| Classes | PascalCase | `PostCardComponent` |
| Sélecteurs | préfixe `app-` | `app-post-card` |
| Services | suffixe `Service` | `PostsService` |
| Interfaces | PascalCase | `Post`, `User`, `Contact` |
| Signals | camelCase | `searchQuery`, `filteredPosts` |

## Points d'attention

- Ne pas utiliser `NgModule` ou `BrowserModule`.
- Ne pas utiliser `@Input()` / `@Output()` (décorateurs dépréciés dans ce projet).
- Ne pas utiliser `*ngIf` / `*ngFor` (remplacés par `@if` / `@for`).
- Ne pas importer des modules Angular Material entiers — importer uniquement les sous-modules nécessaires (ex. `MatButtonModule`, `MatIconModule`).
- Les `templateUrl` et `styleUrl` sont toujours des chemins relatifs au composant.