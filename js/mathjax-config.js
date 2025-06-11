// MathJax configuration for proper rendering of mathematical expressions

window.MathJax = {
    tex: {
        inlineMath: [['$', '$'], ['\\(', '\\)']],
        displayMath: [['$$', '$$'], ['\\[', '\\]']],
        processEscapes: true,
        processEnvironments: true,
        packages: {'[+]': ['ams', 'noerrors']}
    },
    options: {
        ignoreHtmlClass: 'tex2jax_ignore',
        processHtmlClass: 'tex2jax_process',
        renderActions: {
            addMenu: [0, '', '']
        }
    },
    startup: {
        pageReady() {
            return MathJax.startup.defaultPageReady();
        }
    }
};



