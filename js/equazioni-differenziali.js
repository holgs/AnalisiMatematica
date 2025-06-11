// Interactive elements and functionality specific to the differential equations section

document.addEventListener('DOMContentLoaded', function() {
    initSlopeFieldVisualizer();
    initFirstOrderLinearODESolver(); // Placeholder for now
    initSecondOrderHomogeneousODESolver(); // Added placeholder for this common type
    initEqDiffParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function initSlopeFieldVisualizer() {
    const container = document.getElementById('slope-field-visualizer');
    if (!container) return;
    container.innerHTML = '';

    const canvasDiv = document.createElement('div');
    canvasDiv.id = 'slope-field-canvas';
    canvasDiv.className = 'canvas-container h-96 mb-4'; // Taller canvas
    container.appendChild(canvasDiv);

    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'grid grid-cols-1 md:grid-cols-2 gap-4 p-2 bg-gray-50 rounded-lg border';
    controlsDiv.innerHTML = `
        <div>
            <label for="slope-fxy-select" class="block text-sm font-medium text-gray-700">Equazione $y' = f(x,y)$:</label>
            <select id="slope-fxy-select" class="interactive-control mt-1">
                <option value="x-y" data-latex="x-y" selected>y' = x - y</option>
                <option value="-x/y" data-latex="-x/y">y' = -x/y (Cerchi)</option>
                <option value="y" data-latex="y">y' = y (Esponenziale)</option>
                <option value="sin(x)" data-latex="\\sin(x)">y' = sin(x)</option>
                <option value="1/(1+x^2)" data-latex="1/(1+x^2)">y' = 1/(1+x²)</option>
            </select>
        </div>
        <div class="md:col-span-2 text-sm text-gray-700">
            Clicca sul grafico per tracciare una curva integrale passante per quel punto.
        </div>
    `;
    container.appendChild(controlsDiv);

    const fxySelect = document.getElementById('slope-fxy-select');
    let current_fxy = (x, y) => x - y; // Default function

    const graph = createFunctionGraph('slope-field-canvas', null, {
        xMin: -5, xMax: 5, yMin: -5, yMax: 5,
        gridStep: 1, responsive: true,
        padding: { left: 30, bottom: 20, top: 10, right: 10 },
        ariaLabel: "Campo di direzione e curve integrali per y' = f(x,y). Seleziona f(x,y) e clicca sul grafico."
    });
    if (!graph) return;

    const solutionCurves = []; // To store user-clicked solution curves

    function drawSlopeField() {
        const canvas = graph.getCanvas();
        const ctx = canvas.getContext('2d');
        const config = graph.getConfig();
        const { xMin, xMax, yMin, yMax, padding } = config;
        const graphWidth = canvas.width - padding.left - padding.right;
        const graphHeight = canvas.height - padding.top - padding.bottom;
        const xScale = graphWidth / (xMax - xMin);
        const yScale = graphHeight / (yMax - yMin);
        const originX_plot = -xMin * xScale; // Origin relative to graph area (not canvas)
        const originY_plot = yMax * yScale;  // Origin relative to graph area (not canvas)

        ctx.save();
        ctx.translate(padding.left, padding.top); // Translate to graph area origin

        const numSegmentsX = 20;
        const numSegmentsY = 20;
        const dx_world = (xMax - xMin) / numSegmentsX;
        const dy_world = (yMax - yMin) / numSegmentsY;
        const segmentLengthCanvas = Math.min(graphWidth / numSegmentsX, graphHeight / numSegmentsY) * 0.4;

        ctx.strokeStyle = '#a5b4fc'; // indigo-300
        ctx.lineWidth = 0.75;

        for (let i = 0; i <= numSegmentsX; i++) {
            for (let j = 0; j <= numSegmentsY; j++) {
                const x_world = xMin + i * dx_world;
                const y_world = yMin + j * dy_world;
                
                let slope;
                try {
                    slope = current_fxy(x_world, y_world);
                } catch (e) { slope = NaN; }


                if (isFinite(slope)) {
                    const angle = Math.atan(slope);
                    const x_canvas = originX_plot + x_world * xScale;
                    const y_canvas = originY_plot - y_world * yScale;

                    const dx_canvas = segmentLengthCanvas * Math.cos(angle);
                    const dy_canvas = segmentLengthCanvas * Math.sin(angle);

                    ctx.beginPath();
                    ctx.moveTo(x_canvas - dx_canvas / 2, y_canvas - dy_canvas / 2);
                    ctx.lineTo(x_canvas + dx_canvas / 2, y_canvas + dy_canvas / 2);
                    ctx.stroke();
                }
            }
        }
        ctx.restore(); // Restore original canvas context state
    }
    
    function updateSlopeFieldVisualizer() {
        const selectedVal = fxySelect.value;
        switch (selectedVal) {
            case 'x-y': current_fxy = (x,y) => x - y; break;
            case '-x/y': current_fxy = (x,y) => (Math.abs(y) < 1e-3 ? (y>=0 ? -x*1000 : x*1000) : -x/y); break; // Avoid division by zero
            case 'y': current_fxy = (x,y) => y; break;
            case 'sin(x)': current_fxy = (x,y) => Math.sin(x); break;
            case '1/(1+x^2)': current_fxy = (x,y) => 1 / (1 + x*x); break;
            default: current_fxy = (x,y) => x - y;
        }
        solutionCurves.length = 0; // Clear previous solutions when function changes
        graph.updateConfig({ curves: [] }); // Clear drawn solution curves
        graph.redraw(); // Redraw axes and grid
        drawSlopeField(); // Then draw the slope field on top
    }

    // Euler method for tracing solution curve
    function traceSolutionCurve(x0, y0) {
        const dt = 0.05; // Step size
        const steps = 200; // Number of steps in each direction
        let curvePointsFwd = [{x: x0, y: y0}];
        let curvePointsBwd = [{x: x0, y: y0}];

        // Forward
        let x = x0, y = y0;
        for (let i = 0; i < steps; i++) {
            let slope;
            try { slope = current_fxy(x, y); } catch(e) { break; }
            if(!isFinite(slope)) break;
            y += slope * dt;
            x += dt;
            if (x > graph.getConfig().xMax || y > graph.getConfig().yMax || y < graph.getConfig().yMin) break;
            curvePointsFwd.push({x, y});
        }
        // Backward
        x = x0; y = y0;
        for (let i = 0; i < steps; i++) {
            let slope;
            try { slope = current_fxy(x, y); } catch(e) { break; }
            if(!isFinite(slope)) break;
            y -= slope * dt; // Go backward
            x -= dt;
            if (x < graph.getConfig().xMin || y > graph.getConfig().yMax || y < graph.getConfig().yMin) break;
            curvePointsBwd.unshift({x,y}); // Add to beginning
        }
        
        const fullCurvePoints = curvePointsBwd.slice(0,-1).concat(curvePointsFwd); // Avoid duplicate start point
        
        // Add this as a new "curve" to the graph's config
        // This requires createFunctionGraph to support plotting array of points
        // For now, we'll add a new simple curve object with a "points" property
        solutionCurves.push({ points: fullCurvePoints, color: '#ef4444', width: 2 }); // Red color
        
        // Re-draw graph with existing curves and new solution
        graph.updateConfig({ 
            curves: solutionCurves.map(sc => { // Convert point arrays to drawable functions for the grapher
                return {
                    func: (x_val) => { // Interpolate or find nearest for plotting
                        // This is a simplified way; proper interpolation or point-plotting in createFunctionGraph is better
                        for (let i = 0; i < sc.points.length - 1; i++) {
                            if (x_val >= sc.points[i].x && x_val <= sc.points[i+1].x) {
                                const t = (x_val - sc.points[i].x) / (sc.points[i+1].x - sc.points[i].x);
                                if (!isFinite(t)) return sc.points[i].y;
                                return (1-t)*sc.points[i].y + t*sc.points[i+1].y; // Linear interpolation
                            }
                        }
                        return NaN; // Not in this segment's x-range
                    },
                    color: sc.color,
                    width: sc.width
                };
            })
        });
        graph.redraw(); // Redraw everything (axes, grid, slope field, solution curves)
        drawSlopeField(); // Redraw slope field on top again
    }

    graph.getCanvas().addEventListener('click', function(event) {
        const rect = graph.getCanvas().getBoundingClientRect();
        const config = graph.getConfig();
        const graphX = event.clientX - rect.left - config.padding.left;
        const graphY = event.clientY - rect.top - config.padding.top;

        const worldX = config.xMin + graphX / ( (canvas.width - config.padding.left - config.padding.right) / (config.xMax - config.xMin) );
        const worldY = config.yMax - graphY / ( (canvas.height - config.padding.top - config.padding.bottom) / (config.yMax - config.yMin) );
        
        if (worldX >= config.xMin && worldX <= config.xMax && worldY >= config.yMin && worldY <= config.yMax) {
            traceSolutionCurve(worldX, worldY);
        }
    });

    fxySelect.addEventListener('change', updateSlopeFieldVisualizer);
    // Initial draw
    updateSlopeFieldVisualizer(); 
    // Ensure slope field is drawn after initial graph setup by createFunctionGraph
    setTimeout(drawSlopeField, 100); // Small delay if graph init is async
    
    // Redraw slope field on resize too
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            graph.redraw(); // Redraws axes, grid, and any solution curves
            drawSlopeField(); // Then redraw slope field
        }, 100);
    });
}

function initFirstOrderLinearODESolver() {
    const container = document.getElementById('first-order-linear-ode-solver');
    if (!container) return;
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Risolutore interattivo per EDO lineari del primo ordine in sviluppo.</p>`;
}
function initSecondOrderHomogeneousODESolver() {
    const container = document.getElementById('second-order-homogeneous-ode-solver'); // Assuming this ID exists
    if (!container) return;
    // Placeholder - a full solver would take more UI and logic
    // container.innerHTML = `<p class="text-center text-gray-500 p-4 border rounded-md">Risolutore per EDO lineari omogenee del secondo ordine a coefficienti costanti in sviluppo.</p>`;
}


function initEqDiffParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="equazioni-differenziali"]');
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
                generateEqDiffExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise'));
            });
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input');
            initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateEqDiffExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}

function generateEqDiffExercise(exerciseId, textEl, solutionEl, userParams) {
    const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randCoeff = (allowZero = false, min_abs = 1, max_abs = 3) => {
        let val;
        do { val = randInt(min_abs, max_abs) * (Math.random() < 0.5 ? 1 : -1); } 
        while (val === 0 && !allowZero);
        return val;
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
        case 'separable-ode-parametric':
            // y' = f(x)g(y) -> Example y' = kx * y  or y' = k * y^m
            const k_sep = userParams.k_sep !== undefined ? userParams.k_sep : randCoeff(false, 1, 4);
            const n_sep = userParams.n_sep !== undefined ? userParams.n_sep : randInt(0, 2); // Power of x
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                            $k$: <input type="number" name="k_sep" value="${k_sep}" class="p-1 border rounded">
                            $n$ (per $x^n$): <input type="number" name="n_sep" value="${n_sep}" min="0" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvere l'equazione differenziale a variabili separabili: $y' = ${k_sep}x^{${n_sep}}y$. ${htmlInputs}`;
            
            solutionEl.innerHTML = `<p>Data $y' = \\frac{dy}{dx} = ${k_sep}x^{${n_sep}}y$.</p>
                                     <p>Separiamo le variabili (assumendo $y \\neq 0$): $\\frac{1}{y} dy = ${k_sep}x^{${n_sep}} dx$.</p>
                                     <p>Integriamo entrambi i membri:</p>
                                     <p>$\\int \\frac{1}{y} dy = \\int ${k_sep}x^{${n_sep}} dx$</p>
                                     <p>$\\ln|y| = ${k_sep}\\frac{x^{${n_sep}+1}}{${n_sep}+1} + C_1$</p>
                                     <p>$|y| = e^{${k_sep}\\frac{x^{${n_sep}+1}}{${n_sep}+1} + C_1} = e^{C_1} e^{${k_sep}\\frac{x^{${n_sep}+1}}{${n_sep}+1}}$</p>
                                     <p>Posto $C = \\pm e^{C_1}$ (una costante arbitraria non nulla), la soluzione generale è $y(x) = C e^{${k_sep/(n_sep+1)}x^{${n_sep}+1}}$.</p>
                                     <p>(Si noti che $y=0$ è anche una soluzione, talvolta inclusa nella forma generale per $C=0$ se la separazione non lo escludesse).</p>`;
            break;
        case 'linear-first-order-ode-parametric':
            // y' + P(x)y = Q(x) -> Example y' + ay = b
            const a_lin = userParams.a_lin !== undefined ? userParams.a_lin : randCoeff(false, 1, 3);
            const b_lin = userParams.b_lin !== undefined ? userParams.b_lin : randCoeff(true, 0, 5);
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                            $a$: <input type="number" name="a_lin" value="${a_lin}" class="p-1 border rounded">
                            $b$: <input type="number" name="b_lin" value="${b_lin}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvere l'EDO lineare del primo ordine: $y' + ${a_lin}y = ${b_lin}$. ${htmlInputs}`;
            
            // Fattore integrante mu(x) = e^(int P(x)dx) = e^(int a dx) = e^(ax)
            // y(x) = (1/mu(x)) * [int (mu(x)Q(x) dx) + C]
            // y(x) = e^(-ax) * [int (e^(ax) * b dx) + C]
            // y(x) = e^(-ax) * [b * (1/a)e^(ax) + C]  (if a != 0)
            // y(x) = b/a + C * e^(-ax)
            let sol_lin_str;
            if (a_lin === 0) { // y' = b
                sol_lin_str = `<p>Se $a=0$, l'equazione diventa $y' = ${b_lin}$.</p>
                               <p>Integrando direttamente: $y(x) = \\int ${b_lin} dx = ${b_lin}x + C$.</p>`;
            } else {
                sol_lin_str = `<p>Questa è un'EDO lineare del primo ordine $y' + P(x)y = Q(x)$ con $P(x)=${a_lin}$ e $Q(x)=${b_lin}$.</p>
                                 <p>Il fattore integrante è $\\mu(x) = e^{\\int P(x)dx} = e^{\\int ${a_lin}dx} = e^{${a_lin}x}$.</p>
                                 <p>La soluzione generale è $y(x) = \\frac{1}{\\mu(x)} \\left( \\int \\mu(x)Q(x)dx + C \\right)$.</p>
                                 <p>$y(x) = e^{-${a_lin}x} \\left( \\int e^{${a_lin}x} \\cdot ${b_lin} dx + C \\right)$</p>
                                 <p>$y(x) = e^{-${a_lin}x} \\left( ${b_lin} \\cdot \\frac{1}{${a_lin}}e^{${a_lin}x} + C \\right)$</p>
                                 <p>$y(x) = \\frac{${b_lin}}{${a_lin}} + Ce^{-${a_lin}x}$.</p>`;
            }
            solutionEl.innerHTML = sol_lin_str;
            break;
        case 'second-order-homogeneous-ode-parametric':
            // ay'' + by' + cy = 0
            const A_coeff = 1; // For simplicity, leading coeff is 1
            const B_coeff = userParams.B_coeff !== undefined ? userParams.B_coeff : randInt(-4, 4);
            const C_coeff = userParams.C_coeff !== undefined ? userParams.C_coeff : randInt(-5, 5);
            htmlInputs = `<div class="parametric-inputs mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            $b$ (coeff di $y'$): <input type="number" name="B_coeff" value="${B_coeff}" class="p-1 border rounded">
                            $c$ (coeff di $y$): <input type="number" name="C_coeff" value="${C_coeff}" class="p-1 border rounded">
                          </div>`;
            textEl.innerHTML = `Risolvere l'EDO lineare omogenea del secondo ordine a coefficienti costanti: $y'' + ${B_coeff}y' + ${C_coeff}y = 0$. ${htmlInputs}`;
            
            const delta = B_coeff*B_coeff - 4*A_coeff*C_coeff;
            let sol_type_str, sol_gen_str;

            if (delta > 0) {
                const r1 = (-B_coeff + Math.sqrt(delta)) / (2*A_coeff);
                const r2 = (-B_coeff - Math.sqrt(delta)) / (2*A_coeff);
                sol_type_str = `Il discriminante $\\Delta = ${B_coeff}^2 - 4(${A_coeff})(${C_coeff}) = ${delta} > 0$. Ci sono due radici reali distinte: $r_1 = ${r1.toFixed(2)}$ e $r_2 = ${r2.toFixed(2)}$.`;
                sol_gen_str = `$y(x) = C_1 e^{${r1.toFixed(2)}x} + C_2 e^{${r2.toFixed(2)}x}$.`;
            } else if (delta === 0) {
                const r = -B_coeff / (2*A_coeff);
                sol_type_str = `Il discriminante $\\Delta = ${B_coeff}^2 - 4(${A_coeff})(${C_coeff}) = 0$. C'è una radice reale doppia: $r = ${r.toFixed(2)}$.`;
                sol_gen_str = `$y(x) = (C_1 + C_2x)e^{${r.toFixed(2)}x}$.`;
            } else { // delta < 0
                const alpha = -B_coeff / (2*A_coeff);
                const beta = Math.sqrt(-delta) / (2*A_coeff);
                sol_type_str = `Il discriminante $\\Delta = ${B_coeff}^2 - 4(${A_coeff})(${C_coeff}) = ${delta} < 0$. Ci sono due radici complesse coniugate: $r = ${alpha.toFixed(2)} \\pm i${beta.toFixed(2)}$.`;
                sol_gen_str = `$y(x) = e^{${alpha.toFixed(2)}x}(C_1 \\cos(${beta.toFixed(2)}x) + C_2 \\sin(${beta.toFixed(2)}x))$.`;
            }
            solutionEl.innerHTML = `<p>L'equazione caratteristica associata è $Ar^2 + Br + Cr = 0$, qui $r^2 + ${B_coeff}r + ${C_coeff} = 0$.</p>
                                     <p>${sol_type_str}</p>
                                     <p>La soluzione generale è: ${sol_gen_str}</p>`;
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
            generateEqDiffExercise(exerciseId, textEl, solutionEl, params);
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
