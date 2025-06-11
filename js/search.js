// Search functionality for the interactive mathematics manual

const SEARCHABLE_PAGES = [
    { url: '../index.html', title: 'Home Page' }, // Adjusted path for sections
    { url: 'esponenziali.html', title: 'Esponenziali e Logaritmi' },
    { url: 'goniometria.html', title: 'Goniometria' },
    { url: 'trigonometria.html', title: 'Trigonometria' },
    { url: 'numeri-complessi.html', title: 'Numeri Complessi' },
    { url: 'geometria-analitica.html', title: 'Geometria Analitica' },
    { url: 'calcolo-combinatorio.html', title: 'Calcolo Combinatorio' },
    { url: 'limiti.html', title: 'Limiti di Funzioni' },
    { url: 'derivate.html', title: 'Derivate' },
    { url: 'integrali.html', title: 'Integrali' },
    { url: 'probabilita.html', title: 'Distribuzioni di probabilità' },
    { url: 'equazioni-differenziali.html', title: 'Equazioni differenziali' },
];
// For index.html, paths are relative to js/
const SEARCHABLE_PAGES_FROM_ROOT = [
    { url: 'index.html', title: 'Home Page' },
    { url: 'sections/esponenziali.html', title: 'Esponenziali e Logaritmi' },
    { url: 'sections/goniometria.html', title: 'Goniometria' },
    { url: 'sections/trigonometria.html', title: 'Trigonometria' },
    { url: 'sections/numeri-complessi.html', title: 'Numeri Complessi' },
    { url: 'sections/geometria-analitica.html', title: 'Geometria Analitica' },
    { url: 'sections/calcolo-combinatorio.html', title: 'Calcolo Combinatorio' },
    { url: 'sections/limiti.html', title: 'Limiti di Funzioni' },
    { url: 'sections/derivate.html', title: 'Derivate' },
    { url: 'sections/integrali.html', title: 'Integrali' },
    { url: 'sections/probabilita.html', title: 'Distribuzioni di probabilità' },
    { url: 'sections/equazioni-differenziali.html', title: 'Equazioni differenziali' },
];


const MAX_SNIPPET_LENGTH = 180; // Max characters for context snippet
const CONTEXT_WINDOW = 60; // Characters before and after the found term for snippet

function initSearch() {
    const searchInput = document.getElementById('search-input');
    const resultsContainer = document.getElementById('search-results-container');
    const resultsOutput = document.getElementById('search-results-output');
    const mainPageContent = document.getElementById('main-page-content'); // Original homepage content
    const sectionActualContent = document.getElementById('actual-content-container'); // Content of a section page

    if (!searchInput || !resultsContainer || !resultsOutput) {
        console.error("Search UI elements not found.");
        return;
    }
    
    const pagesToSearch = window.location.pathname.includes('/sections/') ? SEARCHABLE_PAGES : SEARCHABLE_PAGES_FROM_ROOT;


    // Debounced search function
    const debouncedSearch = debounce(async (query) => {
        const targetContentDisplay = sectionActualContent || mainPageContent;

        if (query.length < 3) {
            resultsOutput.innerHTML = '<p class="text-neutral-500">Inserisci almeno 3 caratteri per la ricerca.</p>';
            resultsContainer.style.display = query.length > 0 ? 'block' : 'none';
            if (targetContentDisplay) {
                targetContentDisplay.style.display = 'block';
            }
            return;
        }

        resultsOutput.innerHTML = '<p class="text-neutral-500 animate-pulse">Ricerca in corso...</p>';
        resultsContainer.style.display = 'block';
        if (targetContentDisplay) {
            targetContentDisplay.style.display = 'none';
        }

        const searchResults = [];
        const processedQuery = query.toLowerCase();
        const queryRegex = new RegExp(processedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');


        for (const page of pagesToSearch) {
            try {
                const response = await fetch(page.url);
                if (!response.ok) {
                    console.warn(`Failed to fetch ${page.url}: ${response.statusText}`);
                    continue;
                }
                const htmlContent = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(htmlContent, "text/html");
                
                const mainContentElement = doc.querySelector('#actual-content-container') || doc.querySelector('#main-page-content') || doc.querySelector('main') || doc.body;
                
                // Prefer text from specific elements if available, otherwise full text
                // Consider titles, headings, paragraphs, list items, table cells.
                // Avoid script/style content.
                let pageText = "";
                mainContentElement.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, .exercise-text, .example-box, .intro-text').forEach(el => {
                    pageText += el.textContent.trim() + " ";
                });
                pageText = pageText.toLowerCase();


                let match;
                let bestSnippet = null;
                let firstMatchIndex = -1;

                while ((match = queryRegex.exec(pageText)) !== null) {
                    if (firstMatchIndex === -1) firstMatchIndex = match.index;

                    const startIndex = Math.max(0, match.index - CONTEXT_WINDOW);
                    const endIndex = Math.min(pageText.length, match.index + query.length + CONTEXT_WINDOW);
                    let snippet = pageText.substring(startIndex, endIndex);
                    
                    // Highlight the query in the snippet
                    snippet = snippet.replace(queryRegex, (match) => `<strong>${match}</strong>`);
                    
                    if (!bestSnippet) bestSnippet = snippet; // Take first snippet
                     // Potentially add logic to prefer snippets with more context or from headings

                    // For performance, might break after a few matches per page if pages are very large
                    // if (searchResults.find(sr => sr.url === page.url)) break; 
                }


                if (bestSnippet) {
                    searchResults.push({
                        title: page.title,
                        url: page.url,
                        snippet: `...${bestSnippet}...`
                    });
                } else if (page.title.toLowerCase().includes(processedQuery)) { // Match in title if no body match
                     searchResults.push({
                        title: page.title,
                        url: page.url,
                        snippet: `Trovato nel titolo della pagina.`
                    });
                }

            } catch (error) {
                console.error(`Error fetching or parsing ${page.url}:`, error);
            }
        }

        displayResults(searchResults, query);

    }, 300);

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        debouncedSearch(query);
         if (query === "") { 
            resultsContainer.style.display = 'none';
            const targetContentDisplay = sectionActualContent || mainPageContent;
            if (targetContentDisplay) {
                targetContentDisplay.style.display = 'block';
            }
            resultsOutput.innerHTML = '';
        }
    });

    function displayResults(results, query) {
        if (results.length === 0) {
            resultsOutput.innerHTML = `<p class="text-neutral-600">Nessun risultato trovato per "<strong>${escapeHTML(query)}</strong>".</p>`;
            return;
        }

        resultsOutput.innerHTML = results.map(result => `
            <div class="search-result-item">
                <h4><a href="${result.url}" class="hover:underline">${escapeHTML(result.title)}</a></h4>
                <p class="context-snippet">${result.snippet}</p> 
            </div>
        `).join('');
    }
}

function escapeHTML(str) {
    const p = document.createElement("p");
    p.appendChild(document.createTextNode(str));
    return p.innerHTML;
}
