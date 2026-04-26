const viewer = $3Dmol.createViewer("viewer", {
  backgroundColor: "white"
});

let molecules = [];

// Chargement des molécules
fetch("molecules.json")
  .then(res => res.json())
  .then(data => {
    molecules = data;

    const select = document.getElementById("moleculeSelect");

    data.forEach(mol => {
      const option = document.createElement("option");
      option.value = mol.name_en;        // utilisé pour API
      option.textContent = mol.name_fr;  // affichage utilisateur
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      loadMolecule(select.value);
    });

    // Charger première molécule correctement
    loadMolecule(data[0].name_en);
  })
  .catch(err => {
    console.error("Erreur chargement JSON :", err);
  });


// =======================
// 🔬 Chargement molécule
// =======================
async function loadMolecule(name_en) {
  try {
    const mol = molecules.find(m => m.name_en === name_en);

    const url3D = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF?record_type=3d`;

    let res = await fetch(url3D);

    // 🔁 fallback si 3D non dispo
    if (!res.ok) {
      const fallbackUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(name_en)}/SDF`;
      res = await fetch(fallbackUrl);
    }

    if (!res.ok) throw new Error("Molécule introuvable");

    const sdf = await res.text();

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    // 🔤 affichage nom FR + EN
    if (mol) {
      document.getElementById("molName").textContent =
        `${mol.name_fr} (${mol.name_en})`;
    }

    loadInfo(name_en);

  } catch (e) {
    console.error(e);
    alert("Erreur lors du chargement de la molécule");
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
    const props = data.PropertyTable.Properties[0];

    document.getElementById("formula").textContent =
      props.MolecularFormula || "-";

    document.getElementById("mass").textContent =
      props.MolecularWeight || "-";

  } catch (e) {
    console.error(e);
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

  try {
    const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`;

    let res = await fetch(url);

    // fallback sans 3D
    if (!res.ok) {
      const fallbackUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF`;
      res = await fetch(fallbackUrl);
    }

    if (!res.ok) throw new Error("SMILES invalide");

    const sdf = await res.text();

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

    // reset infos
    document.getElementById("molName").textContent = "SMILES personnalisé";
    document.getElementById("formula").textContent = "-";
    document.getElementById("mass").textContent = "-";

  } catch (e) {
    console.error(e);
    alert("SMILES invalide ou molécule non trouvée");
  }
}
