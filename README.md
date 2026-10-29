# Invitation de mariage — faire-part numérique

Un site d'invitation d'une seule page : le sceau de cire se brise, l'enveloppe s'ouvre, la lettre sort,
puis sept chapitres plein écran défilent (Accueil, Notre jour, Programme, Localisation, RSVP, Verset, Merci).

Aucune dépendance, aucun build : trois fichiers et un dossier d'images. Il s'ouvre en double-cliquant
sur `index.html`, et se publie en glissant le dossier sur n'importe quel hébergeur statique.

## Personnaliser — un seul fichier : `config.js`

| Champ | Rôle |
|---|---|
| `prenoms`, `initiales` | Prénoms et initiales (monogramme, sceau, menu, titre de l'onglet) |
| `unionLe` | Début de la cérémonie, **heure de Dakar (GMT)** : `"2026-10-31T16:00:00Z"` |
| `dateLongue`, `dateCourte`, `heure` | Dates telles qu'elles s'affichent |
| `lieu` | Nom, adresse, et `coordonnees` (clic droit sur Google Maps → copier les coordonnées) |
| `textes` | Tous les textes de la page |
| `programme` | `jour` + `etapes[]` : `{ heure, libelle, icone }` — icônes : `accueil`, `alliances`, `diner`, `lune`, `priere`, `photo`, `musique` |
| `verset` | Verset arabe, traduction, référence |
| `rsvp` | `whatsapp` (repli sans serveur) et `endpoint` (facultatif) |
| `contacts` | Boutons WhatsApp de la dernière page |
| `photo` | Nom du fichier photo de la page « Notre jour » (facultatif) |

Après modification, rechargez la page. Rien d'autre à toucher.

## La photo « Notre jour »

1. Déposez l'image dans `assets/` (jpg, png ou webp).
2. Écrivez son nom dans `config.js` → `photo: "notre-photo.jpg"`.

Le cadre recadre automatiquement l'image (portrait, paysage ou carré), la fait fondre dans le papier
et **le chapitre reste parfaitement lisible sans photo** : laissez `photo: ""` pour un panneau
typographique centré.

Aperçu d'une photo sans modifier `config.js` : `index.html?photo=mon-essai.jpg`

## Le RSVP

- **Sans serveur (par défaut)** : la réponse ouvre WhatsApp avec un message déjà rédigé
  (« Assalamou aleykoum ! RSVP mariage… Nom : … ») vers le numéro `rsvp.whatsapp`.
  Rien à installer, rien à payer, et les mariés reçoivent tout sur leur téléphone.
- **Avec un tableau de suivi** : créez un Google Sheet + un Apps Script qui expose une URL `/exec`,
  puis collez cette URL dans `rsvp.endpoint`. Les réponses y sont envoyées en `POST`
  (`nom`, `presence`) et WhatsApp n'est plus ouvert. Exemple de script :

```js
function doPost(e) {
  const f = e.parameter;
  SpreadsheetApp.getActiveSheet().appendRow([new Date(), f.nom, f.presence]);
  return ContentService.createTextOutput("ok");
}
```

## Publier

- **GitHub Pages** : créez un dépôt, poussez le dossier, Settings → Pages → branche `main`, dossier `/root`.
- **Vercel / Netlify** : glissez-déposez le dossier, aucune configuration nécessaire.
- **Sans hébergeur** : le dossier fonctionne en local, mais le lien de partage WhatsApp exige une URL publique.

Pensez à remplacer `assets/apercu.jpg` (image d'aperçu du lien WhatsApp, 1200×630) si vous en avez une.

## Recette (contrôle visuel)

- `index.html?ouvert=1` — saute l'enveloppe (utile pour relire les chapitres).
- `index.html?ouvert=1&chapitre=programme` — ouvre directement un chapitre
  (`accueil`, `notre-jour`, `programme`, `localisation`, `rsvp`, `verset`, `merci`).
- `index.html?photo=mon-essai.jpg` — prévisualise une photo.
- `tools/apercu.html?c=programme` — banc de recette : le site dans un cadre de 390×844
  (ajoutez `&large=1` pour la version ordinateur, `&enveloppe=1` pour l'écran d'ouverture).
  À servir en HTTP : `python -m http.server 8765` à la racine du projet, puis `http://localhost:8765/tools/apercu.html`.

## Ornements

`tools/make-ornements.py` régénère `assets/*.svg` (coin filigrané, guirlande, gypsophile, sceau, grain de papier).
La palette et la densité sont des paramètres en tête de fichier (`BURGUNDY`, `GOLD`, `STROKE`).
Les ornements sont du dessin vectoriel original : ils restent nets à toutes les tailles et vous appartiennent.

## Structure

```text
index.html               structure : enveloppe + 7 chapitres + menu
config.js                LE fichier à modifier
style.css                design system, mise en page des chapitres, animations
script.js                hydratation, enveloppe, compte à rebours, programme, cartes, RSVP, menu
assets/*.svg             ornements générés
assets/photo-…           votre photo (facultative)
tools/make-ornements.py  régénération des ornements
tools/apercu.html        banc de recette visuelle
```
