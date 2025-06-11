// Interactive elements and functionality specific to the complex numbers section

document.addEventListener('DOMContentLoaded', function() {
    initComplexPlaneVisualizer();
    initComplexOperationsCalculator();
    initPolarExponentialConverter(); // Placeholder, will show message
    initRootsOfUnityVisualizer();
    initComplexParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initComplexPlaneVisualizer() {
    const container = document.getElementById('complex-plane-visualizer');
    if (!container) return;
    container.innerHTML = ''; 

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'complex-plane-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="complex-real-input" class="block text-sm font-medium text-gray-700">Parte Reale (a):</label>
            <input type="number" id="complex-real-input" value="2" step="0.1" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" aria-describedby="complex-info-output">
        </div>
        <div>
            <label for="complex-imag-input" class="block text-sm font-medium text-gray-700">Parte Immaginaria (b):</label>
            <input type="number" id="complex-imag-input" value="3" step="0.1" class="interactive-control mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm" aria-describedby="complex-info-output">
        </div>
        <div class="md:col-span-2 text-sm text-gray-700 min-h-[60px]" id="complex-info-output" aria-live="polite">
            Numero complesso: $z = 2 + 3i$
        </div>
    `;
    container.appendChild(controlsDiv);

    const realInput = document.getElementById('complex-real-input');
    const imagInput = document.getElementById('complex-imag-input');
    const infoOutput = document.getElementById('complex-info-output');

    const graph = createFunctionGraph('complex-plane-canvas', null, { 
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, 
        gridStep: 1, xAxisLabelInterval:1, yAxisLabelInterval:1,
        responsive: true,
        padding: {left: 30, bottom: 20, top:10, right:10},
        ariaLabel: "Piano di Argand-Gauss. Asse orizzontale: parte reale. Asse verticale: parte immaginaria."
    });
    if (!graph) return;

    function updateComplexVisualizer() {
        const realPart = parseFloat(realInput.value);
        const imagPart = parseFloat(imagInput.value);

        if (isNaN(realPart) || isNaN(imagPart)) {
            infoOutput.innerHTML = "<p class='text-red-500'>Input non validi.</p>";
            graph.updateConfig({ markers: [], curves: [] }); // Clear vector too
            return;
        }

        const modulus = Math.sqrt(realPart*realPart + imagPart*imagPart);
        let argument = Math.atan2(imagPart, realPart); 
        const argumentDeg = (argument * 180 / Math.PI);
        const argumentDegNormalized = (argumentDeg % 360 + 360) % 360;


        const markers = [
            { x: realPart, y: imagPart, color: '#4f46e5', radius: 6, label: `z` },
            { x: 0, y: 0, color: '#9ca3af', radius: 3 } 
        ];
        
        // Vector from origin to z (using a "curve" with a custom function)
        // This is a bit of a hack for drawing a single line segment.
        // A proper line segment feature in createFunctionGraph would be better.
        let vectorCurve = [];
        if (realPart !== 0 || imagPart !== 0) { // Only draw if not origin
             vectorCurve.push({
                func: x => {
                    if (realPart === 0) return (imagPart > 0 ? (x === 0 ? Math.min(y, imagPart) : NaN) : (x === 0 ? Math.max(y, imagPart) : NaN)); // Vertical line
                    const slope = imagPart / realPart;
                    // Restrict line to segment: 0 to realPart for x
                    if ((realPart > 0 && (x < 0 || x > realPart)) || (realPart < 0 && (x > 0 || x < realPart))) return NaN;
                    return slope * x;
                },
                color: '#a5b4fc', // indigo-300
                width: 2
            });
        }


        graph.updateConfig({ markers, curves: vectorCurve }); 
        
        infoOutput.innerHTML = `Numero complesso: $z = ${realPart.toFixed(1)} ${imagPart >= 0 ? '+' : '-'} ${Math.abs(imagPart).toFixed(1)}i$<br>
                                Modulo $|z| = \\sqrt{${realPart.toFixed(1)}^2 + ${Math.abs(imagPart).toFixed(1)}^2} = ${modulus.toFixed(2)}$<br>
                                Argomento $\\arg(z) = ${argument.toFixed(2)}$ rad (${argumentDegNormalized.toFixed(1)}°)$`;
        setupMathJaxRendering(infoOutput);
        graph.getCanvas().setAttribute('aria-label', `Piano di Argand-Gauss con punto z = ${realPart.toFixed(1)} ${imagPart >=0 ? '+' : ''} ${imagPart.toFixed(1)}i.`);
    }

    realInput.addEventListener('input', updateComplexVisualizer);
    imagInput.addEventListener('input', updateComplexVisualizer);
    updateComplexVisualizer();
}

function initComplexOperationsCalculator() {
    const container = document.getElementById('complex-operations-calculator');
    if (!container) return;
    
    const z1Real = container.querySelector('#z1-real');
    const z1Imag = container.querySelector('#z1-imag');
    const z2Real = container.querySelector('#z2-real');
    const z2Imag = container.querySelector('#z2-imag');
    const operationSelect = container.querySelector('#complex-operation');
    const calculateBtn = container.querySelector('#calculate-complex-op');
    const resultsDiv = container.querySelector('#complex-op-results');

    if (!z1Real || !z1Imag || !z2Real || !z2Imag || !operationSelect || !calculateBtn || !resultsDiv) {
        console.error("Elementi per il calcolatore di operazioni complesse non trovati.");
        return;
    }
    
    // Disable/enable z2 inputs based on operation
    operationSelect.addEventListener('change', () => {
        const op = operationSelect.value;
        const needsZ2 = !(op === 'conjugate' || op === 'modulus' || op === 'argument');
        z2Real.disabled = !needsZ2;
        z2Imag.disabled = !needsZ2;
        z2Real.closest('div').classList.toggle('opacity-50', !needsZ2);
    });
    operationSelect.dispatchEvent(new Event('change')); // Initial state

    calculateBtn.addEventListener('click', () => {
        const a1 = parseFloat(z1Real.value); const b1 = parseFloat(z1Imag.value);
        const op = operationSelect.value;
        let a2, b2;

        if(isNaN(a1) || isNaN(b1)) {
            resultsDiv.innerHTML = `<p class="text-red-500">Input per $z_1$ non validi.</p>`; return;
        }

        const needsZ2 = !(op === 'conjugate' || op === 'modulus' || op === 'argument');
        if (needsZ2) {
            a2 = parseFloat(z2Real.value); b2 = parseFloat(z2Imag.value);
            if (isNaN(a2) || isNaN(b2)) {
                 resultsDiv.innerHTML = `<p class="text-red-500">Input per $z_2$ non validi.</p>`; return;
            }
        }


        let resReal, resImag, resScalar;
        let resultStr = "";

        switch(op) {
            case 'add': 
                resReal = a1 + a2; resImag = b1 + b2;
                resultStr = `$z_1 + z_2 = (${a1} + ${b1}i) + (${a2} ${b2>=0?'+':''} ${b2}i) = ${resReal.toFixed(2)} ${resImag>=0?'+':'-'} ${Math.abs(resImag).toFixed(2)}i$`;
                break;
            case 'subtract':
                resReal = a1 - a2; resImag = b1 - b2;
                resultStr = `$z_1 - z_2 = (${a1} + ${b1}i) - (${a2} ${b2>=0?'+':''} ${b2}i) = ${resReal.toFixed(2)} ${resImag>=0?'+':'-'} ${Math.abs(resImag).toFixed(2)}i$`;
                break;
            case 'multiply':
                resReal = a1*a2 - b1*b2; resImag = a1*b2 + a2*b1;
                resultStr = `$z_1 \\cdot z_2 = (${a1} + ${b1}i)(${a2} ${b2>=0?'+':''} ${b2}i) = ${resReal.toFixed(2)} ${resImag>=0?'+':'-'} ${Math.abs(resImag).toFixed(2)}i$`;
                break;
            case 'divide':
                const den = a2*a2 + b2*b2;
                if (Math.abs(den) < 1e-9) { resultsDiv.innerHTML = `<p class="text-red-500">Divisione per zero ($z_2$ non può essere 0).</p>`; return; }
                resReal = (a1*a2 + b1*b2) / den;
                resImag = (b1*a2 - a1*b2) / den;
                resultStr = `$\\frac{z_1}{z_2} = \\frac{${a1} + ${b1}i}{${a2} ${b2>=0?'+':''} ${b2}i} = ${resReal.toFixed(2)} ${resImag>=0?'+':'-'} ${Math.abs(resImag).toFixed(2)}i$`;
                break;
            case 'conjugate': 
                resReal = a1; resImag = -b1;
                resultStr = `$\\bar{z_1} = \\overline{${a1} + ${b1}i} = ${resReal.toFixed(2)} ${resImag>=0?'+':'-'} ${Math.abs(resImag).toFixed(2)}i$`;
                break;
            case 'modulus': 
                resScalar = Math.sqrt(a1*a1 + b1*b1);
                resultStr = `$|z_1| = |${a1} + ${b1}i| = \\sqrt{${a1}^2 + ${b1}^2} = ${resScalar.toFixed(3)}$`;
                break;
             case 'argument': 
                resScalar = Math.atan2(b1, a1); // radians
                const argDeg = (resScalar * 180 / Math.PI);
                const argDegNormalized = (argDeg % 360 + 360) % 360;
                resultStr = `$\\arg(z_1) = \\arg(${a1} + ${b1}i) = ${resScalar.toFixed(3)}$ rad (${argDegNormalized.toFixed(1)}°)$ (Argomento Principale in $(-\\pi, \\pi]$)`;
                break;
        }
        resultsDiv.innerHTML = resultStr;
        setupMathJaxRendering(resultsDiv);
    });
}

function initPolarExponentialConverter() {
    const container = document.getElementById('polar-exp-converter');
    if (!container) return;
    // Existing placeholder is fine as full implementation is complex.
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Convertitore tra forma algebrica, polare ed esponenziale in sviluppo.</p>`;
}

function initRootsOfUnityVisualizer() {
    const container = document.getElementById('roots-of-unity-visualizer');
    if (!container) return;
    container.innerHTML = '';

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'roots-unity-canvas';
    canvasDiv.className = 'canvas-container h-80 mb-4';
    container.appendChild(canvasDiv);
    
    const controlsDiv = document.createElement('div');
    controlsDiv.className = "mt-2";
    controlsDiv.innerHTML = `
        <label for="roots-n-input" class="block text-sm font-medium text-gray-700">Numero di radici (n): <span id="roots-n-value" class="font-semibold">3</span></label>
        <input type="range" id="roots-n-input" min="2" max="12" step="1" value="3" class="custom-slider" aria-describedby="roots-output">
        <div id="roots-output" class="text-sm mt-2 min-h-[50px]" aria-live="polite"></div>
    `;
    container.appendChild(controlsDiv);

    const nInput = document.getElementById('roots-n-input');
    const nValueDisplay = document.getElementById('roots-n-value');
    const rootsOutput = document.getElementById('roots-output');

    const graph = createFunctionGraph('roots-unity-canvas', null, {
        xMin: -1.5, xMax: 1.5, yMin: -1.5, yMax: 1.5,
        gridStep: 0.5, responsive: true,
        padding: {left: 30, bottom: 20, top:10, right:10},
        ariaLabel: "Visualizzatore delle radici n-esime dell'unità. Modifica 'n' per vedere le radici."
    });
    if(!graph) return;

    function updateRootsVisualizer() {
        const n = parseInt(nInput.value);
        nValueDisplay.textContent = n;

        let markers = [];
        let rootsList = `<p class="font-medium mb-1">Le ${n} radici ${n}-esime dell'unità sono:</p><ul class="list-disc list-inside text-xs">`;
        
        const unitCircleFuncTop = x => Math.sqrt(Math.max(0, 1 - x*x));
        const unitCircleFuncBottom = x => -Math.sqrt(Math.max(0, 1 - x*x));

        for (let k = 0; k < n; k++) {
            const angle = 2 * Math.PI * k / n;
            const realPart = Math.cos(angle);
            const imagPart = Math.sin(angle);
            markers.push({ x: realPart, y: imagPart, color: '#4f46e5', radius: 5, label: `ω${k}`});
            rootsList += `<li>$\\omega_{${k}} = e^{i \\frac{${2*k}\\pi}{${n}}} = \\cos(\\frac{${2*k}\\pi}{${n}}) + i\\sin(\\frac{${2*k}\\pi}{${n}}) \\approx ${realPart.toFixed(2)} ${imagPart>=0?'+':'-'} ${Math.abs(imagPart).toFixed(2)}i$</li>`;
        }
        rootsList += "</ul>";
        
        graph.updateConfig({ 
            curves: [
                { func: unitCircleFuncTop, color: '#d1d5db'}, //slate-300
                { func: unitCircleFuncBottom, color: '#d1d5db'}
            ],
            markers: markers 
        });
        rootsOutput.innerHTML = rootsList;
        setupMathJaxRendering(rootsOutput);
        graph.getCanvas().setAttribute('aria-label', `Radici ${n}-esime dell'unità visualizzate sul piano complesso.`);
    }
    nInput.addEventListener('input', updateRootsVisualizer);
    updateRootsVisualizer();
}

function initComplexParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="numeri-complessi"]');
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
                generateComplexExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
             initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateComplexExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateComplexExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randReal = () => randInt(-5,5);
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
        case 'sum-complex-parametric':
            const a1 = userParams.a1_sum !== undefined ? userParams.a1_sum : randReal();
            const b1 = userParams.b1_sum !== undefined ? userParams.b1_sum : randReal();
            const a2 = userParams.a2_sum !== undefined ? userParams.a2_sum : randReal();
            const b2 = userParams.b2_sum !== undefined ? userParams.b2_sum : randReal();
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $a_1$:<input type="number" name="a1_sum" value="${a1}" class="p-1 border rounded"> $b_1$:<input type="number" name="b1_sum" value="${b1}" class="p-1 border rounded">
                            $a_2$:<input type="number" name="a2_sum" value="${a2}" class="p-1 border rounded"> $b_2$:<input type="number" name="b2_sum" value="${b2}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Dati $z_1 = ${a1} ${b1>=0?'+':''} ${b1}i$ e $z_2 = ${a2} ${b2>=0?'+':''} ${b2}i$, calcolare $z_1 + z_2$. ${htmlInputs}`;
            const sumR = a1+a2; const sumI = b1+b2;
            solutionEl.innerHTML = `<p>$z_1+z_2 = (${a1}+${a2}) + (${b1}+${b2})i = ${sumR} ${sumI>=0?'+':''} ${sumI}i$.</p>`;
            break;
        case 'product-complex-parametric':
            const p_a1 = userParams.a1_prod !== undefined ? userParams.a1_prod : randReal();
            const p_b1 = userParams.b1_prod !== undefined ? userParams.b1_prod : randReal();
            const p_a2 = userParams.a2_prod !== undefined ? userParams.a2_prod : randReal();
            const p_b2 = userParams.b2_prod !== undefined ? userParams.b2_prod : randReal();
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $a_1$:<input type="number" name="a1_prod" value="${p_a1}" class="p-1 border rounded"> $b_1$:<input type="number" name="b1_prod" value="${p_b1}" class="p-1 border rounded">
                            $a_2$:<input type="number" name="a2_prod" value="${p_a2}" class="p-1 border rounded"> $b_2$:<input type="number" name="b2_prod" value="${p_b2}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Dati $z_1 = ${p_a1} ${p_b1>=0?'+':''} ${p_b1}i$ e $z_2 = ${p_a2} ${p_b2>=0?'+':''} ${p_b2}i$, calcolare $z_1 \\cdot z_2$. ${htmlInputs}`;
            const prodR = p_a1*p_a2 - p_b1*p_b2; const prodI = p_a1*p_b2 + p_a2*p_b1;
            solutionEl.innerHTML = `<p>$z_1 \\cdot z_2 = (${p_a1}${p_b1>=0?'+':''}${p_b1}i)(${p_a2}${p_b2>=0?'+':''}${p_b2}i) = (${p_a1*p_a2} ${p_a1*p_b2>=0?'+':''}${p_a1*p_b2}i ${p_a2*p_b1>=0?'+':''}${p_a2*p_b1}i ${p_b1*p_b2>=0?'+':''}${p_b1*p_b2}i^2)$</p>
                                     <p>$= (${p_a1*p_a2} - ${p_b1*p_b2}) + (${p_a1*p_b2} + ${p_a2*p_b1})i = ${prodR} ${prodI>=0?'+':''} ${prodI}i$.</p>`;
            break;
        case 'modulus-argument-parametric':
            const ma_a = userParams.a_modarg !== undefined ? userParams.a_modarg : randReal();
            const ma_b = userParams.b_modarg !== undefined ? userParams.b_modarg : randReal();
             htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                            $a$:<input type="number" name="a_modarg" value="${ma_a}" class="p-1 border rounded w-20"> 
                            $b$:<input type="number" name="b_modarg" value="${ma_b}" class="p-1 border rounded w-20">
                          </div>`;
            textEl.innerHTML = `Calcola modulo e argomento principale (in $(-\\pi, \\pi]$ radianti) del numero complesso $z = ${ma_a} ${ma_b>=0?'+':''} ${ma_b}i$. ${htmlInputs}`;
            const mod_val = Math.sqrt(ma_a*ma_a + ma_b*ma_b);
            const arg_val_rad = Math.atan2(ma_b, ma_a);
            const arg_val_deg = arg_val_rad * 180 / Math.PI;
            solutionEl.innerHTML = `<p>Modulo: $|z| = \\sqrt{(${ma_a})^2 + (${ma_b})^2} = \\sqrt{${ma_a*ma_a + ma_b*ma_b}} = ${mod_val.toFixed(3)}$.</p>
                                     <p>Argomento: $\\arg(z) = \\operatorname{atan2}(${ma_b}, ${ma_a}) = ${arg_val_rad.toFixed(3)}$ radianti (che corrisponde a ${arg_val_deg.toFixed(1)}$^\\circ$).</p>`;
            break;
        default:
            textEl.innerHTML = "Esercizio Parametrico non definito (ID: " + exerciseId + ")";
            solutionEl.innerHTML = "Soluzione non disponibile.";
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
            generateComplexExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
