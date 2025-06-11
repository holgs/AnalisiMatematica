// Interactive elements and functionality specific to the probability distributions section

document.addEventListener('DOMContentLoaded', function() {
    initBinomialDistributionVisualizer();
    initNormalDistributionVisualizer();
    initPoissonDistributionVisualizer(); // Placeholder for now
    initProbabilityParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

// Helper: Factorial & Combinations (can be moved to a shared utility if used elsewhere often)
function factorial(n) {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}
function combinations(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k;
    let res = 1;
    for (let i = 1; i <= k; i++) res = res * (n - i + 1) / i;
    return Math.round(res);
}


function initBinomialDistributionVisualizer() {
    const container = document.getElementById('binomial-distribution-visualizer');
    if (!container) return;
    container.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'binomial-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="binomial-n" class="block text-sm font-medium text-gray-700">Numero di prove (n): <span id="binomial-n-val" class="font-semibold">10</span></label>
            <input type="range" id="binomial-n" min="1" max="50" step="1" value="10" class="custom-slider" aria-describedby="binomial-info">
        </div>
        <div>
            <label for="binomial-p" class="block text-sm font-medium text-gray-700">Prob. di successo (p): <span id="binomial-p-val" class="font-semibold">0.5</span></label>
            <input type="range" id="binomial-p" min="0.01" max="0.99" step="0.01" value="0.5" class="custom-slider" aria-describedby="binomial-info">
        </div>
        <div class="md:col-span-2 text-sm text-gray-700 min-h-[40px]" id="binomial-info" aria-live="polite"></div>
    `;
    container.appendChild(controlsDiv);

    const nSlider = document.getElementById('binomial-n');
    const pSlider = document.getElementById('binomial-p');
    const nValDisplay = document.getElementById('binomial-n-val');
    const pValDisplay = document.getElementById('binomial-p-val');
    const infoDiv = document.getElementById('binomial-info');

    // Bar chart for discrete distribution
    // createFunctionGraph is for continuous. We need a bar chart.
    // For simplicity, we'll use createFunctionGraph and draw rectangles as "bars"
    // This is a workaround. A dedicated bar chart function would be better.
    const graph = createFunctionGraph('binomial-canvas', null, {
        yMin: 0, yMax: 0.5, // Initial yMax, will adjust
        responsive: true,
        ariaLabel: "Grafico della distribuzione binomiale. Modifica n e p."
    });
    if(!graph) return;

    function drawBinomialBars(n, p) {
        graph.updateConfig({ curves: [], markers: [], fillBelow: [] }); // Clear previous
        let probabilities = [];
        let maxY = 0;
        for (let k = 0; k <= n; k++) {
            const prob = combinations(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
            probabilities.push({ k: k, prob: prob });
            if (prob > maxY) maxY = prob;
        }
        
        const barWidthRatio = 0.8; // Percentage of step width
        const stepX = (graph.getConfig().xMax - graph.getConfig().xMin) / (n + 2); // Dynamic step based on n
        const barPixelWidth = stepX * graph.getCanvas().width / (graph.getConfig().xMax - graph.getConfig().xMin) * barWidthRatio;


        let fills = [];
        probabilities.forEach(item => {
            // Create a "function" that is constant for the bar width and 0 otherwise
            const barFunc = (x_val) => {
                if (x_val >= item.k - barWidthRatio/2 && x_val <= item.k + barWidthRatio/2) {
                    return item.prob;
                }
                return 0; // Return 0 outside the bar interval to avoid filling outside
            };
             fills.push({
                func: barFunc, // This is a bit of a hack for bar chart using line graph fill
                from: item.k - barWidthRatio/2, 
                to: item.k + barWidthRatio/2, 
                color: 'rgba(79, 70, 229, 0.7)' // Indigo
            });
        });

        graph.updateConfig({
            xMin: -0.5, xMax: n + 0.5,
            yMax: Math.max(0.1, maxY * 1.2), // Ensure yMax is reasonable
            gridStep: 1, // For x-axis ticks at integers
            xAxisLabelInterval: Math.max(1, Math.floor(n/10)), // Dynamic x-axis labels
            fillBelow: fills
        });
    }


    function updateBinomialVisualizer() {
        const n = parseInt(nSlider.value);
        const p = parseFloat(pSlider.value);
        nValDisplay.textContent = n;
        pValDisplay.textContent = p.toFixed(2);

        drawBinomialBars(n, p);
        
        const mean = n * p;
        const variance = n * p * (1 - p);
        const stdDev = Math.sqrt(variance);
        infoDiv.innerHTML = `Media $\\mu = np = ${mean.toFixed(2)}$<br>Varianza $\\sigma^2 = np(1-p) = ${variance.toFixed(3)}$, Dev. Std. $\\sigma \\approx ${stdDev.toFixed(3)}$`;
        setupMathJaxRendering(infoDiv);
         graph.getCanvas().setAttribute('aria-label', `Distribuzione binomiale B(${n}, ${p.toFixed(2)}). Media: ${mean.toFixed(2)}.`);
    }

    nSlider.addEventListener('input', updateBinomialVisualizer);
    pSlider.addEventListener('input', updateBinomialVisualizer);
    updateBinomialVisualizer();
}


function initNormalDistributionVisualizer() {
    const container = document.getElementById('normal-distribution-visualizer');
    if (!container) return;
    container.innerHTML = '';

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'normal-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="normal-mu" class="block text-sm font-medium text-gray-700">Media (μ): <span id="normal-mu-val" class="font-semibold">0</span></label>
            <input type="range" id="normal-mu" min="-5" max="5" step="0.1" value="0" class="custom-slider" aria-describedby="normal-info">
        </div>
        <div>
            <label for="normal-sigma" class="block text-sm font-medium text-gray-700">Dev. Std. (σ): <span id="normal-sigma-val" class="font-semibold">1</span></label>
            <input type="range" id="normal-sigma" min="0.1" max="3" step="0.1" value="1" class="custom-slider" aria-describedby="normal-info">
        </div>
        <div class="md:col-span-2 text-sm text-gray-700 min-h-[20px]" id="normal-info" aria-live="polite"></div>
    `;
    container.appendChild(controlsDiv);

    const muSlider = document.getElementById('normal-mu');
    const sigmaSlider = document.getElementById('normal-sigma');
    const muValDisplay = document.getElementById('normal-mu-val');
    const sigmaValDisplay = document.getElementById('normal-sigma-val');
    const infoDiv = document.getElementById('normal-info');

    const graph = createFunctionGraph('normal-canvas', null, {
        responsive: true,
        ariaLabel: "Grafico della distribuzione normale. Modifica media mu e deviazione standard sigma."
    });
     if(!graph) return;

    function normalPDF(x, mu, sigma) {
        if (sigma <= 0) return 0; // Sigma must be positive
        return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
    }

    function updateNormalVisualizer() {
        const mu = parseFloat(muSlider.value);
        const sigma = parseFloat(sigmaSlider.value);
        muValDisplay.textContent = mu.toFixed(1);
        sigmaValDisplay.textContent = sigma.toFixed(1);

        const currentNormalFunc = x => normalPDF(x, mu, sigma);
        const xMin = mu - 4 * sigma; // Show +/- 4 standard deviations
        const xMax = mu + 4 * sigma;
        const yMax = normalPDF(mu, mu, sigma) * 1.1; // Peak height + 10%

        graph.updateConfig({
            curves: [{ func: currentNormalFunc, color: '#9333ea' }], // Purple-600
            xMin: xMin, xMax: xMax,
            yMin: 0, yMax: Math.max(0.05, yMax), // Ensure yMax is not too small
            gridStep: sigma, // Grid lines at sigma intervals from mu
            xAxisLabelInterval: sigma,
            verticalLines: [
                {x: mu, color: '#f87171', dash: [4,4], label: `μ=${mu.toFixed(1)}`}, // red-400
                {x: mu - sigma, color: '#fbbf24', dash: [2,2], label: `μ-σ`}, // amber-400
                {x: mu + sigma, color: '#fbbf24', dash: [2,2], label: `μ+σ`},
            ]
        });
        infoDiv.innerHTML = `Distribuzione Normale $N(\\mu=${mu.toFixed(1)}, \\sigma^2=${(sigma*sigma).toFixed(2)})$`;
        setupMathJaxRendering(infoDiv);
        graph.getCanvas().setAttribute('aria-label', `Distribuzione normale con media ${mu.toFixed(1)} e deviazione standard ${sigma.toFixed(1)}.`);
    }

    muSlider.addEventListener('input', updateNormalVisualizer);
    sigmaSlider.addEventListener('input', updateNormalVisualizer);
    updateNormalVisualizer();
}


function initPoissonDistributionVisualizer() {
    const container = document.getElementById('poisson-distribution-visualizer');
    if (!container) return;
    // Placeholder for now, similar to Binomial but with Poisson formula
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Visualizzatore interattivo della Distribuzione di Poisson $P(\\lambda)$ in sviluppo.</p>`;
}


function initProbabilityParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="probabilita"]');
    parametricExercises.forEach(exercise => {
        const exerciseId = exercise.getAttribute('data-exercise-id');
        const generateBtn = exercise.querySelector('.generate-btn');
        const exerciseTextEl = exercise.querySelector('.exercise-text');
        const solutionContentEl = exercise.querySelector('.solution-content');

        if (generateBtn && exerciseTextEl && solutionContentEl) {
            generateBtn.addEventListener('click', () => {
                const params = {};
                const currentInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
                currentInputs.forEach(input => {
                     params[input.name] = parseFloat(input.value) || input.value;
                });
                generateProbabilityExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                 initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
            initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateProbabilityExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateProbabilityExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min, max, dec = 2) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
    solutionEl.style.display = 'none';
    const toggle = textEl.closest('.parametric-exercise').querySelector('.solution-toggle');
    if (toggle) {
        const toggleText = toggle.querySelector('.toggle-text');
        const toggleIcon = toggle.querySelector('.toggle-icon-svg');
        if (toggleText) toggleText.textContent = 'Mostra soluzione';
        if (toggleIcon) toggleIcon.classList.remove('rotate-180');
        toggle.setAttribute('aria-expanded', 'false');
    }

    let htmlInputs = "";

    switch (exerciseId) {
        case 'binomial-prob-parametric':
            const n_binom = userParams.n_binom !== undefined ? userParams.n_binom : randInt(5, 20);
            const p_binom = userParams.p_binom !== undefined ? userParams.p_binom : randFloat(0.1, 0.9, 2);
            const k_binom = userParams.k_binom !== undefined ? userParams.k_binom : randInt(0, n_binom);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            $n$ (prove): <input type="number" name="n_binom" value="${n_binom}" min="1" class="p-1 border rounded">
                            $p$ (prob. successo): <input type="number" name="p_binom" value="${p_binom}" step="0.01" min="0.01" max="0.99" class="p-1 border rounded">
                            $k$ (successi): <input type="number" name="k_binom" value="${k_binom}" min="0" max="${n_binom}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Si effettuano ${n_binom} prove indipendenti, ognuna con probabilità di successo $p=${p_binom}$. Qual è la probabilità di ottenere esattamente ${k_binom} successi? ${htmlInputs}`;
            
            const prob_binom_val = combinations(n_binom, k_binom) * Math.pow(p_binom, k_binom) * Math.pow(1 - p_binom, n_binom - k_binom);
            solutionEl.innerHTML = `<p>Questa è una distribuzione binomiale $B(n=${n_binom}, p=${p_binom})$.</p>
                                     <p>La probabilità di $k=${k_binom}$ successi è data da $P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}$.</p>
                                     <p>$P(X=${k_binom}) = \\binom{${n_binom}}{${k_binom}} (${p_binom})^{${k_binom}} (1-${p_binom})^{${n_binom}-${k_binom}}$</p>
                                     <p>$P(X=${k_binom}) = ${combinations(n_binom, k_binom)} \\cdot ${Math.pow(p_binom, k_binom).toFixed(5)} \\cdot ${Math.pow(1 - p_binom, n_binom - k_binom).toFixed(5)} \\approx ${prob_binom_val.toFixed(5)}$</p>`;
            break;
        case 'normal-zscore-parametric':
            const mu_norm = userParams.mu_norm !== undefined ? userParams.mu_norm : randFloat(50, 150, 1);
            const sigma_norm = userParams.sigma_norm !== undefined ? userParams.sigma_norm : randFloat(5, 20, 1);
            const x_norm = userParams.x_norm !== undefined ? userParams.x_norm : randFloat(mu_norm - 2*sigma_norm, mu_norm + 2*sigma_norm, 1);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            Media $\\mu$: <input type="number" name="mu_norm" value="${mu_norm.toFixed(1)}" step="0.1" class="p-1 border rounded">
                            Dev. Std $\\sigma$: <input type="number" name="sigma_norm" value="${sigma_norm.toFixed(1)}" step="0.1" min="0.1" class="p-1 border rounded">
                            Valore $X$: <input type="number" name="x_norm" value="${x_norm.toFixed(1)}" step="0.1" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Una variabile aleatoria $X$ segue una distribuzione normale $N(\\mu=${mu_norm.toFixed(1)}, \\sigma^2=${(sigma_norm*sigma_norm).toFixed(2)})$. Calcolare il punteggio Z per $X=${x_norm.toFixed(1)}$. ${htmlInputs}`;
            
            const z_score = (x_norm - mu_norm) / sigma_norm;
            solutionEl.innerHTML = `<p>Il punteggio Z (o valore standardizzato) si calcola come $Z = \\frac{X - \\mu}{\\sigma}$.</p>
                                     <p>$Z = \\frac{${x_norm.toFixed(1)} - ${mu_norm.toFixed(1)}}{${sigma_norm.toFixed(1)}} = \\frac{${(x_norm - mu_norm).toFixed(1)}}{${sigma_norm.toFixed(1)}} \\approx ${z_score.toFixed(3)}$</p>
                                     <p>Questo significa che il valore $X=${x_norm.toFixed(1)}$ si trova a circa ${Math.abs(z_score).toFixed(3)}$ deviazioni standard ${z_score >= 0 ? 'sopra' : 'sotto'} la media.</p>
                                     <p class="text-xs mt-1">(Per calcolare $P(X \\le ${x_norm.toFixed(1)})$ o $P(Z \\le ${z_score.toFixed(3)})$ si userebbero le tavole della normale standard o software.)</p>`;
            break;
        case 'poisson-event-parametric':
             const lambda_poisson = userParams.lambda_poisson !== undefined ? userParams.lambda_poisson : randFloat(1,5,1);
             const k_poisson = userParams.k_poisson !== undefined ? userParams.k_poisson : randInt(0, Math.ceil(lambda_poisson + 2*Math.sqrt(lambda_poisson))); // k around lambda
             htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                            Tasso medio $\\lambda$: <input type="number" name="lambda_poisson" value="${lambda_poisson.toFixed(1)}" step="0.1" min="0.1" class="p-1 border rounded">
                            Num. eventi $k$: <input type="number" name="k_poisson" value="${k_poisson}" min="0" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Un call center riceve in media $\\lambda = ${lambda_poisson.toFixed(1)}$ chiamate all'ora. Qual è la probabilità di ricevere esattamente $k = ${k_poisson}$ chiamate nella prossima ora, assumendo una distribuzione di Poisson? ${htmlInputs}`;
            
            const prob_poisson_val = (Math.exp(-lambda_poisson) * Math.pow(lambda_poisson, k_poisson)) / factorial(k_poisson);
            solutionEl.innerHTML = `<p>Questa è una distribuzione di Poisson $P(\\lambda=${lambda_poisson.toFixed(1)})$.</p>
                                     <p>La probabilità di $k=${k_poisson}$ eventi è $P(X=k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}$.</p>
                                     <p>$P(X=${k_poisson}) = \\frac{e^{-${lambda_poisson.toFixed(1)}} (${lambda_poisson.toFixed(1)})^{${k_poisson}}}{${k_poisson}!}$</p>
                                     <p>$P(X=${k_poisson}) \\approx \\frac{${Math.exp(-lambda_poisson).toFixed(5)} \\cdot ${Math.pow(lambda_poisson, k_poisson).toFixed(3)}}{${factorial(k_poisson)}} \\approx ${prob_poisson_val.toFixed(5)}$</p>`;
            break;
        default:
            textEl.innerHTML = "Esercizio non definito.";
            solutionEl.innerHTML = "";
            return;
    }
     // Re-attach input listeners
    const newInputs = textEl.querySelectorAll('.parametric-inputs input');
    newInputs.forEach(input => {
        input.addEventListener('change', () => { 
            const params = {};
            textEl.querySelectorAll('.parametric-inputs input').forEach(i => {
                params[i.name] = parseFloat(i.value) || i.value;
            });
            generateProbabilityExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
