const ecran = document.querySelector("#terminal-ecran");
const terminal = document.querySelector(".terminal");
const input = document.querySelector("#terminal-input");
const tape = document.querySelector("#terminal-tape");
const annonce = document.querySelector("#terminal-annonce");
const sources = document.querySelectorAll(".bloc-depliant");
const reductionMouvement = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!ecran || !terminal || !input || !tape || !annonce || sources.length === 0) {
  throw new Error("Impossible d'initialiser le terminal : éléments HTML manquants.");
}

const descriptions = {
  restauration: "Retouche et restauration de photos anciennes",
  conditions: "Supports acceptés et conditions de prise en charge",
  tarifs: "Tarifs indicatifs par image",
  contact: "Me contacter par SMS",
};
const rubriques = new Map();
const delaiFrappeSortie = 22;
const delaiFrappeCommande = 50;

sources.forEach((source) => {
  const key = (source.dataset.key || source.id || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  if (key) {
    rubriques.set(key, source);
  }

  source.hidden = true;
});

let enFrappe = false;
let timerId = 0;
let generation = 0;

function creerLigne(contenu = "", classe = "") {
  const ligne = document.createElement("p");
  ligne.className = `terminal-ligne${classe ? ` ${classe}` : ""}`;
  ligne.textContent = contenu;
  ecran.append(ligne);
  return ligne;
}

function ajouterRappelMenu() {
  const rappel = document.createElement("p");
  rappel.className = "terminal-ligne terminal-rappel";
  rappel.append(document.createTextNode("❯ retour au menu : "));

  const bouton = document.createElement("button");
  bouton.className = "terminal-hashtag";
  bouton.type = "button";
  bouton.dataset.key = "menu";
  bouton.textContent = "#menu";
  rappel.append(bouton);
  ecran.append(rappel);
  ecran.scrollTop = ecran.scrollHeight;
}

function afficherMenu() {
  enFrappe = false;
  window.clearTimeout(timerId);
  generation += 1;
  ecran.replaceChildren();
  ecran.setAttribute("aria-busy", "false");
  input.value = "";
  tape.textContent = "";

  const menu = document.createElement("div");
  menu.className = "terminal-menu";

  const intro = document.createElement("p");
  intro.className = "terminal-ligne terminal-menu-intro";
  intro.textContent = "❯ /help";
  menu.append(intro);

  rubriques.forEach((_, key) => {
    const ligne = document.createElement("p");
    ligne.className = "terminal-ligne";

    const bouton = document.createElement("button");
    bouton.className = "terminal-hashtag";
    bouton.type = "button";
    bouton.dataset.key = key;
    bouton.textContent = `#${key}`;
    ligne.append(bouton, document.createTextNode(` ${descriptions[key] || ""}`));
    menu.append(ligne);
  });

  ecran.append(menu);
  input.focus({ preventScroll: true });
}

function normaliserCommande(raw) {
  return raw.trim().replace(/^#/, "").toLowerCase().replace(/\s+/g, "-");
}

function terminerSortie(texteAnnonce = "") {
  enFrappe = false;
  ecran.setAttribute("aria-busy", "false");
  ecran.querySelectorAll(".terminal-image-en-attente").forEach((image) => {
    image.classList.remove("terminal-image-en-attente");
  });
  annonce.textContent = texteAnnonce;
  ajouterRappelMenu();
}

function revelerCaractereActif(node, caractere) {
  const range = document.createRange();
  const fin = node.textContent.length;
  range.setStart(node, fin - caractere.length);
  range.setEnd(node, fin);

  const basCaractere = range.getBoundingClientRect().bottom;
  const boundsEcran = ecran.getBoundingClientRect();
  const basVisible = boundsEcran.top + ecran.clientTop + ecran.clientHeight;

  if (basCaractere > basVisible) {
    ecran.scrollTop += basCaractere - basVisible;
  }
}

function preparerSortie(source) {
  const clone = source.cloneNode(true);
  clone.removeAttribute("hidden");
  clone.open = true;

  const summary = clone.querySelector(":scope > summary");
  if (summary) {
    const titre = document.createElement("h3");
    titre.textContent = summary.textContent.trim();
    summary.replaceWith(titre);
  }

  const sortie = document.createElement("div");
  sortie.className = "terminal-sortie";
  while (clone.firstChild) {
    sortie.append(clone.firstChild);
  }

  const images = [...sortie.querySelectorAll("img")];
  images.forEach((image) => image.classList.add("terminal-image-en-attente"));

  const textNodes = [];
  const walker = document.createTreeWalker(sortie, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();

  while (node) {
    if (node.textContent.trim()) {
      textNodes.push(node);
    } else {
      node.remove();
    }
    node = walker.nextNode();
  }

  const termesClefs = /#[\p{L}\p{N}_-]+/gu;
  textNodes.forEach((textNode) => {
    const valeur = textNode.textContent;
    const morceaux = valeur.split(termesClefs);
    const correspondances = valeur.match(termesClefs);
    if (!correspondances) {
      return;
    }

    const fragment = document.createDocumentFragment();
    morceaux.forEach((morceau, index) => {
      if (morceau) {
        fragment.append(document.createTextNode(morceau));
      }
      if (correspondances[index]) {
        const surbrillance = document.createElement("span");
        surbrillance.className = "term-hl";
        surbrillance.textContent = correspondances[index];
        fragment.append(surbrillance);
      }
    });
    textNode.replaceWith(fragment);
  });

  const nodesATaper = [];
  const texteWalker = document.createTreeWalker(sortie, NodeFilter.SHOW_TEXT);
  let texteNode = texteWalker.nextNode();
  while (texteNode) {
    if (texteNode.textContent) {
      nodesATaper.push({
        node: texteNode,
        caracteres: Array.from(texteNode.textContent),
      });
      texteNode.textContent = "";
    }
    texteNode = texteWalker.nextNode();
  }

  return { sortie, images, nodesATaper };
}

function ecrireSortie(source) {
  enFrappe = true;
  const currentGeneration = ++generation;
  window.clearTimeout(timerId);
  ecran.replaceChildren();
  annonce.textContent = "";
  ecran.setAttribute("aria-busy", "true");

  const { sortie, images, nodesATaper } = preparerSortie(source);
  ecran.append(sortie);
  let nodeIndex = 0;
  let characterIndex = 0;
  const texteAnnonce = [
    nodesATaper.map(({ caracteres }) => caracteres.join("")).join(" ").replace(/\s+/g, " ").trim(),
    ...images.map((image) => image.alt).filter(Boolean),
  ].filter(Boolean).join(" ");

  function afficherToutLeTexte() {
    nodesATaper.forEach(({ node, caracteres }) => {
      node.textContent = caracteres.join("");
    });
    terminerSortie(texteAnnonce);
  }

  if (reductionMouvement.matches) {
    afficherToutLeTexte();
    return;
  }

  function taperCaractere() {
    if (currentGeneration !== generation) {
      return;
    }

    while (nodeIndex < nodesATaper.length
      && characterIndex >= nodesATaper[nodeIndex].caracteres.length) {
      nodeIndex += 1;
      characterIndex = 0;
    }

    if (nodeIndex >= nodesATaper.length) {
      terminerSortie();
      return;
    }

    const actuel = nodesATaper[nodeIndex];
    const caractere = actuel.caracteres[characterIndex];
    actuel.node.textContent += caractere;
    characterIndex += 1;
    revelerCaractereActif(actuel.node, caractere);

    if (characterIndex >= actuel.caracteres.length) {
      nodeIndex += 1;
      characterIndex = 0;
    }

    if (nodeIndex >= nodesATaper.length) {
      terminerSortie(texteAnnonce);
      return;
    }

    timerId = window.setTimeout(taperCaractere, delaiFrappeSortie);
  }

  if (nodesATaper.length === 0) {
    terminerSortie();
  } else {
    taperCaractere();
  }
}

function executerCommande(raw) {
  const key = normaliserCommande(raw);
  input.value = "";
  tape.textContent = "";

  if (key === "menu") {
    afficherMenu();
    return;
  }

  const source = rubriques.get(key);
  if (source) {
    ecrireSortie(source);
    return;
  }

  enFrappe = false;
  generation += 1;
  window.clearTimeout(timerId);
  ecran.replaceChildren();
  ecran.setAttribute("aria-busy", "false");
  const erreur = creerLigne(`❯ commande inconnue : #${raw.trim()}`, "terminal-erreur");
  annonce.textContent = erreur.textContent;
  ajouterRappelMenu();
}

function simulerFrappeCommande(key) {
  if (enFrappe) {
    return;
  }

  const commande = `#${key}`;
  if (reductionMouvement.matches) {
    executerCommande(key);
    return;
  }

  enFrappe = true;
  input.focus({ preventScroll: true });
  const currentGeneration = ++generation;
  let index = 0;
  const caracteres = Array.from(commande);

  function taperCommande() {
    if (currentGeneration !== generation) {
      return;
    }

    tape.textContent = caracteres.slice(0, index).join("");
    index += 1;

    if (index > caracteres.length) {
      timerId = window.setTimeout(() => {
        if (currentGeneration === generation) {
          executerCommande(key);
        }
      }, 150);
      return;
    }

    timerId = window.setTimeout(taperCommande, delaiFrappeCommande);
  }

  taperCommande();
}

input.addEventListener("input", () => {
  if (!enFrappe) {
    tape.textContent = input.value;
  }
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (!enFrappe) {
      executerCommande(input.value);
    }
  } else if (event.key === "Escape" && enFrappe) {
    window.clearTimeout(timerId);
    generation += 1;
    afficherMenu();
  }
});

ecran.addEventListener("click", (event) => {
  const cible = event.target;
  if (!(cible instanceof Element)) {
    return;
  }

  const bouton = cible.closest(".terminal-hashtag");
  if (bouton instanceof HTMLButtonElement) {
    simulerFrappeCommande(bouton.dataset.key || "");
  }
});

terminal.addEventListener("click", (event) => {
  const cible = event.target;
  if (cible instanceof Element && cible.closest(".terminal-hashtag")) {
    return;
  }

  input.focus({ preventScroll: true });
});

afficherMenu();
