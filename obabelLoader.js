export async function smilesTo3D(smiles) {
    const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/SDF`
    );

    if (!res.ok) throw new Error();

    return await res.text();
}
