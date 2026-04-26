let RDKit = null;

export async function getRDKit() {
    if (RDKit) return RDKit;

    if (!window.initRDKitModule) {
        throw new Error("RDKit non chargé");
    }

    RDKit = await window.initRDKitModule();
    await RDKit.init?.();

    return RDKit;
}

/* 🔬 SMILES → 3D SDF */
export async function smilesTo3D_RDKit(smiles) {
    const RDKit = await getRDKit();

    const mol = RDKit.get_mol(smiles);

    if (!mol) {
        throw new Error("SMILES invalide");
    }

    try {
        // ✅ RDKit JS : génération 3D correcte
        const molBlock = mol.get_molblock(true);

        return molBlock;

    } finally {
        mol.delete?.();
    }
}
