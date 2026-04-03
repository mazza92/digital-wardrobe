# Back-office : rubrique « Mes coups de cœur » (accès par mot de passe)

La rubrique **Mes coups de cœur** peut être protégée par mot de passe. Le front appelle l’API suivante ; le back-office doit exposer ces endpoints et permettre de gérer le paramètre et la liste des mots de passe.

## Comportement côté front

- Si **requirePassword** est `false` (ou en cas d’erreur/404 sur les settings) : la rubrique est **accessible directement** sans demande de mot de passe.
- Si **requirePassword** est `true` : au clic sur l’onglet « Mes coups de cœur », un modal demande un mot de passe ; après vérification réussie, l’accès est accordé pour la session (24 h en `sessionStorage`).

## Endpoints à implémenter dans le back-office

Base URL : même API que le reste (ex. `VITE_API_URL` / `https://digital-wardrobe-admin.vercel.app/api`).

### 1. GET `/coup-de-coeur/settings`

Retourne si la rubrique est protégée par mot de passe.

**Réponse attendue (200) :**

```json
{
  "requirePassword": true
}
```

ou

```json
{
  "requirePassword": false
}
```

- Si **requirePassword** est `false` ou absent : le front n’affiche pas le modal et affiche directement le contenu.
- En cas de 404 ou d’erreur réseau : le front considère `requirePassword: false` (accès direct).

### 2. POST `/coup-de-coeur/verify`

Vérifie le mot de passe saisi par l’utilisateur.

**Corps de la requête :**

```json
{
  "password": "le mot de passe saisi"
}
```

**Réponse succès (200) :**

```json
{
  "verified": true
}
```

**Réponse mot de passe invalide (401) :**

- Corps libre (ex. `{ "error": "Invalid password" }`).
- Le front affiche un message du type « Mot de passe incorrect ».

Le back-office doit comparer `password` à la **liste des mots de passe** configurée pour cette rubrique (mot de passe unique ou générique / plusieurs mots de passe autorisés). Ne pas renvoyer la liste des mots de passe au front ; faire la vérification côté serveur uniquement.

## Gestion en back-office

À prévoir dans l’admin :

1. **Activer / Désactiver la protection**
   - Un réglage (ex. case à cocher) : « Protéger la rubrique Mes coups de cœur par mot de passe ».
   - Si désactivé : `GET /coup-de-coeur/settings` renvoie `requirePassword: false` → accès direct sans modal.
   - Si activé : `requirePassword: true` → le modal s’affiche au clic sur l’onglet.

2. **Liste des mots de passe**
   - Interface pour gérer une **liste de mots de passe** valides pour cette rubrique (ajout / suppression).
   - Chaque entrée peut être un mot de passe « unique » (invité) ou un mot de passe « générique » partagé.
   - Lors de `POST /coup-de-coeur/verify`, le backend vérifie que le mot de passe saisi correspond à l’un des mots de passe de la liste (comparaison sécurisée, ex. hash si stockage persisté).

Aucun autre endpoint n’est requis côté front pour cette fonctionnalité.
