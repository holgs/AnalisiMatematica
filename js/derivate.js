// Interactive elements and functionality specific to the derivatives section

document.addEventListener('DOMContentLoaded', function() {
    initTangentLineVisualizer();
    initDerivativePropertiesExplorer(); // Placeholder
    initFunctionPlotterWithDerivative();
    initDerivativesParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initTangentLineVisualizer() {
    const container = document.getElementById('tangent-line-visualizer');
    if (!container) return;
    container.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'tangent-line-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="tangent-func-select" class="block text-sm font-medium text-gray-700">Funzione $f(x)$:</label>
            <select id="tangent-func-select" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                <option value="x^2" data-derivative="2x" data-latex="x^2" selected>x²</option>
                <option value="x^3" data-derivative="3x^2" data-latex="x^3">x³</option>
                <option value="sin(x)" data-derivative="\\cos(x)" data-latex="\\sin(x)">sin(x)</option>
                <option value="cos(x)" data-derivative="-\\sin(x)" data-latex="\\cos(x)">cos(x)</option>
                <option value="exp(x)" data-derivative="e^x" data-latex="e^x">eˣ</option>
                 <option value="1/x" data-derivative="-1/x^2" data-latex="1/x">1/x (per x ≠ 0)</option>
            </select>
        </div>
        <div>
            <label for="tangent-point-slider" class="block text-sm font-medium text-gray-700">Punto $x_0$: <span id="tangent-point-value" class="font-semibold">1</span></label>
            <input type="range" id="tangent-point-slider" min="-3" max="3" step="0.05" value="1" class="custom-slider" aria-describedby="tangent-output">
        </div>
        <div class="md:col-span-2 text-sm text-gray-700 min-h-[70px]" id="tangent-output" aria-live="polite">Seleziona funzione e punto $x_0$.</div>
    `;
    container.appendChild(controlsDiv);

    const funcSelect = document.getElementById('tangent-func-select');
    const pointSlider = document.getElementById('tangent-point-slider');
    const pointValueDisplay = document.getElementById('tangent-point-value');
    const outputDiv = document.getElementById('tangent-output');

    let currentFuncExpr, currentDerivativeFuncExpr; // Store expressions for evaluation
    let currentX0 = 1;
    let funcLatex = "x^2";
    let derivLatex = "2x";

    const graph = createFunctionGraph('tangent-line-canvas', null, {
        xMin: -4, xMax: 4, yMin: -5, yMax: 10, responsive: true,
        ariaLabel: "Visualizzatore della retta tangente. Modifica la funzione e il punto x0."
    });
    if(!graph) return;

    function updateTangentVisualizer() {
        currentX0 = parseFloat(pointSlider.value);
        pointValueDisplay.textContent = currentX0.toFixed(2);
        
        const selectedOption = funcSelect.options[funcSelect.selectedIndex];
        funcLatex = selectedOption.dataset.latex;
        derivLatex = selectedOption.dataset.derivative;
        const funcVal = selectedOption.value;

        // Using string expressions for eval with mathjs or similar would be more robust
        // For now, direct JS functions:
        switch (funcVal) {
            case 'x^2': currentFuncExpr = x => x*x; currentDerivativeFuncExpr = x => 2*x; break;
            case 'x^3': currentFuncExpr = x => x*x*x; currentDerivativeFuncExpr = x => 3*x*x; break;
            case 'sin(x)': currentFuncExpr = x => Math.sin(x); currentDerivativeFuncExpr = x => Math.cos(x); break;
            case 'cos(x)': currentFuncExpr = x => Math.cos(x); currentDerivativeFuncExpr = x => -Math.sin(x); break;
            case 'exp(x)': currentFuncExpr = x => Math.exp(x); currentDerivativeFuncExpr = x => Math.exp(x); break;
            case '1/x': 
                currentFuncExpr = x => (Math.abs(x) < 1e-9 ? NaN : 1/x); 
                currentDerivativeFuncExpr = x => (Math.abs(x) < 1e-9 ? NaN : -1/(x*x)); 
                break;
            default: currentFuncExpr = x => x*x; currentDerivativeFuncExpr = x => 2*x;
        }

        const y0 = currentFuncExpr(currentX0);
        const slope = currentDerivativeFuncExpr(currentX0);
        
        let curves = [{ func: currentFuncExpr, color: '#4f46e5' }]; // Indigo-600
        let markers = [];
        let tangentOutputHTML = "";

        if (isFinite(y0) && isFinite(slope)) {
            const tangentFunc = x => slope * (x - currentX0) + y0;
            markers.push({ x: currentX0, y: y0, color: '#e11d48', radius: 5, label: `P(${currentX0.toFixed(1)}, ${y0.toFixed(2)})` }); // Rose-600
            curves.push({ func: tangentFunc, color: '#10b981', dash: [5,5] }); // Green-500
            tangentOutputHTML = `Funzione: $f(x) = ${funcLatex}$ <br>
                               Derivata: $f'(x) = ${derivLatex}$<br>
                               Nel punto $x_0 = ${currentX0.toFixed(2)}$: $f(x_0) = ${y0.toFixed(2)}$, $f'(x_0) = m = ${slope.toFixed(2)}$<br>
                               Equazione retta tangente: $y - ${y0.toFixed(2)} = ${slope.toFixed(2)}(x - ${currentX0.toFixed(2)})$`;
        } else {
            tangentOutputHTML = `Funzione: $f(x) = ${funcLatex}$ <br>
                               Derivata $f'(x) = ${derivLatex}$ <br>
                               La funzione o la sua derivata non è definita o è infinita nel punto $x_0 = ${currentX0.toFixed(2)}$.`;
            if (Math.abs(currentX0) < 1e-9 && funcVal === '1/x') {
                 tangentOutputHTML += ` (Asintoto verticale in $x=0$)`;
            }
        }
        
        graph.updateConfig({ curves, markers });
        outputDiv.innerHTML = tangentOutputHTML;
        setupMathJaxRendering(outputDiv);
        graph.getCanvas().setAttribute('aria-label', `Grafico di f(x) = ${selectedOption.text} con retta tangente nel punto x0 = ${currentX0.toFixed(2)}. Pendenza tangente: ${isFinite(slope) ? slope.toFixed(2) : 'non definita'}.`);
    }

    funcSelect.addEventListener('change', updateTangentVisualizer);
    pointSlider.addEventListener('input', updateTangentVisualizer);
    updateTangentVisualizer();
}

function initDerivativePropertiesExplorer() {
    const container = document.getElementById('derivative-rules-explorer');
    if (!container) return;
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Esploratore interattivo delle regole di derivazione (somma, prodotto, quoziente) in sviluppo.</p>`;
}

function initFunctionPlotterWithDerivative() {
    const container = document.getElementById('function-derivative-plotter');
    if (!container) return;
    container.innerHTML = ""; 

    const canvasFuncDiv = document.createElement('div');
    canvasFuncDiv.id = 'func-plot-canvas';
    canvasFuncDiv.className = 'canvas-container h-64 md:h-80 mb-2'; 
    container.appendChild(canvasFuncDiv);

    const canvasDerivDiv = document.createElement('div');
    canvasDerivDiv.id = 'deriv-plot-canvas';
    canvasDerivDiv.className = 'canvas-container h-64 md:h-80 mb-4'; 
    container.appendChild(canvasDerivDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="plotter-func-select" class="block text-sm font-medium text-gray-700">Funzione $f(x)$:</label>
            <select id="plotter-func-select" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                <option value="x^2" data-derivative-str="2x" data-latex="x^2" selected>x²</option>
                <option value="x^3-3x" data-derivative-str="3x^2-3" data-latex="x^3-3x">x³ - 3x</option>
                <option value="sin(x)" data-derivative-str="\\cos(x)" data-latex="\\sin(x)">sin(x)</option>
                <option value="exp(x*0.5)" data-derivative-str="0.5e^{0.5x}" data-latex="e^{0.5x}">e^(0.5x)</option>
            </select>
        </div>
        <div class="mt-2 text-sm text-gray-700" aria-live="polite">
            <p>Sopra: Grafico di $f(x)$ (blu). Sotto: Grafico di $f'(x)$ (verde).</p>
            <p id="plotter-equation-f">Funzione: $f(x) = ? $</p>
            <p id="plotter-derivative-eq">Derivata: $f'(x) = ? $</p>
        </div>
    `;
    container.appendChild(controlsDiv);
    
    const funcSelect = document.getElementById('plotter-func-select');
    const equationFDisplay = document.getElementById('plotter-equation-f');
    const derivativeEqDisplay = document.getElementById('plotter-derivative-eq');

    const graphFunc = createFunctionGraph('func-plot-canvas', null, { 
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, responsive: true, padding: {left: 30, bottom: 20, top:10, right:10},
        ariaLabel: "Grafico della funzione f(x)"
    });
    const graphDeriv = createFunctionGraph('deriv-plot-canvas', null, { 
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, responsive: true, padding: {left: 30, bottom: 20, top:10, right:10},
        ariaLabel: "Grafico della derivata f'(x)"
    });
    if(!graphFunc || !graphDeriv) return;


    function updatePlotter() {
        const selectedOption = funcSelect.options[funcSelect.selectedIndex];
        const funcVal = selectedOption.value;
        const funcLatex = selectedOption.dataset.latex;
        const derivativeStrLatex = selectedOption.dataset.derivativeStr;
        let f, df;

        switch(funcVal) {
            case 'x^2': f = x => x*x; df = x => 2*x; break;
            case 'x^3-3x': f = x => x*x*x - 3*x; df = x => 3*x*x - 3; break;
            case 'sin(x)': f = x => Math.sin(x); df = x => Math.cos(x); break;
            case 'exp(x*0.5)': f = x => Math.exp(x*0.5); df = x => 0.5*Math.exp(x*0.5); break;
            default: f = x => x*x; df = x => 2*x;
        }
        
        graphFunc.updateConfig({ curves: [{func: f, color: '#4f46e5'}] }); // Indigo-600
        graphDeriv.updateConfig({ curves: [{func: df, color: '#10b981'}] }); // Green-500
        equationFDisplay.innerHTML = `Funzione: $f(x) = ${funcLatex}$`;
        derivativeEqDisplay.innerHTML = `Derivata: $f'(x) = ${derivativeStrLatex}$`;
        setupMathJaxRendering(equationFDisplay.parentElement); // Render parent of both
    }
    funcSelect.addEventListener('change', updatePlotter);
    updatePlotter();
}


function initDerivativesParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="derivate"]');
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
                generateDerivativeExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
             const initialParams = {};
             const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
             initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateDerivativeExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateDerivativeExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randCoeff = (allowZero = false, min = 1, max = 5) => {
        let coeff = randInt(min,max) * (Math.random() < 0.5 ? 1 : -1);
        return (coeff === 0 && !allowZero) ? (Math.random() < 0.5 ? 1 : -1) : coeff; // Ensure non-zero if not allowed
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
        case 'poly-derivative-parametric':
            const a = userParams.a_poly !== undefined ? userParams.a_poly : randCoeff();
            const b = userParams.b_poly !== undefined ? userParams.b_poly : randCoeff(true); 
            const c = userParams.c_poly !== undefined ? userParams.c_poly : randCoeff(true); 
            const n_exp = userParams.n_poly !== undefined ? userParams.n_poly : randInt(2, 4); 
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $a$: <input type="number" name="a_poly" value="${a}" class="p-1 border rounded">
                            $b$: <input type="number" name="b_poly" value="${b}" class="p-1 border rounded">
                            $c$: <input type="number" name="c_poly" value="${c}" class="p-1 border rounded">
                            $n$: <input type="number" name="n_poly" value="${n_exp}" min="0" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare la derivata di $f(x) = ${a}x^{${n_exp}} ${b>=0?'+':''} ${b}x ${c>=0?'+':''} ${c}$. ${htmlInputs}`;
            
            const da = a * n_exp;
            const dn_new = n_exp - 1;
            const db = b; 
            
            let derivStr = "";
            if (da !== 0) {
                 derivStr += `${da}x` + (dn_new > 1 ? `^{${dn_new}}` : (dn_new === 0 ? "" : (dn_new === 1 ? "" : `^{${dn_new}}`)));
                 if (dn_new === 0 && da !== 0) derivStr = `${da}`; // Case ax^1 -> a
            }
             if (db !== 0) {
                 if (derivStr !== "" && db > 0) derivStr += " + ";
                 else if (db < 0) derivStr += (derivStr !== "" ? " - " : "-") + Math.abs(db);
                 else if (derivStr === "") derivStr += db; // If first term and b > 0
                 else derivStr += Math.abs(db); // Should be covered by + or -
            }
            if (derivStr === "") derivStr = "0"; // Derivative of a constant

            solutionEl.innerHTML = `<p>$f'(x) = \\frac{d}{dx}(${a}x^{${n_exp}}) + \\frac{d}{dx}(${b}x) + \\frac{d}{dx}(${c})$</p>
                                     <p>$f'(x) = ${a}\\cdot${n_exp}x^{${n_exp}-1} + ${b} + 0$</p>
                                     <p>$f'(x) = ${derivStr}$</p>`;
            break;
        case 'product-rule-parametric':
            const u1 = userParams.u1_prod !== undefined ? userParams.u1_prod : randCoeff(false, 1, 3); 
            const u0 = userParams.u0_prod !== undefined ? userParams.u0_prod : randInt(-3,3); 
            const v1 = userParams.v1_prod !== undefined ? userParams.v1_prod : randCoeff(false, 1, 3); 
            const v0 = userParams.v0_prod !== undefined ? userParams.v0_prod : randInt(-3,3); 
            
            const u_x_str = `(${u1}x ${u0>=0?'+':''} ${u0})`;
            const v_x_str = `(${v1}x ${v0>=0?'+':''} ${v0})`;
            const du_dx_str = `${u1}`; // D[u1*x + u0] = u1
            const dv_dx_str = `${v1}`; // D[v1*x + v0] = v1

            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $u_1$: <input type="number" name="u1_prod" value="${u1}" class="p-1 border rounded"> $u_0$: <input type="number" name="u0_prod" value="${u0}" class="p-1 border rounded">
                            $v_1$: <input type="number" name="v1_prod" value="${v1}" class="p-1 border rounded"> $v_0$: <input type="number" name="v0_prod" value="${v0}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare la derivata di $f(x) = ${u_x_str} \\cdot ${v_x_str}$ usando la regola del prodotto $f'(x) = u'v + uv'$. ${htmlInputs}`;
            
            const term_x_coeff = u1*v1 + u1*v1; // (u1*v1)x from u'v and (u1*v1)x from uv'
            const const_term = u1*v0 + u0*v1;

            solutionEl.innerHTML = `<p>Sia $u(x) = ${u_x_str}$ e $v(x) = ${v_x_str}$.</p>
                                     <p>Allora $u'(x) = ${du_dx_str}$ e $v'(x) = ${dv_dx_str}$.</p>
                                     <p>Per la regola del prodotto, $f'(x) = u'(x)v(x) + u(x)v'(x)$.</p>
                                     <p>$f'(x) = (${du_dx_str})(${v_x_str}) + (${u_x_str})(${dv_dx_str})$</p>
                                     <p>$f'(x) = (${u1*v1}x ${u1*v0>=0?'+':''} ${u1*v0}) + (${u1*v1}x ${u0*v1>=0?'+':''} ${u0*v1})$</p>
                                     <p>$f'(x) = ${term_x_coeff}x ${const_term>=0?'+':''} ${const_term}$.</p>`;
            break;
        case 'quotient-rule-parametric': // Placeholder for user - to be implemented
             const qa = userParams.qa_quot !== undefined ? userParams.qa_quot : randCoeff(false,1,2);
             const qb = userParams.qb_quot !== undefined ? userParams.qb_quot : randInt(-2,2);
             const qc = userParams.qc_quot !== undefined ? userParams.qc_quot : randCoeff(false,1,2);
             const qd = userParams.qd_quot !== undefined ? userParams.qd_quot : randInt(-2,2);
             htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            Num $a$:<input type="number" name="qa_quot" value="${qa}" class="p-1 border rounded"> Num $b$:<input type="number" name="qb_quot" value="${qb}" class="p-1 border rounded">
                            Den $c$:<input type="number" name="qc_quot" value="${qc}" class="p-1 border rounded"> Den $d$:<input type="number" name="qd_quot" value="${qd}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare la derivata di $f(x) = \\frac{${qa}x ${qb>=0?'+':''} ${qb}}{${qc}x ${qd>=0?'+':''} ${qd}}$ usando la regola del quoziente. ${htmlInputs}`;
            // f'(x) = (u'v - uv') / v^2
            // u = ax+b -> u' = a
            // v = cx+d -> v' = c
            // u'v = a(cx+d) = acx + ad
            // uv' = (ax+b)c = acx + bc
            // u'v - uv' = acx + ad - (acx + bc) = ad - bc
            // v^2 = (cx+d)^2
            const numerator_quot = qa*qd - qb*qc;
            solutionEl.innerHTML = `<p>Sia $u(x) = ${qa}x ${qb>=0?'+':''} ${qb}$ e $v(x) = ${qc}x ${qd>=0?'+':''} ${qd}$.</p>
                                     <p>Allora $u'(x) = ${qa}$ e $v'(x) = ${qc}$.</p>
                                     <p>Per la regola del quoziente, $f'(x) = \\frac{u'(x)v(x) - u(x)v'(x)}{[v(x)]^2}$.</p>
                                     <p>$f'(x) = \\frac{(${qa})(${qc}x ${qd>=0?'+':''} ${qd}) - (${qa}x ${qb>=0?'+':''} ${qb})(${qc})}{(${qc}x ${qd>=0?'+':''} ${qd})^2}$</p>
                                     <p>$f'(x) = \\frac{(${qa*qc}x ${qa*qd>=0?'+':''} ${qa*qd}) - (${qa*qc}x ${qb*qc>=0?'+':''} ${qb*qc})}{(${qc}x ${qd>=0?'+':''} ${qd})^2}$</p>
                                     <p>$f'(x) = \\frac{${numerator_quot}}{(${qc}x ${qd>=0?'+':''} ${qd})^2}$. (Assicurarsi $v(x) \\neq 0$)</p>`;
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
            generateDerivativeExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
