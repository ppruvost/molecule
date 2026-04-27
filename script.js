let viewer;

window.addEventListener("DOMContentLoaded", () => {
  viewer = $3Dmol.createViewer("viewer", {
    backgroundColor: "white"
  });
});
// 🔧 Normalisation (à placer ici, en haut du fichier)
function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

async function searchMolecule() {
  const name = document.getElementById("search").value.trim();

  if (!name) return;

  try {
    // 🔹 API PubChem
    const infoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/MolecularFormula,MolecularWeight/JSON`;
    const infoRes = await fetch(infoUrl);
    const infoData = await infoRes.json();

    const props = infoData.PropertyTable.Properties[0];

    document.getElementById("formule").textContent = props.MolecularFormula;
    document.getElementById("masse").textContent = props.MolecularWeight;

    const structureUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/record/SDF/?record_type=3d`;
    const sdfRes = await fetch(structureUrl);
    const sdf = await sdfRes.text();

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

  } catch (error) {

    console.warn("API échouée → fallback local");

    try {
      const res = await fetch("molecules.json");
      const localData = await res.json();

      const nameLower = name.toLowerCase();

      const mol = localData.find(m =>
        normalize(m.nom).includes(query) ||
        (m.aliases && m.aliases.some(alias => normalize(alias).includes(query)))
      );

      if (!mol) {
        alert("Molécule non trouvée");
        return;
      }

      document.getElementById("formule").textContent = mol.formule;
      document.getElementById("masse").textContent = mol.masse;

      viewer.clear();
      viewer.addModel(mol.structure, "xyz");
      viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
      viewer.zoomTo();
      viewer.render();

    } catch (err) {
      alert("Erreur locale");
      console.error(err);
    }
  }
}
