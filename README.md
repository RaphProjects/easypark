# EasyPark Mairie

Back-office de demonstration pour gerer un parking municipal : visualisation des places, CRUD, simulation d'entrees/sorties, facturation horaire, abonnements, configuration et exports CSV.

## Lancer le projet

```bash
npm install
npm run dev
```

L'application utilise Vue + Vite et persiste les donnees de demo dans `localStorage`.

## Scripts

- `npm run dev` : demarre le serveur local.
- `npm run build` : compile l'application.
- `npm test` : verifie les regles metier critiques.

## Notes d'architecture

La v1 simule le backend dans `src/store.js` pour rester executable sans PHP/Composer sur cette machine. Les entites et regles metier sont isolees dans `src/domain.js` afin de faciliter une future migration vers une API Laravel.
