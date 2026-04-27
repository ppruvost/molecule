let viewer;

window.onload = function () {
  viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });
};

async function searchMolecule() {
  const name = document.getElementById("search").value.trim();

  if (!name) return;

  try {
    // 🔹 Infos chimiques
    const infoUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/MolecularFormula,MolecularWeight/JSON`;

    const infoRes = await fetch(infoUrl);
    const infoData = await infoRes.json();

    const props = infoData.PropertyTable.Properties[0];

    document.getElementById("formule").textContent = props.MolecularFormula;
    document.getElementById("masse").textContent = props.MolecularWeight;

    // 🔹 Structure 3D
    const structureUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/record/SDF/?record_type=3d`;

    const sdfRes = await fetch(structureUrl);
    const sdf = await sdfRes.text();

    viewer.clear();
    viewer.addModel(sdf, "sdf");
    viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
    viewer.zoomTo();
    viewer.render();

  catch (error) {
  console.warn("API échouée, tentative locale...");

  fetch("molecules.json")
    .then(res => res.json())
    .then(localData => {

      const nameLower = name.toLowerCase();

      const mol = localData.find(m =>
        m.nom === nameLower ||
        (m.aliases && m.aliases.includes(nameLower))
      );

      if (!mol) {
        alert("Molécule non trouvée");
        return;
      }

      // Affichage des infos
      document.getElementById("formule").textContent = mol.formule;
      document.getElementById("masse").textContent = mol.masse;

      // Affichage 3D
      viewer.clear();
      viewer.addModel(mol.structure, "xyz");
      viewer.setStyle({}, { stick: {}, sphere: { scale: 0.3 } });
      viewer.zoomTo();
      viewer.render();
    })
    .catch(err => {
      alert("Erreur locale");
      console.error(err);
    });
}
}
