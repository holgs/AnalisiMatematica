// Main JavaScript file for the interactive mathematics manual

document.addEventListener('DOMContentLoaded', function() {
    // Add skip to content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main-content-area'; // Ensure your main content area has this ID
    skipLink.className = 'skip-link p-2 bg-neutral-800 text-white fixed top-[-3em] left-2 focus:top-2 transition-all duration-200 z-50 rounded';
    skipLink.textContent = 'Salta al contenuto principale';
    document.body.prepend(skipLink);


    // Initialize collapsible sections globally
    initCollapsibleSections();

    // Initialize solution toggles globally
    initSolutionToggles();

    // Initialize navigation for mobile (if navigation.js handles it)
    if (typeof initSidebarNavigation === 'function') {
        initSidebarNavigation();
    } else if (document.getElementById('sidebar')) { // Basic toggle if navigation.js is not loaded/needed
        const sidebar = document.getElementById('sidebar');
        const openSidebarBtn = document.getElementById('open-sidebar');
        const closeSidebarBtn = document.getElementById('close-sidebar');
        if(openSidebarBtn && sidebar) {
            openSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('-translate-x-full');
                sidebar.classList.add('translate-x-0');
                openSidebarBtn.setAttribute('aria-expanded', 'true');
            });
        }
        if(closeSidebarBtn && sidebar) {
            closeSidebarBtn.addEventListener('click', () => {
                sidebar.classList.remove('translate-x-0');
                sidebar.classList.add('-translate-x-full');
                 if(openSidebarBtn) openSidebarBtn.setAttribute('aria-expanded', 'false');
            });
        }
    }


    // Initialize search functionality (if search.js handles it)
    if (typeof initSearch === 'function') {
        initSearch();
    }
    
    // Call MathJax for the whole page initially
    setupMathJaxRendering(document.body);
});

/**
 * Initializes collapsible sections throughout the document.
 * @param {HTMLElement} [container=document] - The container element to search within.
 */
function initCollapsibleSections(container = document) {
    const collapsibles = container.querySelectorAll('.collapsible-header');

    collapsibles.forEach(header => {
        if (header.dataset.collapsibleInitialized === 'true') return;

        const content = header.nextElementSibling;
        const icon = header.querySelector('.toggle-icon');
        const isInitiallyOpen = header.dataset.initiallyOpen === 'true';

        if (content) {
            content.style.display = isInitiallyOpen ? 'block' : 'none';
            if (icon) {
                icon.classList.toggle('rotate-180', isInitiallyOpen);
            }
            header.setAttribute('aria-expanded', isInitiallyOpen ? 'true' : 'false');
            content.setAttribute('aria-hidden', isInitiallyOpen ? 'false' : 'true');
            if (content.id) { // Ensure content has an ID for aria-controls
                 header.setAttribute('aria-controls', content.id);
            }
        }
        
        header.addEventListener('click', function() {
            if (content) {
                const isVisible = content.style.display === 'block';
                content.style.display = isVisible ? 'none' : 'block';
                header.setAttribute('aria-expanded', !isVisible);
                content.setAttribute('aria-hidden', isVisible);
                if (icon) {
                    icon.classList.toggle('rotate-180', !isVisible);
                }
            }
        });
        header.dataset.collapsibleInitialized = 'true';
    });
}

/**
 * Initializes solution toggle buttons for exercises.
 * @param {HTMLElement} [container=document] - The container element to search within.
 */
function initSolutionToggles(container = document) {
    const toggles = container.querySelectorAll('.solution-toggle');

    toggles.forEach(toggle => {
        if (toggle.dataset.solutionInitialized === 'true') return;

        const solutionContent = toggle.nextElementSibling; 
        const toggleTextElement = toggle.querySelector('.toggle-text');
        const toggleIcon = toggle.querySelector('.toggle-icon-svg');
        const isInitiallyOpen = toggle.dataset.initiallyOpen === 'true';

        if (solutionContent) {
            solutionContent.style.display = isInitiallyOpen ? 'block' : 'none';
             toggle.setAttribute('aria-expanded', isInitiallyOpen ? 'true' : 'false');
             if (solutionContent.id) {
                toggle.setAttribute('aria-controls', solutionContent.id);
            }

            if (toggleTextElement) {
                toggleTextElement.textContent = isInitiallyOpen ? 'Nascondi soluzione' : 'Mostra soluzione';
            }
            if (toggleIcon) {
                toggleIcon.classList.toggle('rotate-180', isInitiallyOpen);
            }
        }

        toggle.addEventListener('click', function() {
            if (solutionContent) {
                const isVisible = solutionContent.style.display === 'block';
                solutionContent.style.display = isVisible ? 'none' : 'block';
                toggle.setAttribute('aria-expanded', !isVisible);
                if (toggleTextElement) {
                    toggleTextElement.textContent = isVisible ? 'Mostra soluzione' : 'Nascondi soluzione';
                }
                if (toggleIcon) {
                    toggleIcon.classList.toggle('rotate-180', !isVisible);
                }
            }
        });
        toggle.dataset.solutionInitialized = 'true';
    });
}

/**
 * Sets up MathJax to properly render dynamically added content.
 * @param {HTMLElement} [element=document.body] - The element containing the new MathJax content.
 */
function setupMathJaxRendering(element = document.body) {
    if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
        MathJax.typesetPromise([element]).catch((err) => console.error('MathJax typesetting error on dynamic content:', err));
    } else if (typeof MathJax !== 'undefined' && MathJax.Hub && MathJax.Hub.Queue) {
        // Fallback for MathJax v2 if used, though config suggests v3
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, element]);
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
