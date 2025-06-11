document.addEventListener('DOMContentLoaded', function() {
    initCombinatoricsCalculator();
    initPascalTriangleGenerator();
    initBinomialExpander();
    initCombinatoricsParametricExercises();
    // Collapsibles and solutions are handled by main.js
});

function factorial(n) {
    if (n < 0) return NaN; 
    if (n > 170) return Infinity; // Prevent overflow for large numbers, JS max safe integer for factorials
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

function combinations(n, k) {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    if (k > n / 2) k = n - k; 
    if (n > 170) { // Handle large numbers by approximation or log gamma, for now indicate large
        // This is a simplification, true large number C(n,k) is more complex
        if (n-k < 20 && k < 20) { /* can proceed */ } else return Infinity;
    }
    let res = 1;
    for (let i = 1; i <= k; i++) {
        res = res * (n - i + 1) / i;
    }
    return Math.round(res); 
}

function permutations(n, k) {
    if (k < 0 || k > n) return 0;
    if (n > 170 && k > 20) return Infinity; // Heuristic, P(n,k) grows very fast
    let res = 1;
    for (let i = 0; i < k; i++) {
        res *= (n - i);
        if (!isFinite(res)) return Infinity; // Check for overflow during calculation
    }
    return res;
}

function initCombinatoricsCalculator() {
    const container = document.getElementById('combinatorics-calculator');
    if (!container) return;

    const nInput = document.getElementById('calc-n-value');
    const kInput = document.getElementById('calc-k-value');
    const typeSelect = document.getElementById('calc-type');
    const repetitionsInputContainer = document.getElementById('repetitions-input-container');
    const repetitionsInput = document.getElementById('repetitions-value');
    const calculateBtn = document.getElementById('calculate-combinatorics-btn');
    const resultDiv = document.getElementById('combinatorics-result');

    if (!nInput || !kInput || !typeSelect || !calculateBtn || !resultDiv) {
        console.error("One or more elements for combinatorics calculator not found.");
        return;
    }
    
    typeSelect.addEventListener('change', function() {
        const type = this.value;
        kInput.disabled = (type === 'factorial' || type === 'permutations-simple' || type === 'permutations-repetition');
        
        if (repetitionsInputContainer) { 
             repetitionsInputContainer.style.display = (type === 'permutations-repetition') ? 'block' : 'none';
        }
        // Set appropriate aria-labels or descriptions based on type
        if (type === 'permutations-repetition') {
            kInput.setAttribute('aria-label', 'K (non usato per permutazioni con ripetizione)');
            repetitionsInput.setAttribute('aria-required', 'true');
        } else {
            kInput.setAttribute('aria-label', 'Valore di k (elementi scelti)');
            if(repetitionsInput) repetitionsInput.setAttribute('aria-required', 'false');
        }
    });
    typeSelect.dispatchEvent(new Event('change'));


    calculateBtn.addEventListener('click', function() {
        const n = parseInt(nInput.value);
        const k = parseInt(kInput.value);
        const type = typeSelect.value;
        let result = 0;
        let formula = "";
        let explanation = "";

        if (isNaN(n) || n < 0) {
            resultDiv.innerHTML = '<p class="text-red-500">Inserisci un valore intero non negativo per n.</p>';
            return;
        }
        if (!kInput.disabled && (isNaN(k) || k < 0)) {
            resultDiv.innerHTML = '<p class="text-red-500">Inserisci un valore intero non negativo per k.</p>';
            return;
        }


        switch (type) {
            case 'factorial':
                if (n > 20 && n <=170) resultDiv.innerHTML = `<p class="text-yellow-500">Attenzione: il fattoriale di ${n} è un numero molto grande.</p>`;
                else if (n > 170) { resultDiv.innerHTML = `<p class="text-red-500">Il fattoriale di ${n} è troppo grande per essere calcolato con precisione.</p>`; return; }
                result = factorial(n);
                formula = `$P_n = n!$`;
                explanation = `$${n}! = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            case 'permutations-simple':
                 if (n > 20 && n <=170) resultDiv.innerHTML = `<p class="text-yellow-500">Attenzione: $P_{${n}}$ è un numero molto grande.</p>`;
                 else if (n > 170) { resultDiv.innerHTML = `<p class="text-red-500">$P_{${n}}$ è troppo grande per essere calcolato con precisione.</p>`; return; }
                result = factorial(n);
                formula = `$P_n = n!$`;
                explanation = `$P_{${n}} = ${n}! = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            case 'permutations-repetition':
                if (!repetitionsInput) {
                     resultDiv.innerHTML = '<p class="text-red-500">Campo per le ripetizioni non trovato.</p>';
                     return;
                }
                const repsStr = repetitionsInput.value.split(',').map(s => parseInt(s.trim()));
                if (repsStr.some(isNaN) || repsStr.reduce((sum, val) => sum + val, 0) !== n || repsStr.some(r => r < 0)) {
                    resultDiv.innerHTML = `<p class="text-red-500">Le ripetizioni devono essere numeri interi non negativi validi e la loro somma deve essere uguale a n (${n}). Es. per MAMMA (n=5) inserire 3,2.</p>`;
                    return;
                }
                let denFactorials = 1;
                let denFactorialsStr = "";
                for(let i=0; i < repsStr.length; i++){
                    const ni = repsStr[i];
                    if (ni > 170) { resultDiv.innerHTML = `<p class="text-red-500">Una delle ripetizioni (${ni}!) è troppo grande.</p>`; return;}
                    denFactorials *= factorial(ni);
                    denFactorialsStr += `${ni}!${i < repsStr.length - 1 ? '\\cdot' : ''}`;
                    if(!isFinite(denFactorials)) break;
                }
                if (!isFinite(denFactorials) || !isFinite(factorial(n))) {
                     resultDiv.innerHTML = `<p class="text-red-500">Calcolo troppo grande per le permutazioni con ripetizione.</p>`; return;
                }
                result = factorial(n) / denFactorials;
                formula = `$P_n^{(n_1, ..., n_m)} = \\frac{n!}{n_1! n_2! ... n_m!}$`;
                explanation = `$P_{${n}}^{(${repsStr.join(',')})} = \\frac{${n}!}{${denFactorialsStr}} = \\frac{${factorial(n).toLocaleString('it-IT')}}{${denFactorials.toLocaleString('it-IT')}} = ${result.toLocaleString('it-IT',{maximumFractionDigits: 0})}$`;
                break;
            case 'dispositions-simple':
                if (k > n) { resultDiv.innerHTML = '<p class="text-red-500">k non può essere maggiore di n per le disposizioni semplici.</p>'; return; }
                result = permutations(n, k);
                formula = `$D_{n,k} = \\frac{n!}{(n-k)!}$`;
                explanation = `$D_{${n},${k}} = \\frac{${n}!}{(${n}-${k})!} = \\frac{${n}!}{${n-k}!} = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            case 'dispositions-repetition':
                result = Math.pow(n, k);
                formula = `$D'_{n,k} = n^k$`;
                explanation = `$D'_{${n},${k}} = ${n}^{${k}} = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            case 'combinations-simple':
                if (k > n) { resultDiv.innerHTML = '<p class="text-red-500">k non può essere maggiore di n per le combinazioni semplici.</p>'; return; }
                result = combinations(n, k);
                formula = `$C_{n,k} = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}$`;
                explanation = `$C_{${n},${k}} = \\binom{${n}}{${k}} = \\frac{${n}!}{${k}!(${n}-${k})!} = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            case 'combinations-repetition':
                result = combinations(n + k - 1, k);
                formula = `$C'_{n,k} = \\binom{n+k-1}{k}$`;
                explanation = `$C'_{${n},${k}} = \\binom{${n}+${k}-1}{${k}} = \\binom{${n+k-1}}{${k}} = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
                break;
            default:
                 resultDiv.innerHTML = '<p class="text-yellow-500">Seleziona un tipo di calcolo.</p>';
                 return;
        }

        if (isNaN(result)) {
            resultDiv.innerHTML = '<p class="text-red-500">Risultato non calcolabile (es. n troppo grande o input non valido).</p>';
        } else {
            resultDiv.innerHTML = `
                <p><strong>Formula:</strong> ${formula}</p>
                <p><strong>Calcolo:</strong> ${explanation}</p>
                <p class="text-lg font-semibold mt-2"><strong>Risultato:</strong> ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}</p>
            `;
        }
        setupMathJaxRendering(resultDiv);
    });
     if (nInput.value && (kInput.value || kInput.disabled)) { 
        calculateBtn.click();
    }
}

function initPascalTriangleGenerator() {
    const container = document.getElementById('pascal-triangle-generator');
    if (!container) return;

    const rowsInput = document.getElementById('triangle-rows');
    const generateBtn = document.getElementById('generate-triangle-btn');
    const outputDiv = document.getElementById('pascal-triangle-output');

    if (!rowsInput || !generateBtn || !outputDiv) {
        console.error("Elements for Pascal's triangle generator not found.");
        return;
    }

    generateBtn.addEventListener('click', function() {
        const numRowsInput = parseInt(rowsInput.value);
        if (isNaN(numRowsInput) || numRowsInput < 0 || numRowsInput > 20) { 
            outputDiv.innerHTML = '<p class="text-red-500">Inserisci un numero di righe intero valido (0-20).</p>';
            return;
        }
        const numRows = numRowsInput; // n va da 0 a numRowsInput

        let triangleHTML = '<div class="overflow-x-auto"><table class="mx-auto border-collapse my-2" aria-label="Triangolo di Tartaglia">';
        triangleHTML += '<thead><tr><th scope="col" class="sr-only">Riga n</th><th scope="col" class="sr-only" colspan="'+ (numRows+1) +'">Coefficienti C(n,k)</th></tr></thead><tbody>';
        
        let previousRow = [];

        for (let n = 0; n <= numRows; n++) { // n è l'indice della riga (da 0)
            triangleHTML += `<tr><th scope="row" class="p-1 pr-2 text-right font-normal text-gray-600">n=${n}</th>`;
            let currentRow = [];
            for (let k = 0; k <= n; k++) { // k è l'indice dell'elemento nella riga (da 0)
                let value;
                if (k === 0 || k === n) {
                    value = 1;
                } else {
                    value = previousRow[k - 1] + previousRow[k];
                }
                currentRow.push(value);
                triangleHTML += `<td class="px-2 py-1 border border-gray-300 text-center hover:bg-blue-100 cursor-default" title="C(${n},${k})">${value.toLocaleString('it-IT')}</td>`;
            }
            previousRow = currentRow;
            triangleHTML += '</tr>';
        }
        triangleHTML += '</tbody></table></div>';
        outputDiv.innerHTML = triangleHTML;
    });
    if (rowsInput.value) { 
        generateBtn.click();
    }
}

function initBinomialExpander() {
    const container = document.getElementById('binomial-expander');
    if (!container) return;

    const aInput = document.getElementById('binomial-a');
    const bInput = document.getElementById('binomial-b');
    const nInput = document.getElementById('binomial-n');
    const expandBtn = document.getElementById('expand-binomial-btn');
    const resultDiv = document.getElementById('binomial-result');

    if (!aInput || !bInput || !nInput || !expandBtn || !resultDiv) {
        console.error("Elements for binomial expander not found.");
        return;
    }

    expandBtn.addEventListener('click', function() {
        const aTerm = aInput.value.trim() || "a";
        const bTerm = bInput.value.trim() || "b";
        const n = parseInt(nInput.value);

        if (isNaN(n) || n < 0 || n > 12) { // Max n=12 for reasonable display
            resultDiv.innerHTML = '<p class="text-red-500">Inserisci una potenza n intera valida (0-12).</p>';
            return;
        }

        if (n === 0) {
            resultDiv.innerHTML = `Espansione: $(${aTerm} + ${bTerm})^0 = 1$`;
            setupMathJaxRendering(resultDiv);
            return;
        }

        let expansionTerms = [];
        for (let k = 0; k <= n; k++) {
            const coeff = combinations(n, k);
            let termStr = "";

            if (coeff !== 1 || (n - k === 0 && k === 0)) { // Show coeff if not 1, OR if it's (a+b)^0 which is just 1
                 termStr += coeff;
            }
            
            if (n - k > 0) { 
                termStr += (coeff !== 1 && termStr !== "" && termStr !== coeff.toString() ? (coeff.toString().endsWith(" ") ? "" : " \\cdot ") : "") + `(${aTerm})`;
                if (n - k > 1) termStr += `^{${n-k}}`;
            }

            if (k > 0) { 
                termStr += (termStr !== "" && termStr !== coeff.toString() && !termStr.endsWith(" ") ? " \\cdot " : "") + `(${bTerm})`;
                if (k > 1) termStr += `^{${k}}`;
            }
            
            if(termStr === "" && coeff === 1) termStr = "1"; 
            if(coeff === 0) continue; // Should not happen for C(n,k) with k<=n

            expansionTerms.push(termStr);
        }
        
        let finalExpansion = expansionTerms.join(' + ');
        finalExpansion = finalExpansion.replace(/\+ -/g, '- '); 
        finalExpansion = finalExpansion.replace(/1 \cdot /g, ''); // Remove "1 * " for cleaner look if a or b is 1
        finalExpansion = finalExpansion.replace(/\(1\)/g, '1'); // (1) to 1


        resultDiv.innerHTML = `Espansione di $(${aTerm} + ${bTerm})^{${n}}$: <br> $ = ${finalExpansion}$`;
        setupMathJaxRendering(resultDiv);
    });
    if (nInput.value) { 
         expandBtn.click();
    }
}


function initCombinatoricsParametricExercises() {
    const parametricExercises = document.querySelectorAll('#main-content .parametric-exercise[data-section="calcolo-combinatorio"]');

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
                generateCombinatoricsExercise(exerciseId, exerciseTextEl, solutionContentEl, params);
                initSolutionToggles(exerciseTextEl.closest('.parametric-exercise')); 
            });
            // Initial generation with default or empty params from HTML (if any) or internal defaults
            const initialParams = {};
            const initialInputs = exerciseTextEl.querySelectorAll('.parametric-inputs input'); // If inputs are in HTML initially
             initialInputs.forEach(input => {
                initialParams[input.name] = parseFloat(input.value) || input.value;
            });
            generateCombinatoricsExercise(exerciseId, exerciseTextEl, solutionContentEl, initialParams);
        }
    });
}


function generateCombinatoricsExercise(exerciseId, textEl, solutionEl, userParams = {}) {
    let n_val, k_val, result, formulaStr, calculationStr; // Renamed n,k to avoid conflict
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
        case 'dispositions-repetition-parametric': 
            n_val = userParams.n_dr !== undefined ? userParams.n_dr : randInt(2, 5); 
            k_val = userParams.k_dr !== undefined ? userParams.k_dr : randInt(2, 4);
            result = Math.pow(n_val, k_val);
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                                  N oggetti: <input type="number" name="n_dr" value="${n_val}" class="p-1 border rounded w-20">
                                  K posti: <input type="number" name="k_dr" value="${k_val}" class="p-1 border rounded w-20">
                                </div>`;
            textEl.innerHTML = `Quante sequenze di ${k_val} elementi si possono formare da un insieme di ${n_val} tipi di elementi, ammettendo ripetizioni? (Es. password di ${k_val} cifre con ${n_val} simboli possibili)<br>${htmlInputs}`;
            formulaStr = `$D'_{n,k} = n^k$`;
            calculationStr = `$D'_{${n_val},${k_val}} = ${n_val}^{${k_val}} = ${result.toLocaleString('it-IT')}$`;
            break;
        case 'combinations-simple-parametric':
            n_val = userParams.n_cs !== undefined ? userParams.n_cs : randInt(4, 10); 
            k_val = userParams.k_cs !== undefined ? userParams.k_cs : randInt(2, n_val - 1);
            result = combinations(n_val, k_val);
             htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                                  N oggetti: <input type="number" name="n_cs" value="${n_val}" class="p-1 border rounded w-20">
                                  K scelti: <input type="number" name="k_cs" value="${k_val}" class="p-1 border rounded w-20">
                                </div>`;
            textEl.innerHTML = `In quanti modi si possono scegliere ${k_val} oggetti da un insieme di ${n_val} oggetti distinti, senza considerare l'ordine? (Es. formare un comitato di ${k_val} persone da ${n_val} candidati)<br>${htmlInputs}`;
            formulaStr = `$C_{n,k} = \\binom{n}{k} = \\frac{n!}{k!(n-k)!}$`;
            calculationStr = `$C_{${n_val},${k_val}} = \\binom{${n_val}}{${k_val}} = \\frac{${n_val}!}{${k_val}!(${n_val}-${k_val})!} = ${result.toLocaleString('it-IT')}$`;
            break;
        case 'permutations-simple-parametric':
            n_val = userParams.n_ps !== undefined ? userParams.n_ps : randInt(3, 7);
            result = factorial(n_val);
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                                  N oggetti: <input type="number" name="n_ps" value="${n_val}" class="p-1 border rounded w-20">
                                </div>`;
            textEl.innerHTML = `In quanti modi si possono ordinare ${n_val} oggetti distinti? (Es. anagrammi di una parola di ${n_val} lettere tutte diverse, o ${n_val} amici in fila)<br>${htmlInputs}`;
            formulaStr = `$P_n = n!$`;
            calculationStr = `$P_{${n_val}} = ${n_val}! = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
            break;
        case 'dispositions-simple-parametric':
            n_val = userParams.n_ds !== undefined ? userParams.n_ds : randInt(4, 8); 
            k_val = userParams.k_ds !== undefined ? userParams.k_ds : randInt(2, n_val-1);
            result = permutations(n_val,k_val);
            htmlInputs = `<div class="parametric-inputs mt-2 flex gap-2">
                                  N oggetti: <input type="number" name="n_ds" value="${n_val}" class="p-1 border rounded w-20">
                                  K scelti e ordinati: <input type="number" name="k_ds" value="${k_val}" class="p-1 border rounded w-20">
                                </div>`;
            textEl.innerHTML = `In quanti modi si possono scegliere e ordinare ${k_val} oggetti da ${n_val} oggetti distinti? (Es. podio con i primi ${k_val} classificati in una gara con ${n_val} partecipanti)<br>${htmlInputs}`;
            formulaStr = `$D_{n,k} = \\frac{n!}{(n-k)!}$`;
            calculationStr = `$D_{${n_val},${k_val}} = \\frac{${n_val}!}{(${n_val}-${k_val})!} = ${isFinite(result) ? result.toLocaleString('it-IT') : 'Numero troppo grande'}$`;
            break;
        case 'permutations-repetition-parametric':
            const defaultWord = "MAMMA";
            let inputWord = userParams.word_pr || defaultWord;
            inputWord = inputWord.toUpperCase().replace(/[^A-Z]/g, ''); 
            if (inputWord.length === 0 || inputWord.length > 15) inputWord = defaultWord; // Limit length for sanity

            n_val = inputWord.length;
            let counts = {};
            for (const char of inputWord) {
                counts[char] = (counts[char] || 0) + 1;
            }
            
            let repArray = [];
            let repDesc = [];
            for (const char in counts) {
                repArray.push(counts[char]);
                if (counts[char] > 1) {
                    repDesc.push(`${char}: ${counts[char]}`);
                }
            }

            let denFactorials = 1;
            let denFactorialsStr = "";
            repArray.forEach((ni, index) => {
                denFactorials *= factorial(ni);
                denFactorialsStr += `${ni}!${index < repArray.length - 1 ? '\\cdot' : ''}`;
            });
            result = factorial(n_val) / denFactorials;

            htmlInputs = `<div class="parametric-inputs mt-2">
                                  Parola: <input type="text" name="word_pr" value="${inputWord}" class="p-1 border rounded w-40" aria-label="Parola per anagrammi">
                                </div>`;
            textEl.innerHTML = `Quanti anagrammi (permutazioni con ripetizione) si possono formare dalla parola "${inputWord}"? (Lunghezza ${n_val}${repDesc.length > 0 ? '. Ripetizioni: ' + repDesc.join(', ') : ', tutte lettere distinte'}).<br>${htmlInputs}`;
            formulaStr = `$P_n^{(n_1, ..., n_m)} = \\frac{n!}{n_1! ... n_m!}$`;
            calculationStr = `$\\frac{${n_val}!}{${denFactorialsStr}} = \\frac{${isFinite(factorial(n_val)) ? factorial(n_val).toLocaleString('it-IT') : 'Grande!'}}{${isFinite(denFactorials) ? denFactorials.toLocaleString('it-IT'): 'Grande!'}} = ${isFinite(result) ? Math.round(result).toLocaleString('it-IT') : 'Numero troppo grande'}$`;
            break;
        default:
            textEl.innerHTML = "Esercizio non definito.";
            solutionEl.innerHTML = "";
            return;
    }

    solutionEl.innerHTML = `<p><strong>Formula Applicabile:</strong> ${formulaStr}</p>
                             <p><strong>Calcolo Specifico:</strong> ${calculationStr}</p>
                             <p class="font-semibold">Risultato: ${isFinite(result) ? result.toLocaleString('it-IT', {maximumFractionDigits:0}) : 'Numero troppo grande'}</p>`;
    
    // Re-attach input listeners if inputs are part of htmlInputs
    const newInputs = textEl.querySelectorAll('.parametric-inputs input');
    newInputs.forEach(input => {
        input.addEventListener('change', () => { // Or 'input' for more responsive updates
            const params = {};
            textEl.querySelectorAll('.parametric-inputs input').forEach(i => {
                params[i.name] = parseFloat(i.value) || i.value;
            });
            generateCombinatoricsExercise(exerciseId, textEl, solutionEl, params);
             // initSolutionToggles needs to be called on the parent .parametric-exercise for the specific toggle
            initSolutionToggles(textEl.closest('.parametric-exercise'));
        });
    });
    setupMathJaxRendering(textEl.closest('.parametric-exercise'));
}
