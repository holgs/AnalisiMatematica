// Interactive elements and functionality specific to the goniometry section

document.addEventListener('DOMContentLoaded', function() {
    initUnitCircle();
    initTrigonometricGraph();
    initAssociatedAnglesCalculator();
    initGoniometryParametricExercises(); 
    // Collapsibles and solutions are handled by main.js
});

function initUnitCircle() {
    const unitCircleContainer = document.getElementById('unit-circle-canvas-container');
    if (!unitCircleContainer) {
        console.warn("Unit circle container 'unit-circle-canvas-container' not found.");
        return;
    }
    if (typeof createUnitCircle === "function") {
        createUnitCircle('unit-circle-canvas-container'); 
    } else {
        console.error("createUnitCircle function not found. Make sure interactive.js is loaded.");
    }
}

function initTrigonometricGraph() {
    const graphContainer = document.getElementById('trigonometric-graph-interactive'); 
    if (!graphContainer) return;
    graphContainer.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'trigonometric-canvas';
    canvasDiv.className = 'canvas-container h-96 mb-4'; 
    graphContainer.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="trig-func-select" class="block text-sm font-medium text-gray-700">Funzione:</label>
            <select id="trig-func-select" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                <option value="sin" selected>$A \\sin(B(x-C)) + D$</option>
                <option value="cos">$A \\cos(B(x-C)) + D$</option>
                <option value="tan">$A \\tan(B(x-C)) + D$</option>
                <option value="cot">$A \\cot(B(x-C)) + D$</option>
            </select>
        </div>
        <div>
            <label for="trig-A" class="block text-sm font-medium text-gray-700">Ampiezza (A): <span id="trig-A-val" class="font-semibold">1</span></label>
            <input type="range" id="trig-A" min="0.1" max="5" step="0.1" value="1" class="custom-slider" aria-labelledby="trig-A-val">
        </div>
        <div>
            <label for="trig-B" class="block text-sm font-medium text-gray-700">Pulsazione (B): <span id="trig-B-val" class="font-semibold">1</span></label>
            <input type="range" id="trig-B" min="0.1" max="5" step="0.1" value="1" class="custom-slider" aria-labelledby="trig-B-val">
        </div>
        <div>
            <label for="trig-C" class="block text-sm font-medium text-gray-700">Sfasamento (C): <span id="trig-C-val" class="font-semibold">0</span></label>
            <input type="range" id="trig-C" min="-3.14" max="3.14" step="0.01" value="0" class="custom-slider" aria-labelledby="trig-C-val"> <!-- Approx -pi to pi -->
        </div>
        <div>
            <label for="trig-D" class="block text-sm font-medium text-gray-700">Trasl. Verticale (D): <span id="trig-D-val" class="font-semibold">0</span></label>
            <input type="range" id="trig-D" min="-3" max="3" step="0.1" value="0" class="custom-slider" aria-labelledby="trig-D-val">
        </div>
        <div class="md:col-span-2 lg:col-span-3">
             <p id="trig-equation-display" class="text-sm text-gray-700 font-mono p-2 bg-gray-100 rounded min-h-[40px]" aria-live="polite"></p>
        </div>
    `;
    graphContainer.appendChild(controlsDiv);

    const selectEl = document.getElementById('trig-func-select');
    const aSlider = document.getElementById('trig-A');
    const bSlider = document.getElementById('trig-B');
    const cSlider = document.getElementById('trig-C');
    const dSlider = document.getElementById('trig-D');
    const aVal = document.getElementById('trig-A-val');
    const bVal = document.getElementById('trig-B-val');
    const cVal = document.getElementById('trig-C-val');
    const dVal = document.getElementById('trig-D-val');
    const equationDisplay = document.getElementById('trig-equation-display');

    const graph = createFunctionGraph('trigonometric-canvas', null, { 
        xMin: -2 * Math.PI, xMax: 2 * Math.PI,
        yMin: -5, yMax: 5, 
        gridStep: Math.PI / 4, // Finer grid
        xAxisLabelInterval: Math.PI / 2, // Labels every pi/2
        xAxisLabels: {
            [-2*Math.PI]: '-2π', [-1.5*Math.PI]: '-3π/2', [-Math.PI]: '-π', [-0.5*Math.PI]: '-π/2',
            0: '0',
            [0.5*Math.PI]: 'π/2', [Math.PI]: 'π', [1.5*Math.PI]: '3π/2', [2*Math.PI]: '2π'
        },
        responsive: true,
        ariaLabel: "Grafico interattivo di funzioni goniometriche. Modifica i parametri A, B, C, D per vedere come cambia il grafico."
    });
    if (!graph) return;

    function updateTrigGraph() {
        const A = parseFloat(aSlider.value);
        const B = parseFloat(bSlider.value);
        const C = parseFloat(cSlider.value);
        const D = parseFloat(dSlider.value);
        const type = selectEl.value;

        aVal.textContent = A.toFixed(1);
        bVal.textContent = B.toFixed(1);
        cVal.textContent = C.toFixed(2);
        dVal.textContent = D.toFixed(1);
        
        let func, eqText, yRange = { min: D - Math.abs(A) - 1, max: D + Math.abs(A) + 1};
        let curves = [];
        let verticalLines = []; // For asymptotes

        let C_sign = C < 0 ? '+' : '-';
        let C_abs = Math.abs(C).toFixed(2);
        let D_sign = D < 0 ? '-' : '+';
        let D_abs = Math.abs(D).toFixed(1);
        if (Math.abs(D) < 1e-9 && D_sign === '+') D_sign = ""; // Don't show +0

        switch (type) {
            case 'sin':
                func = x => A * Math.sin(B * (x - C)) + D;
                eqText = `${A.toFixed(1)} \\sin(${B.toFixed(1)}(x ${C_sign} ${C_abs})) ${D_sign} ${D_abs}`;
                break;
            case 'cos':
                func = x => A * Math.cos(B * (x - C)) + D;
                eqText = `${A.toFixed(1)} \\cos(${B.toFixed(1)}(x ${C_sign} ${C_abs})) ${D_sign} ${D_abs}`;
                break;
            case 'tan':
                func = x => A * Math.tan(B * (x - C)) + D;
                eqText = `${A.toFixed(1)} \\tan(${B.toFixed(1)}(x ${C_sign} ${C_abs})) ${D_sign} ${D_abs}`;
                yRange = { min: -10, max: 10 }; 
                for (let k = -10; k <= 10; k++) { // More asymptotes
                    if (B !== 0) verticalLines.push({ x: C + (Math.PI/2 + k*Math.PI)/B, color: '#e2e8f0', dash: [2,2] });
                }
                break;
            case 'cot':
                func = x => {
                    const tanVal = Math.tan(B * (x - C));
                    if (Math.abs(tanVal) < 1e-9) return B > 0 ? Infinity : -Infinity; // Handle vertical asymptotes
                    return A * (1 / tanVal) + D;
                };
                eqText = `${A.toFixed(1)} \\cot(${B.toFixed(1)}(x ${C_sign} ${C_abs})) ${D_sign} ${D_abs}`;
                yRange = { min: -10, max: 10 }; 
                for (let k = -10; k <= 10; k++) {
                     if (B !== 0) verticalLines.push({ x: C + (k*Math.PI)/B, color: '#e2e8f0', dash: [2,2] });
                }
                break;
        }
        curves.push({ func: func, color: '#4f46e5' });
        graph.updateConfig({ curves: curves, yMin: yRange.min, yMax: yRange.max, verticalLines: verticalLines });
        equationDisplay.innerHTML = `Equazione: $y = ${eqText}$`;
        setupMathJaxRendering(equationDisplay);
    }

    [selectEl, aSlider, bSlider, cSlider, dSlider].forEach(el => el.addEventListener('input', updateTrigGraph));
    updateTrigGraph();
}


function initAssociatedAnglesCalculator() {
    const container = document.getElementById('associated-angles-calculator');
    if (!container) return;

    const angleInput = container.querySelector('#reference-angle-input');
    const unitSelect = container.querySelector('#angle-unit-select');
    const associatedTypeSelect = container.querySelector('#associated-angle-type');
    const trigFunctionSelect = container.querySelector('#trig-function-select');
    const resultsDiv = container.querySelector('#associated-angles-results');

    if(!angleInput || !unitSelect || !associatedTypeSelect || !trigFunctionSelect || !resultsDiv) {
        console.error("Elementi per il calcolatore angoli associati non trovati.");
        return;
    }

    function calculateAssociatedAngle() {
        let angle = parseFloat(angleInput.value);
        const unit = unitSelect.value;
        const type = associatedTypeSelect.value;
        const funcName = trigFunctionSelect.value;

        if (isNaN(angle)) {
            resultsDiv.innerHTML = `<p class="text-red-500">Inserisci un angolo valido.</p>`; return;
        }

        const angleRadOriginal = unit === 'deg' ? angle * Math.PI / 180 : angle;
        const angleDegOriginal = unit === 'rad' ? angle * 180 / Math.PI : angle;

        let targetAngleRad, relationStr;
        let finalFuncName = funcName; // Func name might change (e.g. sin to cos)
        let sign = ""; // Sign of the resulting function

        switch (type) {
            case '-a': targetAngleRad = -angleRadOriginal; 
                relationStr = `${funcName}(-\\alpha) = `;
                if (funcName === 'sin' || funcName === 'tan' || funcName === 'cot') sign = "-";
                break;
            case 'pi/2-a': targetAngleRad = Math.PI/2 - angleRadOriginal;
                relationStr = `${funcName}(\\pi/2 - \\alpha) = `;
                if (funcName === 'sin') finalFuncName = 'cos'; else if (funcName === 'cos') finalFuncName = 'sin';
                else if (funcName === 'tan') finalFuncName = 'cot'; else if (funcName === 'cot') finalFuncName = 'tan';
                break;
            case 'pi/2+a': targetAngleRad = Math.PI/2 + angleRadOriginal;
                relationStr = `${funcName}(\\pi/2 + \\alpha) = `;
                if (funcName === 'sin') finalFuncName = 'cos'; 
                else if (funcName === 'cos') { finalFuncName = 'sin'; sign = "-"; }
                else if (funcName === 'tan') { finalFuncName = 'cot'; sign = "-"; }
                else if (funcName === 'cot') { finalFuncName = 'tan'; sign = "-"; }
                break;
            case 'pi-a': targetAngleRad = Math.PI - angleRadOriginal;
                relationStr = `${funcName}(\\pi - \\alpha) = `;
                if (funcName === 'cos' || funcName === 'tan' || funcName === 'cot') sign = "-";
                break;
            case 'pi+a': targetAngleRad = Math.PI + angleRadOriginal;
                relationStr = `${funcName}(\\pi + \\alpha) = `;
                if (funcName === 'sin' || funcName === 'cos') sign = "-";
                break;
            case '3pi/2-a': targetAngleRad = 3*Math.PI/2 - angleRadOriginal;
                relationStr = `${funcName}(3\\pi/2 - \\alpha) = `;
                if (funcName === 'sin') {finalFuncName = 'cos'; sign = "-";}
                else if (funcName === 'cos') {finalFuncName = 'sin'; sign = "-";}
                else if (funcName === 'tan') finalFuncName = 'cot';
                else if (funcName === 'cot') finalFuncName = 'tan';
                break;
            case '3pi/2+a': targetAngleRad = 3*Math.PI/2 + angleRadOriginal;
                relationStr = `${funcName}(3\\pi/2 + \\alpha) = `;
                if (funcName === 'sin') {finalFuncName = 'cos'; sign = "-";}
                else if (funcName === 'cos') finalFuncName = 'sin';
                else if (funcName === 'tan') {finalFuncName = 'cot'; sign = "-";}
                else if (funcName === 'cot') {finalFuncName = 'tan'; sign = "-";}
                break;
            case '2pi-a': targetAngleRad = 2*Math.PI - angleRadOriginal; // Same as -alpha
                relationStr = `${funcName}(2\\pi - \\alpha) = `;
                if (funcName === 'sin' || funcName === 'tan' || funcName === 'cot') sign = "-";
                break;
        }
        relationStr += `${sign}\\${finalFuncName}(\\alpha)`;

        let resultVal;
        if (funcName === 'sin') resultVal = Math.sin(targetAngleRad);
        else if (funcName === 'cos') resultVal = Math.cos(targetAngleRad);
        else if (funcName === 'tan') resultVal = Math.tan(targetAngleRad);
        else if (funcName === 'cot') resultVal = 1 / Math.tan(targetAngleRad);
        
        const originalFuncVal = 
            funcName === 'sin' ? Math.sin(angleRadOriginal) : 
            funcName === 'cos' ? Math.cos(angleRadOriginal) : 
            funcName === 'tan' ? Math.tan(angleRadOriginal) : 1/Math.tan(angleRadOriginal);

        resultsDiv.innerHTML = `
            <p>Angolo $\\alpha = ${angleDegOriginal.toFixed(2)}° = ${angleRadOriginal.toFixed(3)}$ rad</p>
            <p>Formula: $${relationStr}$</p>
            <p>Valore di $${funcName}(${associatedTypeSelect.options[associatedTypeSelect.selectedIndex].text.replace(/\s/g,'')})${isFinite(resultVal) ? ` $\\approx ${resultVal.toFixed(4)}$` : ` non è definito`}</p>
            <p>(Valore di riferimento: $${funcName}(\\alpha)$${isFinite(originalFuncVal) ? ` $\\approx ${originalFuncVal.toFixed(4)}$` : ` non è definito`})</p>
        `;
        if (!isFinite(resultVal) || ( (funcName === 'tan' || funcName === 'cot') && Math.abs(Math.cos(targetAngleRad)) < 1e-9 && funcName === 'tan') || ( (funcName === 'tan' || funcName === 'cot') && Math.abs(Math.sin(targetAngleRad)) < 1e-9 && funcName === 'cot') ) {
             resultsDiv.innerHTML += `<p class="text-red-500 mt-1">Attenzione: ${funcName} non definito per l'angolo risultante (o l'angolo originale se la funzione è ${funcName}).</p>`;
        }
        setupMathJaxRendering(resultsDiv);
    }

    [angleInput, unitSelect, associatedTypeSelect, trigFunctionSelect].forEach(el => el.addEventListener('input', calculateAssociatedAngle));
    calculateAssociatedAngle(); // Initial call
}


function initGoniometryParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="goniometria"]');
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
                generateGoniometryExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                 initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
             const initialParams = {};
             const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select');
             initialInputs.forEach(input => {
                initialParams[input.name] = input.type === 'number' ? parseFloat(input.value) : input.value;
            });
            generateGoniometryExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateGoniometryExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const commonAnglesDeg = [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330, 360];
    const commonAnglesRadText = ["0", "\\pi/6", "\\pi/4", "\\pi/3", "\\pi/2", "2\\pi/3", "3\\pi/4", "5\\pi/6", "\\pi", "7\\pi/6", "5\\pi/4", "4\\pi/3", "3\\pi/2", "5\\pi/3", "7\\pi/4", "11\\pi/6", "2\\pi"];
    
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
        case 'angle-conversion-parametric':
            const toRad = userParams.conversion_type === undefined ? (Math.random() < 0.5) : (userParams.conversion_type === 'to_rad');
            let angleDeg, angleRadStrInput, angleRadMath;

            if (toRad) {
                angleDeg = userParams.deg_val !== undefined ? userParams.deg_val : commonAnglesDeg[randInt(0, commonAnglesDeg.length-1)];
                htmlInputs = `<div class="parametric-inputs mt-2">
                                Tipo: <input type="hidden" name="conversion_type" value="to_rad">
                                Angolo in Gradi: <input type="number" name="deg_val" value="${angleDeg}" class="p-1 border rounded w-24" aria-label="Angolo in gradi">
                              </div>`;
                textEl.innerHTML = `Convertire ${angleDeg}° in radianti. ${htmlInputs}`;
                
                const radVal = angleDeg * Math.PI / 180;
                const gcd = (a, b) => b ? gcd(b, a % b) : a;
                const common = gcd(angleDeg, 180);
                const num = angleDeg / common;
                const den = 180 / common;
                let angleRadTextDisplay = den === 1 ? (num === 0 ? "0" : (num === 1 ? "\\pi" : `${num}\\pi`)) : (num === 0 ? "0" : (num === 1 ? `\\frac{\\pi}{${den}}` : `\\frac{${num}\\pi}{${den}}`));
                if(angleDeg % 180 === 0 && angleDeg !== 0 && angleDeg !== 180 && num !==1){ // e.g. 360 = 2pi
                     angleRadTextDisplay = `${num}\\pi`;
                } else if (angleDeg === 0) angleRadTextDisplay = "0";

                solutionEl.innerHTML = `<p>$${angleDeg}^\\circ \\times \\frac{\\pi}{180^\\circ} = ${angleRadTextDisplay}$ radianti ($\\approx ${radVal.toFixed(4)}$ rad).</p>`;
            } else { // to Degrees
                const idx = userParams.rad_idx !== undefined ? userParams.rad_idx : randInt(0, commonAnglesRadText.length-1);
                angleRadStrInput = commonAnglesRadText[idx]; // e.g. "\\pi/6"
                angleDeg = commonAnglesDeg[idx]; // Corresponding degree value for calculation
                
                htmlInputs = `<div class="parametric-inputs mt-2">
                                Tipo: <input type="hidden" name="conversion_type" value="to_deg">
                                Angolo in Radianti (es. pi/4, 2pi/3): <input type="text" name="rad_str_val" value="${angleRadStrInput.replace(/\\/g, '')}" class="p-1 border rounded w-32" aria-label="Angolo in radianti">
                                <input type="hidden" name="rad_idx" value="${idx}"> <!-- Store index for consistent regeneration if user doesn't change text -->
                              </div>`;
                textEl.innerHTML = `Convertire $${angleRadStrInput}$ radianti in gradi. ${htmlInputs}`;
                
                angleRadMath = angleDeg * Math.PI / 180; // Use known degree value for precise calculation
                const degResult = angleRadMath * 180 / Math.PI;
                solutionEl.innerHTML = `<p>$${angleRadStrInput} \\times \\frac{180^\\circ}{\\pi} = ${degResult.toFixed(0)}^\\circ$.</p>`;
            }
            break;
        case 'evaluate-trig-parametric':
            const funcNames = ['sin', 'cos', 'tan', 'cot'];
            const func = userParams.func_eval || funcNames[randInt(0, funcNames.length-1)];
            const angleIdxEval = userParams.angle_idx_eval !== undefined ? userParams.angle_idx_eval : randInt(0, commonAnglesDeg.length-1);
            const angleValDegEval = commonAnglesDeg[angleIdxEval];
            const angleValRadEval = angleValDegEval * Math.PI / 180;
            const angleValRadStrEval = commonAnglesRadText[angleIdxEval];
            
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2 items-center">
                            Funzione: <select name="func_eval" class="p-1 border rounded" aria-label="Funzione goniometrica">
                                ${funcNames.map(f => `<option value="${f}" ${f===func ? 'selected':''}>${f}</option>`).join('')}
                            </select>
                            Angolo: <select name="angle_idx_eval" class="p-1 border rounded" aria-label="Angolo comune">
                                ${commonAnglesDeg.map((deg, i) => `<option value="${i}" ${i===angleIdxEval ? 'selected':''}>${deg}° (${commonAnglesRadText[i].replace(/\\/g, '')})</option>`).join('')}
                            </select>
                          </div>`;
            textEl.innerHTML = `Calcolare $\\${func}(${angleValDegEval}^\\circ)$ (cioè $\\${func}(${angleValRadStrEval})$). ${htmlInputs}`;
            
            let resNum, resExact;
            if (func === 'sin') resNum = Math.sin(angleValRadEval);
            else if (func === 'cos') resNum = Math.cos(angleValRadEval);
            else if (func === 'tan') resNum = Math.tan(angleValRadEval);
            else resNum = 1 / Math.tan(angleValRadEval); // cot

            const tolerance = 1e-9;
            if (Math.abs(resNum) < tolerance) resExact = "0";
            else if (Math.abs(resNum - 1) < tolerance) resExact = "1";
            else if (Math.abs(resNum + 1) < tolerance) resExact = "-1";
            else if (Math.abs(resNum - 0.5) < tolerance) resExact = "\\frac{1}{2}";
            else if (Math.abs(resNum + 0.5) < tolerance) resExact = "-\\frac{1}{2}";
            else if (Math.abs(resNum - Math.sqrt(2)/2) < tolerance) resExact = "\\frac{\\sqrt{2}}{2}";
            else if (Math.abs(resNum + Math.sqrt(2)/2) < tolerance) resExact = "-\\frac{\\sqrt{2}}{2}";
            else if (Math.abs(resNum - Math.sqrt(3)/2) < tolerance) resExact = "\\frac{\\sqrt{3}}{2}";
            else if (Math.abs(resNum + Math.sqrt(3)/2) < tolerance) resExact = "-\\frac{\\sqrt{3}}{2}";
            else if (func === 'tan' || func === 'cot') {
                if (Math.abs(resNum - Math.sqrt(3)) < tolerance) resExact = "\\sqrt{3}";
                else if (Math.abs(resNum + Math.sqrt(3)) < tolerance) resExact = "-\\sqrt{3}";
                else if (Math.abs(resNum - 1/Math.sqrt(3)) < tolerance) resExact = "\\frac{\\sqrt{3}}{3}"; 
                else if (Math.abs(resNum + 1/Math.sqrt(3)) < tolerance) resExact = "-\\frac{\\sqrt{3}}{3}";
            }
            
            if (resExact) {
                 solutionEl.innerHTML = `<p>$\\${func}(${angleValDegEval}^\\circ) = ${resExact}$</p>`;
            } else if (!isFinite(resNum)){
                 solutionEl.innerHTML = `<p>$\\${func}(${angleValDegEval}^\\circ)$ non è definito.</p>`;
            } else {
                 solutionEl.innerHTML = `<p>$\\${func}(${angleValDegEval}^\\circ) \\approx ${resNum.toFixed(4)}$</p>`;
            }
            break;
        case 'solve-simple-equation-parametric':
            const funcEq = userParams.func_eq || 'sin'; // sin, cos, tan
            let k_val = userParams.k_val;
            if (k_val === undefined) {
                if (funcEq === 'sin' || funcEq === 'cos') k_val = [0, 0.5, Math.sqrt(2)/2, Math.sqrt(3)/2, 1, -0.5, -Math.sqrt(2)/2, -Math.sqrt(3)/2, -1][randInt(0,8)];
                else k_val = [0, 1, Math.sqrt(3), 1/Math.sqrt(3), -1, -Math.sqrt(3), -1/Math.sqrt(3)][randInt(0,6)];
            }
            
            let k_val_display = k_val.toFixed(3); // Default display
            if (Math.abs(k_val - 0.5) < tolerance) k_val_display = "1/2";
            if (Math.abs(k_val - Math.sqrt(2)/2) < tolerance) k_val_display = "\\frac{\\sqrt{2}}{2}";
             // Add more exact k_val displays if needed

            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2 items-center">
                            Funzione: <select name="func_eq" class="p-1 border rounded">
                                <option value="sin" ${funcEq==='sin'?'selected':''}>sin(x)</option>
                                <option value="cos" ${funcEq==='cos'?'selected':''}>cos(x)</option>
                                <option value="tan" ${funcEq==='tan'?'selected':''}>tan(x)</option>
                            </select>
                            Valore k: <input type="number" name="k_val" value="${k_val}" step="any" class="p-1 border rounded w-24">
                          </div>`;
            textEl.innerHTML = `Risolvere l'equazione $\\${funcEq}(x) = ${k_val_display}$ nell'intervallo $[0, 2\\pi)$. ${htmlInputs}`;
            
            let solText = "";
            if ((funcEq === 'sin' || funcEq === 'cos') && (k_val < -1 || k_val > 1)) {
                solText = `L'equazione non ha soluzioni poiché ${k_val} è fuori dall'intervallo [-1, 1] per ${funcEq}(x).`;
            } else {
                let alpha;
                if (funcEq === 'sin') alpha = Math.asin(k_val);
                else if (funcEq === 'cos') alpha = Math.acos(k_val);
                else alpha = Math.atan(k_val);

                let sol1_rad = alpha;
                let sol2_rad;

                if (funcEq === 'sin') {
                    sol2_rad = Math.PI - alpha;
                    if(sol1_rad < 0) sol1_rad += 2*Math.PI; // Normalize to [0, 2pi)
                    if(sol2_rad < 0) sol2_rad += 2*Math.PI;
                     if(sol1_rad >= 2*Math.PI) sol1_rad -= 2*Math.PI;
                     if(sol2_rad >= 2*Math.PI) sol2_rad -= 2*Math.PI;

                    solText = `Le soluzioni principali sono $x_1 = ${sol1_rad.toFixed(3)}$ rad e $x_2 = ${sol2_rad.toFixed(3)}$ rad.`;
                    if (Math.abs(sol1_rad - sol2_rad) < tolerance && sol1_rad >=0 && sol1_rad < 2*Math.PI) { // e.g. sin(x)=1 -> x=pi/2
                         solText = `La soluzione principale è $x = ${sol1_rad.toFixed(3)}$ rad.`;
                    } else if (Math.abs(sol1_rad - sol2_rad) < tolerance){
                        solText = `La soluzione principale è $x = ${sol1_rad.toFixed(3)}$ rad.`;
                    } else {
                        // filter solutions not in [0, 2pi)
                        let solutionsInInterval = [sol1_rad, sol2_rad].filter(s => s >= -tolerance && s < 2*Math.PI-tolerance);
                        solutionsInInterval = [...new Set(solutionsInInterval.map(s => parseFloat(s.toFixed(5))))]; // Unique and formatted
                        if(solutionsInInterval.length > 0) {
                             solText = `Le soluzioni in $[0, 2\\pi)$ sono $x \\approx ${solutionsInInterval.map(s => s.toFixed(3)).join(', ')}$ rad.`;
                        } else {
                             solText = `Nessuna soluzione nell'intervallo $[0, 2\\pi)$.`;
                        }
                    }

                } else if (funcEq === 'cos') {
                    sol2_rad = 2*Math.PI - alpha;
                    if(sol1_rad < 0) sol1_rad += 2*Math.PI;
                     if(sol2_rad < 0) sol2_rad += 2*Math.PI;
                     if(sol1_rad >= 2*Math.PI) sol1_rad -= 2*Math.PI;
                     if(sol2_rad >= 2*Math.PI) sol2_rad -= 2*Math.PI;
                    
                    if (Math.abs(sol1_rad - sol2_rad) < tolerance && sol1_rad >=0 && sol1_rad < 2*Math.PI) { // e.g. cos(x)=1 -> x=0
                         solText = `La soluzione principale è $x = ${sol1_rad.toFixed(3)}$ rad.`;
                    } else if (Math.abs(sol1_rad - sol2_rad) < tolerance) {
                         solText = `La soluzione principale è $x = ${sol1_rad.toFixed(3)}$ rad.`;
                    }
                    else {
                        let solutionsInInterval = [sol1_rad, sol2_rad].filter(s => s >= -tolerance && s < 2*Math.PI-tolerance);
                         solutionsInInterval = [...new Set(solutionsInInterval.map(s => parseFloat(s.toFixed(5))))];
                         if(solutionsInInterval.length > 0) {
                             solText = `Le soluzioni in $[0, 2\\pi)$ sono $x \\approx ${solutionsInInterval.map(s => s.toFixed(3)).join(', ')}$ rad.`;
                        } else {
                             solText = `Nessuna soluzione nell'intervallo $[0, 2\\pi)$.`;
                        }
                    }
                } else { // tan
                    sol1_rad = alpha;
                    sol2_rad = alpha + Math.PI;
                    if(sol1_rad < 0) sol1_rad += Math.PI; // Normalize to first positive solution for tan period pi
                    if(sol1_rad < 0) sol1_rad += Math.PI; // one more time if still negative
                    
                    let solutionsInInterval = [];
                    if (sol1_rad >= -tolerance && sol1_rad < 2*Math.PI-tolerance) solutionsInInterval.push(sol1_rad);
                    if (sol2_rad >= -tolerance && sol2_rad < 2*Math.PI-tolerance) solutionsInInterval.push(sol2_rad);
                    
                    solutionsInInterval = [...new Set(solutionsInInterval.map(s => parseFloat(s.toFixed(5))))].sort((a,b)=>a-b);


                    if(solutionsInInterval.length > 0) {
                        solText = `Le soluzioni in $[0, 2\\pi)$ sono $x \\approx ${solutionsInInterval.map(s => s.toFixed(3)).join(', ')}$ rad.`;
                    } else {
                        // This case should be rare if alpha is correctly calculated for tan
                         solText = `Nessuna soluzione nell'intervallo $[0, 2\\pi)$.`;
                    }
                }
            }
            solutionEl.innerHTML = `<p>${solText}</p><p class="text-xs mt-1">Nota: Le soluzioni generali sono $x = x_0 + 2k\\pi$ e $x = x_1 + 2k\\pi$ (per sin/cos) o $x = x_0 + k\\pi$ (per tan), con $k \\in \\mathbb{Z}$.</p>`;
            break;
        default:
            textEl.innerHTML = "Esercizio non definito.";
            solutionEl.innerHTML = "";
            return;
    }
     // Re-attach input listeners if inputs are part of htmlInputs
    const newInputs = textEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select');
    newInputs.forEach(input => {
        input.addEventListener('change', () => { 
            const params = {};
            textEl.querySelectorAll('.parametric-inputs input, .parametric-inputs select').forEach(i => {
                 params[i.name] = i.type === 'number' ? parseFloat(i.value) : i.value;
            });
            generateGoniometryExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}

