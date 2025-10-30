# Déploiement Netlify + GitHub (gratuit)

## Étape 0 — Personnalisation rapide
- Remplace **assets/logo.png** par ton logo (même nom de fichier).
- Option couleurs (index.html → `data-theme` ou bouton « Thème ») :
  - `brand` (par défaut) — modifie les variables dans `:root[data-theme="brand"]` dans `styles.css`
  - `dark`
  - `light`

## Étape 1 — Créer le dépôt GitHub
1. Sur GitHub, **New repository** → nom: `recit-progress` (par ex.).
2. Upload **tous les fichiers** de ce dossier à la racine.

## Étape 2 — Connecter Netlify
1. Sur https://app.netlify.com → **Add new site** → **Import an existing project**.
2. Choisis ton repo `recit-progress`.
3. Build command: *(vide)* — Publish directory: `/`.
4. Déploie → tu obtiens `https://ton-site.netlify.app`.

## Étape 3 — Mettre à jour en 10 secondes depuis GitHub (même sur iPhone)
- Va dans ton repo → clique **status.json** → **Edit** → modifie:  
  - `percent` (0–100)
  - `current_task`
  - `milestones` (avec `done` true/false et `date` si fait)
  - `notes`, `details`…
- **Commit** → Netlify redéploie automatiquement.
- Pour ajouter un raccourci « Modifier les données » sur le site :
  - Ouvre `status.json` sur GitHub → copie l’URL d’édition (qui contient `/edit/`).
  - Colle cette URL dans la clé `edit_url` de `status.json` (ex.: `"edit_url": "https://github.com/tonuser/recit-progress/edit/main/status.json"`).

## Format des données (`status.json`)
```json
{
  "percent": 37,
  "current_task": "Chapitre 2 — relecture",
  "is_active": true,
  "last_update": "2025-10-30T10:07:00+01:00",
  "milestones": [
    {"title": "Plan détaillé", "done": true, "date": "2025-10-10"},
    {"title": "Chapitre 1 — brouillon", "done": true, "date": "2025-10-18"},
    {"title": "Chapitre 2 — brouillon", "done": false, "date": null}
  ],
  "notes": "Texte libre…",
  "details": { "Mots écrits": 4230, "Objectif": "10 000 mots" },
  "edit_url": "https://github.com/tonuser/recit-progress/edit/main/status.json"
}
```

## Bonus : Live instantané (sans redeploiement)
- Héberge sur Netlify, mais lis les données depuis **Firebase Realtime Database**.  
- Dans `app.js`, remplace la boucle de fetch par l’écoute Firebase (je peux te fournir la config à coller).
