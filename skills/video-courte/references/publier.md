# Publier : heures, cadence, légende

## L'heure : celle du public, pas la vôtre

Un compte tenu depuis un autre fuseau que son public publie souvent quand ce public dort ou travaille. Par exemple : un compte tenu depuis Nairobi, avec un public en France et au Québec. Il faut d'abord savoir où est le public :
- TikTok Studio → Spectateurs → Lieux ;
- YouTube Studio → Audience → Zones géographiques ;
- Instagram → Statistiques → Audience.

Ensuite, on publie à l'heure **de ce public**.

**Ce que disent les chiffres** (octobre 2026, comptes francophones tech et IA) :
- **Un compte qui perce** (43 vidéos en 21 jours, public en France) :
  - ses 7 vidéos au-dessus de 5 000 vues sont **toutes** parties entre **8 h et 19 h** (heure de Paris) ;
  - ses 13 vidéos postées entre 19 h et 2 h n'ont jamais dépassé 1 700 vues ;
  - médianes par créneau : 345 vues de 6 h à 10 h, 536 de 11 h à 14 h, 576 de 15 h à 18 h, 376 de 19 h à 21 h, 307 de 22 h à 2 h.
- **Un compte en démarrage** (81 vidéos) :
  - sur TikTok, les médianes sont un peu meilleures à 21-22 h (Paris) ;
  - sur YouTube, elles sont meilleures vers 14 h ;
  - les deux vidéos qui ont percé sont parties à 17 h et 22 h.
- **YouTube** dit que l'heure n'a pas d'effet durable, et **Instagram** qu'elle compte peu. L'heure est un levier secondaire : le sujet et l'accroche passent avant.

**Les créneaux à tester**, en heure locale du public :

| Créneau | Pourquoi |
|---|---|
| 7 h 30 à 9 h | trajets du matin |
| 12 h à 14 h | pause de midi : le créneau le plus sûr |
| 17 h à 19 h | sortie du travail |
| 20 h 30 à 21 h 30 | soirée : à tester, il marche mieux pour certains comptes |

Pour un public à la fois en Europe et en Amérique du Nord, l'heure de midi à Montréal tombe à 18 h à Paris : une bonne vidéo à 17 h-18 h (Paris) touche les deux. Attention aux changements d'heure, qui n'ont pas lieu le même jour. L'Europe passe à l'heure d'hiver le dernier dimanche d'octobre, l'Amérique du Nord le premier dimanche de novembre.

## La cadence

- Le compte observé publie **1 à 4 vidéos par jour** (2 en moyenne). C'est le rythme sûr pour TikTok.
- **Plus de vidéos ne veut pas dire plus de vues.** Un compte qui est passé de 11 à 32 vidéos par semaine a vu sa médiane divisée par 3. Augmentez le volume par paliers, et seulement si la médiane par vidéo tient.
- **Pour 10 vidéos par jour**, répartissez-les :
  - YouTube Shorts et Facebook Reels supportent bien le volume ;
  - TikTok et Instagram, gardez-y les 3 ou 4 meilleures.
  - Laissez au moins **90 minutes** entre deux vidéos sur le même réseau, et jamais deux vidéos sur le même sujet le même jour.
- **Une série** (« Partie 1, 2, 3 ») se publie dans l'ordre, une par jour, à la même heure.
- **La règle d'arrêt** : si, après 3 jours à un rythme donné, la médiane à 48 h baisse de plus d'un tiers, revenez au palier d'avant.

## Le jour de la publication

1. Mettez la couverture : `<id>-couverture.jpg`, qui est l'image 1. Sur YouTube, elle se choisit dans l'appli ; sur Instagram, dans « Couverture ».
2. Reprenez le titre et la légende de `<id>.txt`. Gardez 3 à 5 hashtags précis.
3. Épinglez le commentaire de `<id>.txt` **dans la minute**.
4. Répondez aux commentaires de la première heure : c'est là que la vidéo se joue.
5. Notez les vues à 48 h et le pourcentage regardé. Ces deux chiffres jugent l'accroche et le sujet.

## La case « contenu généré par IA »

- **Les réseaux demandent la case** quand la vidéo montre du **réaliste** qui pourrait tromper : un visage ou une scène réaliste générés, ou la voix clonée d'une vraie personne. C'est le cas sur TikTok, sur YouTube (« contenu modifié ou synthétique ») et chez Meta.
- **Pour des animations, des schémas, du texte animé et une voix de synthèse générique**, ce que produit ce skill en mode généré, elle n'est en général pas exigée.
- Si vous clonez votre propre voix, ou si vous ajoutez des images réalistes générées, cochez la case.
- **Rien ne vous oblige à écrire « IA » dans la légende.** Ce qui compte, c'est la case de la plateforme, quand elle s'applique.

## Programmer un lot

- Gardez un tableau avec, pour chaque vidéo : n°, date, heure du public, heure en UTC, réseaux, id du json, titre.
- Un outil de programmation (Postiz, Buffer, Metricool) peut tout poster depuis ce tableau. Ne programmez rien sans l'accord explicite de la personne qui publie : une vidéo sort en son nom.
