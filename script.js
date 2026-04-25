let viewer;

init();

function init() {
    viewer = $3Dmol.createViewer("viewer", {
        backgroundColor: "#f0f0f0"
    });

    document.getElementById("btnGen").addEventListener("click", generate);
    document.getElementById("btnExample").addEventListener("click", loadExample);

    document.getElementById("fileInput").addEventListener("change", loadFile);

    setStatus("Prêt (mode 100% offline)");
}

// 🔥 Base molécules locale
const molecules = {
    ethanol: `ethanol
  local

  9  8  0  0  0  0            999 V2000
    0.0000    0.0000    0.0000 C
    1.5400    0.0000    0.0000 C
    2.0900    1.2000    0.0000 O
    0.0000    1.0000    0.0000 H
    0.0000   -0.5000    0.9000 H
    0.0000   -0.5000   -0.9000 H
    1.5400   -0.5000    0.9000 H
    1.5400   -0.5000   -0.9000 H
    2.0900    1.7000    0.9000 H
  1  2  1
  2  3  1
  1  4  1
  1  5  1
  1  6  1
  2  7  1
  2  8  1
  3  9  1
M  END
`,

    benzene: `benzene
  local

  6  6  0  0  0  0            999 V2000
    1.3960    0.0000    0.0000 C
    0.6980    1.2090    0.0000 C
   -0.6980    1.2090    0.0000 C
   -1.3960    0.0000    0.0000 C
   -0.6980   -1.2090    0.0000 C
    0.6980   -1.2090    0.0000 C
  1  2  2
  2  3  1
  3  4  2
  4  5  1
  5  6  2
  6  1  1
M  END
`,

    methane: `methane
  local

  5  4  0  0  0  0            999 V2000
    0.0000    0.0000    0.0000 C
    0.0000    0.0000    1.0890 H
    1.0267    0.0000   -0.3630 H
   -0.5133   -0.8892   -0.3630 H
   -0.5133    0.8892   -0.3630 H
  1  2  1
  1  3  1
  1  4  1
  1  5  1
M  END
`
};

function generate() {
    const input = document.getElementById("input").value.toLowerCase().trim();

    if (!input) {
        setStatus("Entre un nom de molécule");
        return;
    }

    if (molecules[input]) {
        display(molecules[input]);
        setStatus("Molécule chargée (offline)");
    } else {
        setStatus("Molécule inconnue (offline)");
    }
}

function display(data) {
    viewer.clear();

    viewer.addModel(data, "sdf");

    viewer.setStyle({}, {
    stick: { radius: 0.2 },
    sphere: { scale: 0.3 }
});

// 🔥 Override carbone en noir
viewer.setStyle({ elem: "C" }, {
    stick: { color: "black" },
    sphere: { color: "black" }
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
