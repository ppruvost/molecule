let viewer;

window.addEventListener("DOMContentLoaded", () => {
  viewer = $3Dmol.createViewer("viewer", {
    backgroundColor: "white"
  });
});

// ===============================
// Normalisation
// ===============================
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// ===============================
// Affichage 3D
// ===============================
function display3D(structure, format = "xyz") {
  viewer.clear();
  viewer.addModel(structure, format);
  viewer.setStyle({}, {
    stick: {},
    sphere: { scale: 0.3 }
  });
  viewer.zoomTo();
  viewer.render();
}

// ===============================
// Recherche locale JSON
// ===============================
async function searchLocalMolecule(name, onlyStructure = false) {
  const res = await fetch("molecules.json");
  const localData = await res.json();

  const query = normalize(name);

  const mol = localData.find(m =>
    normalize(m.nom).includes(query) ||
    (m.aliases &&
      m.aliases.some(a => normalize(a).includes(query)))
  );

  if (!mol) return null;

  if (!onlyStructure) {
    document.getElementById("formule").textContent = mol.formule || "-";
    document.getElementById("masse").textContent = mol.masse || "-";
  }

  if (mol.structure) {
    display3D(mol.structure, "xyz");
  }

  return mol;
}

// ===============================
// Recherche principale
// ===============================
async function searchMolecule() {
  const rawName = document.getElementById("search").value.trim();
  const name = normalize(rawName);

  if (!name) return;

  // reset visuel
  document.getElementById("formule").textContent = "-";
  document.getElementById("masse").textContent = "-";
  viewer.clear();
  viewer.render();

  let pubchemWorked = false;

  // =====================================================
  // 1. Infos PubChem (formule + masse)
  // =====================================================
  try {
    const infoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/MolecularFormula,MolecularWeight/JSON`;

    const infoRes = await fetch(infoUrl);

    if (infoRes.ok) {
      const infoData = await infoRes.json();

      if (
        infoData.PropertyTable &&
        infoData.PropertyTable.Properties &&
        infoData.PropertyTable.Properties.length > 0
      ) {
        const props = infoData.PropertyTable.Properties[0];

        document.getElementById("formule").textContent =
          props.MolecularFormula || "-";

        document.getElementById("masse").textContent =
          props.MolecularWeight || "-";

        pubchemWorked = true;
      }
    }
  } catch (error) {
    console.warn("Infos PubChem indisponibles");
  }

  // =====================================================
  // 2. Structure 3D PubChem
  // =====================================================
  try {
    const structureUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/record/SDF/?record_type=3d`;

    const sdfRes = await fetch(structureUrl);

    if (sdfRes.ok) {
      const sdf = await sdfRes.text();

      // Vérifie si vraie structure
      if (sdf && sdf.length > 100) {
        display3D(sdf, "sdf");
        return;
      }
    }

    throw new Error("Pas de vraie structure 3D");

  } catch (error) {
    console.warn("3D PubChem absente → fallback JSON");

    // fallback uniquement structure
    const localMol = await searchLocalMolecule(name, pubchemWorked);

    if (localMol) return;
  }

  // =====================================================
  // 3. Si PubChem totalement échoué
  // =====================================================
  if (!pubchemWorked) {
    console.warn("Fallback complet JSON");

    const localMol = await searchLocalMolecule(name);

    if (!localMol) {
      alert("Molécule non trouvée");
    }
  }
}
