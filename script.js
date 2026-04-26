import { molecules } from "./library.js";
import { smilesTo3D } from "./obabelLoader.js";

let viewer;

init();

function init() {

    viewer = $3Dmol.createViewer("viewer", {
        backgroundColor: "#1e3a8a"
    });

    window.addEventListener("resize", () => viewer.resize());

    document.getElementById("btnGen").addEventListener("click", generate);
    document.getElementById("btnExample").addEventListener("click", loadExample);
    document.getElementById("fileInput").addEventListener("change", loadFile);
    document.getElementById("btnSmiles").addEventListener("click", generateFromSmiles);

    document.getElementById("smilesInput")
        .addEventListener("keypress", (e) => {
            if (e.key === "Enter") generateFromSmiles();
        });

    buildDropdown();
    setStatus("Prêt");
}

// 📦 MENU
function buildDropdown() {
    const select = document.getElementById("molSelect");

    for (const key in molecules) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    }
}

// 🧪 GENERATE LOCAL
function generate() {
    const key = document.getElementById("molSelect").value;

    if (!key) {
        setStatus("Choisis une molécule");
        return;
    }

    display(molecules[key]);
    setStatus("Molécule chargée");
}

// 🔬 SMILES → 3D
async function generateFromSmiles() {
    const smiles = document.getElementById("smilesInput").value.trim();

    if (!smiles) {
        setStatus("Entre un SMILES");
        return;
    }

    setStatus("Chargement...");

    try {
        const sdf = await smilesTo3D(smiles);
        display(sdf);
        setStatus("Molécule générée");
    } catch {
        setStatus("Erreur SMILES");
    }
}

// 🎯 DISPLAY
function display(data) {
    viewer.clear();
    viewer.addModel(data, "sdf");

    viewer.setStyle({}, {
        stick: { radius: 0.2 },
        sphere: { scale: 0.3 }
    });

    viewer.zoomTo();
    viewer.render();
}

// 🎯 EXEMPLE
function loadExample() {
    document.getElementById("molSelect").value = "ethanol";
    generate();
}

// 📂 FILE
function loadFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
        display(ev.target.result);
        setStatus("Fichier chargé");
    };

    reader.readAsText(file);
}

// 📢 STATUS
function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}
