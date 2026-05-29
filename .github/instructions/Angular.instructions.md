---
description: Instructions Angular à appliquer pour tout fichier TypeScript ou HTML du projet Angular EasyPark (application de gestion de parkings municipaux)
applyTo: "frontend/src/**/*.ts,frontend/src/**/*.html,frontend/src/**/*.scss"
---

 # Instructions Angular — EasyPark

 ## Contexte du projet

 Application Angular 20 pour la gestion des parkings municipaux (EasyPark). Objectifs principaux : visualisation du parc, CRUD des places, réservation en temps réel, gestion des abonnements, facturation mock et intégration LPR mockée pour prototype.
 - **Angular** : v20 (standalone components, signals)
 - **UI** : Angular Material v20
 - **Styles** : SCSS
 - **Formatage** : Prettier (singleQuote, printWidth 100)

 ---

 ## Architecture recommandée

 ```
 frontend/src/app/
   core/
     models/       # Interfaces TypeScript (Place, TypePlace, Reservation, User, Invoice)
     services/     # Services injectables exposant state via signal()
   features/
     dashboard/    # Vue parc, taux d'occupation
     places/       # CRUD des places
     reservations/ # Gestion des réservations
     subscriptions/ # Gestion abonnements
   shared/
     components/   # Composants réutilisables (place-card, map-grid, navbar)
 ```

 - `core/` : logique métier et modèles partagés
 - `features/` : composants de page (lazy-loaded)
 - `shared/` : composants UI réutilisables

 ---

 ## Bonnes pratiques composants

 - Utiliser des composants `standalone`.
 - Déclarer uniquement les `imports` réellement utilisés.
 - Favoriser `signal()` et `computed()` pour l'état local; services exposent leur état via `signal()`.

 ### Exemple minimal

 ```typescript
 @Component({
   selector: 'app-place-card',
   standalone: true,
   imports: [MatCardModule, MatButtonModule],
   templateUrl: './place-card.component.html',
   styleUrls: ['./place-card.component.scss'],
 })
 export class PlaceCardComponent {
   place = input.required<Place>();
 }
 ```

 ---

 ## State & services

 - Les services doivent être `providedIn: 'root'` et exposer des `signal()` pour l'état (ex: `places`, `reservations`, `users`).
 - Utiliser `inject()` pour obtenir des services dans les composants.

 ---

 ## Templates et binding

 - La nouvelle syntaxe `@if/@for/@empty` est autorisée mais non obligatoire; utilisez ce qui convient à l'équipe. `track` est recommandé pour les listes.
 - Pour les formulaires, utiliser `ReactiveFormsModule` pour la gestion des validations et états complexes (réservations, facturation).

 ---

 ## Routing

 - Routes lazy-loaded via `loadComponent`.
 - Prévoir une route `admin` avec contrôles d'accès pour la gestion CRUD et `dashboard` pour la visualisation.

 ---

 ## Accessibilité & localisation

 - L'application doit être en français par défaut.
 - Prévoir labels accessibles, contrastes conformes et support PMR pour vues/indications.

 ---

 ## Conventions de données

 - Utiliser `interface` TypeScript pour les modèles (Place, Reservation, Subscription, Invoice).
 - Garder les modèles simples et sérialisables pour l'API REST.

 Exemple `Place`:
 ```typescript
 export interface Place {
   id: string;
   code: string; // ex: A1
   type: 'voiture' | 'moto' | 'pmr' | 'famille' | 'ev';
   isOccupied: boolean;
   isReserved?: boolean;
   occupantPlate?: string | null;
 }
 ```

 ---

 ## Tests

 - Fournir tests unitaires pour services critiques (gestion places, réservation, facturation mock).
 - Prévoir tests E2E pour flux principaux (réservation, annulation, génération facture mock).

 ---

 ## Style et format

 - Fichiers : `kebab-case`.
 - Classes : `PascalCase`.
 - Sélecteurs : préfixe `app-`.
 - Prettier : singleQuote, printWidth 100.
