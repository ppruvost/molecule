import { molecules } from "./library.js";
import { families } from "./courseData.js";
import { smilesTo3D } from "./obabelLoader.js";

let viewer;

init();

function init() {

    viewer = $3Dmol.createViewer("viewer", {
        backgroundColor: "#1e3a8a"
    });

    window.addEventListener("resize", () => viewer.resize());
    window.addEventListener("orientationchange", () => {
        setTimeout(() => viewer.resize(), 300);
    });

    document.getElementById("btnGen").addEventListener("click", generate);
    document.getElementById("btnExample").addEventListener("click", loadExample);
    document.getElementById("fileInput").addEventListener("change", loadFile);
    document.getElementById("btnSmiles").addEventListener("click", generateFromSmiles);
    document.getElementById("btnCourse").addEventListener("click", generateFromCourse);

    document.getElementById("familySelect")
        .addEventListener("change", updateExamples);

    buildDropdown();
    buildFamilyMenu();

    setStatus("Prêt");
}

/* 📦 MENU */
function buildDropdown() {
    const select = document.getElementById("molSelect");

    for (const key in molecules) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = key;
        select.appendChild(option);
    }
}

/* 🎓 FAMILLES */
function buildFamilyMenu() {
    const select = document.getElementById("familySelect");

    for (const key in families) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = families[key].nom;
        select.appendChild(option);
    }

    updateExamples();
}

function updateExamples() {
    const familyKey = document.getElementById("familySelect").value;
    const exampleSelect = document.getElementById("exampleSelect");

    exampleSelect.innerHTML = "";

    families[familyKey].exemples.forEach(ex => {
        const option = document.createElement("option");
        option.value = ex.smiles;
        option.textContent = ex.nom;
        exampleSelect.appendChild(option);
    });
}

/* 🧪 LOCAL */
function generate() {
    const key = document.getElementById("molSelect").value;
    display(molecules[key]);
}

/* 🔬 SMILES */
async function generateFromSmiles() {
    const smiles = document.getElementById("smilesInput").value;

    try {
        const sdf = await smilesTo3D(smiles);
        display(sdf);
    } catch {
        setStatus("Erreur SMILES");
    }
}

/* 🎓 MODE COURS */
async function generateFromCourse() {
    const familyKey = document.getElementById("familySelect").value;
    const smiles = document.getElementById("exampleSelect").value;

    const family = families[familyKey];

    document.getElementById("courseInfo").innerText =
        family.nom + " : " + family.description;

    try {
        const sdf = await smilesTo3D(smiles);
        display(sdf);
    } catch {
        setStatus("Erreur cours");
    }
}

/* 🎯 DISPLAY */
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

/* 📂 FILE */
function loadFile(e) {
    const reader = new FileReader();
    reader.onload = (ev) => display(ev.target.result);
    reader.readAsText(e.target.files[0]);
}

function loadExample() {
    document.getElementById("molSelect").value = "ethanol";
    generate();
}

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}
