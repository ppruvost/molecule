export async function smilesTo3D(smiles) {
    // API publique OpenBabel-like (fallback web)
    const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${smiles}/SDF`
    );

    return await res.text();
}
