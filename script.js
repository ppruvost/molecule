import { getRDKit } from './rdkitLoader.js';
import { smilesTo3D } from './obabelLoader.js';

let viewer = $3Dmol.createViewer("viewer", {
    backgroundColor: "black"
});

let currentMol = null;

async function generate() {
    const smiles = document.getElementById("smiles").value;
    const RDKit = await getRDKit();

    try {
        currentMol = RDKit.get_mol(smiles);
        const molblock = currentMol.get_molblock();

        display(molblock);

    } catch (e) {
        alert("Erreur SMILES");
    }
}

async function optimize() {
    const smiles = document.getElementById("smiles").value;

    const sdf = await smilesTo3D(smiles);
    display(sdf);
}

function display(data) {
    viewer.clear();

    viewer.addModel(data, "sdf");

    viewer.setStyle({}, {
        stick: { radius: 0.2 },
        sphere: { scale: 0.25 }
    });

    viewer.zoomTo();
    viewer.render();
}

function loadExample() {
    document.getElementById("smiles").value = "CCO";
    generate();
}

// Import fichier
document.getElementById("fileInput").addEventListener("change", e => {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = function(ev) {
        display(ev.target.result);
    };
    reader.readAsText(file);
});

window.generate = generate;
window.optimize = optimize;
window.loadExample = loadExample;
