// Interactive elements and functionality specific to the exponentials and logarithms section

document.addEventListener('DOMContentLoaded', function() {
    initExponentialGraph();
    initLogarithmicGraph();
    initLogExpConverter();
    initExpLogPropertiesExplorer();
    initParametricExercisesExpLog(); 
    // Collapsibles and solutions are handled by main.js
});

function initExponentialGraph() {
    const graphContainer = document.getElementById('exponential-graph');
    if (!graphContainer) return;
    graphContainer.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'exponential-graph-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4'; // Tailwind class for height
    graphContainer.appendChild(canvasDiv);

    let baseValue = 2;

    const graph = createFunctionGraph('exponential-graph-canvas', x => Math.pow(baseValue, x), {
        xMin: -3, xMax: 3, yMin: -1, yMax: 10, curveColor: '#4f46e5', responsive: true,
        ariaLabel: "Grafico della funzione esponenziale y = a^x. Varia la base 'a' con lo slider sottostante."
    });
    if (!graph) return;


    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'mt-4 space-y-3';
    
    const baseSliderContainer = document.createElement('div');
    baseSliderContainer.innerHTML = `
        <label for="exp-base-slider" class="block text-sm font-medium text-gray-700">Base a: <span id="exp-base-value" class="font-semibold">${baseValue.toFixed(1)}</span></label>
        <input type="range" id="exp-base-slider" min="0.1" max="5" step="0.1" value="${baseValue}" class="custom-slider" aria-describedby="exp-info-box">
        <div id="exp-info-box" class="text-sm text-gray-600 mt-1" aria-live="polite"></div>
    `;
    controlsDiv.appendChild(baseSliderContainer);
    graphContainer.appendChild(controlsDiv);

    const baseSlider = document.getElementById('exp-base-slider');
    const baseValueDisplay = document.getElementById('exp-base-value');
    const infoBox = document.getElementById('exp-info-box');

    function updateExpGraph() {
        baseValue = parseFloat(baseSlider.value);
        baseValueDisplay.textContent = baseValue.toFixed(1);
        graph.updateFunction(x => Math.pow(baseValue, x));
        
        if (Math.abs(baseValue - 1) < 1e-9) { // Check for base approx 1
            infoBox.textContent = 'Funzione costante: f(x) = 1 (base = 1)';
        } else if (baseValue > 1) {
            infoBox.textContent = 'Funzione esponenziale crescente (base > 1)';
        } else if (baseValue > 0) {
            infoBox.textContent = 'Funzione esponenziale decrescente (0 < base < 1)';
        } else {
            infoBox.textContent = 'Base non valida (base deve essere > 0)';
        }
    }
    baseSlider.addEventListener('input', updateExpGraph);
    updateExpGraph(); 
}

function initLogarithmicGraph() {
    const graphContainer = document.getElementById('logarithmic-graph');
    if (!graphContainer) return;
    graphContainer.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'logarithmic-graph-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    graphContainer.appendChild(canvasDiv);

    let baseValue = 2;

    const graph = createFunctionGraph('logarithmic-graph-canvas', x => Math.log(x) / Math.log(baseValue), {
        xMin: 0.01, xMax: 10, yMin: -5, yMax: 5, curveColor: '#9333ea', responsive: true, // purple-600
        ariaLabel: "Grafico della funzione logaritmica y = log_b(x). Varia la base 'b' e scegli se mostrare l'inversa."
    });
    if (!graph) return;

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'mt-4 space-y-3';
    controlsDiv.innerHTML = `
        <div>
            <label for="log-base-slider" class="block text-sm font-medium text-gray-700">Base b: <span id="log-base-value" class="font-semibold">${baseValue.toFixed(1)}</span></label>
            <input type="range" id="log-base-slider" min="0.1" max="10" step="0.1" value="${baseValue}" class="custom-slider" aria-describedby="log-info-box">
            <div id="log-info-box" class="text-sm text-gray-600 mt-1" aria-live="polite"></div>
        </div>
        <div class="flex items-center">
            <input id="show-inverse-exp" type="checkbox" class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500">
            <label for="show-inverse-exp" class="ml-2 block text-sm text-gray-900">Mostra inversa $y=b^x$</label>
        </div>
    `;
    graphContainer.appendChild(controlsDiv);

    const baseSlider = document.getElementById('log-base-slider');
    const baseValueDisplay = document.getElementById('log-base-value');
    const infoBox = document.getElementById('log-info-box');
    const showInverseCheckbox = document.getElementById('show-inverse-exp');

    function updateLogGraph() {
        baseValue = parseFloat(baseSlider.value);
        baseValueDisplay.textContent = baseValue.toFixed(1);

        if (baseValue <= 0 || Math.abs(baseValue - 1) < 1e-9) { 
            infoBox.textContent = 'Base non valida per logaritmo (base > 0 e base ≠ 1)';
            graph.updateConfig({ curves: [] }); 
            return;
        }
        
        let curves = [{ func: x => Math.log(x) / Math.log(baseValue), color: '#9333ea' }]; // Log function
        if (showInverseCheckbox.checked) {
            curves.push({ func: x => Math.pow(baseValue, x), color: '#4f46e5', dash: [5,5] }); // Exp inverse
        }
        graph.updateConfig({ curves: curves });

        if (baseValue > 1) {
            infoBox.textContent = 'Funzione logaritmica crescente (base > 1). Dominio: x > 0.';
        } else { // 0 < base < 1
            infoBox.textContent = 'Funzione logaritmica decrescente (0 < base < 1). Dominio: x > 0.';
        }
    }

    baseSlider.addEventListener('input', updateLogGraph);
    showInverseCheckbox.addEventListener('change', updateLogGraph);
    updateLogGraph();
}

function initLogExpConverter() {
    const container = document.getElementById('log-exp-converter');
    if (!container) return;

    const expBase = document.getElementById('exp-base');
    const expExponent = document.getElementById('exp-exponent');
    const expValue = document.getElementById('exp-value');
    const convertToLogBtn = document.getElementById('convert-to-log');
    const logFormResult = document.getElementById('log-form-result');

    const logBaseInput = document.getElementById('log-base-input'); 
    const logArgument = document.getElementById('log-argument'); 
    const logResultVal = document.getElementById('log-result-val'); 
    const convertToExpBtn = document.getElementById('convert-to-exp');
    const expFormResult = document.getElementById('exp-form-result');

    if(convertToLogBtn) {
        convertToLogBtn.addEventListener('click', () => {
            const b_str = expBase.value;
            const y_str = expExponent.value.trim(); 
            const x_str = expValue.value;
            
            const b = parseFloat(b_str);
            const x = parseFloat(x_str);
            // y can be a variable string, so no parseFloat for y itself.

            if (b_str === "" || y_str === "" || x_str === "") {
                logFormResult.innerHTML = '<p class="text-red-500">Tutti i campi sono obbligatori.</p>'; return;
            }
            if (isNaN(b) || isNaN(x)) {
                logFormResult.innerHTML = '<p class="text-red-500">Base e risultato devono essere numeri validi.</p>'; return;
            }
            if (b <= 0 || Math.abs(b - 1) < 1e-9) {
                logFormResult.innerHTML = '<p class="text-red-500">Base deve essere > 0 e ≠ 1.</p>'; return;
            }
            if (x <= 0) {
                logFormResult.innerHTML = '<p class="text-red-500">Il risultato dell\'esponenziale (argomento del log) deve essere > 0.</p>'; return;
            }
            logFormResult.innerHTML = `<p class="text-lg text-green-700">Forma Logaritmica: $ \\log_{${b}}(${x}) = ${y_str} $</p>`;
            setupMathJaxRendering(logFormResult);
        });
    }

    if(convertToExpBtn) {
        convertToExpBtn.addEventListener('click', () => {
            const b_str = logBaseInput.value;
            const x_str = logArgument.value;
            const y_str = logResultVal.value.trim(); 

            const b = parseFloat(b_str);
            const x = parseFloat(x_str);

            if (b_str === "" || x_str === "" || y_str === "") {
                expFormResult.innerHTML = '<p class="text-red-500">Tutti i campi sono obbligatori.</p>'; return;
            }
            if (isNaN(b) || isNaN(x)) {
                expFormResult.innerHTML = '<p class="text-red-500">Base e argomento devono essere numeri validi.</p>'; return;
            }
             if (b <= 0 || Math.abs(b - 1) < 1e-9) {
                expFormResult.innerHTML = '<p class="text-red-500">Base deve essere > 0 e ≠ 1.</p>'; return;
            }
            if (x <= 0) {
                expFormResult.innerHTML = '<p class="text-red-500">Argomento del logaritmo deve essere > 0.</p>'; return;
            }
            expFormResult.innerHTML = `<p class="text-lg text-green-700">Forma Esponenziale: $ ${b_str}^{${y_str}} = ${x_str} $</p>`;
            setupMathJaxRendering(expFormResult);
        });
    }
}

function initExpLogPropertiesExplorer() {
    const container = document.getElementById('log-properties-explorer');
    if (!container) return;

    const baseInput = container.querySelector('#log-prop-base');
    const xInput = container.querySelector('#log-prop-x');
    const yInput = container.querySelector('#log-prop-y');
    const nInput = container.querySelector('#log-prop-n'); 
    const propertySelect = container.querySelector('#log-property-select');
    const resultsDiv = container.querySelector('#log-properties-results');

    if (!baseInput || !xInput || !yInput || !nInput || !propertySelect || !resultsDiv) {
        console.error("Elementi per l'esploratore di proprietà dei logaritmi non trovati.");
        return;
    }

    function calculateAndDisplay() {
        const b = parseFloat(baseInput.value);
        const x_val = parseFloat(xInput.value); // Renamed to avoid conflict with x from scope
        const y_val = parseFloat(yInput.value); // Renamed
        const n_val = parseFloat(nInput.value); // Renamed
        const property = propertySelect.value;

        resultsDiv.innerHTML = ''; // Clear previous results

        if (isNaN(b) || b <= 0 || Math.abs(b - 1) < 1e-9) {
            resultsDiv.innerHTML = `<p class="text-red-500">Base 'b' non valida. Deve essere > 0 e ≠ 1.</p>`; return;
        }
        if (isNaN(x_val) || x_val <= 0) {
             resultsDiv.innerHTML = `<p class="text-red-500">Valore 'x' non valido. Deve essere > 0.</p>`; return;
        }

        let lhsStr = "", rhsStr = "", lhsVal = NaN, rhsVal = NaN;
        let calculationValid = true;

        switch(property) {
            case "product":
                if (isNaN(y_val) || y_val <= 0) { resultsDiv.innerHTML = `<p class="text-red-500">Valore 'y' non valido per la regola del prodotto. Deve essere > 0.</p>`; calculationValid = false; break; }
                lhsStr = `$\\log_{${b}}(${x_val} \\cdot ${y_val}) = \\log_{${b}}(${x_val * y_val})$`;
                rhsStr = `$\\log_{${b}}(${x_val}) + \\log_{${b}}(${y_val})$`;
                lhsVal = Math.log(x_val * y_val) / Math.log(b);
                rhsVal = (Math.log(x_val) / Math.log(b)) + (Math.log(y_val) / Math.log(b));
                break;
            case "quotient":
                 if (isNaN(y_val) || y_val <= 0) { resultsDiv.innerHTML = `<p class="text-red-500">Valore 'y' non valido per la regola del quoziente. Deve essere > 0.</p>`; calculationValid = false; break; }
                 if (x_val / y_val <= 0) {resultsDiv.innerHTML = `<p class="text-red-500">Argomento $\\frac{x}{y}$ non valido (deve essere > 0).</p>`; calculationValid = false; break;}
                lhsStr = `$\\log_{${b}}(\\frac{${x_val}}{${y_val}}) = \\log_{${b}}(${(x_val/y_val).toFixed(3)})$`;
                rhsStr = `$\\log_{${b}}(${x_val}) - \\log_{${b}}(${y_val})$`;
                lhsVal = Math.log(x_val / y_val) / Math.log(b);
                rhsVal = (Math.log(x_val) / Math.log(b)) - (Math.log(y_val) / Math.log(b));
                break;
            case "power":
                if (isNaN(n_val)) { resultsDiv.innerHTML = `<p class="text-red-500">Valore 'n' (esponente) non valido.</p>`; calculationValid = false; break; }
                if (Math.pow(x_val, n_val) <= 0 && n_val % 1 !== 0) {resultsDiv.innerHTML = `<p class="text-red-500">Argomento $x^n$ non valido (potrebbe essere non reale o non positivo).</p>`; calculationValid = false; break;}
                lhsStr = `$\\log_{${b}}(${x_val}^{${n_val}})$`;
                rhsStr = `${n_val} \\cdot \\log_{${b}}(${x_val})$`;
                lhsVal = Math.log(Math.pow(x_val,n_val)) / Math.log(b);
                rhsVal = n_val * (Math.log(x_val) / Math.log(b));
                break;
            case "change_base":
                 const newBase = 10; 
                 if (isNaN(newBase) || newBase <= 0 || Math.abs(newBase - 1) < 1e-9) { resultsDiv.innerHTML = `<p class="text-red-500">Nuova base non valida.</p>`; calculationValid = false; break;}
                 lhsStr = `$\\log_{${b}}(${x_val})$`;
                 rhsStr = `$\\frac{\\log_{${newBase}}(${x_val})}{\\log_{${newBase}}(${b})}$`; 
                 lhsVal = Math.log(x_val) / Math.log(b);
                 rhsVal = (Math.log(x_val) / Math.log(newBase)) / (Math.log(b) / Math.log(newBase));
                break;
            default:
                resultsDiv.innerHTML = `<p>Seleziona una proprietà.</p>`; return;
        }
        
        if (!calculationValid) return;

        if (!isFinite(lhsVal) || !isFinite(rhsVal)) {
             resultsDiv.innerHTML = `<p class="text-orange-500">Uno dei valori calcolati non è finito (es. logaritmo di un numero troppo piccolo o base problematica).</p>
             <p>LHS: ${lhsStr}, RHS: ${rhsStr}</p>`;
        } else {
             resultsDiv.innerHTML = `
                <p><strong>Lato Sinistro (LHS):</strong> ${lhsStr} $ \\approx ${lhsVal.toFixed(4)}$</p>
                <p><strong>Lato Destro (RHS):</strong> ${rhsStr} $ \\approx ${rhsVal.toFixed(4)}$</p>
                <p class="mt-2 font-semibold ${Math.abs(lhsVal - rhsVal) < 1e-9 ? 'text-green-600' : 'text-red-600'}">
                    ${Math.abs(lhsVal - rhsVal) < 1e-9 ? 'LHS ≈ RHS (Proprietà verificata)' : 'LHS ≠ RHS (Controlla i valori o la proprietà)'}
                </p>
            `;
        }
        setupMathJaxRendering(resultsDiv);
    }

    [baseInput, xInput, yInput, nInput, propertySelect].forEach(el => el.addEventListener('input', calculateAndDisplay));
    calculateAndDisplay(); // Initial call
}

function initParametricExercisesExpLog() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="esponenziali"]');
    parametricExercises.forEach(exercise => {
        const exerciseId = exercise.getAttribute('data-exercise-id');
        const generateBtn = exercise.querySelector('.generate-btn');
        const exerciseTextEl = exercise.querySelector('.exercise-text');
        const solutionContentEl = exercise.querySelector('.solution-content');
        
        if (generateBtn && exerciseTextEl && solutionContentEl) {
            generateBtn.addEventListener('click', () => {
                const params = {};
                // Get params from dynamically generated inputs within exerciseTextEl
                const currentInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
                currentInputs.forEach(input => {
                    params[input.name] = parseFloat(input.value) || input.value; // Keep as string if not floatable
                });
                generateParametricExerciseExpLog(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise')); 
            });
            // Initial generation with default or empty params from HTML (if any) or internal defaults
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input'); // If inputs are in HTML initially
             initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateParametricExerciseExpLog(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}


function generateParametricExerciseExpLog(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
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
        case 'exp-equation-1': 
            const a1 = userParams.a || randInt(2, 5);
            const exp1_sol = userParams.exp_sol || randInt(2, 4); // This is the solution 'x' we want to find
            const b1 = Math.pow(a1, exp1_sol);
            htmlInputs = `<span class="parametric-inputs">Base $a$: <input type="number" name="a" value="${a1}" class="p-1 border rounded w-20" aria-label="Base a"> (Soluzione attesa per $x$: ${exp1_sol}, $a^x = ${b1}$)</span>`;
            textEl.innerHTML = `Risolvere l'equazione esponenziale: $${a1}^x = ${b1}$. ${htmlInputs}`;
            solutionEl.innerHTML = `
                <p>$${a1}^x = ${b1}$.</p>
                <p>Dato che $${b1} = ${a1}^{${exp1_sol}}$ (verificabile calcolando ${a1} elevato alla ${exp1_sol}), l'equazione diventa $${a1}^x = ${a1}^{${exp1_sol}}$.</p>
                <p>Uguagliando gli esponenti (poiché la base $a=${a1} > 0$ e $a \\neq 1$): $x = ${exp1_sol}$.</p>`;
            break;

        case 'log-equation-1': 
            const base_log1 = userParams.base || randInt(2, 4);
            const val_log1 = userParams.val || randInt(1, 3); 
            const arg_log1_sol = Math.pow(base_log1, val_log1); 
            htmlInputs = `<span class="parametric-inputs">Base $b$: <input type="number" name="base" value="${base_log1}" class="p-1 border rounded w-20" aria-label="Base b"> Risultato $c$: <input type="number" name="val" value="${val_log1}" class="p-1 border rounded w-20" aria-label="Risultato c"> (Soluzione attesa per $x$: ${arg_log1_sol})</span>`;
            textEl.innerHTML = `Risolvere l'equazione logaritmica: $\\log_{${base_log1}}(x) = ${val_log1}$. ${htmlInputs}`;
            solutionEl.innerHTML = `
                <p>$\\log_{${base_log1}}(x) = ${val_log1}$.</p>
                <p>Per definizione di logaritmo, convertiamo in forma esponenziale: $x = ${base_log1}^{${val_log1}}$.</p>
                <p>$x = ${arg_log1_sol}$.</p>
                <p>Condizione di esistenza del logaritmo: $x > 0$. Poiché ${arg_log1_sol} > 0$, la soluzione è accettabile.</p>`;
            break;

        case 'compound-interest':
            const P = userParams.P || randInt(10, 50) * 100; 
            const r_perc = userParams.r_perc || randInt(2, 7); 
            const r_decimal = r_perc / 100;
            const t_interest = userParams.t_interest || randInt(5, 15); 
            const A = P * Math.exp(r_decimal * t_interest);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <label for="P_param_ci" class="sr-only">Capitale Iniziale P</label>P (€): <input type="number" id="P_param_ci" name="P" value="${P}" class="p-1 border rounded">
                            <label for="r_param_ci" class="sr-only">Tasso r percentuale</label>Tasso r (%): <input type="number" id="r_param_ci" name="r_perc" value="${r_perc}" class="p-1 border rounded">
                            <label for="t_param_ci" class="sr-only">Tempo t in anni</label>Tempo t (anni): <input type="number" id="t_param_ci" name="t_interest" value="${t_interest}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Un capitale di €${P} è investito al tasso annuo del ${r_perc}% con capitalizzazione continua per ${t_interest} anni. Calcolare il montante finale. ${htmlInputs}`;
            solutionEl.innerHTML = `
                <p>La formula per l'interesse composto continuo è $A = P e^{rt}$.</p>
                <p>Dove $P = ${P}$, $r = ${r_perc}\\% = ${r_decimal}$, $t = ${t_interest}$ anni.</p>
                <p>$A = ${P} \\cdot e^{(${r_decimal} \\cdot ${t_interest})}$.</p>
                <p>$A = ${P} \\cdot e^{${r_decimal*t_interest}}$.</p>
                <p>$A \\approx ${P} \\cdot ${Math.exp(r_decimal*t_interest).toFixed(5)} \\approx ${A.toFixed(2)}$ Euro.</p>`;
            break;

        case 'log-prop-simplify':
            const base_prop = userParams.base_prop || randInt(2,5);
            const m_prop = userParams.m_prop || randInt(2,4);
            const n_prop = userParams.n_prop || randInt(2,4);
            htmlInputs = `<div class="parametric-inputs mt-2 flex flex-wrap gap-2">
                            <label for="base_prop_simplify" class="sr-only">Base b</label>Base $b$: <input type="number" id="base_prop_simplify" name="base_prop" value="${base_prop}" class="p-1 border rounded w-20">
                            <label for="m_prop_simplify" class="sr-only">Potenza m</label>Potenza $m$: <input type="number" name="m_prop" value="${m_prop}" class="p-1 border rounded w-20">
                            <label for="n_prop_simplify" class="sr-only">Potenza n</label>Potenza $n$: <input type="number" name="n_prop" value="${n_prop}" class="p-1 border rounded w-20">
                          </div>`;
            textEl.innerHTML = `Semplificare l'espressione: $\\log_{${base_prop}}(x^{${m_prop}} y^{${n_prop}})$ assumendo $x>0, y>0$. ${htmlInputs}`;
            solutionEl.innerHTML = `
                <p>Usando la proprietà del logaritmo di un prodotto $\\log_b(XY) = \\log_b(X) + \\log_b(Y)$:</p>
                <p>$\\log_{${base_prop}}(x^{${m_prop}} y^{${n_prop}}) = \\log_{${base_prop}}(x^{${m_prop}}) + \\log_{${base_prop}}(y^{${n_prop}})$</p>
                <p>Usando la proprietà del logaritmo di una potenza $\\log_b(X^k) = k \\log_b(X)$:</p>
                <p>$= ${m_prop}\\log_{${base_prop}}(x) + ${n_prop}\\log_{${base_prop}}(y)$.</p>`;
            break;

        case 'exp-equation-equality': 
            const base_eq2 = userParams.base_eq2 || randInt(2,7);
            // Ensure c1 and c3 are different for a unique solution, or handle identity/impossibility
            let c1, c3;
            do {
                c1 = userParams.c1 !== undefined ? userParams.c1 : randInt(1,5);
                c3 = userParams.c3 !== undefined ? userParams.c3 : randInt(1,5);
            } while (c1 === c3 && Math.random() < 0.8); // Reduce chance of c1=c3, but still allow it sometimes

            const c2 = userParams.c2 !== undefined ? userParams.c2 : randInt(-5,5);
            const c4 = userParams.c4 !== undefined ? userParams.c4 : randInt(-5,5);

            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                            <label for="base_eq2_param" class="sr-only">Base a</label>Base $a$: <input type="number" id="base_eq2_param" name="base_eq2" value="${base_eq2}" class="p-1 border rounded">
                            <label for="c1_param" class="sr-only">Coefficiente c1</label>$c_1$: <input type="number" name="c1" value="${c1}" id="c1_param" class="p-1 border rounded">
                            <label for="c2_param" class="sr-only">Termine c2</label>$c_2$: <input type="number" name="c2" value="${c2}" id="c2_param" class="p-1 border rounded">
                            <label for="c3_param" class="sr-only">Coefficiente c3</label>$c_3$: <input type="number" name="c3" value="${c3}" id="c3_param" class="p-1 border rounded">
                            <label for="c4_param" class="sr-only">Termine c4</label>$c_4$: <input type="number" name="c4" value="${c4}" id="c4_param" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvere l'equazione: $${base_eq2}^{${c1}x ${c2>=0?'+':''}${c2}} = ${base_eq2}^{${c3}x ${c4>=0?'+':''}${c4}}$. ${htmlInputs}`;
            
            let sol_x_desc;
            if (c1 - c3 !== 0) {
                const sol_x_val = (c4 - c2) / (c1 - c3);
                sol_x_desc = `<p>$x = \\frac{${c4-c2}}{${c1-c3}} = ${sol_x_val.toFixed(3)}$</p>`;
            } else { // c1 - c3 === 0
                if (c4 - c2 === 0) {
                    sol_x_desc = `<p>$0x = 0$, l'equazione è un'identità, vera per ogni $x \\in \\mathbb{R}$.</p>`;
                } else {
                    sol_x_desc = `<p>$0x = ${c4-c2}$, l'equazione è impossibile, non ci sono soluzioni.</p>`;
                }
            }

            solutionEl.innerHTML = `
                <p>Poiché le basi sono uguali ($${base_eq2}$) e la base $a > 0, a \\neq 1$, possiamo uguagliare gli esponenti:</p>
                <p>$${c1}x ${c2>=0?'+':''}${c2} = ${c3}x ${c4>=0?'+':''}${c4}$.</p>
                <p>Portando i termini con $x$ a sinistra e i termini noti a destra:</p>
                <p>$${c1}x - ${c3}x = ${c4} - ${c2}$.</p>
                <p>$(${c1-c3})x = ${c4-c2}$.</p>
                ${sol_x_desc}
            `;
            break;

        default:
            textEl.textContent = "Esercizio non disponibile";
            solutionEl.textContent = "Soluzione non disponibile";
            return; 
    }
    // Re-attach input listeners if inputs are part of htmlInputs
    const newInputs = textEl.querySelectorAll('.parametric-inputs input');
    newInputs.forEach(input => {
        input.addEventListener('change', () => { // Or 'input' for more responsive updates
            const params = {};
            textEl.querySelectorAll('.parametric-inputs input').forEach(i => {
                params[i.name] = parseFloat(i.value) || i.value;
            });
            generateParametricExerciseExpLog(exerciseId, textEl, solutionEl, params);
             // initSolutionToggles needs to be called on the parent .parametric-exercise for the specific toggle
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
