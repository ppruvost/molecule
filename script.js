import { molecules } from "./library.js";
import { families } from "./courseData.js";
import { smilesTo3D_RDKit } from "./rdkitLoader.js";

let viewer;

window.addEventListener("DOMContentLoaded", init);

function init() {

    if (!window.$3Dmol) {
        console.error("3Dmol pas chargé");
        return;
    }

    viewer = $3Dmol.createViewer("viewer", {
        backgroundColor: "#1e3a8a"
    });

    window.addEventListener("resize", () => viewer.resize());
    window.addEventListener("orientationchange", () => {
        setTimeout(() => viewer.resize(), 300);
    });

    bindUI();
    buildDropdown();
    buildFamilyMenu();

    setStatus("Prêt");
}

/* 🔗 EVENTS */
function bindUI() {
    document.getElementById("btnGen").addEventListener("click", generate);
    document.getElementById("btnExample").addEventListener("click", loadExample);
    document.getElementById("fileInput").addEventListener("change", loadFile);
    document.getElementById("btnSmiles").addEventListener("click", generateFromSmiles);
    document.getElementById("btnCourse").addEventListener("click", generateFromCourse);

    document.getElementById("familySelect")
        .addEventListener("change", updateExamples);
}

/* 📦 MOLÉCULES */
function buildDropdown() {
    const select = document.getElementById("molSelect");
    if (!select || !molecules) return;

    select.innerHTML = "";

    Object.keys(molecules).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = key;
        select.appendChild(opt);
    });
}

/* 🎓 FAMILLES */
function buildFamilyMenu() {
    const select = document.getElementById("familySelect");
    if (!select || !families) return;

    select.innerHTML = "";

    Object.keys(families).forEach(key => {
        const opt = document.createElement("option");
        opt.value = key;
        opt.textContent = families[key].nom || key;
        select.appendChild(opt);
    });

    updateExamples();
}

/* 🧪 EXEMPLES */
function updateExamples() {
    const familyKey = document.getElementById("familySelect")?.value;
    const exampleSelect = document.getElementById("exampleSelect");

    if (!exampleSelect || !families?.[familyKey]) return;

    exampleSelect.innerHTML = "";

    families[familyKey].exemples.forEach(ex => {
        const opt = document.createElement("option");
        opt.value = ex.smiles;
        opt.textContent = ex.nom;
        exampleSelect.appendChild(opt);
    });
}

/* 🧪 LOCAL */
function generate() {
    const key = document.getElementById("molSelect").value;

    if (!molecules[key]) {
        setStatus("Molécule introuvable");
        return;
    }

    display(molecules[key]);
}

/* 🔬 SMILES */
async function generateFromSmiles() {
    const smiles = document.getElementById("smilesInput").value;

    try {
        const sdf = await smilesTo3D_RDKit(smiles);
        display(sdf);
    } catch (e) {
        console.error(e);
        setStatus("Erreur SMILES");
    }
}

/* 🎓 COURS */
async function generateFromCourse() {
    const familyKey = document.getElementById("familySelect").value;
    const smiles = document.getElementById("exampleSelect").value;

    const family = families?.[familyKey];
    if (!family) return;

    document.getElementById("courseInfo").innerText =
        family.nom + " : " + family.description;

    try {
        const sdf = await smilesTo3D_RDKit(smiles);
        display(sdf);
    } catch (e) {
        console.error(e);
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
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => display(ev.target.result);
    reader.readAsText(file);
}

function loadExample() {
    document.getElementById("molSelect").value = "ethanol";
    generate();
}

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}
