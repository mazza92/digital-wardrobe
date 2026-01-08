# ShopMy Auto-Linking Setup

Ce guide explique comment configurer le script ShopMy Auto-Linking pour convertir automatiquement les liens produits manuels en liens d'affiliation ShopMy.

## 📋 Vue d'ensemble

Le script ShopMy Auto-Linking convertit automatiquement tous les liens externes de produits en liens d'affiliation ShopMy, **sauf** ceux qui proviennent déjà du catalogue (feeds Affilae).

### Comment ça fonctionne

1. **Produits du catalogue** (feeds Affilae) : 
   - Ont déjà des liens d'affiliation Affilae
   - Sont marqués avec `data-skip-shopmy="true"` 
   - **Ne sont PAS** convertis par ShopMy

2. **Produits manuels** (tagged sans catalogue) :
   - Ont des liens "bruts" (ex: `https://www.zara.com/product`)
   - **Sont automatiquement convertis** en liens ShopMy par le script

## 🔧 Configuration

### Étape 1 : Obtenir votre script ShopMy

1. Connectez-vous à votre compte ShopMy
2. Allez dans **Account Settings → Advanced**
3. Copiez votre **Auto-Linking Script ID** (ex: `sDXyBS`)
   - Le script ressemble à : `<script defer src="https://static.shopmy.us/Auto/sDXyBS.js" data-sms="sDXyBS"></script>`

### Étape 2 : Configurer le script

**Option A : Via variable d'environnement (recommandé pour production)**

1. Créez/modifiez le fichier `.env` dans `digital-wardrobe/` :
```env
VITE_SHOPMY_SCRIPT_ID=votre_script_id_ici
VITE_SHOPMY_ENABLED=true
```

2. Redéployez l'application

**Option B : Modification directe dans `index.html`**

1. Ouvrez `digital-wardrobe/index.html`
2. Trouvez la ligne avec `var shopmyId = 'YOUR_SHOPMY_ID';`
3. Remplacez `YOUR_SHOPMY_ID` par votre script ID :
```html
var shopmyId = 'sDXyBS'; // Remplacez par votre ID
```

### Étape 3 : Approuver votre domaine

1. Dans **Account Settings → Advanced** de ShopMy
2. Ajoutez votre domaine dans **Allowed Domains** :
   - Ex: `digital-wardrobe-puce.vercel.app`
3. Cliquez sur **Update**

## ✅ Vérification

### Comment tester

1. **Produit du catalogue** (ne doit PAS être converti) :
   - Taggez un produit depuis le catalogue (feeds)
   - Le lien devrait rester un lien Affilae
   - Vérifiez dans le code source : `data-skip-shopmy="true"` est présent

2. **Produit manuel** (doit être converti) :
   - Taggez un produit manuellement (sans utiliser le catalogue)
   - Entrez un lien direct (ex: `https://www.zara.com/product`)
   - Le script ShopMy devrait automatiquement convertir ce lien
   - Vérifiez dans le code source : le lien devient `https://go.shopmy.us/apx/votreusername?url=...`

### Format des liens convertis

Les liens manuels sont convertis au format :
```
https://go.shopmy.us/apx/votreusername?url=https%3A%2F%2Fwww.retailer.com%2Fproduct
```

## 🔍 Dépannage

### Le script ne fonctionne pas

1. **Vérifiez que le script est chargé** :
   - Ouvrez la console du navigateur (F12)
   - Vérifiez qu'il n'y a pas d'erreurs de chargement du script

2. **Vérifiez votre script ID** :
   - Assurez-vous que l'ID est correct dans `index.html`
   - Le format doit être : `https://static.shopmy.us/Auto/VOTRE_ID.js`

3. **Vérifiez les domaines autorisés** :
   - Dans ShopMy → Account Settings → Advanced
   - Votre domaine doit être dans la liste "Allowed Domains"

### Les liens du catalogue sont convertis (ne devrait pas)

- Vérifiez que les liens du catalogue contiennent `affilae.com` ou `feeds.affilae.com`
- Vérifiez que l'attribut `data-skip-shopmy="true"` est présent sur ces liens

## 📝 Notes importantes

- Le script ShopMy fonctionne **uniquement sur les liens externes** (pas sur les liens internes)
- Les liens qui commencent par `go.shopmy.us` ne sont pas reconvertis
- Le script fonctionne en arrière-plan et ne modifie pas votre workflow éditorial
- Les liens convertis apparaissent dans votre **ShopMy Links tab** après le premier clic

## 🔗 Ressources

- [Guide ShopMy Auto-Linking](https://guide.shopmy.us/creating-and-sharing-links/3ViMaZXyQ3oy7Ai2FXgQY8/auto-linking-for-publishers/4tx5RgywPA7Aybno4Vv5RA)
- Support ShopMy : creatorsupport@shopmy.us
