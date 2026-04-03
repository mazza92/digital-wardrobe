# Connecter emmanuellek.com (OVH) à Vercel

Ce guide décrit comment connecter le domaine **emmanuellek.com** hébergé chez OVH au projet déployé sur Vercel.

---

## 1. Côté Vercel

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard) et ouvre le **projet** (front digital-wardrobe ou celui qui sert le site).
2. **Settings** → **Domains** → **Add**.
3. Saisis :
   - `emmanuellek.com` (domaine racine)
   - puis ajoute aussi `www.emmanuellek.com` si Vercel le propose (recommandé).
4. Vercel va afficher les **enregistrements DNS à créer** (et éventuellement une **vérification par enregistrement TXT** si le domaine est déjà utilisé ailleurs). Note les valeurs affichées ; elles peuvent être légèrement différentes selon le projet.

---

## 2. Côté OVH (DNS du domaine)

1. Connecte-toi à [OVH](https://www.ovh.com/manager/) → **Noms de domaine** → **emmanuellek.com**.
2. Onglet **Zone DNS** (ou **Zone de la zone DNS**).
3. Crée ou modifie les enregistrements suivants.

### Domaine racine (emmanuellek.com)

| Type | Sous-domaine | Cible / Valeur        | TTL  |
|------|--------------|------------------------|------|
| **A** | (vide ou `@`) | `76.76.21.21`         | 300 ou défaut |

### Sous-domaine www (www.emmanuellek.com)

| Type   | Sous-domaine | Cible / Valeur              | TTL  |
|--------|--------------|-----------------------------|------|
| **CNAME** | `www`       | `cname.vercel-dns.com`      | 300 ou défaut |

> Si Vercel t’affiche un CNAME **spécifique au projet** (ex. `xxx.vercel-dns-xxx.com`), utilise exactement cette valeur à la place de `cname.vercel-dns.com`.

### Si Vercel demande une vérification (TXT)

| Type | Sous-domaine | Valeur (exemple)      | TTL  |
|------|--------------|------------------------|------|
| **TXT** | (vide ou `@`) | valeur fournie par Vercel | 300 ou défaut |

- Ne garde qu’**un seul** enregistrement TXT de vérification à la fois (celui indiqué par Vercel).
- Une fois le domaine vérifié, tu peux supprimer ce TXT si tu veux.

---

## 3. Vérification

- **Propagation DNS** : peut prendre de quelques minutes à 24–48 h. Tu peux tester avec :
  - [dnschecker.org](https://dnschecker.org) pour `emmanuellek.com` (A → 76.76.21.21) et `www.emmanuellek.com` (CNAME).
  - En ligne de commande : `dig emmanuellek.com +short` (doit renvoyer `76.76.21.21`).
- **Vercel** : dans **Settings → Domains**, le statut du domaine passera à **Valid** (coche verte) une fois la config DNS correcte et propagée.
- **HTTPS** : Vercel provisionne le certificat SSL (Let’s Encrypt) automatiquement une fois le domaine valide.

---

## 4. Redirections (recommandé)

- Dans Vercel **Domains**, tu peux définir :
  - **emmanuellek.com** comme domaine principal,
  - **www.emmanuellek.com** en redirection vers **emmanuellek.com** (ou l’inverse selon ta préférence).

---

## Résumé rapide OVH

- **A** pour `@` (ou vide) → `76.76.21.21`
- **CNAME** pour `www` → `cname.vercel-dns.com` (ou la valeur indiquée par Vercel)
- **TXT** uniquement si Vercel demande une preuve de propriété

Après propagation, le site sera accessible sur **https://emmanuellek.com** et **https://www.emmanuellek.com**.
