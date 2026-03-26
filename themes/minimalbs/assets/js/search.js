fetch('/index.json')
  .then(response => response.json())
  .then(data => {
    const options = {
      keys: ['title', 'content', 'author'],
      threshold: 0.3,
      includeMatches: true
    };
    const fuse = new Fuse(data, options);

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value;
      const results = fuse.search(searchTerm);
      displayResults(results, searchTerm); // On passe le mot recherché ici
    });
  });

function displayResults(results, query) {
  const container = document.getElementById('search-results');
  if (results.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = results.map(res => {
    // 1. Extraire un résumé autour du premier match trouvé dans 'content'
    let snippet = "";
    const contentMatch = res.matches.find(m => m.key === 'content');

    if (contentMatch) {
      const pos = contentMatch.indices[0][0];
      const start = Math.max(0, pos - 50);
      const end = Math.min(res.item.content.length, pos + 100);
      snippet = (start > 0 ? "..." : "") + res.item.content.substring(start, end) + "...";
    } else {
      snippet = res.item.content.substring(0, 150) + "...";
    }

    // 2. Fonction magique pour mettre en violet le mot 'query'
    const highlightMarkup = (text) => {
      if (!query) return text;
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, `<span style="color: #9400D3; font-weight: bold;">$1</span>`);
    };

    // 3. Appliquer la couleur sur le titre et le snippet
    const highlightedTitle = highlightMarkup(res.item.title);
    const highlightedSnippet = highlightMarkup(snippet);
    const highlightedAuthor = highlightMarkup(res.item.author || "Michel C");

    return `
      <li style="margin-bottom: 20px; list-style: none;">
        <a href="${res.item.permalink}" style="font-size: 1.2em; font-weight: bold; text-decoration: none; color: #007bff;">
          ${highlightedTitle}
        </a>
        <br>
        <small style="color: #666;">Par : ${highlightedAuthor} - ${res.item.date}</small>
        <p style="margin: 5px 0; color: #333; font-size: 0.95em; line-height: 1.4;">
          ${highlightedSnippet}
        </p>
      </li>`;
  }).join('');
}
