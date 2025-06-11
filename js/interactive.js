// Interactive elements shared across various sections

/**
 * Creates and manages a dynamic function graph in the specified container
 * @param {string} containerId - ID of the container element for the canvas
 * @param {function} initialFunction - (Optional) Initial function to graph
 * @param {object} options - Configuration options
 */
function createFunctionGraph(containerId, initialFunction, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error("Container not found for createFunctionGraph:", containerId);
        return null;
    }

    container.innerHTML = ''; 

    const defaults = {
        xMin: -10, xMax: 10, yMin: -10, yMax: 10,
        gridStep: 1, xAxisLabelInterval: 1, yAxisLabelInterval: 1,
        axisColor: '#374151', gridColor: '#e5e7eb', labelColor: '#4b5563', // Tailwind neutral colors
        curveColor: '#4f46e5', curveWidth: 2,
        width: container.clientWidth > 0 ? container.clientWidth : 400,
        height: container.clientHeight > 50 ? container.clientHeight : 300, 
        responsive: true,
        curves: initialFunction ? [{ func: initialFunction, color: '#4f46e5', width: 2 }] : [],
        markers: [], 
        horizontalLines: [], 
        verticalLines: [], 
        fillBelow: [], // {func, from, to, color}
        xAxisLabels: null, 
        yAxisLabels: null, 
        padding: { top: 20, right: 20, bottom: 30, left: 40 } 
    };
    
    const config = { ...defaults, ...options };
    config.padding = { ...defaults.padding, ...options.padding }; 

    const canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img'); // Accessibility
    // Dynamic aria-label should be set by the caller if needed
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');

    function drawGraph() {
        if (config.responsive && container.clientWidth > 0) {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight > 50 ? container.clientHeight : config.height;
        } else {
            canvas.width = config.width;
            canvas.height = config.height;
        }
        
        const graphWidth = canvas.width - config.padding.left - config.padding.right;
        const graphHeight = canvas.height - config.padding.top - config.padding.bottom;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(config.padding.left, config.padding.top);


        const xRange = config.xMax - config.xMin;
        const yRange = config.yMax - config.yMin;
        if (xRange <= 0 || yRange <= 0 || graphWidth <=0 || graphHeight <=0) { // Added check for non-positive ranges
            ctx.font = '12px Arial'; ctx.fillStyle = '#ef4444'; ctx.textAlign = 'center';
            ctx.fillText("Intervallo non valido per il grafico.", graphWidth/2, graphHeight/2);
            ctx.restore(); return;
        }

        const xScale = graphWidth / xRange;
        const yScale = graphHeight / yRange;
        const originX = -config.xMin * xScale;
        const originY = config.yMax * yScale;

        ctx.lineWidth = 0.5;
        ctx.strokeStyle = config.gridColor;
        ctx.font = '10px Arial';
        ctx.fillStyle = config.labelColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        for (let x = Math.ceil(config.xMin / config.gridStep) * config.gridStep; x <= config.xMax; x += config.gridStep) {
            if (Math.abs(x % config.xAxisLabelInterval) < 1e-9 || config.xAxisLabelInterval === config.gridStep || (x === 0 && (!config.xAxisLabels || config.xAxisLabels[x.toFixed(2)] === undefined))) {
                const gx = originX + x * xScale;
                if (gx >= -0.5 && gx <= graphWidth + 0.5) {
                    ctx.beginPath();
                    ctx.moveTo(gx, 0); ctx.lineTo(gx, graphHeight); ctx.stroke();
                    const xLabel = config.xAxisLabels && config.xAxisLabels[x.toFixed(2)] !== undefined ? config.xAxisLabels[x.toFixed(2)] : x.toFixed(config.gridStep < 1 ? 1 : 0);
                    if (Math.abs(x) > 1e-9 || (config.xAxisLabels && config.xAxisLabels[x.toFixed(2)])) { 
                         ctx.fillText(xLabel, gx, graphHeight + 5);
                    }
                }
            }
        }
        ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
        for (let y = Math.ceil(config.yMin / config.gridStep) * config.gridStep; y <= config.yMax; y += config.gridStep) {
             if (Math.abs(y % config.yAxisLabelInterval) < 1e-9 || config.yAxisLabelInterval === config.gridStep || (y === 0 && (!config.yAxisLabels || config.yAxisLabels[y.toFixed(2)] === undefined))) {
                const gy = originY - y * yScale;
                 if (gy >= -0.5 && gy <= graphHeight + 0.5) {
                    ctx.beginPath();
                    ctx.moveTo(0, gy); ctx.lineTo(graphWidth, gy); ctx.stroke();
                    const yLabel = config.yAxisLabels && config.yAxisLabels[y.toFixed(2)] !== undefined ? config.yAxisLabels[y.toFixed(2)] : y.toFixed(config.gridStep < 1 ? 1 : 0);
                     if (Math.abs(y) > 1e-9 || (config.yAxisLabels && config.yAxisLabels[y.toFixed(2)])) {
                        ctx.fillText(yLabel, -5, gy);
                    }
                }
            }
        }
        
        ctx.lineWidth = 1.5; ctx.strokeStyle = config.axisColor;
        if (originY >=0 && originY <= graphHeight) {
            ctx.beginPath(); ctx.moveTo(0, originY); ctx.lineTo(graphWidth, originY); ctx.stroke();
        }
        if (originX >=0 && originX <= graphWidth) {
            ctx.beginPath(); ctx.moveTo(originX, 0); ctx.lineTo(originX, graphHeight); ctx.stroke();
        }
        if (originX >=0 && originX <= graphWidth && originY >=0 && originY <= graphHeight) {
            ctx.fillStyle = config.axisColor; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
            ctx.fillText('0', originX - (originX > graphWidth - 10 ? 10 : (originX < 10 ? -5 : 0)) , originY + (originY < 10 ? 10 : (originY > graphHeight - 10 ? -5 : 2)));
        }


        config.horizontalLines.forEach(line => {
            const ly = originY - line.y * yScale;
            if (ly >=0 && ly <= graphHeight) {
                ctx.strokeStyle = line.color || '#ff0000'; ctx.lineWidth = line.width || 1;
                if (line.dash) ctx.setLineDash(line.dash); else ctx.setLineDash([]);
                ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(graphWidth, ly); ctx.stroke();
                if (line.label) {
                    ctx.fillStyle = line.color || '#ff0000'; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
                    ctx.fillText(line.label, 5, ly - 2);
                }
                ctx.setLineDash([]);
            }
        });
        config.verticalLines.forEach(line => {
            const lx = originX + line.x * xScale;
            if (lx >=0 && lx <= graphWidth) {
                ctx.strokeStyle = line.color || '#ff0000'; ctx.lineWidth = line.width || 1;
                if (line.dash) ctx.setLineDash(line.dash); else ctx.setLineDash([]);
                ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, graphHeight); ctx.stroke();
                 if (line.label) {
                    ctx.fillStyle = line.color || '#ff0000'; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
                    ctx.fillText(line.label, lx + 2, 5);
                }
                ctx.setLineDash([]);
            }
        });

        // Fill area under curve
        config.fillBelow.forEach(fill => {
            if (!fill.func || fill.from === undefined || fill.to === undefined) return;
            ctx.fillStyle = fill.color || 'rgba(0,0,255,0.1)';
            ctx.beginPath();
            let firstFillPoint = true;
            
            const startPx = Math.max(0, (fill.from - config.xMin) * xScale);
            const endPx = Math.min(graphWidth, (fill.to - config.xMin) * xScale);

            // Top edge (function)
            for (let px = startPx; px <= endPx; px++) {
                const x = config.xMin + px / xScale;
                let yVal;
                try { yVal = fill.func(x); } catch (e) { continue; }
                if (!isFinite(yVal)) continue;
                const py = originY - yVal * yScale;
                
                if (firstFillPoint) {
                    ctx.moveTo(px, originY); // Start from x-axis
                    ctx.lineTo(px, py);
                    firstFillPoint = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
            // Bottom edge (x-axis)
            if (!firstFillPoint) { // Only draw if points were plotted
                 ctx.lineTo(endPx, originY);
                 ctx.lineTo(startPx, originY);
            }
            ctx.closePath();
            ctx.fill();
        });


        config.curves.forEach(curve => {
            if (!curve.func) return;
            ctx.strokeStyle = curve.color || config.curveColor;
            ctx.lineWidth = curve.width || config.curveWidth;
            if (curve.dash) ctx.setLineDash(curve.dash); else ctx.setLineDash([]);
            ctx.beginPath();
            let firstPoint = true;
            for (let px = 0; px <= graphWidth; px++) {
                const x = config.xMin + px / xScale;
                let yVal;
                try { yVal = curve.func(x); } catch (e) { firstPoint = true; continue; }

                if (!isFinite(yVal) || yVal > config.yMax * 1.5 || yVal < config.yMin * 1.5) { 
                    firstPoint = true; continue;
                }
                const py = originY - yVal * yScale;
                if (py >= -graphHeight*0.2 && py <= graphHeight*1.2) { 
                    if (firstPoint) { ctx.moveTo(px, py); firstPoint = false; }
                    else { ctx.lineTo(px, py); }
                } else {
                    firstPoint = true;
                }
            }
            ctx.stroke();
            ctx.setLineDash([]);
        });

        config.markers.forEach(marker => {
            const mx = originX + marker.x * xScale;
            const my = originY - marker.y * yScale;
            if (mx >=0 && mx <= graphWidth && my >=0 && my <= graphHeight) {
                ctx.fillStyle = marker.color || '#ef4444'; // Tailwind red-500
                ctx.beginPath(); ctx.arc(mx, my, marker.radius || 4, 0, 2 * Math.PI); ctx.fill();
                if (marker.label) {
                    ctx.fillStyle = marker.labelColor || marker.color || '#ef4444';
                    ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
                    ctx.fillText(marker.label, mx + (marker.radius || 4) + 2, my - (marker.radius || 4) - 2);
                }
            }
        });
        ctx.restore(); 
    }

    drawGraph(); 

    let resizeTimer;
    if (config.responsive) {
        const observer = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(drawGraph, 50); // Shorter delay for ResizeObserver
        });
        observer.observe(container);
    }


    return {
        updateFunction: function(newFunction, curveIndex = 0) {
            if (config.curves[curveIndex]) {
                config.curves[curveIndex].func = newFunction;
            } else {
                config.curves[curveIndex] = { func: newFunction, color: config.curveColor, width: config.curveWidth };
            }
            drawGraph();
        },
        updateConfig: function(newConfig) {
            if (newConfig.padding) {
                config.padding = { ...config.padding, ...newConfig.padding };
                delete newConfig.padding; 
            }
            Object.assign(config, newConfig);
            drawGraph();
        },
        getConfig: function() { return config; },
        getCanvas: function() { return canvas; },
        redraw: drawGraph // Expose redraw for external calls if needed
    };
}


function createUnitCircle(containerId) {
     const container = document.getElementById(containerId);
     if (!container) {
        console.error("Container not found for createUnitCircle:", containerId);
         return null;
     }
     container.innerHTML = ''; 

     const canvas = document.createElement('canvas');
     const size = Math.min(container.clientWidth > 0 ? container.clientWidth : 300, 350); // Max size 350px
     canvas.width = size; canvas.height = size;
     canvas.setAttribute('role', 'img');
     canvas.setAttribute('aria-label', 'Cerchio unitario interattivo. Trascina il punto per cambiare angolo.');
     container.appendChild(canvas);
     const ctx = canvas.getContext('2d');
     
     let angle = Math.PI / 4; 
     let isDragging = false;

    const angleInfoDiv = document.createElement('div');
    angleInfoDiv.id = `unit-circle-info-${containerId}`; // Unique ID for ARIA
    angleInfoDiv.className = 'p-2 bg-gray-100 rounded text-sm mt-2 text-center';
    angleInfoDiv.setAttribute('aria-live', 'polite');
    container.appendChild(angleInfoDiv);

     function redraw() {
        const currentSize = Math.min(container.clientWidth > 0 ? container.clientWidth : 300, 350);
        if (canvas.width !== currentSize) { 
            canvas.width = currentSize; canvas.height = currentSize;
        }
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.70; // Adjusted radius
        const labelRadius = radius * 1.20; // Labels further out

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1; // slate-300
        ctx.beginPath(); ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY); ctx.stroke(); 
        ctx.beginPath(); ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height); ctx.stroke(); 

        ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2; // indigo-600
        ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); ctx.stroke();

        const Px = centerX + radius * Math.cos(angle);
        const Py = centerY - radius * Math.sin(angle); 

        ctx.strokeStyle = '#e11d48'; // rose-600
        ctx.beginPath(); ctx.moveTo(centerX, centerY); ctx.lineTo(Px, Py); ctx.stroke();

        ctx.fillStyle = '#e11d48';
        ctx.beginPath(); ctx.arc(Px, Py, 5, 0, 2 * Math.PI); ctx.fill();
        // Focusable point for accessibility (conceptual, actual focus requires off-screen element)
        // canvas.setAttribute('aria-activedescendant', 'point-P'); (if point P had an ID)


        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = '#059669'; ctx.lineWidth = 1.5; // emerald-600 for Sine
        ctx.beginPath(); ctx.moveTo(Px, Py); ctx.lineTo(Px, centerY); ctx.stroke(); 
        
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 1.5; // amber-600 for Cosine
        ctx.beginPath(); ctx.moveTo(Px, Py); ctx.lineTo(centerX, Py); ctx.stroke(); 
        ctx.setLineDash([]);

        ctx.fillStyle = '#4b5563'; // slate-600
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        // Sine label near the line
        ctx.fillText('sin θ', Px + (Px < centerX ? -15 : 15), Py + (Py < centerY ? 15 : -5) * (Math.abs(Math.sin(angle)) > 0.1 ? 1: 0) );
        // Cosine label near the line
        ctx.fillText('cos θ', Px + (Px < centerX ? 15 : -20) * (Math.abs(Math.cos(angle)) > 0.1 ? 1: 0) , Py + (Py < centerY ? -10 : 15));


        ctx.strokeStyle = '#fbbf24'; // amber-400
        ctx.beginPath(); ctx.arc(centerX, centerY, radius * 0.25, 0, -angle, angle > 0); ctx.stroke();

        ctx.fillStyle = '#374151'; ctx.font = '12px Arial'; // slate-700
        const keyAngles = {0: "0", [Math.PI/2]: "π/2", [Math.PI]: "π", [3*Math.PI/2]: "3π/2"};
        for (const angRad in keyAngles) {
            const lx = centerX + labelRadius * Math.cos(parseFloat(angRad));
            const ly = centerY - labelRadius * Math.sin(parseFloat(angRad)); 
            ctx.textAlign = lx > centerX + 5 ? 'left' : (lx < centerX - 5 ? 'right' : 'center');
            ctx.textBaseline = ly > centerY + 5 ? 'top' : (ly < centerY - 5 ? 'bottom' : 'middle');
            ctx.fillText(keyAngles[angRad], lx, ly);
        }
        
        const angleDeg = (angle * 180 / Math.PI);
        const angleDegNormalized = (angleDeg % 360 + 360) % 360; // Normalize to 0-360
        const sinVal = Math.sin(angle).toFixed(3);
        const cosVal = Math.cos(angle).toFixed(3);
        angleInfoDiv.innerHTML = `θ ≈ ${angleDegNormalized.toFixed(1)}° (${(angle/(Math.PI)).toFixed(2)}π rad)<br>sin θ ≈ ${sinVal}, cos θ ≈ ${cosVal}`;
     }

    function handleInteraction(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = clientX - rect.left;
        const mouseY = clientY - rect.top;
        const dx = mouseX - canvas.width / 2;
        const dy = mouseY - canvas.height / 2;
        angle = Math.atan2(-dy, dx); 
        redraw();
    }

    canvas.addEventListener('mousedown', e => { isDragging = true; handleInteraction(e.clientX, e.clientY); });
    canvas.addEventListener('mousemove', e => { if (isDragging) handleInteraction(e.clientX, e.clientY); });
    document.addEventListener('mouseup', () => isDragging = false); // Listen on document for mouseup outside canvas
    canvas.addEventListener('mouseleave', () => {}); // No longer setting isDragging to false here

    canvas.addEventListener('touchstart', e => { isDragging = true; handleInteraction(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault();}, {passive: false});
    canvas.addEventListener('touchmove', e => { if(isDragging) handleInteraction(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault();}, {passive: false});
    canvas.addEventListener('touchend', () => isDragging = false);

    redraw(); 
    
    let resizeTimer;
     const observer = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(redraw, 50);
    });
    observer.observe(container);


    return { 
        setAngle: newAngleRad => { angle = newAngleRad; redraw(); },
        getAngle: () => angle
    };
}


function createTriangleSolver(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    container.innerHTML = ''; 

    const uiHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mb-4">
            <div><label for="ts-side-a" class="block text-sm font-medium text-gray-700">Lato a:</label><input type="number" id="ts-side-a" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 5"></div>
            <div><label for="ts-side-b" class="block text-sm font-medium text-gray-700">Lato b:</label><input type="number" id="ts-side-b" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 7"></div>
            <div><label for="ts-side-c" class="block text-sm font-medium text-gray-700">Lato c:</label><input type="number" id="ts-side-c" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 10"></div>
            <div><label for="ts-angle-a" class="block text-sm font-medium text-gray-700">Angolo A (°):</label><input type="number" id="ts-angle-a" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 30"></div>
            <div><label for="ts-angle-b" class="block text-sm font-medium text-gray-700">Angolo B (°):</label><input type="number" id="ts-angle-b" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 60"></div>
            <div><label for="ts-angle-c" class="block text-sm font-medium text-gray-700">Angolo C (°):</label><input type="number" id="ts-angle-c" class="interactive-control p-1 border rounded w-full" step="any" placeholder="es. 90"></div>
        </div>
        <button id="ts-solve-btn" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 mb-4">Risolvi Triangolo</button>
        <button id="ts-clear-btn" class="ml-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:ring-2 focus:ring-gray-300 focus:ring-offset-1 mb-4">Pulisci</button>
        <div id="ts-results" class="p-3 bg-gray-100 rounded text-sm mb-4 min-h-[50px]" aria-live="polite">Inserisci almeno 3 valori (di cui almeno un lato).</div>
        <div class="canvas-container h-72 md:h-96"><canvas id="ts-canvas" aria-label="Visualizzazione del triangolo risolto"></canvas></div>
    `;
    container.innerHTML = uiHTML;

    const sideAEl = document.getElementById('ts-side-a');
    const sideBEl = document.getElementById('ts-side-b');
    const sideCEl = document.getElementById('ts-side-c');
    const angleAEl = document.getElementById('ts-angle-a');
    const angleBEl = document.getElementById('ts-angle-b');
    const angleCEl = document.getElementById('ts-angle-c');
    const solveBtn = document.getElementById('ts-solve-btn');
    const clearBtn = document.getElementById('ts-clear-btn');
    const resultsDiv = document.getElementById('ts-results');
    const canvas = document.getElementById('ts-canvas');
    const canvasContainer = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const inputElements = [sideAEl, sideBEl, sideCEl, angleAEl, angleBEl, angleCEl];

    function drawTriangle(s, ang) { 
        canvas.width = canvasContainer.clientWidth; 
        canvas.height = canvasContainer.clientHeight; 
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!s || !ang || isNaN(s.a*s.b*s.c*ang.A*ang.B*ang.C) || s.a<=0 || s.b<=0 || s.c<=0) {
            ctx.font = '14px Arial'; ctx.fillStyle = '#aaa'; ctx.textAlign = 'center';
            // Don't draw text if initial message is in resultsDiv
            // ctx.fillText("Dati insufficienti o non validi per disegnare.", canvas.width/2, canvas.height/2);
            return;
        }
        if (s.a + s.b <= s.c + 1e-9 || s.a + s.c <= s.b + 1e-9 || s.b + s.c <= s.a + 1e-9) { // Added tolerance
             ctx.font = '14px Arial'; ctx.fillStyle = 'red'; ctx.textAlign = 'center';
             ctx.fillText("Disuguaglianza triangolare non soddisfatta.", canvas.width/2, canvas.height/2);
             return;
        }

        const A_rad = ang.A * Math.PI / 180;
        const B_rad = ang.B * Math.PI / 180;
        
        const maxSide = Math.max(s.a, s.b, s.c);
        const scale = (Math.min(canvas.width, canvas.height) * 0.8) / maxSide;
        
        let vA = {x: 0, y: 0};
        let vB = {x: s.c * scale, y: 0};
        let vC = {x: s.b * scale * Math.cos(A_rad), y: s.b * scale * Math.sin(A_rad)};

        const allX = [vA.x, vB.x, vC.x]; const allY = [vA.y, vB.y, vC.y];
        const minX = Math.min(...allX); const maxX = Math.max(...allX);
        const minY = Math.min(...allY); const maxY = Math.max(...allY);
        const triWidth = maxX - minX; const triHeight = maxY - minY;
        
        const offsetX = (canvas.width - triWidth) / 2 - minX;
        const offsetY = (canvas.height - triHeight) / 2 - minY;

        vA.x += offsetX; vA.y += offsetY;
        vB.x += offsetX; vB.y += offsetY;
        vC.x += offsetX; vC.y += offsetY;

        ctx.beginPath(); ctx.moveTo(vA.x, vA.y); ctx.lineTo(vB.x, vB.y); ctx.lineTo(vC.x, vC.y); ctx.closePath();
        ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2; ctx.stroke();

        ctx.fillStyle = '#1f2937'; ctx.font = '12px Arial';
        const labelOffset = 15;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        
        // Angle labels (A, B, C vertices) - Side c is between A and B. Side a is opposite A. Side b is opposite B.
        ctx.fillText(`A (${ang.A.toFixed(1)}°)`, vA.x - labelOffset * Math.cos(A_rad / 2), vA.y - labelOffset * Math.sin(A_rad / 2));
        ctx.fillText(`B (${ang.B.toFixed(1)}°)`, vB.x + labelOffset * Math.cos(B_rad / 2), vB.y - labelOffset * Math.sin(B_rad / 2));
        ctx.fillText(`C (${ang.C.toFixed(1)}°)`, vC.x, vC.y + labelOffset);


        // Side labels - midpoints
        const midAB = {x: (vA.x+vB.x)/2, y: (vA.y+vB.y)/2};
        const midBC = {x: (vB.x+vC.x)/2, y: (vB.y+vC.y)/2};
        const midAC = {x: (vA.x+vC.x)/2, y: (vA.y+vC.y)/2};
        
        ctx.fillText(`c=${s.c.toFixed(1)}`, midAB.x, midAB.y - 10);
        // For sides a (BC) and b (AC), calculate normal to place label outside
        let normalBC = { x: vC.y - vB.y, y: vB.x - vC.x };
        let magBC = Math.sqrt(normalBC.x*normalBC.x + normalBC.y*normalBC.y);
        if(magBC === 0) magBC = 1;
        normalBC = { x: normalBC.x/magBC * 10, y: normalBC.y/magBC * 10};
        ctx.fillText(`a=${s.a.toFixed(1)}`, midBC.x + normalBC.x, midBC.y + normalBC.y);

        let normalAC = { x: vA.y - vC.y, y: vC.x - vA.x };
        let magAC = Math.sqrt(normalAC.x*normalAC.x + normalAC.y*normalAC.y);
        if(magAC === 0) magAC = 1;
        normalAC = { x: normalAC.x/magAC * 10, y: normalAC.y/magAC * 10};
        ctx.fillText(`b=${s.b.toFixed(1)}`, midAC.x + normalAC.x, midAC.y + normalAC.y);
    }

    function clearInputsAndResults() {
        inputElements.forEach(el => el.value = '');
        resultsDiv.innerHTML = "Inserisci almeno 3 valori (di cui almeno un lato).";
        drawTriangle(null, null);
    }
    clearBtn.addEventListener('click', clearInputsAndResults);

    solveBtn.addEventListener('click', () => {
        let s = { a: parseFloat(sideAEl.value), b: parseFloat(sideBEl.value), c: parseFloat(sideCEl.value) };
        let ang = { A: parseFloat(angleAEl.value), B: parseFloat(angleBEl.value), C: parseFloat(angleCEl.value) };
        
        let knownSides = (isNaN(s.a)?0:1) + (isNaN(s.b)?0:1) + (isNaN(s.c)?0:1);
        let knownAngles = (isNaN(ang.A)?0:1) + (isNaN(ang.B)?0:1) + (isNaN(ang.C)?0:1);

        if (knownSides + knownAngles < 3 || knownSides === 0) {
            resultsDiv.innerHTML = "<p class='text-red-500'>Servono almeno 3 valori, di cui almeno un lato.</p>";
            drawTriangle(null, null); return;
        }

        let angRad = { A: ang.A * Math.PI/180, B: ang.B * Math.PI/180, C: ang.C * Math.PI/180 };

        try {
            if (knownSides === 3) { // SSS
                if (s.a + s.b <= s.c + 1e-9 || s.a + s.c <= s.b + 1e-9 || s.b + s.c <= s.a + 1e-9) throw new Error("Disuguaglianza triangolare non soddisfatta.");
                angRad.A = Math.acos((s.b*s.b + s.c*s.c - s.a*s.a) / (2*s.b*s.c));
                angRad.B = Math.acos((s.a*s.a + s.c*s.c - s.b*s.b) / (2*s.a*s.c));
                if (isNaN(angRad.A) || isNaN(angRad.B)) throw new Error("Impossibile calcolare angoli (lati non validi).");
                angRad.C = Math.PI - angRad.A - angRad.B;
            }
            else if (knownAngles >= 2) { // ASA, AAS
                if (isNaN(angRad.A)) angRad.A = Math.PI - angRad.B - angRad.C;
                else if (isNaN(angRad.B)) angRad.B = Math.PI - angRad.A - angRad.C;
                else angRad.C = Math.PI - angRad.A - angRad.B;

                if (angRad.A <= 1e-9 || angRad.B <= 1e-9 || angRad.C <= 1e-9 || angRad.A >= Math.PI -1e-9 || angRad.B >= Math.PI -1e-9 || angRad.C >= Math.PI -1e-9 ) throw new Error("Angoli non validi (somma angoli errata o angoli non positivi/troppo grandi).");

                if (!isNaN(s.a)) {
                    s.b = s.a * Math.sin(angRad.B) / Math.sin(angRad.A);
                    s.c = s.a * Math.sin(angRad.C) / Math.sin(angRad.A);
                } else if (!isNaN(s.b)) {
                    s.a = s.b * Math.sin(angRad.A) / Math.sin(angRad.B);
                    s.c = s.b * Math.sin(angRad.C) / Math.sin(angRad.B);
                } else if (!isNaN(s.c)){ 
                    s.a = s.c * Math.sin(angRad.A) / Math.sin(angRad.C);
                    s.b = s.c * Math.sin(angRad.B) / Math.sin(angRad.C);
                } else {  throw new Error("Caso ASA/AAS: un lato deve essere noto.");}
            }
            else if (knownSides === 2 && knownAngles === 1) { // SAS or SSA
                // SAS
                if (!isNaN(s.a) && !isNaN(s.b) && !isNaN(angRad.C)) { // a,b,C known
                    s.c = Math.sqrt(s.a*s.a + s.b*s.b - 2*s.a*s.b*Math.cos(angRad.C));
                    angRad.A = Math.acos((s.b*s.b + s.c*s.c - s.a*s.a) / (2*s.b*s.c));
                    if(isNaN(angRad.A)) throw new Error("Errore nel calcolo di Angolo A (SAS)");
                    angRad.B = Math.PI - angRad.A - angRad.C;
                } else if (!isNaN(s.a) && !isNaN(s.c) && !isNaN(angRad.B)) { // a,c,B known
                    s.b = Math.sqrt(s.a*s.a + s.c*s.c - 2*s.a*s.c*Math.cos(angRad.B));
                    angRad.A = Math.acos((s.b*s.b + s.c*s.c - s.a*s.a) / (2*s.b*s.c));
                     if(isNaN(angRad.A)) throw new Error("Errore nel calcolo di Angolo A (SAS)");
                    angRad.C = Math.PI - angRad.A - angRad.B;
                } else if (!isNaN(s.b) && !isNaN(s.c) && !isNaN(angRad.A)) { // b,c,A known
                    s.a = Math.sqrt(s.b*s.b + s.c*s.c - 2*s.b*s.c*Math.cos(angRad.A));
                    angRad.B = Math.acos((s.a*s.a + s.c*s.c - s.b*s.b) / (2*s.a*s.c));
                     if(isNaN(angRad.B)) throw new Error("Errore nel calcolo di Angolo B (SAS)");
                    angRad.C = Math.PI - angRad.A - angRad.B;
                }
                // SSA (Ambiguous case) - Simplified: one solution or error
                else {
                    resultsDiv.innerHTML = "<p class='text-orange-500'>Caso SSA (ambiguo): una soluzione mostrata se esiste. Potrebbero essercene due o zero.</p>";
                    if (!isNaN(s.a) && !isNaN(s.b) && !isNaN(angRad.A)) { // a, b, A known
                        if (s.a < s.b * Math.sin(angRad.A) - 1e-9) throw new Error("Nessuna soluzione (a troppo corto).");
                        if (Math.abs(s.a - s.b * Math.sin(angRad.A)) < 1e-9) { // Right triangle
                             angRad.B = Math.PI / 2;
                        } else if (s.a >= s.b) { // One solution for B
                             angRad.B = Math.asin(s.b * Math.sin(angRad.A) / s.a);
                        } else { // s.b * sin(A) < s.a < s.b : Two solutions, show acute B
                            angRad.B = Math.asin(s.b * Math.sin(angRad.A) / s.a);
                            resultsDiv.innerHTML += "<br><span class='text-sm text-orange-600'>(Mostrato angolo B acuto, potrebbe esistere anche un angolo B ottuso)</span>";
                        }
                        angRad.C = Math.PI - angRad.A - angRad.B;
                        s.c = s.a * Math.sin(angRad.C) / Math.sin(angRad.A);
                    } // Add other SSA permutations... (b,c,B), (a,c,C) etc.
                    else { throw new Error("Caso SSA non completamente gestito per questa combinazione."); }
                }
            } else {
                throw new Error("Combinazione di input non gestita o insufficiente.");
            }

            ang.A = angRad.A * 180/Math.PI; ang.B = angRad.B * 180/Math.PI; ang.C = angRad.C * 180/Math.PI;

            if (isNaN(s.a*s.b*s.c*ang.A*ang.B*ang.C) || s.a<=1e-9 || s.b<=1e-9 || s.c<=1e-9 || ang.A<=1e-9 || ang.B<=1e-9 || ang.C<=1e-9 || Math.abs(ang.A+ang.B+ang.C - 180) > 0.1) {
                throw new Error("Soluzione non valida (lati/angoli negativi/nulli o somma angoli errata).");
            }

            sideAEl.value = s.a.toFixed(2); sideBEl.value = s.b.toFixed(2); sideCEl.value = s.c.toFixed(2);
            angleAEl.value = ang.A.toFixed(2); angleBEl.value = ang.B.toFixed(2); angleCEl.value = ang.C.toFixed(2);

            const semiP = (s.a + s.b + s.c) / 2;
            const area = Math.sqrt(Math.max(0, semiP * (semiP-s.a) * (semiP-s.b) * (semiP-s.c))); // max(0,..) for robustness
            
            let currentContent = resultsDiv.innerHTML;
            if (currentContent.startsWith("<p class='text-orange-500'>")) { // If SSA message exists
                 resultsDiv.innerHTML = currentContent + `<br>Risultati: a=${s.a.toFixed(2)}, b=${s.b.toFixed(2)}, c=${s.c.toFixed(2)}<br>A=${ang.A.toFixed(2)}°, B=${ang.B.toFixed(2)}°, C=${ang.C.toFixed(2)}°<br>Area ≈ ${area.toFixed(2)}`;
            } else {
                resultsDiv.innerHTML = `Risultati: a=${s.a.toFixed(2)}, b=${s.b.toFixed(2)}, c=${s.c.toFixed(2)}<br>A=${ang.A.toFixed(2)}°, B=${ang.B.toFixed(2)}°, C=${ang.C.toFixed(2)}°<br>Area ≈ ${area.toFixed(2)}`;
            }
            drawTriangle(s, ang);

        } catch (error) {
            resultsDiv.innerHTML = "<p class='text-red-500'>Errore: " + error.message + "</p>";
            drawTriangle(null, null);
        }
        setupMathJaxRendering(resultsDiv);
    });
    
    drawTriangle(null, null);
    const observer = new ResizeObserver(() => {
        drawTriangle(
            { a: parseFloat(sideAEl.value), b: parseFloat(sideBEl.value), c: parseFloat(sideCEl.value) },
            { A: parseFloat(angleAEl.value), B: parseFloat(angleBEl.value), C: parseFloat(angleCEl.value) }
        );
    });
    observer.observe(canvasContainer);
}
