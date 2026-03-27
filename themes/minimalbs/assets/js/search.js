(function() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const searchPageInput = document.getElementById('search-page-input');
    const resultsContainer = document.getElementById('search-page-results');
    const termSpan = document.getElementById('search-query-term');

    // 1. On définit la fonction de normalisation en dehors
    const suggest = function(str) {
        if (!str) return "";
    return str.normalize("NFD")
              .replace(/[\u0300-\u036f]/g, "")
              .toLowerCase()
              .trim();
    };


    // On initialise FlexSearch comme avant...
    const index = new FlexSearch.Document({
        encode: suggest, // FlexSearch appliquera suggest() à chaque mot
        document: { id: "id", index: ["title", "content", "author"], store: ["title", "relpermalink", "date", "author", "content"] },
        tokenize: "forward"
    });

    fetch('/index.json').then(res => res.json()).then(data => {
        data.forEach(doc => index.add(doc));

        // Si on a une requête dans l'URL, on lance la recherche immédiatement
        if (query) {
            if (searchPageInput) searchPageInput.value = query;
            if (termSpan) termSpan.textContent = query;
            executeSearch(query);
        }
    });

    function executeSearch(searchTerm) {
        const results = index.search(searchTerm, { limit: 20, enrich: true });

        // Fusion des résultats (comme vu précédemment)
        const allMatches = [];
        const seenIds = new Set();
        results.forEach(f => f.result.forEach(res => {
            if (!seenIds.has(res.id)) { seenIds.add(res.id); allMatches.push(res); }
        }));

        renderFullResults(allMatches);
    }

    function renderFullResults(matches) {
        if (!resultsContainer) return;
        resultsContainer.innerHTML = "";

        if (matches.length === 0) {
            document.getElementById('no-results-message').classList.remove('d-none');
            return;
        }

        matches.forEach(res => {
            const doc = res.doc;
            const card = document.createElement('div');
            card.className = "col-md-6 col-lg-4";
            card.innerHTML = `
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title"><a href="${doc.relpermalink}" class="text-decoration-none">${doc.title}</a></h5>
                        <p class="card-text text-muted small">${doc.content.substring(0, 150)}...</p>
                    </div>
                    <div class="card-footer bg-transparent border-0 small text-muted">
                        ${doc.date} — Par ${doc.author}
                    </div>
                </div>`;
            resultsContainer.appendChild(card);
        });
    }

    // Écouteur pour la recherche en direct sur la page de résultats
    if (searchPageInput) {
        searchPageInput.addEventListener('input', (e) => executeSearch(e.target.value));
    }
})();
