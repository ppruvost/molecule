let RDKit = null;

/* 🧠 Chargement unique du module RDKit */
export async function getRDKit() {
    if (RDKit) return RDKit;

    if (!window.initRDKitModule) {
        throw new Error("RDKit CDN non chargé (window.initRDKitModule introuvable)");
    }

    RDKit = await window.initRDKitModule();
    await RDKit.init?.();

    return RDKit;
}

/* 🔬 SMILES → 3D (SDF) */
export async function smilesTo3D_RDKit(smiles) {
    const RDKit = await getRDKit();

    const mol = RDKit.get_mol(smiles);

    if (!mol) {
        throw new Error("SMILES invalide");
    }

    try {
        mol.AddHs();
        mol.EmbedMolecule();
        mol.UFFOptimizeMolecule();

        const sdf = mol.get_molblock();
        return sdf;

    } finally {
        mol.delete?.();
    }
}
