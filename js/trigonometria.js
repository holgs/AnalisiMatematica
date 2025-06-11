// Interactive elements and functionality specific to the trigonometry section

document.addEventListener('DOMContentLoaded', function() {
    if (typeof createTriangleSolver === 'function') {
        createTriangleSolver('triangle-solver-container'); 
    } else {
        console.error("createTriangleSolver function not found. Make sure interactive.js is loaded correctly.");
    }
    
    initLawOfSinesCosinesVisualizer();
    initTrigonometryParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initLawOfSinesCosinesVisualizer() {
    const container = document.getElementById('law-sines-cosines-visualizer');
    if (!container) return;

    // Static content is fine for this, already in HTML. 
    // If interactivity is added later, this function can be expanded.
    // Ensure MathJax processes this content if not already handled globally
    if (typeof setupMathJaxRendering === 'function') {
        setupMathJaxRendering(container);
    }
}


function initTrigonometryParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="trigonometria"]');
    parametricExercises.forEach(exercise => {
        const exerciseId = exercise.getAttribute('data-exercise-id');
        const generateBtn = exercise.querySelector('.generate-btn');
        const exerciseTextEl = exercise.querySelector('.exercise-text');
        const solutionContentEl = exercise.querySelector('.solution-content');

        if (generateBtn && exerciseTextEl && solutionContentEl) {
            generateBtn.addEventListener('click', () => {
                const params = {};
                const currentInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select');
                currentInputs.forEach(input => {
                     params[input.name] = input.type === 'number' ? parseFloat(input.value) : input.value;
                });
                generateTrigonometryExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select');
            initialInputs.forEach(input => {
                initialParams[input.name] = input.type === 'number' ? parseFloat(input.value) : input.value;
            });
            generateTrigonometryExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateTrigonometryExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min, max, dec=1) => parseFloat((Math.random() * (max-min) + min).toFixed(dec));
    const tolerance = 1e-9; // For float comparisons
    
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
        case 'solve-triangle-sss-parametric': 
            let s1, s2, s3;
            let attempts = 0;
            do {
                s1 = userParams.s1_sss !== undefined && attempts === 0 ? userParams.s1_sss : randFloat(5, 15, 1);
                s2 = userParams.s2_sss !== undefined && attempts === 0 ? userParams.s2_sss : randFloat(5, 15, 1);
                // Ensure s3 allows a triangle to be formed, but also allow some randomness
                const min_s3 = Math.abs(s1 - s2) + 0.5; // Slightly more than difference
                const max_s3 = s1 + s2 - 0.5;      // Slightly less than sum
                s3 = userParams.s3_sss !== undefined && attempts === 0 ? userParams.s3_sss : randFloat(Math.max(1, min_s3), Math.max(min_s3 + 1, max_s3), 1);
                attempts++;
            } while ((s1+s2 <= s3 + tolerance || s1+s3 <= s2 + tolerance || s2+s3 <= s1 + tolerance || s1<=0 || s2<=0 || s3<=0) && attempts < 10);
            
            if (attempts >= 10 && (s1+s2 <= s3 + tolerance || s1+s3 <= s2 + tolerance || s2+s3 <= s1 + tolerance)) {
                 textEl.innerHTML = `Errore nella generazione dei lati per SSS. Riprova.`;
                 solutionEl.innerHTML = `<p class="text-red-500">Impossibile generare lati validi.</p>`;
                 setupMathJaxRendering(textEl.closest('.parametric-exercise'));
                 return;
            }


            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            Lato a: <input type="number" step="0.1" name="s1_sss" value="${s1.toFixed(1)}" class="p-1 border rounded">
                            Lato b: <input type="number" step="0.1" name="s2_sss" value="${s2.toFixed(1)}" class="p-1 border rounded">
                            Lato c: <input type="number" step="0.1" name="s3_sss" value="${s3.toFixed(1)}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvi un triangolo dati i lati $a=${s1.toFixed(1)}, b=${s2.toFixed(1)}, c=${s3.toFixed(1)}$. Trova tutti gli angoli (A, B, C). ${htmlInputs}`;
            
            const cosA_val = (s2*s2 + s3*s3 - s1*s1) / (2*s2*s3);
            const cosB_val = (s1*s1 + s3*s3 - s2*s2) / (2*s1*s3);
            
            if (Math.abs(cosA_val) > 1 + tolerance || Math.abs(cosB_val) > 1 + tolerance) {
                solutionEl.innerHTML = `<p class="text-red-500">I lati forniti non possono formare un triangolo valido (valore del coseno fuori range [-1, 1]). Lati: a=${s1}, b=${s2}, c=${s3}. CosA=${cosA_val.toFixed(3)}, CosB=${cosB_val.toFixed(3)}</p>`;
                break;
            }
            // Clip values to be strictly within [-1, 1] for acos robustness
            const angleA_rad = Math.acos(Math.max(-1, Math.min(1, cosA_val)));
            const angleB_rad = Math.acos(Math.max(-1, Math.min(1, cosB_val)));
            const angleC_rad = Math.PI - angleA_rad - angleB_rad;
            
            const angleA_deg = angleA_rad * 180 / Math.PI;
            const angleB_deg = angleB_rad * 180 / Math.PI;
            const angleC_deg = angleC_rad * 180 / Math.PI;

            if (angleA_deg <= tolerance || angleB_deg <= tolerance || angleC_deg <= tolerance || Math.abs(angleA_deg + angleB_deg + angleC_deg - 180) > 0.1 ) {
                 solutionEl.innerHTML = `<p class="text-red-500">I lati forniti non possono formare un triangolo valido (angoli non positivi o somma errata: A=${angleA_deg.toFixed(1)}, B=${angleB_deg.toFixed(1)}, C=${angleC_deg.toFixed(1)}).</p>`;
                 break;
            }

            solutionEl.innerHTML = `<p>Usando il Teorema del Coseno:</p>
                                     <p>$A = \\arccos\\left(\\frac{b^2+c^2-a^2}{2bc}\\right) = \\arccos\\left(\\frac{${s2.toFixed(1)}^2+${s3.toFixed(1)}^2-${s1.toFixed(1)}^2}{2\\cdot${s2.toFixed(1)}\\cdot${s3.toFixed(1)}}\\right) \\approx ${angleA_deg.toFixed(2)}^\\circ$</p>
                                     <p>$B = \\arccos\\left(\\frac{a^2+c^2-b^2}{2ac}\\right) = \\arccos\\left(\\frac{${s1.toFixed(1)}^2+${s3.toFixed(1)}^2-${s2.toFixed(1)}^2}{2\\cdot${s1.toFixed(1)}\\cdot${s3.toFixed(1)}}\\right) \\approx ${angleB_deg.toFixed(2)}^\\circ$</p>
                                     <p>$C = 180^\\circ - A - B \\approx 180^\\circ - ${angleA_deg.toFixed(2)}^\\circ - ${angleB_deg.toFixed(2)}^\\circ \\approx ${angleC_deg.toFixed(2)}^\\circ$</p>`;
            break;

        case 'solve-triangle-sas-parametric': 
            const side1_sas = userParams.side1_sas !== undefined ? userParams.side1_sas : randFloat(5,12,1);
            const side2_sas = userParams.side2_sas !== undefined ? userParams.side2_sas : randFloat(5,12,1);
            const angleC_sas_deg = userParams.angleC_sas_deg !== undefined ? userParams.angleC_sas_deg : randInt(20, 140); 
            const angleC_sas_rad = angleC_sas_deg * Math.PI / 180;

            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            Lato a: <input type="number" step="0.1" name="side1_sas" value="${side1_sas.toFixed(1)}" class="p-1 border rounded">
                            Lato b: <input type="number" step="0.1" name="side2_sas" value="${side2_sas.toFixed(1)}" class="p-1 border rounded">
                            Angolo C (°): <input type="number" name="angleC_sas_deg" value="${angleC_sas_deg}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvi un triangolo dati i lati $a=${side1_sas.toFixed(1)}, b=${side2_sas.toFixed(1)}$ e l'angolo compreso $C=${angleC_sas_deg}^\\circ$. Trova il lato $c$ e gli angoli $A, B$. ${htmlInputs}`;

            const side3_sas_sq = side1_sas*side1_sas + side2_sas*side2_sas - 2*side1_sas*
side2_sas*Math.cos(angleC_sas_rad);
            if (side3_sas_sq <= tolerance) {
                solutionEl.innerHTML = `<p class="text-red-500">Impossibile calcolare il terzo lato (radice di un numero negativo o nullo). Controlla i dati.</p>`;
                break;
            }
            const side3_sas = Math.sqrt(side3_sas_sq);
            
            const cosA_sas_val = (side2_sas*side2_sas + side3_sas*side3_sas - side1_sas*side1_sas) / (2*side2_sas*side3_sas);
             if (Math.abs(cosA_sas_val) > 1 + tolerance) {
                solutionEl.innerHTML = `<p class="text-red-500">Errore nel calcolo dell'angolo A (valore del coseno ${cosA_sas_val.toFixed(3)} fuori range [-1, 1]).</p>`;
                break;
            }
            const angleA_sas_rad = Math.acos(Math.max(-1, Math.min(1, cosA_sas_val)));
            const angleA_sas_deg = angleA_sas_rad * 180 / Math.PI;
            const angleB_sas_deg = 180 - angleA_sas_deg - angleC_sas_deg;

             if (side3_sas <= tolerance || angleA_sas_deg <= tolerance || angleB_sas_deg <= tolerance || Math.abs(angleA_sas_deg + angleB_sas_deg + angleC_sas_deg - 180) > 0.1) {
                 solutionEl.innerHTML = `<p class="text-red-500">Soluzione non valida (lati/angoli negativi/nulli o somma angoli errata).</p>`;
                 break;
            }

            solutionEl.innerHTML = `<p>Usando il Teorema del Coseno per trovare il lato $c$:</p>
                                     <p>$c^2 = a^2 + b^2 - 2ab \\cos C$</p>
                                     <p>$c = \\sqrt{${side1_sas.toFixed(1)}^2 + ${side2_sas.toFixed(1)}^2 - 2 \\cdot ${side1_sas.toFixed(1)} \\cdot ${side2_sas.toFixed(1)} \\cdot \\cos(${angleC_sas_deg}^\\circ)} \\approx ${side3_sas.toFixed(2)}$</p>
                                     <p>Usando il Teorema del Coseno (o dei Seni) per trovare l'angolo $A$:</p>
                                     <p>$A = \\arccos\\left(\\frac{b^2+c^2-a^2}{2bc}\\right) \\approx \\arccos\\left(\\frac{${side2_sas.toFixed(1)}^2+${side3_sas.toFixed(2)}^2-${side1_sas.toFixed(1)}^2}{2\\cdot${side2_sas.toFixed(1)}\\cdot${side3_sas.toFixed(2)}}\\right) \\approx ${angleA_sas_deg.toFixed(2)}^\\circ$</p>
                                     <p>Infine, $B = 180^\\circ - A - C \\approx 180^\\circ - ${angleA_sas_deg.toFixed(2)}^\\circ - ${angleC_sas_deg}^\\circ \\approx ${angleB_sas_deg.toFixed(2)}^\\circ$</p>`;
            break;
        case 'apply-addition-formula-parametric':
            // sin(alpha+beta) = sin(alpha)cos(beta) + cos(alpha)sin(beta)
            // Generate alpha and beta in degrees, then get their sin/cos
            const alpha_deg = userParams.alpha_deg !== undefined ? userParams.alpha_deg : [30, 45, 60][randInt(0,2)];
            const beta_deg = userParams.beta_deg !== undefined ? userParams.beta_deg : [30, 45, 60][randInt(0,2)];
            const alpha_rad = alpha_deg * Math.PI / 180;
            const beta_rad = beta_deg * Math.PI / 180;

            const sin_alpha = Math.sin(alpha_rad);
            const cos_alpha = Math.cos(alpha_rad);
            const sin_beta = Math.sin(beta_rad);
            const cos_beta = Math.cos(beta_rad);
            const target_func = userParams.target_func || 'sin'; // 'sin', 'cos', 'tan'
            
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                           Funzione: <select name="target_func" class="p-1 border rounded">
                                <option value="sin" ${target_func==='sin'?'selected':''}>sin(α+β)</option>
                                <option value="cos" ${target_func==='cos'?'selected':''}>cos(α+β)</option>
                                <option value="tan" ${target_func==='tan'?'selected':''}>tan(α+β)</option>
                           </select>
                           Angolo α (°): <input type="number" name="alpha_deg" value="${alpha_deg}" class="p-1 border rounded">
                           Angolo β (°): <input type="number" name="beta_deg" value="${beta_deg}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Dati $\\alpha = ${alpha_deg}^\\circ$ e $\\beta = ${beta_deg}^\\circ$, calcola $\\${target_func}(\\alpha+\\beta)$ usando le formule di addizione. 
                               (Valori noti: $\\sin\\alpha \\approx ${sin_alpha.toFixed(3)}, \\cos\\alpha \\approx ${cos_alpha.toFixed(3)}, \\sin\\beta \\approx ${sin_beta.toFixed(3)}, \\cos\\beta \\approx ${cos_beta.toFixed(3)}$). ${htmlInputs}`;
            
            let result_val, formula_str, calc_str;
            if (target_func === 'sin') {
                result_val = sin_alpha * cos_beta + cos_alpha * sin_beta;
                formula_str = `$\\sin(\\alpha+\\beta) = \\sin\\alpha\\cos\\beta + \\cos\\alpha\\sin\\beta$`;
                calc_str = `$= (${sin_alpha.toFixed(3)})(${cos_beta.toFixed(3)}) + (${cos_alpha.toFixed(3)})(${sin_beta.toFixed(3)}) \\approx ${result_val.toFixed(3)}$`;
            } else if (target_func === 'cos') {
                result_val = cos_alpha * cos_beta - sin_alpha * sin_beta;
                formula_str = `$\\cos(\\alpha+\\beta) = \\cos\\alpha\\cos\\beta - \\sin\\alpha\\sin\\beta$`;
                calc_str = `$= (${cos_alpha.toFixed(3)})(${cos_beta.toFixed(3)}) - (${sin_alpha.toFixed(3)})(${sin_beta.toFixed(3)}) \\approx ${result_val.toFixed(3)}$`;
            } else { // tan
                const tan_alpha = Math.tan(alpha_rad);
                const tan_beta = Math.tan(beta_rad);
                if (Math.abs(1 - tan_alpha*tan_beta) < tolerance) {
                    solutionEl.innerHTML = `<p class="text-red-500">$\\tan(\\alpha+\\beta)$ non è definita perché il denominatore $1 - \\tan\\alpha\\tan\\beta$ è zero.</p>`;
                    break;
                }
                result_val = (tan_alpha + tan_beta) / (1 - tan_alpha*tan_beta);
                formula_str = `$\\tan(\\alpha+\\beta) = \\frac{\\tan\\alpha + \\tan\\beta}{1 - \\tan\\alpha\\tan\\beta}$`;
                calc_str = `Valori noti: $\\tan\\alpha \\approx ${tan_alpha.toFixed(3)}, \\tan\\beta \\approx ${tan_beta.toFixed(3)}$. <br>
                            $= \\frac{${tan_alpha.toFixed(3)} + ${tan_beta.toFixed(3)}}{1 - (${tan_alpha.toFixed(3)})(${tan_beta.toFixed(3)})} \\approx ${result_val.toFixed(3)}$`;
            }
            solutionEl.innerHTML = `<p>Formula: ${formula_str}</p><p>Calcolo: ${calc_str}</p><p>Verifica diretta: $\\${target_func}(${alpha_deg+\beta_deg}^\\circ) \\approx ${Math[target_func]((alpha_deg+beta_deg)*Math.PI/180).toFixed(3)}$</p>`;
            break;
        default:
            textEl.innerHTML = "Esercizio non definito.";
            solutionEl.innerHTML = "";
            return;
    }
     // Re-attach input listeners
    const newInputs = textEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select');
    newInputs.forEach(input => {
        input.addEventListener('change', () => { 
            const params = {};
            textEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select').forEach(i => {
                params[i.name] = i.type === 'number' ? parseFloat(i.value) : i.value;
            });
            generateTrigonometryExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
