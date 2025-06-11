// Interactive elements and functionality specific to the limits section

document.addEventListener('DOMContentLoaded', function() {
    initLimitVisualizer();
    initEpsilonDeltaVisualizer(); // Placeholder
    initLimitPropertiesExplorer(); // Placeholder
    initLimitsParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initLimitVisualizer() {
    const container = document.getElementById('limit-visualizer');
    if (!container) return;
    container.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'limit-visualizer-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="limit-func-select" class="block text-sm font-medium text-gray-700">Funzione $f(x)$:</label>
            <select id="limit-func-select" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                <option value="x^2" data-latex="x^2">x²</option>
                <option value="sin(x)/x" data-latex="\\frac{\\sin(x)}{x}">sin(x)/x</option>
                <option value="(x^2-1)/(x-1)" data-latex="\\frac{x^2-1}{x-1}">(x²-1)/(x-1)</option>
                <option value="1/x" data-latex="\\frac{1}{x}">1/x</option>
                <option value="abs(x)/x" data-latex="\\frac{|x|}{x}">|x|/x (Segno di x)</option>
                <option value="sqrt(x)" data-latex="\\sqrt{x}">√x</option>
            </select>
        </div>
        <div>
            <label for="limit-point-slider" class="block text-sm font-medium text-gray-700">$x_0$ (punto di limite): <span id="limit-point-value" class="font-semibold">1</span></label>
            <input type="range" id="limit-point-slider" min="-5" max="5" step="0.05" value="1" class="custom-slider" aria-describedby="limit-output">
        </div>
        <div class="md:col-span-2 text-sm text-gray-700 min-h-[40px]" id="limit-output" aria-live="polite">Seleziona una funzione e un punto $x_0$.</div>
    `;
    container.appendChild(controlsDiv);

    const funcSelect = document.getElementById('limit-func-select');
    const pointSlider = document.getElementById('limit-point-slider');
    const pointValueDisplay = document.getElementById('limit-point-value');
    const outputDiv = document.getElementById('limit-output');

    let currentFunc = x => x*x;
    let currentX0 = 1;
    let funcLatexStr = "x^2";

    const graph = createFunctionGraph('limit-visualizer-canvas', currentFunc, {
        xMin: -5, xMax: 5, yMin: -5, yMax: 10, responsive: true,
        ariaLabel: "Visualizzatore interattivo di limiti. Modifica la funzione e il punto x0."
    });
    if(!graph) return;


    function updateLimitVisualizer() {
        currentX0 = parseFloat(pointSlider.value);
        pointValueDisplay.textContent = currentX0.toFixed(2);
        
        const selectedOption = funcSelect.options[funcSelect.selectedIndex];
        funcLatexStr = selectedOption.dataset.latex || selectedOption.text;


        switch (funcSelect.value) {
            case 'x^2': currentFunc = x => x*x; break;
            case 'sin(x)/x': currentFunc = x => (Math.abs(x) < 1e-9 ? 1 : Math.sin(x)/x) ; break; 
            case '(x^2-1)/(x-1)': currentFunc = x => (Math.abs(x-1) < 1e-9 ? 2 : (x*x-1)/(x-1)); break; 
            case '1/x': currentFunc = x => (Math.abs(x) < 1e-9 ? (x > 0 ? Infinity : -Infinity) : 1/x); break;
            case 'abs(x)/x': currentFunc = x => (Math.abs(x) < 1e-9 ? NaN : Math.abs(x)/x); break; // Undefined at x=0
            case 'sqrt(x)': currentFunc = x => (x < 0 ? NaN : Math.sqrt(x)); break;
            default: currentFunc = x => x*x;
        }

        let limitVal;
        let limitValRight, limitValLeft;
        const deltaSmall = 1e-7; // For numerical limit calculation
        
        // Attempt to calculate limit numerically
        try {
            limitValLeft = currentFunc(currentX0 - deltaSmall);
            limitValRight = currentFunc(currentX0 + deltaSmall);

            if (funcSelect.value === 'abs(x)/x' && Math.abs(currentX0) < 1e-9) {
                limitVal = NaN; // Explicitly undefined at 0
            } else if (Math.abs(limitValLeft - limitValRight) < 1e-3 && isFinite(limitValLeft)) { // If left and right limits are close
                limitVal = (limitValLeft + limitValRight) / 2;
            } else { // Limits differ or one/both are not finite
                limitVal = NaN; // Default to NaN if limits differ significantly or problematic
            }
            // Specific overrides for well-known points
            if (funcSelect.value === 'sin(x)/x' && Math.abs(currentX0) < 1e-9) limitVal = 1;
            if (funcSelect.value === '(x^2-1)/(x-1)' && Math.abs(currentX0-1) < 1e-9) limitVal = 2;
            if (funcSelect.value === '1/x' && Math.abs(currentX0) < 1e-9) {
                 limitVal = currentX0 >= 0 ? Infinity : -Infinity; // More nuanced for 1/x at 0
            }


        } catch (e) {
            limitVal = NaN;
        }
        
        let markers = [];
        if (isFinite(limitVal)) { // Only add main marker if limit is a finite number
             markers.push({ x: currentX0, y: limitVal, color: '#e11d48', radius: 5, label: `L=${limitVal.toFixed(2)}` }); // Rose-600
        }
        
        // Add points approaching x0
        const deltas = [0.5, 0.2, 0.1, 0.05]; // Multiple deltas for visualization
        deltas.forEach(d => {
            try {
                const yL = currentFunc(currentX0 - d);
                if(isFinite(yL)) markers.push({ x: currentX0 - d, y: yL, color: '#fbbf24', radius: 3 }); // Amber-400
            } catch(e){}
            try {
                const yR = currentFunc(currentX0 + d);
                if(isFinite(yR)) markers.push({ x: currentX0 + d, y: yR, color: '#fbbf24', radius: 3 });
            } catch(e){}
        });


        graph.updateConfig({
            curves: [{ func: currentFunc, color: '#4f46e5' }], // Indigo-600
            markers: markers,
            verticalLines: [{x: currentX0, color: '#9ca3af', dash: [4,4]}] // Slate-400
        });

        let limitOutputText = `$\\lim_{x \\to ${currentX0.toFixed(2)}} ${funcLatexStr} = `;
        if (isNaN(limitVal)) {
            if (funcSelect.value === 'abs(x)/x' && Math.abs(currentX0) < 1e-9) {
                 limitOutputText += `Non esiste (limite sx = ${currentFunc(-deltaSmall)}, limite dx = ${currentFunc(deltaSmall)})$`;
            } else if (funcSelect.value === '1/x' && Math.abs(currentX0) < 1e-9) {
                limitOutputText += `$\\pm\\infty$ (limite sx = ${currentFunc(-deltaSmall)}, limite dx = ${currentFunc(deltaSmall)})$`;
            }
            else {
                 limitOutputText += 'Non definito o non finito';
            }
        } else if (!isFinite(limitVal)) {
            limitOutputText += limitVal > 0 ? '$\\infty$' : '$-\\infty$';
        }
        else {
            limitOutputText += limitVal.toFixed(3);
        }
        
        if (funcSelect.value === 'sqrt(x)' && currentX0 < 0) {
             limitOutputText = `La funzione $\\sqrt{x}$ non è definita per $x < 0$ nel campo reale.`;
        }
        outputDiv.innerHTML = limitOutputText;
        setupMathJaxRendering(outputDiv);
         graph.getCanvas().setAttribute('aria-label', `Grafico di ${selectedOption.text} con limite per x tendente a ${currentX0.toFixed(2)}. Risultato: ${limitOutputText.replace(/\$/g, '')}`);
    }

    funcSelect.addEventListener('change', updateLimitVisualizer);
    pointSlider.addEventListener('input', updateLimitVisualizer);
    updateLimitVisualizer();
}

function initEpsilonDeltaVisualizer() {
    const container = document.getElementById('epsilon-delta-visualizer');
    if (!container) return;
    // This is a more advanced visualizer. Placeholder for now.
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Visualizzatore Epsilon-Delta in sviluppo. Sarà possibile esplorare interattivamente la definizione formale di limite.</p>`;
}

function initLimitPropertiesExplorer() {
    const container = document.getElementById('limit-properties-explorer');
    if (!container) return;
    // Placeholder for interactive exploration of limit properties.
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Esploratore interattivo delle proprietà dei limiti (somma, prodotto, quoziente) in sviluppo.</p>`;
}

function initLimitsParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="limiti"]');
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
                generateLimitExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise')); 
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
            initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateLimitExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams); 
        }
    });
}


function generateLimitExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randCoeff = (allowZero = false) => {
        let c;
        do { c = randInt(-5,5); } while (c===0 && !allowZero);
        return c;
    };
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
        case 'polynomial-limit-parametric':
            const p_a = userParams.p_a_poly !== undefined ? userParams.p_a_poly : randCoeff();
            const p_b = userParams.p_b_poly !== undefined ? userParams.p_b_poly : randCoeff(true);
            const p_c = userParams.p_c_poly !== undefined ? userParams.p_c_poly : randInt(-10, 10);
            const p_x0 = userParams.p_x0_poly !== undefined ? userParams.p_x0_poly : randInt(-3, 3);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $a$: <input type="number" name="p_a_poly" value="${p_a}" class="p-1 border rounded">
                            $b$: <input type="number" name="p_b_poly" value="${p_b}" class="p-1 border rounded">
                            $c$: <input type="number" name="p_c_poly" value="${p_c}" class="p-1 border rounded">
                            $x_0$: <input type="number" name="p_x0_poly" value="${p_x0}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare: $\\lim_{x \\to ${p_x0}} (${p_a}x^2 ${p_b>=0?'+':''} ${p_b}x ${p_c>=0?'+':''} ${p_c})$. ${htmlInputs}`;
            const poly_res = p_a*p_x0*p_x0 + p_b*p_x0 + p_c;
            solutionEl.innerHTML = `<p>I polinomi sono funzioni continue su tutto $\\mathbb{R}$. Pertanto, il limite si calcola per sostituzione diretta:</p>
                                     <p>$\\lim_{x \\to ${p_x0}} (${p_a}x^2 ${p_b>=0?'+':''} ${p_b}x ${p_c>=0?'+':''} ${p_c}) = ${p_a}(${p_x0})^2 ${p_b>=0?'+':''} ${p_b}(${p_x0}) ${p_c>=0?'+':''} ${p_c}$</p>
                                     <p>$= ${p_a*p_x0*p_x0} ${p_b*p_x0>=0?'+':''} ${p_b*p_x0} ${p_c>=0?'+':''} ${p_c} = ${poly_res}$.</p>`;
            break;

        case 'rational-limit-finite-parametric':
            let r_na, r_nb, r_da, r_db, r_x0;
            let attempts_rat = 0;
            do {
                r_na = userParams.r_na_rat !== undefined && attempts_rat === 0 ? userParams.r_na_rat : randCoeff();
                r_nb = userParams.r_nb_rat !== undefined && attempts_rat === 0 ? userParams.r_nb_rat : randInt(-5,5);
                r_da = userParams.r_da_rat !== undefined && attempts_rat === 0 ? userParams.r_da_rat : randCoeff();
                r_db = userParams.r_db_rat !== undefined && attempts_rat === 0 ? userParams.r_db_rat : randInt(-5,5);
                r_x0 = userParams.r_x0_rat !== undefined && attempts_rat === 0 ? userParams.r_x0_rat : randInt(-3,3);
                attempts_rat++;
            } while (Math.abs(r_da * r_x0 + r_db) < 1e-9 && attempts_rat < 10); // Avoid zero denominator
            
            if (Math.abs(r_da * r_x0 + r_db) < 1e-9) { // Still zero after attempts, generate safe non-zero denominator
                r_da = 1; r_db = Math.abs(r_x0) + 1; // Ensures denominator is non-zero
            }

            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                            Num $a$: <input type="number" name="r_na_rat" value="${r_na}" class="p-1 border rounded"> Num $b$: <input type="number" name="r_nb_rat" value="${r_nb}" class="p-1 border rounded">
                            Den $a$: <input type="number" name="r_da_rat" value="${r_da}" class="p-1 border rounded"> Den $b$: <input type="number" name="r_db_rat" value="${r_db}" class="p-1 border rounded">
                            $x_0$: <input type="number" name="r_x0_rat" value="${r_x0}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare: $\\lim_{x \\to ${r_x0}} \\frac{${r_na}x ${r_nb>=0?'+':''} ${r_nb}}{${r_da}x ${r_db>=0?'+':''} ${r_db}}$. ${htmlInputs}`;
            const rat_num = r_na * r_x0 + r_nb;
            const rat_den = r_da * r_x0 + r_db;
            solutionEl.innerHTML = `<p>Le funzioni razionali sono continue nel loro dominio. Se il denominatore non è zero nel punto $x_0$, il limite si calcola per sostituzione diretta.</p>
                                     <p>Numeratore per $x=${r_x0}$: $${r_na}(${r_x0}) ${r_nb>=0?'+':''} ${r_nb} = ${rat_num}$.</p>
                                     <p>Denominatore per $x=${r_x0}$: $${r_da}(${r_x0}) ${r_db>=0?'+':''} ${r_db} = ${rat_den}$.</p>
                                     <p>Poiché il denominatore è ${rat_den} \\neq 0$, il limite è $\\frac{${rat_num}}{${rat_den}} = ${(rat_num/rat_den).toFixed(3)}$.</p>`;
            break;

        case 'limit-sinc-parametric': 
            const s_k = userParams.s_k_sinc !== undefined ? userParams.s_k_sinc : randCoeff() || 1; // Ensure k is not 0
            htmlInputs = `<div class="parametric-inputs mt-2">Costante $k$: <input type="number" name="s_k_sinc" value="${s_k}" class="p-1 border rounded w-20"></div>`;
            textEl.innerHTML = `Calcolare il limite notevole: $\\lim_{x \\to 0} \\frac{\\sin(${s_k}x)}{x}$. ${htmlInputs}`;
            solutionEl.innerHTML = `<p>Questo è una variazione del limite notevole $\\lim_{y \\to 0} \\frac{\\sin y}{y} = 1$.</p>
                                     <p>Moltiplichiamo e dividiamo per $k$ (assumendo $k \\neq 0$):</p>
                                     <p>$\\lim_{x \\to 0} \\frac{\\sin(${s_k}x)}{x} = \\lim_{x \\to 0} \\frac{\\sin(${s_k}x)}{${s_k}x} \\cdot ${s_k}$</p>
                                     <p>Poniamo $y = ${s_k}x$. Quando $x \\to 0$, anche $y \\to 0$.</p>
                                     <p>Il limite diventa: $(\\lim_{y \\to 0} \\frac{\\sin y}{y}) \\cdot ${s_k} = 1 \\cdot ${s_k} = ${s_k}$.</p>`;
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
            generateLimitExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
