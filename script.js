let viewer;

init();

function init() {
    viewer = $3Dmol.createViewer("viewer", {
        backgroundColor: "black"
    });

    document.getElementById("btnGen").addEventListener("click", generate);
    document.getElementById("btnExample").addEventListener("click", loadExample);

    document.getElementById("fileInput").addEventListener("change", loadFile);
}

async function generate() {
    const input = document.getElementById("input").value;
    setStatus("Chargement...");

    try {
        // 🔥 méthode robuste : nom OU SMILES
        const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${input}/SDF?record_type=3d`;

        let res = await fetch(url);

        if (!res.ok) {
            // fallback SMILES
            const url2 = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${input}/SDF?record_type=3d`;
            res = await fetch(url2);
        }

        if (!res.ok) throw new Error("Molécule non trouvée");

        const sdf = await res.text();

        display(sdf);
        setStatus("Molécule chargée");

    } catch (e) {
        console.error(e);
        setStatus("Erreur : molécule introuvable");
    }
}

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

function loadExample() {
    document.getElementById("input").value = "ethanol";
    generate();
}

function loadFile(e) {
    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = function(ev) {
        display(ev.target.result);
        setStatus("Fichier chargé");
    };

    reader.readAsText(file);
}

function setStatus(msg) {
    document.getElementById("status").innerText = msg;
}
