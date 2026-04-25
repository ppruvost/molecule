import initRDKitModule from "@rdkit/rdkit";

let RDKit;

export async function getRDKit() {
    if (!RDKit) {
        RDKit = await initRDKitModule();
    }
    return RDKit;
}
