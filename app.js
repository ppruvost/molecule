const viewer = $3Dmol.createViewer("viewer", {
  backgroundColor: "white"
});

let molecules = [];

fetch("molecules.json")
  .then(res => res.json())
  .then(data => {
    molecules = data;
    const select = document.getElementById("moleculeSelect");

    data.forEach(mol => {
      const option = document.createElement("option");
      option.value = mol.name;
      option.textContent = mol.name;
      select.appendChild(option);
    });

    select.addEventListener("change", () => {
      loadMolecule(select.value);
    });

    loadMolecule(data[0].name);
  });

async function loadMolecule(name) {
  const mol = molecules.find(m => m.name === name);
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${mol.name}/SDF?record_type=3d`;

  const res = await fetch(url);
  const sdf = await res.text();

  viewer.clear();
  viewer.addModel(sdf, "sdf");
  viewer.setStyle({}, {stick:{}, sphere:{scale:0.3}});
  viewer.zoomTo();
  viewer.render();

  loadInfo(mol.name);
}

async function loadInfo(name) {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/MolecularFormula,MolecularWeight/JSON`;

  const res = await fetch(url);
  const data = await res.json();

  const props = data.PropertyTable.Properties[0];

  document.getElementById("formula").textContent = props.MolecularFormula;
  document.getElementById("mass").textContent = props.MolecularWeight;
}

async function loadFromSmiles() {
  const smiles = document.getElementById("smilesInput").value;

  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF?record_type=3d`;

  const res = await fetch(url);
  const sdf = await res.text();

  viewer.clear();
  viewer.addModel(sdf, "sdf");
  viewer.setStyle({}, {stick:{}, sphere:{scale:0.3}});
  viewer.zoomTo();
  viewer.render();
}
