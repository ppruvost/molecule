let viewer = $3Dmol.createViewer("viewer", { backgroundColor: "white" });

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

  } catch (error) {
    alert("Molécule non trouvée ou erreur API");
    console.error(error);
  }
}
