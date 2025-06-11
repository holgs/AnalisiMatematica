document.addEventListener('DOMContentLoaded', function() {
    initLinePointVisualizer();
    initConicExplorer();
    initSpaceVisualizer3D(); 
    initGeoAnaliticaParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initLinePointVisualizer() {
    const container = document.getElementById('line-point-visualizer');
    if (!container) return;

    const p1x_input = document.getElementById('p1x');
    const p1y_input = document.getElementById('p1y');
    const p2x_input = document.getElementById('p2x');
    const p2y_input = document.getElementById('p2y');
    const visualizeBtn = document.getElementById('visualize-line-btn'); 
    const outputDiv = document.getElementById('line-data-output');
    const canvasContainerDiv = document.getElementById('line-plot-canvas'); // Get the div container

    if (!p1x_input || !p1y_input || !p2x_input || !p2y_input || !outputDiv || !canvasContainerDiv) {
        console.error("One or more elements for line point visualizer not found.");
        return;
    }
    
    // Pass the ID of the div container, not the canvas itself yet
    let linePlot = createFunctionGraph(canvasContainerDiv.id, null, {
        xMin: -5, xMax: 5, yMin: -5, yMax: 5, gridStep: 1, responsive: true,
        ariaLabel: "Grafico interattivo di una retta passante per due punti P1 e P2."
    });
     if (!linePlot) return;


    function updateLinePointVisualizer() {
        const x1 = parseFloat(p1x_input.value);
        const y1 = parseFloat(p1y_input.value);
        const x2 = parseFloat(p2x_input.value);
        const y2 = parseFloat(p2y_input.value);

        if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
            outputDiv.innerHTML = '<p class="text-red-500">Inserisci coordinate numeriche valide.</p>';
            linePlot.updateConfig({ curves: [], markers: [], verticalLines: [] });
            return;
        }

        const allX = [x1, x2, 0]; 
        const allY = [y1, y2, 0];
        const xDataRange = Math.max(1, Math.abs(x1-x2)); // Minimum range of 1 to avoid tiny scales
        const yDataRange = Math.max(1, Math.abs(y1-y2));
        const margin = Math.max(2, Math.max(xDataRange, yDataRange) * 0.3); 
        
        const plotXMin = Math.min(...allX) - margin;
        const plotXMax = Math.max(...allX) + margin;
        const plotYMin = Math.min(...allY) - margin;
        const plotYMax = Math.max(...allY) + margin;

        const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        let equationStr = "";
        let lineFuncs = []; 
        let markers = [
            { x: x1, y: y1, color: '#ef4444', radius: 5, label: `P₁(${x1},${y1})` }, // red-500
            { x: x2, y: y2, color: '#ef4444', radius: 5, label: `P₂(${x2},${y2})` },
            { x: midX, y: midY, color: '#34d399', radius: 4, label: `M(${midX.toFixed(2)},${midY.toFixed(2)})`} // green-400
        ];
        let verticalLines = []; // For vertical line case

        if (Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 - y2) < 1e-9) {
            equationStr = "I punti coincidono.";
        } else if (Math.abs(x1 - x2) < 1e-9) { // Vertical line
            equationStr = `Equazione retta: $x = ${x1}$`;
            verticalLines.push({x: x1, color: '#3b82f6', width: 2}); // blue-500
        } else { // Non-vertical line
            const m = (y2 - y1) / (x2 - x1);
            const q = y1 - m * x1;
            const a_impl = y2 - y1;
            const b_impl = x1 - x2; // -(x2-x1)
            const c_impl = x2 * y1 - x1 * y2;

            equationStr = `Equazione esplicita: $y = ${m.toFixed(2)}x ${q >= 0 ? '+' : '-'} ${Math.abs(q).toFixed(2)}$<br>`;
            equationStr += `Equazione implicita: $${a_impl.toFixed(0)}x ${b_impl >= 0 ? '+' : '-'} ${Math.abs(b_impl).toFixed(0)}y ${c_impl >= 0 ? '+' : '-'} ${Math.abs(c_impl).toFixed(0)} = 0$`;
            lineFuncs.push({ func: x => m * x + q, color: '#3b82f6' }); // blue-500
        }

        linePlot.updateConfig({
            curves: lineFuncs,
            markers: markers,
            verticalLines: verticalLines, // Pass vertical lines config
            xMin: plotXMin, xMax: plotXMax, yMin: plotYMin, yMax: plotYMax,
            gridStep: Math.max(0.25, Math.floor(Math.max(plotXMax-plotXMin, plotYMax-plotYMin)/10)) 
        });

        outputDiv.innerHTML = `
            <p><strong>Distanza $P_1P_2$:</strong> ${distance.toFixed(3)}</p>
            <p><strong>Punto Medio M:</strong> $(${midX.toFixed(2)}, ${midY.toFixed(2)})$</p>
            <p>${equationStr}</p>
        `;
        setupMathJaxRendering(outputDiv);
        linePlot.getCanvas().setAttribute('aria-label', `Grafico della retta passante per P1(${x1},${y1}) e P2(${x2},${y2}). Distanza: ${distance.toFixed(2)}. Punto medio: M(${midX.toFixed(2)},${midY.toFixed(2)}).`);

    }
    
    [p1x_input, p1y_input, p2x_input, p2y_input].forEach(el => {
        el.addEventListener('input', updateLinePointVisualizer);
    });
    if(visualizeBtn) visualizeBtn.addEventListener('click', updateLinePointVisualizer); 
    updateLinePointVisualizer(); 
}

function initConicExplorer() {
    const container = document.getElementById('conic-explorer');
    if (!container) return;

    const typeSelect = document.getElementById('conic-type');
    const paramsDiv = document.getElementById('conic-params-inputs'); 
    const equationOutput = document.getElementById('conic-equation-output');
    const canvasContainerDiv = document.getElementById('conic-plot-canvas'); 

    if (!typeSelect || !paramsDiv || !equationOutput || !canvasContainerDiv) {
        console.error("One or more elements for conic explorer not found.");
        return;
    }

    let conicPlot = createFunctionGraph(canvasContainerDiv.id, null, {
        xMin: -10, xMax: 10, yMin: -10, yMax: 10, gridStep: 1, responsive: true,
        ariaLabel: "Esploratore interattivo delle coniche. Seleziona il tipo di conica e modifica i parametri."
    });
    if(!conicPlot) return;

    // Use a single object to store current parameters for each type
    const currentParams = {
        circle: { h: 0, k: 0, r: 3 },
        'parabola-y': { a_parab: 0.5, h: 0, k: 0 }, // Renamed 'a' to 'a_parab' to avoid conflict with ellipse/hyperbola 'a'
        'parabola-x': { a_parab: 0.5, h: 0, k: 0 },
        ellipse: { h: 0, k: 0, a: 5, b: 3 },
        'hyperbola-x': { h: 0, k: 0, a: 2, b: 1.5 },
        'hyperbola-y': { h: 0, k: 0, a: 2, b: 1.5 }
    };

    const paramDefinitions = { // Definitions for sliders
        h: { label: 'Centro h (ascissa)', min: -8, max: 8, step: 0.1, val: 0 },
        k: { label: 'Centro k (ordinata)', min: -8, max: 8, step: 0.1, val: 0 },
        r: { label: 'Raggio r', min: 0.1, max: 8, step: 0.1, val: 3 },
        a_parab: { label: 'Coefficiente a (parabola)', min: -2, max: 2, step: 0.05, val: 0.5 }, // For parabola
        a: { label: 'Semiasse a', min: 0.1, max: 8, step: 0.1, val: 3 }, // For ellipse/hyperbola
        b: { label: 'Semiasse b', min: 0.1, max: 8, step: 0.1, val: 2 }  // For ellipse/hyperbola
    };

    function updateParamInputs() {
        const type = typeSelect.value;
        paramsDiv.innerHTML = ''; 
        const paramsForType = currentParams[type];

        for (const paramKey in paramsForType) {
            // Determine which definition to use (e.g. 'a' vs 'a_parab')
            const defKey = (paramKey === 'a_parab' || paramKey === 'a' && (type.includes('parabola'))) ? 'a_parab' : paramKey;
            const definition = paramDefinitions[defKey];
            if (!definition) continue;

            const val = paramsForType[paramKey];

            const pContainer = document.createElement('div');
            pContainer.className = 'flex flex-col space-y-1';
            
            const label = document.createElement('label');
            label.htmlFor = `param-${paramKey}-${type}`; // Unique ID using type
            label.className = 'text-sm font-medium text-gray-700';
            label.innerHTML = `${definition.label}: <span id="val-${paramKey}-${type}" class="font-semibold">${val.toFixed(paramKey === 'a_parab' ? 2:1)}</span>`;
            
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `param-${paramKey}-${type}`;
            slider.min = definition.min;
            slider.max = definition.max;
            slider.step = definition.step;
            slider.value = val;
            slider.className = 'custom-slider';
            slider.setAttribute('aria-labelledby', `val-${paramKey}-${type}`);

            const numInput = document.createElement('input'); // Optional: direct number input
            numInput.type = 'number';
            numInput.min = definition.min;
            numInput.max = definition.max;
            numInput.step = definition.step;
            numInput.value = val;
            numInput.className = 'interactive-control p-1 border rounded w-24 text-sm mt-1';
            numInput.setAttribute('aria-label', definition.label);


            pContainer.appendChild(label);
            pContainer.appendChild(slider);
            // pContainer.appendChild(numInput); // Uncomment to add number input
            paramsDiv.appendChild(pContainer);

            const valDisplay = document.getElementById(`val-${paramKey}-${type}`);

            slider.addEventListener('input', () => {
                const newValue = parseFloat(slider.value);
                paramsForType[paramKey] = newValue;
                valDisplay.textContent = newValue.toFixed(paramKey === 'a_parab' ? 2:1);
                // numInput.value = newValue; 
                plotConic();
            });
            /* // If using number input
            numInput.addEventListener('input', () => {
                const numVal = parseFloat(numInput.value);
                 if (!isNaN(numVal) && numVal >= parseFloat(definition.min) && numVal <= parseFloat(definition.max)) {
                    paramsForType[paramKey] = numVal;
                    valDisplay.textContent = numVal.toString();
                    slider.value = numVal; 
                    plotConic();
                }
            });
            */
        }
        plotConic();
    }

    function plotConic() {
        const type = typeSelect.value;
        const params = currentParams[type];
        const { h, k } = params; // Common params
        let r, a_parab, a, b; // Type-specific params
        
        if (type === 'circle') r = params.r;
        if (type.includes('parabola')) a_parab = params.a_parab;
        if (type === 'ellipse' || type.includes('hyperbola')) { a = params.a; b = params.b; }


        let curves = [];
        let eqStr = "";
        let markers = [];
        let horizontalLines = [];
        let verticalLines = [];

        switch (type) {
            case 'circle':
                if (r > 0) {
                    curves.push({ func: x_val => k + Math.sqrt(Math.max(0, r*r - Math.pow(x_val-h, 2))), color: '#3b82f6' }); // blue-500
                    curves.push({ func: x_val => k - Math.sqrt(Math.max(0, r*r - Math.pow(x_val-h, 2))), color: '#3b82f6' });
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `C(${h.toFixed(1)},${k.toFixed(1)})` }); // red-500
                }
                eqStr = `$(x ${h<0?'+':'-'} ${Math.abs(h).toFixed(1)})^2 + (y ${k<0?'+':'-'} ${Math.abs(k).toFixed(1)})^2 = ${r.toFixed(1)}^2$`;
                break;
            case 'parabola-y': 
                if (Math.abs(a_parab) > 1e-9) {
                   curves.push({ func: x_val => a_parab * Math.pow(x_val-h, 2) + k, color: '#10b981' }); // green-500
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `V(${h.toFixed(1)},${k.toFixed(1)})` });
                    const focusY = k + 1/(4*a_parab);
                    markers.push({ x: h, y: focusY, color: '#f59e0b', radius: 3, label: `F` }); // amber-500
                    const directrixY = k - 1/(4*a_parab);
                    horizontalLines.push({ y: directrixY, color: '#8b5cf6', dash: [5,5], label: `d: y=${directrixY.toFixed(1)}`}); // violet-500
                }
                eqStr = `$y = ${a_parab.toFixed(2)}(x ${h<0?'+':'-'} ${Math.abs(h).toFixed(1)})^2 ${k>=0? (k===0?'':'+'):'-'} ${k===0?'':Math.abs(k).toFixed(1)}$`;
                break;
            case 'parabola-x': 
                if (Math.abs(a_parab) > 1e-9) {
                    // Solve for y: y = k +/- sqrt((x-h)/a_parab)
                    // Need to plot for x > h if a_parab > 0, and x < h if a_parab < 0
                    const domainCondition = (x_val) => (a_parab > 0 ? x_val >=h : x_val <=h);
                    curves.push({ func: x_val => domainCondition(x_val) ? k + Math.sqrt(Math.max(0,(x_val-h)/a_parab)) : NaN, color: '#10b981' });
                    curves.push({ func: x_val => domainCondition(x_val) ? k - Math.sqrt(Math.max(0,(x_val-h)/a_parab)) : NaN, color: '#10b981' });
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `V(${h.toFixed(1)},${k.toFixed(1)})` });
                    const focusX = h + 1/(4*a_parab);
                    markers.push({ x: focusX, y: k, color: '#f59e0b', radius: 3, label: `F` });
                    const directrixX = h - 1/(4*a_parab);
                    verticalLines.push({ x: directrixX, color: '#8b5cf6', dash: [5,5], label: `d: x=${directrixX.toFixed(1)}`});
                }
                eqStr = `$x = ${a_parab.toFixed(2)}(y ${k<0?'+':'-'} ${Math.abs(k).toFixed(1)})^2 ${h>=0?(h===0?'':'+'):'-'} ${h===0?'':Math.abs(h).toFixed(1)}$`;
                break;
            case 'ellipse':
                if (a > 0 && b > 0) {
                    curves.push({ func: x_val => k + b * Math.sqrt(Math.max(0, 1 - Math.pow(x_val-h,2)/(a*a))), color: '#8b5cf6' }); // violet-500
                    curves.push({ func: x_val => k - b * Math.sqrt(Math.max(0, 1 - Math.pow(x_val-h,2)/(a*a))), color: '#8b5cf6' });
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `C` });
                    const c_sq = Math.abs(a*a - b*b); const c_val = Math.sqrt(c_sq);
                    if (a >= b) { 
                        markers.push({ x: h - c_val, y: k, color: '#f59e0b', radius: 3, label: `F₁` });
                        markers.push({ x: h + c_val, y: k, color: '#f59e0b', radius: 3, label: `F₂` });
                    } else { 
                        markers.push({ x: h, y: k - c_val, color: '#f59e0b', radius: 3, label: `F₁` });
                        markers.push({ x: h, y: k + c_val, color: '#f59e0b', radius: 3, label: `F₂` });
                    }
                }
                eqStr = `$\\frac{(x ${h<0?'+':'-'} ${Math.abs(h).toFixed(1)})^2}{${(a*a).toFixed(1)}} + \\frac{(y ${k<0?'+':'-'} ${Math.abs(k).toFixed(1)})^2}{${(b*b).toFixed(1)}} = 1$`;
                break;
            case 'hyperbola-x': 
                if (a > 0 && b > 0) {
                    curves.push({ func: x_val => k + b * Math.sqrt(Math.max(0, Math.pow(x_val-h,2)/(a*a) - 1)), color: '#f59e0b'}); // amber-500
                    curves.push({ func: x_val => k - b * Math.sqrt(Math.max(0, Math.pow(x_val-h,2)/(a*a) - 1)), color: '#f59e0b'});
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `C` });
                    // Asymptotes: y - k = +/- (b/a)(x-h)
                    curves.push({ func: x_val => k + (b/a)*(x_val-h), color: '#cbd5e1', dash: [5,5] }); // slate-300
                    curves.push({ func: x_val => k - (b/a)*(x_val-h), color: '#cbd5e1', dash: [5,5] });
                }
                eqStr = `$\\frac{(x ${h<0?'+':'-'} ${Math.abs(h).toFixed(1)})^2}{${(a*a).toFixed(1)}} - \\frac{(y ${k<0?'+':'-'} ${Math.abs(k).toFixed(1)})^2}{${(b*b).toFixed(1)}} = 1$`;
                break;
            case 'hyperbola-y': 
                if (a > 0 && b > 0) { // 'a' is semi-transverse (with y), 'b' is semi-conjugate (with x)
                    // y = k +/- a * sqrt(1 + (x-h)^2/b^2)
                    curves.push({ func: x_val => k + a * Math.sqrt(Math.max(0, 1 + Math.pow(x_val-h,2)/(b*b))), color: '#f59e0b'});
                    curves.push({ func: x_val => k - a * Math.sqrt(Math.max(0, 1 + Math.pow(x_val-h,2)/(b*b))), color: '#f59e0b'});
                    markers.push({ x: h, y: k, color: '#ef4444', radius: 4, label: `C` });
                     // Asymptotes: y - k = +/- (a/b)(x-h)
                    curves.push({ func: x_val => k + (a/b)*(x_val-h), color: '#cbd5e1', dash: [5,5] });
                    curves.push({ func: x_val => k - (a/b)*(x_val-h), color: '#cbd5e1', dash: [5,5] });
                }
                 eqStr = `$\\frac{(y ${k<0?'+':'-'} ${Math.abs(k).toFixed(1)})^2}{${(a*a).toFixed(1)}} - \\frac{(x ${h<0?'+':'-'} ${Math.abs(h).toFixed(1)})^2}{${(b*b).toFixed(1)}} = 1$`;
                break;
        }
        conicPlot.updateConfig({ curves, markers, horizontalLines, verticalLines });
        equationOutput.innerHTML = `<p>Equazione: ${eqStr}</p>`;
        setupMathJaxRendering(equationOutput);
        conicPlot.getCanvas().setAttribute('aria-label', `Grafico di ${typeSelect.options[typeSelect.selectedIndex].text.split(':')[0].trim()} con equazione ${eqStr.replace(/\$/g, '')}`);
    }

    typeSelect.addEventListener('change', updateParamInputs);
    updateParamInputs(); 
}


function initSpaceVisualizer3D() {
    const container = document.getElementById('space-visualizer-3d');
    if (!container) return;
    // Existing placeholder is fine, as MathJax is key here.
    setupMathJaxRendering(container); 
}

function initGeoAnaliticaParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="geometria-analitica"]');

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
                generateGeoAnaliticaExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
            initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateGeoAnaliticaExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams); 
        }
    });
}

function generateGeoAnaliticaExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randFloat = (min, max, dec = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(dec));
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
        case 'line-equation-two-points':
            const x1 = userParams.x1_line !== undefined ? userParams.x1_line : randInt(-5,5); 
            const y1 = userParams.y1_line !== undefined ? userParams.y1_line : randInt(-5,5);
            let x2 = userParams.x2_line !== undefined ? userParams.x2_line : randInt(-5,5);
            let y2 = userParams.y2_line !== undefined ? userParams.y2_line : randInt(-5,5);
            let attempts_line = 0;
            while(Math.abs(x1-x2) < 1e-9 && Math.abs(y1-y2) < 1e-9 && attempts_line < 5) { 
                x2 = randInt(-5,5); y2 = randInt(-5,5); attempts_line++; 
            }
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $P_1(x_1)$: <input type="number" name="x1_line" value="${x1}" class="p-1 border rounded"> $P_1(y_1)$: <input type="number" name="y1_line" value="${y1}" class="p-1 border rounded">
                            $P_2(x_2)$: <input type="number" name="x2_line" value="${x2}" class="p-1 border rounded"> $P_2(y_2)$: <input type="number" name="y2_line" value="${y2}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Trova l'equazione della retta passante per $P_1(${x1}, ${y1})$ e $P_2(${x2}, ${y2})$. ${htmlInputs}`;
            
            if (Math.abs(x1 - x2) < 1e-9 && Math.abs(y1 - y2) < 1e-9) {
                 solutionEl.innerHTML = `<p class="text-red-500">I punti coincidono, non definiscono una retta unica.</p>`;
            } else if (Math.abs(x1 - x2) < 1e-9) { // Vertical line
                solutionEl.innerHTML = `<p>La retta è verticale. Equazione: $x = ${x1}$.</p>`;
            } else { 
                const m = (y2 - y1) / (x2 - x1);
                const q = y1 - m * x1;
                const a_impl = y2 - y1;
                const b_impl = x1 - x2;
                const c_impl = x2*y1 - x1*y2;
                solutionEl.innerHTML = `<p>Formula generale: $\\frac{y-y_1}{y_2-y_1} = \\frac{x-x_1}{x_2-x_1}$ (se $x_1 \\neq x_2$ e $y_1 \\neq y_2$).</p>
                                         <p>Coefficiente angolare $m = \\frac{y_2-y_1}{x_2-x_1} = \\frac{${y2}-(${y1})}{${x2}-(${x1})} = \\frac{${y2-y1}}{${x2-x1}} = ${m.toFixed(2)}$.</p>
                                         <p>Intercetta $q = y_1 - m x_1 = ${y1} - (${m.toFixed(2)})(${x1}) = ${q.toFixed(2)}$.</p>
                                         <p>Equazione esplicita: $y = ${m.toFixed(2)}x ${q>=0?'+':'-'} ${Math.abs(q).toFixed(2)}$.</p>
                                         <p>Equazione implicita: ${a_impl.toFixed(0)}x ${b_impl >= 0 ? '+' : '-'} ${Math.abs(b_impl).toFixed(0)}y ${c_impl >= 0 ? '+' : '-'} ${Math.abs(c_impl).toFixed(0)} = 0$.</p>`;
            }
            break;
        case 'parabola-vertex-focus':
            const a_p = userParams.a_parab_ex !== undefined ? userParams.a_parab_ex : (randFloat(-2, 2, 1) || 0.5); 
            const h_p = userParams.h_parab_ex !== undefined ? userParams.h_parab_ex : randInt(-3,3);
            const k_p = userParams.k_parab_ex !== undefined ? userParams.k_parab_ex : randInt(-3,3);
             htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            $a$: <input type="number" step="0.1" name="a_parab_ex" value="${a_p.toFixed(1)}" class="p-1 border rounded">
                            $h (V_x)$: <input type="number" step="0.1" name="h_parab_ex" value="${h_p}" class="p-1 border rounded">
                            $k (V_y)$: <input type="number" step="0.1" name="k_parab_ex" value="${k_p}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Data la parabola $y = ${a_p.toFixed(1)}(x ${h_p<0?'+':'-'} ${Math.abs(h_p)})^2 ${k_p>=0?'+':'-'} ${Math.abs(k_p)}$, trova vertice, fuoco e direttrice. ${htmlInputs}`;
            const vX = h_p; const vY = k_p;
            let fY, dirY;
            if (Math.abs(a_p) < 1e-9) { // Degenerate case if a=0
                 fY = "Non definito (a=0)"; dirY = "Non definito (a=0)";
            } else {
                fY = k_p + 1/(4*a_p);
                dirY = k_p - 1/(4*a_p);
            }
            solutionEl.innerHTML = `<p>L'equazione è in forma $y=a(x-h)^2+k$.</p>
                                     <p>Vertice $V(h, k) = (${vX.toFixed(2)}, ${vY.toFixed(2)})$.</p>
                                     ${Math.abs(a_p) < 1e-9 ? 
                                     `<p>Fuoco e direttrice non sono definiti nel modo standard poiché $a=0$ (la curva è una retta orizzontale $y=${k_p}$).</p>` :
                                     `<p>Fuoco $F(h, k + \\frac{1}{4a}) = (${vX.toFixed(2)}, ${fY.toFixed(2)})$.</p>
                                      <p>Direttrice $y = k - \\frac{1}{4a} = ${dirY.toFixed(2)}$.</p>`
                                     }`;
            break;
        case 'sphere-equation':
            const cx = userParams.cx_sphere !== undefined ? userParams.cx_sphere : randInt(-3,3); 
            const cy = userParams.cy_sphere !== undefined ? userParams.cy_sphere : randInt(-3,3); 
            const cz = userParams.cz_sphere !== undefined ? userParams.cz_sphere : randInt(-3,3);
            const r_s = userParams.r_sphere !== undefined ? userParams.r_sphere : randInt(1,5);
             htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            $C_x$: <input type="number" name="cx_sphere" value="${cx}" class="p-1 border rounded">
                            $C_y$: <input type="number" name="cy_sphere" value="${cy}" class="p-1 border rounded">
                            $C_z$: <input type="number" name="cz_sphere" value="${cz}" class="p-1 border rounded">
                            Raggio $r$: <input type="number" name="r_sphere" value="${r_s}" min="0.1" step="0.1" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Scrivere l'equazione della sfera di centro $C(${cx}, ${cy}, ${cz})$ e raggio $r=${r_s}$. ${htmlInputs}`;
            solutionEl.innerHTML = `<p>L'equazione della sfera è $(x-x_C)^2 + (y-y_C)^2 + (z-z_C)^2 = r^2$.</p>
                                     <p>Sostituendo i valori dati:</p>
                                     <p>$(x ${cx<0?'+':'-'} ${Math.abs(cx)})^2 + (y ${cy<0?'+':'-'} ${Math.abs(cy)})^2 + (z ${cz<0?'+':'-'} ${Math.abs(cz)})^2 = ${r_s}^2$</p>
                                     <p>$(x ${cx<0?'+':'-'} ${Math.abs(cx)})^2 + (y ${cy<0?'+':'-'} ${Math.abs(cy)})^2 + (z ${cz<0?'+':'-'} ${Math.abs(cz)})^2 = ${r_s*r_s}$.</p>`;
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
            generateGeoAnaliticaExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
