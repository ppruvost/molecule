function buildMolecule(formula) {
    const group = new THREE.Group();

    const atoms = parseFormula(formula);

    const atomMeshes = [];

    atoms.forEach((atom, index) => {
        const mesh = createAtom(atom.element);

        // Position simple en cercle (améliorable avec VSEPR)
        const angle = (index / atoms.length) * Math.PI * 2;
        const radius = 2;

        mesh.position.set(
            Math.cos(angle) * radius,
            Math.sin(angle) * radius,
            0
        );

        group.add(mesh);
        atomMeshes.push(mesh);
    });

    // Liaisons
    for (let i = 0; i < atomMeshes.length - 1; i++) {
        const bond = createBond(atomMeshes[i].position, atomMeshes[i + 1].position);
        group.add(bond);
    }

    return group;
}

function parseFormula(formula) {
    const regex = /([A-Z][a-z]?)(\d*)/g;
    let match;
    const atoms = [];

    while ((match = regex.exec(formula)) !== null) {
        const element = match[1];
        const count = parseInt(match[2]) || 1;

        for (let i = 0; i < count; i++) {
            atoms.push({ element });
        }
    }

    return atoms;
}

function createAtom(element) {
    const colors = {
        H: 0xffffff,
        O: 0xff0000,
        C: 0x333333,
        N: 0x0000ff,
        S: 0xffff00
    };

    const sizes = {
        H: 0.3,
        O: 0.6,
        C: 0.5,
        N: 0.5,
        S: 0.7
    };

    const geometry = new THREE.SphereGeometry(sizes[element] || 0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({
        color: colors[element] || 0xaaaaaa
    });

    return new THREE.Mesh(geometry, material);
}

function createBond(start, end) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, length, 16);
    const material = new THREE.MeshStandardMaterial({ color: 0xffffff });

    const bond = new THREE.Mesh(geometry, material);

    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    bond.position.copy(midpoint);

    bond.lookAt(end);
    bond.rotateX(Math.PI / 2);

    return bond;
}
