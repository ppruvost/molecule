import initRDKitModule from "@rdkit/rdkit";

let RDKit;

export async function getRDKit() {
    if (!RDKit) {
        RDKit = await initRDKitModule();
    }
    return RDKit;
}

export async function smilesTo3D_RDKit(smiles) {
    const RDKit = await getRDKit();

    const mol = RDKit.get_mol(smiles);
    if (!mol) throw new Error("SMILES invalide");

    mol.AddHs();
    mol.EmbedMolecule();
    mol.UFFOptimizeMolecule();

    const sdf = mol.get_molblock();
    mol.delete?.();

    return sdf;
}
