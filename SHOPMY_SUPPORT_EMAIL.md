# Email pour le Support ShopMy

**À :** creatorsupport@shopmy.us  
**Objet :** Problème avec Auto-Linking - Erreur "unauthorized" avec le format /apx/

---

Bonjour,

Je vous contacte concernant un problème avec l'intégration du script Auto-Linking ShopMy sur notre site web.

## Contexte

Nous intégrons le script ShopMy Auto-Linking sur notre site **digital-wardrobe-puce.vercel.app** pour convertir automatiquement les liens produits manuels en liens d'affiliation ShopMy.

**Configuration actuelle :**
- Script ID : `2FPSlX`
- Domaine approuvé : `digital-wardrobe-puce.vercel.app` (dans Account Settings → Advanced → Allowed Domains)
- Script chargé : `https://static.shopmy.us/Auto/2FPSlX.js`

## Problème rencontré

Le script Auto-Linking se charge correctement et détecte les liens dans du HTML statique. Cependant, nous rencontrons deux problèmes :

### 1. Format Auto-Linking `/apx/` ne fonctionne pas

Quand nous convertissons manuellement un lien manuel au format Auto-Linking :
```
https://go.shopmy.us/apx/2FPSlX?url=https%3A%2F%2Fwww.monicavinader.com%2F...
```

Nous obtenons une erreur "unauthorized" :
```json
{
  "success": false,
  "msg": "unauthorized",
  "error": "unauthorized"
}
```

### 2. Liens React dynamiques non détectés

Le script Auto-Linking fonctionne avec du HTML statique, mais ne détecte pas les liens créés dynamiquement par React. Nous avons testé avec une page HTML statique et les liens sont correctement convertis, mais pas avec notre application React.

## Ce qui fonctionne

Les liens créés **manuellement** dans ShopMy (format `/p-{linkId}`) fonctionnent parfaitement :
- Exemple : `https://go.shopmy.us/p-17584192`
- Redirection correcte vers le retailer avec tracking UTM

## Questions

1. **Pourquoi le format `/apx/2FPSlX?url=...` renvoie-t-il "unauthorized" ?**
   - Le domaine est bien approuvé dans les paramètres
   - Le retailer (Monica Vinader) est dans le réseau ShopMy
   - Le script ID est correct

2. **Le format Auto-Linking nécessite-t-il une configuration supplémentaire ?**
   - Y a-t-il des restrictions ou limitations que nous devrions connaître ?
   - Faut-il activer quelque chose de spécifique dans les paramètres ?

3. **Comment faire fonctionner Auto-Linking avec React ?**
   - Le script ne détecte pas les liens créés dynamiquement par React
   - Y a-t-il une API ou une méthode pour déclencher un re-scan du DOM ?
   - Ou faut-il utiliser une approche différente pour les applications React ?

4. **Alternative : Utiliser les liens créés manuellement**
   - Si Auto-Linking ne fonctionne pas avec React, devons-nous créer tous les liens manuellement ?
   - Y a-t-il une API pour créer des liens programmatiquement ?

## Informations techniques

- **Site :** https://digital-wardrobe-puce.vercel.app
- **Framework :** React (Vite)
- **Script ShopMy :** Chargé dans `index.html` avant le `</body>`
- **Test HTML statique :** Fonctionne (liens convertis correctement)
- **Test React :** Ne fonctionne pas (liens non détectés)

## Ce que nous avons essayé

1. ✅ Vérifié que le domaine est approuvé
2. ✅ Vérifié que le script ID est correct
3. ✅ Testé avec HTML statique (fonctionne)
4. ✅ Ajouté des événements personnalisés pour déclencher un re-scan
5. ✅ Essayé de mettre à jour le `href` au lieu d'utiliser `window.open()`
6. ✅ Vérifié le Content Security Policy (domaines ShopMy autorisés)

## Résultat attendu

Nous aimerions que les liens produits manuels soient automatiquement convertis en liens ShopMy lorsque les utilisateurs cliquent dessus, exactement comme cela fonctionne avec le HTML statique.

Merci pour votre aide !

Cordialement,  
[Votre nom]  
[Votre email]  
Site : digital-wardrobe-puce.vercel.app

---

**P.S.** : Si nécessaire, je peux fournir des captures d'écran, des logs de console, ou accès à un environnement de test.
