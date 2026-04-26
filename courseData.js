export const families = {

    alcanes: {
        nom: "Alcanes",
        description: "Hydrocarbures saturés",
        exemples: [
            { nom: "Méthane", smiles: "C" },
            { nom: "Éthane", smiles: "CC" },
            { nom: "Propane", smiles: "CCC" },
            { nom: "Butane", smiles: "CCCC" }
        ]
    },

    alcenes: {
        nom: "Alcènes",
        description: "Double liaison",
        exemples: [
            { nom: "Éthène", smiles: "C=C" }
        ]
    },

    alcools: {
        nom: "Alcools",
        description: "Groupe OH",
        exemples: [
            { nom: "Éthanol", smiles: "CCO" }
        ]
    },

    acides: {
        nom: "Acides carboxyliques",
        description: "Groupe COOH",
        exemples: [
            { nom: "Acide acétique", smiles: "CC(=O)O" }
        ]
    },

    aromatiques: {
        nom: "Aromatiques",
        description: "Cycle benzénique",
        exemples: [
            { nom: "Benzène", smiles: "c1ccccc1" }
        ]
    }
};
