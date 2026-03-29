let fuse;

/**
 * Normalisation des chaînes (suppression des accents)
 */
function normalize(str) {
    return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Initialisation de la recherche
 */
async function initSearch() {
    console.log("Moteur de recherche : Initialisation lancée...");

    const searchInput = document.getElementById('search-input-page') || document.getElementById('search-input');
    const container = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    if (!searchInput || !container) {
        console.warn("Composants de recherche non trouvés sur cette page.");
        return;
    }

    try {
        const response = await fetch('/index.json');
        if (!response.ok) throw new Error("Impossible de charger l'index.json");
        const data = await response.json();

        const options = {
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'author', weight: 0.6 },
                { name: 'content', weight: 0.4 }
            ],
            threshold: 0.3,
            minMatchCharLength: 3,
            includeMatches: true,
            ignoreLocation: true,

            // Normalisation des champs indexés
            getFn: (obj, path) => {
                const value = Fuse.config.getFn(obj, path);
                return typeof value === "string" ? normalize(value) : value;
            }
        };

        fuse = new Fuse(data, options);

        // 1. Gestion de la requête via l'URL (ex: ?q=hugo)
        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('q');

        if (queryFromUrl) {
            searchInput.value = queryFromUrl;
            if (clearBtn) clearBtn.style.display = 'block';
            executeSearch(queryFromUrl);
        }

        // 2. Écouteur unique sur la saisie
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;

            if (clearBtn) {
                clearBtn.style.display = query.length > 0 ? 'block' : 'none';
            }

            executeSearch(query);
        });

        // 3. Action du clic sur la croix
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = "";
                clearBtn.style.display = 'none';
                executeSearch("");
                searchInput.focus();
            });
        }

    } catch (err) {
        console.error("Erreur d'initialisation :", err);
    }
}

/**
 * Exécute la recherche et affiche les résultats
 */
function executeSearch(query) {
    const container = document.getElementById('search-results');
    if (!container || !fuse) return;

    if (!query || query.trim().length < 3) {
        container.innerHTML = "";
        return;
    }

    // Normalisation de la requête
    const results = fuse.search(normalize(query));

    if (results.length === 0) {
        container.innerHTML = `<p class="mt-4" style="color: var(--primary-gray);">Aucun résultat trouvé pour "<strong>${query}</strong>".</p>`;
        return;
    }

    const countText = results.length > 1 ? `${results.length} articles trouvés` : `${results.length} article trouvé`;
    const countHTML = `<p style="color: var(--primary-gray); font-weight: 600; margin-bottom: 2rem; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px;">
                        ${countText}
                      </p>`;

    const resultsHTML = results.map(result => {
        let { title, author, content, permalink } = result.item;
        author = author || "Michel C";

        result.matches.forEach(match => {
            if (match.key === 'title') title = highlight(match.value, match.indices);
            if (match.key === 'author') author = highlight(match.value, match.indices);
            if (match.key === 'content') {
                content = highlight(match.value.substring(0, 250), match.indices);
            }
        });

        return `
            <article class="search-result-big">
                <h3><a href="${permalink}" class="article-title-link">${title}</a></h3>
                <div class="author">par : <strong>${author}</strong></div>
                <div class="excerpt">${content}...</div>
            </article>
        `;
    }).join('');

    container.innerHTML = countHTML + resultsHTML;
}

/**
 * Surlignage des termes
 */
function highlight(text, indices) {
    if (!text) return "";
    let result = "";
    let lastIndex = 0;
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

    for (const [start, end] of sortedIndices) {
        if (start < text.length) {
            result += text.substring(lastIndex, start) +
                `<mark>` + text.substring(start, end + 1) + `</mark>`;
            lastIndex = end + 1;
        }
    }
    return result + text.substring(lastIndex);
}

document.addEventListener('DOMContentLoaded', initSearch);
