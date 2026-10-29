/* =============================================================
   INVITATION — TOUT SE PERSONNALISE ICI
   Ce fichier est le seul à modifier pour adapter l'invitation.
   Aucune connaissance technique n'est nécessaire : remplacez les
   textes entre guillemets, puis enregistrez.
   ============================================================= */
window.INVITATION = {
  /* ---------- Les mariés ---------- */
  prenoms: { a: 'Fadel', b: 'Fatou Binetou' },
  // Initiales utilisées dans le monogramme, le sceau et le menu.
  initiales: { a: 'F', b: 'F' },

  /* ---------- La date ---------- */
  // Date et heure exactes du début, heure de Dakar (GMT). Format AAAA-MM-JJTHH:MM:SSZ
  unionLe: '2027-01-09T16:00:00Z',
  dateLongue: 'Samedi 9 janvier 2027',
  dateCourte: '9 · 1 · 2027',
  heure: 'À partir de 16h',

  /* ---------- Le lieu ---------- */
  lieu: {
    nom: 'Maison Madera',
    detail: 'Yoff, Dakar · Sénégal',
    // Coordonnées GPS : clic droit sur Google Maps → copier les coordonnées.
    coordonnees: { lat: 14.742158, lng: -17.520318 },
  },

  /* ---------- Les textes ---------- */
  textes: {
    surTitreAccueil: 'Une belle histoire commence…',
    sousTitreAccueil: 'ont la joie de vous inviter<br>à leur union',
    intro: [
      'Après un chemin guidé par la foi, le respect et l’amour, nous avons choisi de nous unir devant Allah et nos proches.',
      'Nous serions honorés de votre présence pour partager ce moment précieux avec nous.',
    ],
    rsvp: 'Merci de nous confirmer votre présence<br>afin que nous puissions vous accueillir au mieux.',
    remerciement: 'pour votre présence<br>et vos prières',
    auRevoir: 'À très bientôt',
    contact: 'Une question ? Écrivez-nous',
  },

  /* ---------- Le programme ----------
     icones disponibles : accueil · alliances · diner · lune · priere · photo · musique */
  programme: {
    jour: 'Samedi 9 janvier 2027',
    etapes: [
      { heure: '16h00', libelle: 'Accueil & mise en place', icone: 'accueil' },
      { heure: '17h15', libelle: 'Takk', icone: 'alliances' },
      { heure: '19h30', libelle: 'Le dîner', icone: 'diner' },
      { heure: '21h00', libelle: 'Fin de la cérémonie', icone: 'lune' },
    ],
  },

  /* ---------- Le verset ---------- */
  verset: {
    arabe:
      'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    francais:
      '« Et parmi Ses signes, Il a créé de vous, pour vous, des épouses afin que vous trouviez auprès d’elles la tranquillité, et Il a mis entre vous de l’amour et de la miséricorde. »',
    reference: 'Coran 30:21',
  },

  /* ---------- RSVP ----------
     Sans serveur, la réponse part sur WhatsApp (champ whatsapp ci-dessous).
     Avec un serveur (Google Apps Script, Formspree, Make…), collez l'URL dans
     endpoint : la réponse y sera envoyée en POST et WhatsApp ne sera pas ouvert. */
  rsvp: {
    whatsapp: '221781101620',
    endpoint: '',
  },

  /* ---------- Contacts (page « Merci ») ---------- */
  contacts: [
    { nom: 'Fadel', numero: '221781101620' },
    { nom: 'Fatou Binetou', numero: '221785469101' },
  ],

  /* ---------- Photo de la page « Notre jour » (facultatif) ----------
     Déposez votre image dans assets/ et écrivez son nom ici : "photo.jpg".
     Laissez vide pour un panneau sans photo.
     photoCadrage : "haut" (portrait, visage en haut) · "centre" · "bas". */
  photo: 'diop_couple.jpeg',
  photoCadrage: 'haut',
}
