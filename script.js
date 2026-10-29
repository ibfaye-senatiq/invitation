/* =========================================================
   INVITATION DE MARIAGE — logique
   Aucune personnalisation ici : tout se règle dans config.js
   ========================================================= */
(function () {
  "use strict";

  const C = window.INVITATION || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const attendre = (ms) => new Promise((r) => setTimeout(r, ms));
  const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const racine = document.documentElement;

  /* ------------------------------------------------------ utilitaires */
  function valeur(chemin) {
    return chemin.split(".").reduce((o, k) => (o == null ? undefined : o[k]), C);
  }

  function hydrater() {
    // Textes simples (les valeurs de config.js sont de confiance : <br> autorisé)
    $$("[data-cfg]").forEach((el) => {
      const v = valeur(el.dataset.cfg);
      if (typeof v === "string" && v.length) el.innerHTML = v;
    });

    // Monogramme + sceau
    const ia = (C.initiales && C.initiales.a) || "I";
    const ib = (C.initiales && C.initiales.b) || "F";
    document.title = `${C.prenoms.a} & ${C.prenoms.b} · ${C.dateCourte || ""}`.trim();
    const og = $('meta[property="og:title"]');
    if (og) og.setAttribute("content", document.title);

    $$(".monogramme").forEach((el) => {
      el.innerHTML = `${ia}<span>&amp;</span>${ib}`;
    });
    const mono = $(".sceau-monogramme");
    if (mono) mono.innerHTML = `${ia}<b>&amp;</b>${ib}`;

    // Photo facultative de la page « Notre jour ». ?photo=nom.jpg = aperçu sans toucher config.js
    const apercuPhoto = new URLSearchParams(location.search).get("photo");
    const fichierPhoto = apercuPhoto || C.photo;
    if (fichierPhoto) {
      const zone = $("#photo-haut");
      if (zone) {
        const chemin = /^(https?:|\/|assets\/)/.test(fichierPhoto) ? fichierPhoto : `assets/${fichierPhoto}`;
        // cadrage : "haut" pour un portrait dont le visage est en haut de l'image
        const cadrages = { haut: "50% 5%", centre: "50% 32%", bas: "50% 72%" };
        zone.style.setProperty("--cadrage", cadrages[C.photoCadrage] || cadrages.centre);
        zone.hidden = false;
        zone.innerHTML = `<img src="${chemin}" alt="${C.prenoms.a} et ${C.prenoms.b}">`;
        const img = zone.querySelector("img");
        if (img) {
          const reveler = () => img.classList.add("chargee");
          if (img.complete && img.naturalWidth) reveler();
          else img.addEventListener("load", reveler, { once: true });
        }
        // classe de mise en page : le chapitre ne passe en « photo en tête » que si l'image existe
        const panneau = zone.closest(".panneau");
        if (panneau) panneau.classList.add("avec-photo");
      }
    }
  }

  /* ------------------------------------------------------ programme */
  const ICONES = {
    accueil: '<path d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/>',
    alliances: '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10.4 4.2L12 2.6l1.6 1.6L12 5.8z"/>',
    diner: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 21V3c-2 1-3 4-3 7s1 4 3 4"/>',
    lune: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/><path d="M17 3l.5 1.3L18.8 5l-1.3.5L17 6.8l-.5-1.3L15.2 5l1.3-.7z"/>',
    priere: '<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>',
    photo: '<rect x="3" y="6" width="18" height="14" rx="2.5"/><circle cx="12" cy="13" r="3.4"/><path d="M8.5 6l1.4-2h4.2L15.5 6"/>',
    musique: '<circle cx="7" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M10 18V7l11-2v11"/>',
  };

  function dessinerProgramme() {
    const liste = $("#deroule");
    const etapes = (C.programme && C.programme.etapes) || [];
    if (!liste || !etapes.length) return;
    liste.innerHTML = etapes
      .map(
        (e) => `<li>
        <span class="etape-icone" aria-hidden="true"><svg viewBox="0 0 24 24">${ICONES[e.icone] || ICONES.priere}</svg></span>
        <span class="etape-heure">${e.heure}</span>
        <span class="etape-libelle">${e.libelle}</span>
      </li>`
      )
      .join("");
  }

  /* ------------------------------------------------------ enveloppe */
  const intro = $("#intro");
  const enveloppe = $("#enveloppe");
  const site = $("#site");
  const defilement = $("#defilement");
  let ouvert = false;

  function afficherSite(anime) {
    try { sessionStorage.setItem("invitation-ouverte", "1"); } catch (_) {}
    racine.classList.remove("verrouille");
    site.removeAttribute("aria-hidden");
    site.classList.add("visible");
    if (defilement) defilement.scrollTo(0, 0);
    if (anime) {
      intro.classList.add("quitte");
      setTimeout(() => intro.remove(), 1500);
    } else if (intro) {
      intro.remove();
    }
  }

  async function ouvrirEnveloppe() {
    if (ouvert) return;
    ouvert = true;
    if (navigator.vibrate) navigator.vibrate(16);

    const duree = mouvementReduit ? 0.2 : 1;
    enveloppe.classList.add("brise");            // le sceau se brise
    await attendre(520 * duree);
    enveloppe.classList.add("ouvre");            // le rabat se rabat vers le haut
    await attendre(780 * duree);
    enveloppe.classList.add("lettre-sort");      // la lettre glisse hors de l'enveloppe
    await attendre(1550 * duree);
    afficherSite(true);
  }

  const sceau = $("#sceau");
  if (sceau) {
    sceau.addEventListener("click", ouvrirEnveloppe);
  }
  // ouvrir aussi au clavier / au tap sur l'enveloppe entière
  if (enveloppe) {
    enveloppe.addEventListener("click", (e) => {
      if (e.target.closest("#sceau")) return;
      ouvrirEnveloppe();
    });
  }

  /* ------------------------------------------------------ chapitres */
  const panneaux = $$(".panneau");
  let observateur = null;

  function observerPanneaux() {
    if (!("IntersectionObserver" in window)) {
      panneaux.forEach((p) => p.classList.add("est-visible"));
      return;
    }
    observateur = new IntersectionObserver(
      (entrees) =>
        entrees.forEach((e) => {
          if (e.intersectionRatio >= 0.3) e.target.classList.add("est-visible");
          else if (!e.isIntersecting) e.target.classList.remove("est-visible");
        }),
      { root: defilement, threshold: [0, 0.3] }
    );
    panneaux.forEach((p) => observateur.observe(p));
  }

  // bouton « Faites défiler » sur tous les chapitres sauf le dernier
  function ajouterIndices() {
    const chevron = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    panneaux.slice(0, -1).forEach((p, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "indice-defilement";
      b.setAttribute("aria-label", "Chapitre suivant");
      b.innerHTML = `<span>Faites défiler</span>${chevron}`;
      b.addEventListener("click", () =>
        panneaux[i + 1].scrollIntoView({ behavior: mouvementReduit ? "auto" : "smooth" })
      );
      p.appendChild(b);
    });
  }

  /* ------------------------------------------------------ progression */
  function suivreProgression() {
    const barre = $("#progression-barre");
    if (!barre) return;
    const maj = () => {
      const total = defilement.scrollHeight - defilement.clientHeight;
      barre.style.width = total > 0 ? `${(defilement.scrollTop / total) * 100}%` : "0%";
    };
    defilement.addEventListener("scroll", maj, { passive: true });
    window.addEventListener("resize", maj);
  }

  /* ------------------------------------------------------ compte à rebours */
  function compteARebours() {
    const zone = $("#compte-a-rebours");
    if (!zone || !C.unionLe) return;
    const cible = new Date(C.unionLe).getTime();

    const tic = () => {
      const reste = cible - Date.now();
      if (reste <= 0) {
        zone.classList.add("arrive");
        zone.textContent = reste > -12 * 3600e3
          ? "C’est aujourd’hui !"
          : "Merci d’avoir partagé ce jour avec nous.";
        return false;
      }
      const j = Math.floor(reste / 864e5);
      const h = Math.floor((reste % 864e5) / 36e5);
      const m = Math.floor((reste % 36e5) / 6e4);
      zone.querySelector('[data-cd="j"]').textContent = j;
      zone.querySelector('[data-cd="h"]').textContent = String(h).padStart(2, "0");
      zone.querySelector('[data-cd="m"]').textContent = String(m).padStart(2, "0");
      return true;
    };
    if (tic()) {
      const minuteur = setInterval(() => { if (!tic()) clearInterval(minuteur); }, 20000);
    }
  }

  /* ------------------------------------------------------ cartes */
  function preparerCartes() {
    const lieu = C.lieu || {};
    const co = lieu.coordonnees;
    const destination = co ? `${co.lat},${co.lng}` : lieu.nom || "";
    // On laisse la virgule non encodée : Plans et Waze la lisent mieux.
    const q = co ? destination : encodeURIComponent(destination);

    const liens = {
      google: `https://www.google.com/maps/dir/?api=1&destination=${q}`,
      apple: co
        ? `https://maps.apple.com/?daddr=${q}&q=${encodeURIComponent(lieu.nom || "")}`
        : `https://maps.apple.com/?daddr=${q}`,
      waze: co ? `https://waze.com/ul?ll=${q}&navigate=yes` : `https://waze.com/ul?q=${q}&navigate=yes`,
    };

    const g = $("#ouvrir-google"), a = $("#ouvrir-apple"), w = $("#ouvrir-waze");
    if (g) g.href = liens.google;
    if (a) a.href = liens.apple;
    if (w) w.href = liens.waze;

    // carte intégrée, chargée seulement à l'approche du chapitre
    const carte = $("#carte");
    if (carte && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entrees) => {
          if (entrees[0].isIntersecting) {
            carte.src = `https://maps.google.com/maps?q=${q}&z=16&output=embed&hl=fr`;
            io.disconnect();
          }
        },
        { root: defilement, rootMargin: "600px" }
      );
      io.observe(carte);
    }

    const feuille = $("#feuille-cartes");
    const ouvrirFeuille = () => { if (feuille) feuille.hidden = false; };
    const fermerFeuille = () => { if (feuille) feuille.hidden = true; };
    if (feuille) {
      $$("[data-fermer]", feuille).forEach((el) => el.addEventListener("click", fermerFeuille));
      $$(".feuille-option", feuille).forEach((el) =>
        el.addEventListener("click", () => setTimeout(fermerFeuille, 300))
      );
    }

    const ua = navigator.userAgent;
    const iOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const itineraire = $("#itineraire");
    if (itineraire) {
      itineraire.href = liens.google;
      itineraire.addEventListener("click", (e) => {
        if (iOS) { e.preventDefault(); ouvrirFeuille(); }
      });
    }
    const autres = $("#autres-applis");
    if (autres) autres.addEventListener("click", ouvrirFeuille);

    window.__fermerFeuille = fermerFeuille;
  }

  /* ------------------------------------------------------ WhatsApp */
  function ajouterContacts() {
    const boite = $("#boutons-wa");
    const modele = $("#icone-wa");
    if (!boite || !modele) return;
    (C.contacts || []).forEach(({ nom, numero }) => {
      const a = document.createElement("a");
      a.className = "wa-btn";
      a.href = `https://wa.me/${String(numero).replace(/\D/g, "")}?text=${encodeURIComponent(`Assalamou aleykoum ${nom} ! `)}`;
      a.target = "_blank";
      a.rel = "noopener";
      a.setAttribute("aria-label", `Écrire à ${nom} sur WhatsApp`);
      a.append(modele.content.cloneNode(true), document.createTextNode(nom));
      boite.appendChild(a);
    });
  }

  /* ------------------------------------------------------ menu */
  function preparerMenu() {
    const bouton = $("#bouton-menu");
    if (!bouton) return;
    const basculer = (etat) => {
      document.body.classList.toggle("menu-ouvert", etat);
      bouton.setAttribute("aria-expanded", String(etat));
      bouton.setAttribute("aria-label", etat ? "Fermer le menu" : "Ouvrir le menu");
    };
    bouton.addEventListener("click", () =>
      basculer(!document.body.classList.contains("menu-ouvert"))
    );
    $$("#menu a").forEach((a) => a.addEventListener("click", () => basculer(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        basculer(false);
        if (window.__fermerFeuille) window.__fermerFeuille();
      }
    });
  }

  /* ------------------------------------------------------ RSVP */
  function preparerRsvp() {
    const form = $("#formulaire-rsvp");
    const confirmation = $("#confirmation");
    const erreur = $("#rsvp-erreur");
    const bouton = $("#rsvp-envoyer");
    if (!form) return;

    const rsvp = C.rsvp || {};
    const numero = String(rsvp.whatsapp || (C.contacts && C.contacts[0] && C.contacts[0].numero) || "")
      .replace(/\D/g, "");

    function message(entree) {
      const debut = entree.presence === "Présent(e)" ? "Je serai présent(e)" : "Je ne pourrai pas être présent(e)";
      return `Assalamou aleykoum ! RSVP mariage ${C.prenoms.a} & ${C.prenoms.b} — ${debut} le ${C.dateLongue}. Nom : ${entree.nom}.`;
    }

    function remercier(entree) {
      const prenom = entree.nom.split(" ")[0];
      const texte = $("#confirmation-texte");
      if (texte) {
        texte.innerHTML =
          entree.presence === "Présent(e)"
            ? `Merci ${prenom}, nous avons hâte de vous retrouver le ${C.dateCourte.replace(/ · /g, "/")} !`
            : `Merci ${prenom} de nous avoir prévenus. Vous serez dans nos cœurs et nos prières.`;
      }
      form.hidden = true;
      if (confirmation) confirmation.hidden = false;
      else form.reset();
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const nom = (form.nom.value || "").trim();
      const coche = form.querySelector('input[name="presence"]:checked');
      if (!nom) {
        erreur.textContent = "Merci d’indiquer votre nom et prénom.";
        form.nom.focus();
        return;
      }
      if (!coche) {
        erreur.textContent = "Merci d’indiquer si vous serez présent(e).";
        return;
      }
      erreur.textContent = "";
      const entree = { nom, presence: coche.value };

      if (rsvp.endpoint) {
        bouton.disabled = true;
        bouton.textContent = "Envoi…";
        try {
          // "no-cors" : Apps Script ne renvoie pas d'en-tête lisible, mais la ligne est bien ajoutée.
          await fetch(rsvp.endpoint, {
            method: "POST",
            mode: "no-cors",
            body: new URLSearchParams(entree),
          });
        } catch (err) {
          bouton.disabled = false;
          bouton.textContent = "Confirmer ma présence";
          erreur.textContent = "L’envoi n’a pas abouti. Vérifiez votre connexion et réessayez.";
          return;
        }
        remercier(entree);
        return;
      }

      // Sans serveur : la réponse part sur WhatsApp.
      if (!numero) {
        erreur.textContent = "Aucun numéro WhatsApp n’est configuré dans config.js.";
        return;
      }
      window.open(`https://wa.me/${numero}?text=${encodeURIComponent(message(entree))}`, "_blank", "noopener");
      remercier(entree);
    });

    const encore = $("#rsvp-encore");
    if (encore) {
      encore.addEventListener("click", () => {
        form.reset();
        form.hidden = false;
        if (confirmation) confirmation.hidden = true;
        bouton.disabled = false;
        bouton.textContent = "Confirmer ma présence";
        const premier = $("#rsvp-nom");
        if (premier) premier.focus();
      });
    }
  }

  /* ------------------------------------------------------ démarrage */
  function demarrer() {
    hydrater();
    dessinerProgramme();
    observerPanneaux();
    ajouterIndices();
    suivreProgression();
    compteARebours();
    preparerCartes();
    ajouterContacts();
    preparerMenu();
    preparerRsvp();

    const chargeur = $("#chargeur");
    const images = [
      "assets/filigrane-coin.svg",
      "assets/filigrane-bordure.svg",
      "assets/gypsophile.svg",
      "assets/sceau.svg",
    ];
    const precharger = (src) =>
      new Promise((res) => { const i = new Image(); i.onload = i.onerror = res; i.src = src; });
    const polices = document.fonts ? document.fonts.ready : Promise.resolve();

    // Jamais plus de 5 s d'attente, même en connexion lente.
    Promise.race([
      Promise.all([...images.map(precharger), polices]),
      attendre(5000),
    ]).then(() => {
      if (chargeur) chargeur.classList.add("cache");
      let dejaVu = false;
      try { dejaVu = !!sessionStorage.getItem("invitation-ouverte"); } catch (_) {}
      // ?ouvert = raccourci de recette : on saute l'enveloppe (utile pour tester les chapitres).
      const params = new URLSearchParams(location.search);
      const forcer = params.has("ouvert");
      if ((dejaVu || forcer) && intro) {
        ouvert = true;
        afficherSite(false);
        // ?chapitre=programme = raccourci de recette : on ouvre directement ce chapitre.
        const cible = params.get("chapitre");
        if (cible) {
          const el = document.getElementById(cible);
          const cadre = document.getElementById("defilement");
          // scrollTop brut : "scrollIntoView({behavior})" est animé par le scroll-behavior du CSS
          // et n'aboutit pas dans un rendu headless (ou lève une erreur selon l'implémentation).
          requestAnimationFrame(() => {
            if (el && cadre) {
              cadre.style.scrollBehavior = "auto";
              cadre.scrollTop = el.offsetTop;
            }
          });
        }
      } else if (intro) {
        requestAnimationFrame(() => intro.classList.add("prete"));
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", demarrer);
  } else {
    demarrer();
  }
})();
