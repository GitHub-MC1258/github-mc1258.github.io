let fuse;

/**
 * Initialisation de la recherche : chargement de l'index JSON et configuration de Fuse.js
 */
async function initSearch() {
    try {
        const response = await fetch('/index.json');
        if (!response.ok) throw new Error("Impossible de charger index.json");

        const data = await response.json();

        const options = {
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'author', weight: 0.6 },
                { name: 'content', weight: 0.3 }
            ],
            threshold: 0.3,           // Équilibre entre précision et tolérance aux typos
            minMatchCharLength: 3,    // Évite de surligner des lettres isolées
            findAllMatches: false,
            includeMatches: true,     // Indispensable pour le surlignage
            ignoreLocation: true
        };

        fuse = new Fuse(data, options);
        console.log("Moteur de recherche Fuse.js prêt.");

        // Gestion du paramètre URL ?q=... (provenant du header)
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        if (query) {
            const inputPage = document.getElementById('search-page-input');
            if (inputPage) inputPage.value = query;
            executeSearch(query);
        }
    } catch (err) {
        console.error("Erreur d'initialisation :", err);
    }
}

/**
 * Exécute la recherche et affiche les résultats dans le conteneur dédié
 */
function executeSearch(query) {
    const container = document.getElementById('search-page-results');
    if (!container) return;

    if (!query || query.length < 2) {
        container.innerHTML = "";
        return;
    }

    if (!fuse) {
        container.innerHTML = "<p>Chargement du moteur de recherche...</p>";
        return;
    }

    const results = fuse.search(query);

    if (results.length === 0) {
        container.innerHTML = "<p>Aucun résultat trouvé pour cette recherche.</p>";
        return;
    }

    container.innerHTML = results.map(result => {
        // On récupère les valeurs de base
        let title = result.item.title;
        let author = result.item.author || "Anonyme";
        let content = result.item.content.substring(0, 250) + "...";

        // On applique le surlignage via les correspondances trouvées par Fuse
        result.matches.forEach(match => {
            if (match.key === 'title') title = highlight(match.value, match.indices);
            if (match.key === 'author') author = highlight(match.value, match.indices);
            if (match.key === 'content') content = highlight(match.value, match.indices);
        });

        return `
            <article class="search-result-big" style="margin-bottom: 2rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
                <h3 style="margin-bottom: 5px;">
                    <a href="${result.item.permalink}" style="color: var(--dark-gray); text-decoration: none;">${title}</a>
                </h3>
                <p class="author" style="font-size: 0.85rem; color: var(--primary-gray); font-style: italic; margin-bottom: 10px;">
                    Par : ${author}
                </p>
                <p class="excerpt" style="font-size: 0.95rem; color: #444;">
                    ${content}
                </p>
            </article>
        `;
    }).join('');
}

/**
 * Fonction de surlignage utilisant les indices de Fuse.js
 */
function highlight(text, indices) {
    let result = "";
    let lastIndex = 0;

    // On trie les indices pour éviter les décalages
    indices.sort((a, b) => a[0] - b[0]).forEach(([start, end]) => {
        // On ne surligne que si la séquence fait au moins 2 caractères
        if ((end - start) >= 1) {
            result += text.substring(lastIndex, start) +
                `<mark style="background-color: var(--signature-violet); color: white; padding: 0 2px; border-radius: 3px;">` +
                text.substring(start, end + 1) +
                `</mark>`;
            lastIndex = end + 1;
        }
    });
    return result + text.substring(lastIndex);
}

/**
 * Écouteur d'événement sur l'input de la page de recherche
 */
const searchPageInput = document.getElementById('search-page-input');
if (searchPageInput) {
    searchPageInput.addEventListener('input', (e) => {
        executeSearch(e.target.value);
    });
}

// Lancement de l'initialisation
initSearch();
