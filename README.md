# Manuale Interattivo di Analisi Matematica

Questo repository contiene il codice sorgente di **Analisi Pro**, un manuale digitale e interattivo per lo studio dell'analisi matematica e di alcuni argomenti propedeutici. Tutte le pagine sono in lingua italiana e possono essere consultate localmente tramite un comune browser web.

## Struttura del progetto

- `index.html` – pagina principale del manuale con i collegamenti alle varie sezioni.
- `sections/` – sotto‑cartella che ospita le pagine HTML dedicate a ciascun argomento (derivate, integrali, goniometria, ecc.).
- `js/` – script JavaScript che implementano gli elementi interattivi (esercizi parametrici, grafici, navigazione, ricerca…).
- `css/` – foglio di stile personalizzato.

Il progetto utilizza [Tailwind CSS](https://tailwindcss.com) tramite CDN e [MathJax](https://www.mathjax.org) per la resa delle formule matematiche.

## Come utilizzare il manuale

1. Clona o scarica il repository sul tuo computer.
2. Apri `index.html` con il browser: non sono necessarie compilazioni o dipendenze aggiuntive. In alternativa puoi eseguire un piccolo server HTTP locale (ad esempio `python -m http.server`) e visitare l'indirizzo indicato dal comando.
3. Naviga tra le sezioni e sperimenta gli esercizi interattivi, i grafici dinamici e i suggerimenti/soluzioni che possono essere mostrati o nascosti a piacere.

## Contributi

Il progetto è in fase iniziale. Sono benvenuti suggerimenti, correzioni e nuovi contenuti tramite pull request o issue.

## Licenza

Al momento non è stata specificata una licenza. Finché non verrà aggiunto un file `LICENSE`, si consiglia di contattare gli autori prima di riutilizzare il materiale.
