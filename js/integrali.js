// Interactive elements and functionality specific to the integrals section

document.addEventListener('DOMContentLoaded', function() {
    initAreaUnderCurveVisualizer();
    initIntegralPropertiesExplorer(); // Placeholder
    initFundamentalTheoremVisualizer(); // Placeholder
    initIntegralsParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initAreaUnderCurveVisualizer() {
    const container = document.getElementById('area-under-curve-visualizer');
    if (!container) return;
    container.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'area-visualizer-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-3 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="area-func-select" class="block text-sm font-medium text-gray-700">Funzione $f(x)$:</label>
            <select id="area-func-select" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm">
                <option value="x^2" data-antiderivative="x^3/3" data-latex="x^2" selected>x²</option>
                <option value="2*x" data-antiderivative="x^2" data-latex="2x">2x</option>
                <option value="3" data-antiderivative="3*x" data-latex="3">3 (costante)</option>
                <option value="cos(x)" data-antiderivative="sin(x)" data-latex="\\cos(x)">cos(x)</option>
                 <option value="exp(x)" data-antiderivative="exp(x)" data-latex="e^x">eˣ</option>
            </select>
        </div>
        <div>
            <label for="area-limit-a-slider" class="block text-sm font-medium text-gray-700">$a$ (limite inf.): <span id="area-limit-a-value" class="font-semibold">0</span></label>
            <input type="range" id="area-limit-a-slider" min="-3" max="4.9" step="0.1" value="0" class="custom-slider" aria-describedby="area-output">
        </div>
        <div>
            <label for="area-limit-b-slider" class="block text-sm font-medium text-gray-700">$b$ (limite sup.): <span id="area-limit-b-value" class="font-semibold">2</span></label>
            <input type="range" id="area-limit-b-slider" min="-2.9" max="5" step="0.1" value="2" class="custom-slider" aria-describedby="area-output">
        </div>
        <div class="md:col-span-3 text-sm text-gray-700 min-h-[40px]" id="area-output" aria-live="polite">Seleziona funzione e limiti di integrazione.</div>
    `;
    container.appendChild(controlsDiv);

    const funcSelect = document.getElementById('area-func-select');
    const limitASlider = document.getElementById('area-limit-a-slider');
    const limitBSlider = document.getElementById('area-limit-b-slider');
    const limitAValueDisplay = document.getElementById('area-limit-a-value');
    const limitBValueDisplay = document.getElementById('area-limit-b-value');
    const outputDiv = document.getElementById('area-output');

    let currentFuncExpr, currentAntiderivativeExpr;
    let currentA = 0, currentB = 2;
    let funcLatexStr = "x^2";

    const graph = createFunctionGraph('area-visualizer-canvas', null, {
        xMin: -3, xMax: 5, yMin: -2, yMax: 10, responsive: true,
        ariaLabel: "Visualizzatore dell'area sottesa da una curva. Modifica funzione e limiti."
    });
    if(!graph) return;

    function updateAreaVisualizer() {
        currentA = parseFloat(limitASlider.value);
        currentB = parseFloat(limitBSlider.value);

        // Ensure a < b, with a small gap for visibility of fill
        const minGap = 0.2;
        if (currentA >= currentB - minGap) {
            if (event && event.target.id === 'area-limit-a-slider') { 
                currentB = currentA + minGap;
                if (currentB > parseFloat(limitBSlider.max)) currentB = parseFloat(limitBSlider.max);
                limitBSlider.value = currentB.toFixed(1);
            } else { 
                currentA = currentB - minGap;
                 if (currentA < parseFloat(limitASlider.min)) currentA = parseFloat(limitASlider.min);
                limitASlider.value = currentA.toFixed(1);
            }
        }
        // Dynamically adjust slider limits to prevent crossover (optional, can be tricky)
        // limitASlider.max = (currentB - minGap).toFixed(1); 
        // limitBSlider.min = (currentA + minGap).toFixed(1);

        limitAValueDisplay.textContent = currentA.toFixed(1);
        limitBValueDisplay.textContent = currentB.toFixed(1);
        
        const selectedOption = funcSelect.options[funcSelect.selectedIndex];
        funcLatexStr = selectedOption.dataset.latex;
        const funcVal = selectedOption.value;
        
        switch (funcVal) {
            case 'x^2': currentFuncExpr = x => x*x; currentAntiderivativeExpr = x => Math.pow(x,3)/3; break;
            case '2*x': currentFuncExpr = x => 2*x; currentAntiderivativeExpr = x => x*x; break;
            case '3': currentFuncExpr = x => 3; currentAntiderivativeExpr = x => 3*x; break;
            case 'cos(x)': currentFuncExpr = x => Math.cos(x); currentAntiderivativeExpr = x => Math.sin(x); break;
            case 'exp(x)': currentFuncExpr = x => Math.exp(x); currentAntiderivativeExpr = x => Math.exp(x); break;
            default: currentFuncExpr = x => x*x; currentAntiderivativeExpr = x => Math.pow(x,3)/3;
        }

        const area = currentAntiderivativeExpr(currentB) - currentAntiderivativeExpr(currentA);
        
        graph.updateConfig({
            curves: [{ func: currentFuncExpr, color: '#4f46e5' }], // Indigo-600
            markers: [], 
            fillBelow: [{ func: currentFuncExpr, from: currentA, to: currentB, color: 'rgba(79, 70, 229, 0.3)' }], // Indigo-600 with opacity
            verticalLines: [
                {x: currentA, color: '#9ca3af', dash: [4,4], label: `a=${currentA.toFixed(1)}`}, // Slate-400
                {x: currentB, color: '#9ca3af', dash: [4,4], label: `b=${currentB.toFixed(1)}`}
            ]
        });

        outputDiv.innerHTML = `Area sotto $f(x) = ${funcLatexStr}$ da $a=${currentA.toFixed(1)}$ a $b=${currentB.toFixed(1)}$:
                               $\\int_{${currentA.toFixed(1)}}^{${currentB.toFixed(1)}} ${funcLatexStr} \\, dx = ${area.toFixed(3)}$`;
        setupMathJaxRendering(outputDiv);
        graph.getCanvas().setAttribute('aria-label', `Area sotto f(x) = ${selectedOption.text} da a=${currentA.toFixed(1)} a b=${currentB.toFixed(1)}. Valore integrale: ${area.toFixed(3)}.`);
    }

    funcSelect.addEventListener('change', updateAreaVisualizer);
    limitASlider.addEventListener('input', updateAreaVisualizer);
    limitBSlider.addEventListener('input', updateAreaVisualizer);
    updateAreaVisualizer();
}

function initIntegralPropertiesExplorer() {
    const container = document.getElementById('integral-properties-explorer');
    if (!container) return;
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Esploratore interattivo delle proprietà degli integrali (linearità, additività) in sviluppo.</p>`;
}

function initFundamentalTheoremVisualizer() {
     const container = document.getElementById('fundamental-theorem-visualizer');
    if (!container) return;
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Visualizzatore interattivo del Teorema Fondamentale del Calcolo Integrale in sviluppo.</p>`;
}

function initIntegralsParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="integrali"]');
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
                generateIntegralExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
            initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateIntegralExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateIntegralExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randCoeff = (allowZero = false, min_abs=1, max_abs=5) => {
        let coeff = randInt(min_abs,max_abs) * (Math.random() < 0.5 ? 1 : -1);
        return (coeff === 0 && !allowZero) ? (Math.random() < 0.5 ? min_abs : -min_abs) : coeff;
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
        case 'poly-integral-parametric':
            const a = userParams.a_poly_int !== undefined ? userParams.a_poly_int : randCoeff();
            const n_exp = userParams.n_poly_int !== undefined ? userParams.n_poly_int : randInt(0, 3); // exponent for x^n, allow 0 for constant
            const b = userParams.b_poly_int !== undefined ? userParams.b_poly_int : randCoeff(true); 
            const c = userParams.c_poly_int !== undefined ? userParams.c_poly_int : randInt(-5,5); 
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $a$: <input type="number" name="a_poly_int" value="${a}" class="p-1 border rounded">
                            $n$: <input type="number" name="n_poly_int" value="${n_exp}" min="0" class="p-1 border rounded">
                            $b$: <input type="number" name="b_poly_int" value="${b}" class="p-1 border rounded">
                            $c$: <input type="number" name="c_poly_int" value="${c}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare l'integrale indefinito: $\\int (${a}x^{${n_exp}} ${b>=0?'+':''} ${b}x ${c>=0?'+':''} ${c}) \\, dx$. ${htmlInputs}`;
            
            let intStr = "";
            // Integral of ax^n
            if (a !== 0) {
                if (n_exp === -1) { // Should not happen with n_exp >=0, but good practice
                    intStr += `${a}\\ln|x|`;
                } else {
                    const new_coeff_a_num = a;
                    const new_coeff_a_den = n_exp + 1;
                    const new_exp_a = n_exp + 1;
                    // Simplify fraction new_coeff_a_num / new_coeff_a_den
                    const common_divisor_a = gcd(Math.abs(new_coeff_a_num), new_coeff_a_den);
                    const simplified_num_a = new_coeff_a_num / common_divisor_a;
                    const simplified_den_a = new_coeff_a_den / common_divisor_a;

                    if (simplified_den_a === 1) {
                        intStr += `${simplified_num_a === 1 ? '' : (simplified_num_a === -1 ? '-' : simplified_num_a)}x` + (new_exp_a > 1 ? `^{${new_exp_a}}` : "");
                    } else {
                        intStr += `\\frac{${simplified_num_a}}{${simplified_den_a}}x` + (new_exp_a > 1 ? `^{${new_exp_a}}` : "");
                    }
                }
            }
            // Integral of bx
            if (b !== 0) {
                const new_coeff_b_num = b;
                const new_coeff_b_den = 2;
                const common_divisor_b = gcd(Math.abs(new_coeff_b_num), new_coeff_b_den);
                const simplified_num_b = new_coeff_b_num / common_divisor_b;
                const simplified_den_b = new_coeff_b_den / common_divisor_b;
                let b_term_str = "";
                if (simplified_den_b === 1) {
                    b_term_str = `${simplified_num_b === 1 ? '' : (simplified_num_b === -1 ? '-' : simplified_num_b)}x^2`;
                } else {
                     b_term_str = `\\frac{${simplified_num_b}}{${simplified_den_b}}x^2`;
                }
                intStr += (intStr !== "" && new_coeff_b_num > 0 ? " + " : (new_coeff_b_num < 0 ? (intStr !== "" ? " - " : "-") : (intStr !== "" ? " + " : ""))) + (new_coeff_b_num > 0 || intStr === "" ? b_term_str : b_term_str.substring(1) );
            }
             // Integral of c
            if (c !== 0) {
                 intStr += (intStr !== "" && c > 0 ? " + " : (c < 0 ? (intStr !== "" ? " - " : "-") : (intStr !== "" ? " + " : ""))) + `${Math.abs(c)}x`;
            }
            if (intStr === "") intStr = "0";

            solutionEl.innerHTML = `<p>Usando la linearità dell'integrale e la regola di potenza $\\int x^k dx = \\frac{x^{k+1}}{k+1} + C$ (per $k \\neq -1$):</p>
                                     <p>$\\int ${a}x^{${n_exp}} dx + \\int ${b}x dx + \\int ${c} dx$</p>
                                     <p>$= ${intStr} + C$</p>`;
            break;
        case 'definite-integral-poly-parametric':
            const da = userParams.da_def_int !== undefined ? userParams.da_def_int : randCoeff();
            const dn = userParams.dn_def_int !== undefined ? userParams.dn_def_int : randInt(0,3);
            const lim_inf = userParams.lim_inf_def_int !== undefined ? userParams.lim_inf_def_int : randInt(-2,1); // Ensure lim_inf < lim_sup
            const lim_sup = userParams.lim_sup_def_int !== undefined ? userParams.lim_sup_def_int : randInt(lim_inf + 1, lim_inf + 3);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            Coeff $a$: <input type="number" name="da_def_int" value="${da}" class="p-1 border rounded">
                            Esp. $n$: <input type="number" name="dn_def_int" value="${dn}" min="0" class="p-1 border rounded">
                            Lim Inf $a$: <input type="number" name="lim_inf_def_int" value="${lim_inf}" class="p-1 border rounded">
                            Lim Sup $b$: <input type="number" name="lim_sup_def_int" value="${lim_sup}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Calcolare l'integrale definito: $\\int_{${lim_inf}}^{${lim_sup}} ${da}x^{${dn}} \\, dx$. ${htmlInputs}`;
            
            let F_x_str;
            const F_x_exp = dn + 1;
            if (dn === -1) { // Should not be hit with dn >= 0
                F_x_str = `${da}\\ln|x|`;
            } else {
                const F_x_coeff_num = da;
                const F_x_coeff_den = dn + 1;
                const common_F = gcd(Math.abs(F_x_coeff_num), F_x_coeff_den);
                const simp_F_num = F_x_coeff_num / common_F;
                const simp_F_den = F_x_coeff_den / common_F;
                if (simp_F_den === 1) F_x_str = `${simp_F_num === 1 ? '' : (simp_F_num === -1 ? '-' : simp_F_num)}x^{${F_x_exp}}`;
                else F_x_str = `\\frac{${simp_F_num}}{${simp_F_den}}x^{${F_x_exp}}`;
            }
            
            const F_b = (da / (dn + 1)) * Math.pow(lim_sup, F_x_exp);
            const F_a = (da / (dn + 1)) * Math.pow(lim_inf, F_x_exp);
            const def_int_res = F_b - F_a;

            solutionEl.innerHTML = `<p>La primitiva di ${da}x^{${dn}} è $F(x) = ${F_x_str}$.</p>
                                     <p>Applicando il Teorema Fondamentale del Calcolo: $\\int_{a}^{b} f(x)dx = F(b) - F(a)$.</p>
                                     <p>$F(${lim_sup}) = ${F_x_str.replace(/x/g, `(${lim_sup})`)} = ${F_b.toFixed(3)}$</p>
                                     <p>$F(${lim_inf}) = ${F_x_str.replace(/x/g, `(${lim_inf})`)} = ${F_a.toFixed(3)}$</p>
                                     <p>Risultato: $${F_b.toFixed(3)} - (${F_a.toFixed(3)}) = ${def_int_res.toFixed(3)}$.</p>`;
            break;
        case 'integration-by-parts-parametric':
            const k_parts = userParams.a_parts !== undefined ? userParams.a_parts : randCoeff(false, 1, 3); // Coefficient for e.g. e^(kx)
            htmlInputs = `<div class="parametric-inputs mt-2">$k$: <input type="number" name="a_parts" value="${k_parts}" class="p-1 border rounded"></div>`;
            textEl.innerHTML = `Calcolare $\\int x e^{${k_parts}x} dx$ usando l'integrazione per parti. ${htmlInputs}`;
            
            // f(x) = x  => f'(x) = 1
            // g'(x) = e^(kx) => g(x) = (1/k)e^(kx)
            // int(f g') = fg - int(f' g)
            // = x * (1/k)e^(kx) - int(1 * (1/k)e^(kx)) dx
            // = (x/k)e^(kx) - (1/k) * (1/k)e^(kx)
            // = (x/k)e^(kx) - (1/k^2)e^(kx) + C
            // = (1/k^2) * e^(kx) * (kx - 1) + C
            
            let sol_parts_str;
            if (k_parts === 0) { // Special case if k=0, then integral is int(x * e^0) dx = int(x) dx
                 sol_parts_str = `Se $k=0$, l'integrale diventa $\\int x e^0 dx = \\int x dx = \\frac{1}{2}x^2 + C$.`;
            } else {
                 sol_parts_str = `Scegliamo $f(x) = x \\implies f'(x)=1$.<br>
                                 Scegliamo $g'(x) = e^{${k_parts}x} \\implies g(x) = \\frac{1}{${k_parts}}e^{${k_parts}x}$.<br>
                                 Applicando la formula $\\int f g' dx = fg - \\int f'g dx$:<br>
                                 $\\int x e^{${k_parts}x} dx = x \\cdot \\frac{1}{${k_parts}}e^{${k_parts}x} - \\int 1 \\cdot \\frac{1}{${k_parts}}e^{${k_parts}x} dx$<br>
                                 $= \\frac{x}{${k_parts}}e^{${k_parts}x} - \\frac{1}{${k_parts}} \\int e^{${k_parts}x} dx$<br>
                                 $= \\frac{x}{${k_parts}}e^{${k_parts}x} - \\frac{1}{${k_parts}} \\cdot \\frac{1}{${k_parts}}e^{${k_parts}x} + C$<br>
                                 $= \\frac{x}{${k_parts}}e^{${k_parts}x} - \\frac{1}{${k_parts*k_parts}}e^{${k_parts}x} + C$<br>
                                 Oppure, raccogliendo: $= \\frac{1}{${k_parts*k_parts}}e^{${k_parts}x}(${k_parts}x - 1) + C$.`;
            }
            solutionEl.innerHTML = `<p>${sol_parts_str}</p>`;
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
            generateIntegralExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}

function gcd(a, b) { // Helper for simplifying fractions
  return b === 0 ? a : gcd(b, a % b);
}
