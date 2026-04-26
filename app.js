const viewer = $3Dmol.createViewer("viewer", {
  backgroundColor: "white"
});

let molecules = [];

// =======================
// 📦 Chargement JSON
// =======================
fetch("molecules.json")
  .then(res => res.json())
  .then(data => {

    // 🔒 sécurité (filtre valeurs invalides)
    molecules = data.filter(m => m.name_en && m.name_fr);

    if (molecules.length === 0) {
      console.error("Aucune molécule valide dans le JSON");
      document.getElementById("molName").textContent = "Erreur de données";
      return;
    }

    const select = document.getElementById("moleculeSelect");

    molecules.forEach(mol => {
      const option = document.createElement("option");
      option.value = mol.name_en;
      option.textContent = mol.name_fr;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      loadMolecule(select.value);
    });

    // 🔬 molécule par défaut fiable
    const defaultMol =
      molecules.find(m => m.name_en === "Methane") || molecules[0];

    loadMolecule(defaultMol.name_en);
  })
  .catch(err => {
    console.error("Erreur chargement JSON :", err);
    document.getElementById("molName").textContent =
      "Erreur chargement des molécules";
  });


// =======================
// 🔬 Chargement molécule 3D
// =======================
async function loadMolecule(name_en) {

  console.log("Chargement :", name_en);

  if (!name_en || name_en === "undefined") {
    console.error("Nom invalide :", name_en);
    document.getElementById("molName").textContent = "Molécule invalide";
    return;
  }

  try {
    const mol = molecules.find(m => m.name_en === name_en);

    let sdf = null;

    // 🔬 tentative 3D
    let res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF?record_type=3d`
    );

    if (res.ok) {
      sdf = await res.text();
    } else {
      console.warn("3D indisponible → fallback 2D");

      res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF`
      );

      if (res.ok) {
        sdf = await res.text();
      }
    }

    if (!sdf || sdf.length < 50) {
      console.warn("Structure introuvable :", name_en);

      viewer.clear();
      viewer.render();

      document.getElementById("molName").textContent =
        mol ? `${mol.name_fr} (${mol.name_en})` : name_en;

      document.getElementById("formula").textContent = "N/A";
      document.getElementById("mass").textContent = "N/A";

      return;
    }

    // 🧬 affichage 3D
    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    document.getElementById("molName").textContent =
      mol ? `${mol.name_fr} (${mol.name_en})` : name_en;

    loadInfo(name_en);

  } catch (e) {
    console.error("Erreur loadMolecule :", e);

    document.getElementById("molName").textContent =
      "Molécule non disponible";

    viewer.clear();
    viewer.render();
  }
}


// =======================
// 📊 Infos moléculaires
// =======================
async function loadInfo(name_en) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/property/MolecularFormula,MolecularWeight/JSON`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Infos indisponibles");

    const data = await res.json();

    const props = data?.PropertyTable?.Properties?.[0];

    document.getElementById("formula").textContent =
      props?.MolecularFormula || "N/A";

    document.getElementById("mass").textContent =
      props?.MolecularWeight || "N/A";

  } catch (e) {
    console.error("Erreur loadInfo :", e);

    document.getElementById("formula").textContent = "N/A";
    document.getElementById("mass").textContent = "N/A";
  }
}


// =======================
// 🧪 SMILES
// =======================
async function loadFromSmiles() {

  const smiles = document.getElementById("smilesInput").value.trim();

  if (!smiles) {
    document.getElementById("molName").textContent =
      "Veuillez entrer un SMILES";
    return;
  }

  console.log("SMILES :", smiles);

  try {
    let res = await fetch(
      `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`
    );

    if (!res.ok) {
      console.warn("Fallback SMILES 2D");

      res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF`
      );
    }

    if (!res.ok) throw new Error("SMILES invalide");

    const sdf = await res.text();

    if (!sdf || sdf.length < 50) {
      throw new Error("Structure vide");
    }

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    document.getElementById("molName").textContent =
      "Molécule (SMILES)";

    document.getElementById("formula").textContent = "N/A";
    document.getElementById("mass").textContent = "N/A";

  } catch (e) {
    console.error("Erreur SMILES :", e);

    document.getElementById("molName").textContent =
      "SMILES non reconnu";

    viewer.clear();
    viewer.render();
  }
}
