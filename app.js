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

    // 🔒 filtre sécurité (évite undefined)
    molecules = data.filter(m => m.name_en && m.name_fr);

    if (molecules.length === 0) {
      throw new Error("Aucune molécule valide dans le JSON");
    }

    const select = document.getElementById("moleculeSelect");

    molecules.forEach(mol => {
      const option = document.createElement("option");
      option.value = mol.name_en;
      option.textContent = mol.name_fr;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      console.log("Sélection :", select.value);
      loadMolecule(select.value);
    });

    // ✅ première molécule sûre
    loadMolecule(molecules[0].name_en);
  })
  .catch(err => {
    console.error("Erreur chargement JSON :", err);
    alert("Erreur chargement des molécules");
  });


// =======================
// 🔬 Chargement molécule
// =======================
async function loadMolecule(name_en) {

  console.log("Chargement molécule :", name_en);

  if (!name_en || name_en === "undefined") {
    console.error("❌ name_en invalide :", name_en);
    alert("Erreur : molécule invalide");
    return;
  }

  try {
    const mol = molecules.find(m => m.name_en === name_en);

    const url3D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF?record_type=3d`;

    let res = await fetch(url3D);

    // 🔁 fallback si 3D absent
    if (!res.ok) {
      console.warn("3D non dispo → fallback 2D");
      const fallbackUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF`;
      res = await fetch(fallbackUrl);
    }

    if (!res.ok) throw new Error("Molécule introuvable");

    const sdf = await res.text();

    // ⚠️ sécurité contenu vide
    if (!sdf || sdf.length < 100) {
      throw new Error("Structure vide");
    }

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    // 🔤 affichage nom
    if (mol) {
      document.getElementById("molName").textContent =
        `${mol.name_fr} (${mol.name_en})`;
    } else {
      document.getElementById("molName").textContent = name_en;
    }

    loadInfo(name_en);

  } catch (e) {
    console.error("Erreur loadMolecule :", e);
    alert("Impossible de charger cette molécule");
  }
}


// =======================
// 📊 Infos molécule
// =======================
async function loadInfo(name_en) {
  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/property/MolecularFormula,MolecularWeight/JSON`;

    const res = await fetch(url);

    if (!res.ok) throw new Error("Infos introuvables");

    const data = await res.json();

    const props = data?.PropertyTable?.Properties?.[0];

    if (!props) throw new Error("Données invalides");

    document.getElementById("formula").textContent =
      props.MolecularFormula || "-";

    document.getElementById("mass").textContent =
      props.MolecularWeight || "-";

  } catch (e) {
    console.error("Erreur loadInfo :", e);
    document.getElementById("formula").textContent = "-";
    document.getElementById("mass").textContent = "-";
  }
}


// =======================
// 🧪 SMILES
// =======================
async function loadFromSmiles() {
  const smiles = document.getElementById("smilesInput").value.trim();

  if (!smiles) {
    alert("Veuillez entrer un SMILES");
    return;
  }

  console.log("SMILES :", smiles);

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`;

    let res = await fetch(url);

    if (!res.ok) {
      console.warn("3D SMILES indispo → fallback");
      const fallbackUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF`;
      res = await fetch(fallbackUrl);
    }

    if (!res.ok) throw new Error("SMILES invalide");

    const sdf = await res.text();

    if (!sdf || sdf.length < 100) {
      throw new Error("Structure vide");
    }

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    document.getElementById("molName").textContent = "Molécule (SMILES)";
    document.getElementById("formula").textContent = "-";
    document.getElementById("mass").textContent = "-";

  } catch (e) {
    console.error("Erreur SMILES :", e);
    alert("SMILES invalide ou non reconnu");
  }
}
