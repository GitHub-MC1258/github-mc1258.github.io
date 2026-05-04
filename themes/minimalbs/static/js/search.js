let fuse;

function normalize(str) {
    if (!str) return "";
    return str.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
        .replace(/[‘’'´`]/g, "'")      // Harmonise les apostrophes
        .toLowerCase()
        .trim();
}

async function initSearch() {
    const searchInput = document.getElementById('search-input-page') || document.getElementById('search-input');
    const container = document.getElementById('search-results');
    const clearBtn = document.getElementById('clear-search');

    if (!searchInput || !container) return;

    try {
        const response = await fetch('/index.json');
        const data = await response.json();

        const options = {
            keys: [
                { name: 'title', weight: 0.8 },
                { name: 'author', weight: 0.6 },
                { name: 'content', weight: 0.4 }
            ],
            threshold: 0.2,
            minMatchCharLength: 3,
            includeMatches: true,
            ignoreLocation: true,
            // getFn personnalisé pour normaliser les données de l'index
            getFn: (obj, path) => {
                // Accès direct à la propriété (plus sûr que d'appeler Fuse.config)
                const value = obj[path];
                return (typeof value === "string") ? normalize(value) : value;
            }
        };

        fuse = new Fuse(data, options);

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            if (clearBtn) clearBtn.style.display = query.length > 0 ? 'block' : 'none';
            executeSearch(query);
        });

        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                searchInput.value = "";
                clearBtn.style.display = 'none';
                executeSearch("");
                searchInput.focus();
            });
        }
    } catch (err) {
        console.error("Erreur lors de l'initialisation de la recherche :", err);
    }
}

function executeSearch(query) {
    const container = document.getElementById('search-results');
    if (!container || !fuse) return;

    // On normalise la requête pour qu'elle matche avec l'index normalisé
    const normalizedQuery = normalize(query);

    if (!normalizedQuery || normalizedQuery.length < 3) {
        container.innerHTML = "";
        return;
    }

    let rawResults = fuse.search(normalizedQuery);

    // Anti-doublons par permalink
    const uniqueResultsMap = new Map();
    rawResults.forEach(result => {
        if (!uniqueResultsMap.has(result.item.permalink)) {
            uniqueResultsMap.set(result.item.permalink, result);
        }
    });

    let results = Array.from(uniqueResultsMap.values());

    if (results.length === 0) {
        container.innerHTML = `<p class="mt-4" style="color: var(--primary-gray);">Aucun résultat pour "<strong>${query}</strong>".</p>`;
        return;
    }

    const countText = results.length > 1 ? `${results.length} articles trouvés` : `${results.length} article trouvé`;
    const countHTML = `<p style="color: var(--primary-gray); font-weight: 600; margin-bottom: 2rem; font-size: 0.9rem; text-transform: uppercase;">${countText}</p>`;

    const resultsHTML = results.map(result => {
        let { title, author, content, permalink, date } = result.item;

        // Valeurs par défaut
        author = author || "Michel C";
        const displayDate = date || "Date inconnue";
        let displayTitle = title;
        let displayAuthor = author;
        let displayContent = (content || "").substring(0, 250);

        // Application du surlignage si des correspondances existent
        if (result.matches) {
            result.matches.forEach(match => {
                if (match.key === 'title') displayTitle = highlight(match.value, match.indices);
                if (match.key === 'author') displayAuthor = highlight(match.value, match.indices);
                if (match.key === 'content') displayContent = highlight(match.value.substring(0, 250), match.indices);
            });
        }

        return `
            <article class="search-result-big">
                <h3><a href="${permalink}" class="article-title-link">${displayTitle}</a></h3>
                <div class="meta-info">
                    <span class="date">${displayDate}</span> •
                    <span class="author">${displayAuthor}</span>
                </div>
                <div class="excerpt">${displayContent}...</div>
            </article>
        `;
    }).join('');

    container.innerHTML = countHTML + resultsHTML;
}

function highlight(text, indices) {
    if (!text) return "";
    let result = "";
    let lastIndex = 0;
    // On s'assure que les indices sont triés
    const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);

    for (const [start, end] of sortedIndices) {
        if (start < text.length) {
            result += text.substring(lastIndex, start) + `<mark>` + text.substring(start, end + 1) + `</mark>`;
            lastIndex = end + 1;
        }
    }
    return result + text.substring(lastIndex);
}

document.addEventListener('DOMContentLoaded', initSearch);
