export async function smilesTo3D(smiles) {
    try {
        const res = await fetch(
            `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF`
        );

        if (!res.ok) throw new Error("Molécule introuvable");

        return await res.text();
    } catch (err) {
        throw new Error("Erreur SMILES → 3D");
    }
}
