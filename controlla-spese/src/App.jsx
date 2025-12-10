import { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import Prodotto from './prodotto';
import PocketBase from 'pocketbase';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";


// Inizializzazione di PocketBase all'esterno del componente per evitare ricreazioni
const pb = new PocketBase('http://127.0.0.1:8090');
const THEMES_NON_PREDEFINITI = ['cyberpunk', 'synthwave', 'forest', 'aqua'];
const THEMES_MAP = {
  'Scuro (default)': 'dark',
  'Chiaro': 'winter',
};

// Popoliamo la mappa dei temi una sola volta
THEMES_NON_PREDEFINITI.forEach(thm => {
  const maiuscolo = thm[0].toUpperCase() + thm.slice(1);
  THEMES_MAP[maiuscolo] = thm;
});

const CATEGORIE = ['Abbigliamento', 'Alimentari', 'Cartoleria', 'Casa e Arredamento', 'Giochi ed elettronica',
  'Medicinali e salute', 'Sport e tempo libero', 'Lavoro'].sort().concat('Altro');


function App() {

  const [data, setData] = useState([]); // Dati completi non filtrati
  const [filteredData, setFilteredData] = useState([]); // Dati correnti visualizzati

  // Range di prezzo ORIGINALE (basato su tutti i dati)
  const [prezzoMin, setPrezzoMin] = useState(0);
  const [prezzoMax, setPrezzoMax] = useState(0);

  // Range di prezzo SELEZIONATO dall'utente per il filtro
  const [prezzoMinSelezionato, setPrezzoMinSelezionato] = useState(0);
  const [prezzoMaxSelezionato, setPrezzoMaxSelezionato] = useState(0);

  const [nomeRicerca, setNomeRicerca] = useState("");

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');


  // 1. useEffect per Gestione Tema
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Handler per cambio tema
  const handleThemeChange = (event) => {
    setTheme(event.target.value);
  };

  // Funzione per ricalcolare il range di prezzo totale (uso useCallback per stabilità)
  const calculatePriceRange = useCallback((currentData) => {
    if (currentData.length === 0) return { min: 0, max: 0 };
    const prezzi = currentData.map(item => Number(item.prezzo));
    return {
      min: Math.min(...prezzi),
      max: Math.max(...prezzi)
    };
  }, []);

  // 2. useEffect per Inizializzazione Dati (fetch all'avvio)
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://127.0.0.1:8090/api/collections/spese/records");
        if (!response.ok) throw new Error("Errore nel fetch dei dati");

        const responseData = await response.json();

        const listaProdotti = responseData.items.map(item => ({
          nome: item.nome,
          descrizione: item.descrizione,
          prezzo: Number(item.prezzo), // Converti subito in numero
          quantita: item.quantita,
          tipologia: item.tipologia,
          data_acquisto: item.data_acquisto,
          data_creazione: item.created,
          id: item.id
        }));

        setData(listaProdotti);

      } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
      }
    }
    fetchData();
  }, []);


  // 3. useEffect per Inizializzazione/Ricalcolo Range Prezzi Totale
  useEffect(() => {
    if (data.length === 0) return;

    const { min, max } = calculatePriceRange(data);

    // Imposta il range totale
    setPrezzoMin(min);
    setPrezzoMax(max);

    // Imposta il range di filtro iniziale solo la prima volta (quando sono a 0)
    // o aggiorna se il range totale è cambiato (es. dopo una cancellazione o aggiunta)
    // Non resettare il filtro dell'utente se ha già selezionato qualcosa
    if (prezzoMinSelezionato === 0 && prezzoMaxSelezionato === 0) {
      setPrezzoMinSelezionato(min);
      setPrezzoMaxSelezionato(max);
    }
    // Eseguito la prima volta o quando 'data' cambia
  }, [data, calculatePriceRange]);


  const dataPerCategoria = useMemo(() => {
    const mappa = {};

    data.forEach(item => {
      if (!mappa[item.tipologia]) mappa[item.tipologia] = 0;
      mappa[item.tipologia] += Number(item.prezzo) * Number(item.quantita);
    });

    // Converto nel formato richiesto da Nivo
    return Object.keys(mappa).map(cat => ({
      id: cat,
      label: cat,
      value: mappa[cat]
    }));
  }, [data]);

  const [periodo, setPeriodo] = useState("tutto");

  const dataPerPeriodo = useMemo(() => {
    if (data.length === 0) return [];

    const oggi = new Date();
    let dataInizio;

    switch (periodo) {
      case "settimana":
        dataInizio = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - 7);
        break;
      case "mese":
        dataInizio = new Date(oggi.getFullYear(), oggi.getMonth() - 1, oggi.getDate());
        break;
      case "anno":
        dataInizio = new Date(oggi.getFullYear() - 1, oggi.getMonth(), oggi.getDate());
        break;
      default:
        dataInizio = new Date(0); // tutto
        break;
    }

    // Raggruppo la spesa per giorno
    const mappa = {};

    data.forEach(item => {
      const dataAcq = new Date(item.data_acquisto);
      if (dataAcq >= dataInizio) {
        const giorno = dataAcq.toISOString().split("T")[0];
        const costo = Number(item.prezzo) * Number(item.quantita);

        if (!mappa[giorno]) mappa[giorno] = 0;
        mappa[giorno] += costo;
      }
    });

    // Ordino le date
    const dateOrdinate = Object.keys(mappa).sort();

    return [
      {
        id: "Spesa Totale",
        data: dateOrdinate.map(giorno => ({
          x: giorno,
          y: mappa[giorno]
        }))
      }
    ];
  }, [data, periodo]);

  // 4. useEffect per Applicazione Filtri (Unico punto di verità per il filtraggio)
  // Questo useEffect viene eseguito ogni volta che uno dei parametri di filtro cambia.
  useEffect(() => {
    // 1. Filtro per prezzo
    let currentFiltered = data.filter(item => {
      return item.prezzo >= prezzoMinSelezionato && item.prezzo <= prezzoMaxSelezionato;
    });

    // 2. Filtro per nome/descrizione (se nomeRicerca non è vuoto)
    if (nomeRicerca) {
      const searchTerm = nomeRicerca.toLowerCase();
      currentFiltered = currentFiltered.filter(item =>
        item.nome.toLowerCase().includes(searchTerm) ||
        item.descrizione.toLowerCase().includes(searchTerm)
      );
    }

    // Controlli di sicurezza (es. se i prezzi selezionati escono dal range originale)
    const minClamped = Math.max(prezzoMin, prezzoMinSelezionato);
    const maxClamped = Math.min(prezzoMax, prezzoMaxSelezionato);

    // Ricalcola il filtro in base ai valori *selezionati* dall'utente e al testo di ricerca
    currentFiltered = data.filter(item => {
      const prezzoItem = Number(item.prezzo);
      const isPriceMatch = prezzoItem >= minClamped && prezzoItem <= maxClamped;

      if (!nomeRicerca) {
        return isPriceMatch;
      }

      const searchTerm = nomeRicerca.toLowerCase();
      const isTextMatch = item.nome.toLowerCase().includes(searchTerm) ||
        item.descrizione.toLowerCase().includes(searchTerm);

      return isPriceMatch && isTextMatch;
    });

    setFilteredData(currentFiltered);

  }, [data, prezzoMinSelezionato, prezzoMaxSelezionato, nomeRicerca, prezzoMin, prezzoMax]);


  // Handler per la ricerca per nome
  const HandleRicercaPerNome = (event) => {
    // Aggiorna lo stato, il filtraggio avverrà nel useEffect di filtro centralizzato
    setNomeRicerca(event.target.value);
  }

  // Handler per il cambio range di prezzo
  const handlePriceRangeChange = (event) => {
    const { name, value } = event.target;
    const valore = Number(value);

    if (name === 'min') {
      // Imposta il minimo, assicurandosi che non superi il massimo selezionato
      setPrezzoMinSelezionato(Math.min(valore, prezzoMaxSelezionato));
    } else if (name === 'max') {
      // Imposta il massimo, assicurandosi che non sia inferiore al minimo selezionato
      setPrezzoMaxSelezionato(Math.max(valore, prezzoMinSelezionato));
    }
    // Il filtro sarà aggiornato nell'useEffect di filtro centralizzato
  }

  // La funzione handleApplicaFiltro è stata resa vuota perché il filtraggio è automatico
  // a ogni cambio di prezzo. Serve solo a chiudere il modale.
  const handleApplicaFiltro = () => {
    document.getElementById("modaleFiltro").close();
  }

  const handleResetFiltro = () => {
    // CORREZIONE: Usare i range totali (originali)
    setPrezzoMinSelezionato(prezzoMin);
    setPrezzoMaxSelezionato(prezzoMax);
    setNomeRicerca("");
    // Il setFilteredData viene gestito dall'useEffect di filtro centralizzato
    document.getElementById("ricercaNome").value = ""; // Pulisce l'input di ricerca

    document.getElementById("modaleFiltro").close();
  }

  const handleAggiungiSpesa = async (nuovoAcquisto) => {
    try {
      const response = await fetch("http://127.0.0.1:8090/api/collections/spese/records", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuovoAcquisto)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Errore PocketBase:", errorData);
        alert(`Errore nell'aggiunta: ${response.status} ${response.statusText}`);
        return;
      }

      document.getElementById("formSpesa").reset();

      const recordCreato = await response.json();

      // Aggiorna data con il nuovo elemento (come oggetto JS, PocketBase restituisce l'oggetto completo)
      setData(prevData => [{
        ...recordCreato,
        prezzo: Number(recordCreato.prezzo) // Garantisce che 'prezzo' sia numerico
      }, ...prevData]);


      // Se è attivo un filtro, aggiorna i range di prezzo
      if (recordCreato.prezzo <= prezzoMin && recordCreato.prezzo >= prezzoMax &&
        (recordCreato.nome.toLowerCase().includes(nomeRicerca.toLowerCase()) || recordCreato.descrizione.toLowerCase().includes(nomeRicerca.toLowerCase()))) {
        setFilteredData(prevFiltered => [recordCreato, ...prevFiltered]);
      }


      // Non è necessario aggiornare filteredData qui, lo farà il `useEffect` di filtro

      document.getElementById("modaleAggiungiSpesa").close();

    } catch (error) {
      console.error("Errore di rete o catch finale:", error);
      alert("Impossibile connettersi al server PocketBase.");
    }
  };

  // Utilizziamo useCallback per stabilizzare la funzione passata come prop
  const handleRimuoviSpesa = useCallback((id) => async () => {
    try {
      await pb.collection('spese').delete(id);

      // Aggiorna l'array data rimuovendo l'elemento
      setData(prevData => {
        const newData = prevData.filter(item => item.id !== id);

        // CORREZIONE: Ricalcola il range di prezzo totale DOPO l'eliminazione
        // Questo è necessario perché l'elemento rimosso potrebbe essere il min o max.
        const { min, max } = calculatePriceRange(newData);
        setPrezzoMin(min);
        setPrezzoMax(max);

        // Se il filtro attuale è fuori dal nuovo range, lo resetta
        setPrezzoMinSelezionato(prevMin => Math.max(prevMin, min));
        setPrezzoMaxSelezionato(prevMax => Math.min(prevMax, max));

        return newData;
      });
      // Non è necessario aggiornare filteredData qui, lo farà il `useEffect` di filtro

    } catch (error) {
      console.error("Errore durante la rimozione della spesa:", error);
      alert("Errore durante la rimozione della spesa.");
    }
  }, [calculatePriceRange]); // Inserisci calculatePriceRange nelle dipendenze


  return (
    <div className="container mx-auto p-4" data-theme={theme}>
      <div id="barraNav"
        className="
    card fixed 
    top-4 left-4 right-4 z-50 
    shadow-xl glass rounded-box p-4
    text-primary-content/80
    flex justify-between items-center">
        <div className="flex items-center">
          <button className="btn btn-primary btn-sm m-2" onClick={
            () => {
              document.getElementById("modaleAggiungiSpesa").showModal()
            }
          }>
            Aggiungi Spesa
          </button>

          {/* RICERCA PER NOME*/}
          <input type="text" placeholder="Cerca Spesa"
            className="input input-bordered input-primary w-full max-w-xs m-2"
            id="ricercaNome"
            value={nomeRicerca} // Aggiunto per permettere l'aggiornamento dopo il reset
            onChange={HandleRicercaPerNome}
          />

          <button className="btn btn-secondary btn-sm m-2" disabled={
            data.length === 0
          }
            onClick={() => {
              document.getElementById("modaleFiltro").showModal()
            }}>Range di prezzo</button>
        </div>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn m-1">
            Tema
            <svg
              width="12px"
              height="12px"
              className="inline-block h-2 w-2 fill-current opacity-60"
              viewBox="0 0 2048 2048">
              <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
            </svg>
          </div>
          {/*SCELTA TEMI*/}
          <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-10 w-52 p-2 shadow-2xl"
            onChange={handleThemeChange}
            data-theme={theme}
          >
            {Object.keys(THEMES_MAP).map((thm) => (
              <li key={thm}>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label={thm}
                  value={THEMES_MAP[thm]}
                  checked={THEMES_MAP[thm] === theme} // Aggiunto per evidenziare il tema corrente
                  onChange={() => { }} // Dummy handler per evitare warning se 'checked' è usato
                />
              </li>
            ))}
          </ul>
        </div>

        {/* MODALE AGGIUNTA */}
        <dialog id="modaleAggiungiSpesa" className="modal">
          <div className="modal-box">

            <form
              data-theme={theme}
              id="formSpesa"
              onSubmit={async (e) => {
                e.preventDefault();

                const form = e.target;
                if (!form.checkValidity()) {
                  form.reportValidity();
                  return;
                }

                const formData = new FormData(form);

                const dataAcquisto = formData.get("data");
                const oraAcquisto = formData.get("ora");

                const nuovoAcquisto = {
                  nome: formData.get("nome"),
                  quantita: Number(formData.get("quantita")), // Converti in numero
                  prezzo: Number(formData.get("prezzo")), // Converti in numero
                  tipologia: formData.get("categoria"),
                  descrizione: formData.get("descrizione"),
                  data_acquisto: `${dataAcquisto} ${oraAcquisto}:00Z` // Formato PocketBase corretto
                };

                await handleAggiungiSpesa(nuovoAcquisto);
              }}
            >
              <h2 className="font-bold text-lg mb-4">Aggiungi una nuova spesa</h2>

              <div className="flex flex-col items-start mx-auto w-full max-w-xs">
                {/* Ometti i campi del form per brevità */}
                <input type="text" name="nome" placeholder="Nome Spesa" className="input rounded-lg w-full mb-2" required />
                <input type="number" name="prezzo" placeholder="Importo (€)" className="input rounded-lg w-full mb-2" min="0" step="0.01" required />
                <input type="number" name="quantita" placeholder="Quantità" className="input rounded-lg w-full mb-4" min="1" required />

                <label className="label">Data di acquisto</label>
                <input type="date" name="data" required className='input rounded-lg w-full mb-2' />

                <label className="label">Ora di acquisto</label>
                <input type="time" name="ora" required className='input rounded-lg w-full mb-2' />

                <select
                  name="categoria"
                  className="select rounded-lg w-full max-w-xs mb-4"
                  required
                >
                  <option value="" disabled defaultValue>
                    Scegli categoria
                  </option>
                  {
                    CATEGORIE.map(cat => {
                      return <option key={cat}>{cat}</option>
                    })
                  }
                </select>

                <textarea
                  name="descrizione"
                  placeholder="Descrizione (opzionale)"
                  className="textarea textarea-bordered w-full max-w-xs mb-4"
                />

              </div>

              <div className="modal-action">
                <form method="dialog">
                  <button
                    type="button" // Deve essere type="button" per evitare submit
                    className="btn btn-secondary mr-2"
                    onClick={() => {
                      document.getElementById("formSpesa").reset();
                      document.getElementById("modaleAggiungiSpesa").close();
                    }}
                  >
                    Annulla
                  </button>
                </form>

                <button type="submit" className="btn btn-primary">
                  Aggiungi Spesa
                </button>
              </div>

            </form>

          </div>
        </dialog>

        {/* MODALE FILTRO PER PREZZO*/}
        <dialog id="modaleFiltro" className="modal">
          <div className="modal-box" data-theme={theme}>
            <form id="formFiltro" onSubmit={(e) => { e.preventDefault(); handleApplicaFiltro(); }}>
              <h2 className="font-bold text-lg mb-4">Filtra per prezzo</h2>

              {/* Visualizzazione del range di prezzo corrente */}
              <div className="text-xl font-mono mb-4 text-center">
                Da €{prezzoMinSelezionato.toFixed(2)} a €{prezzoMaxSelezionato.toFixed(2)}
              </div>

              {/* Range Slider per il Prezzo Minimo */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Prezzo Minimo (€): </span>
                </label>
                <input
                  type="range"
                  name="min"
                  min={prezzoMin}
                  max={prezzoMax}
                  step="0.01"
                  value={prezzoMinSelezionato}
                  onChange={handlePriceRangeChange}
                  className="range range-primary"
                />
                <div className='flex justify-between text-xs px-2'>
                  <span>€{prezzoMin.toFixed(2)}</span>
                  <span>€{prezzoMax.toFixed(2)}</span> {/* CORREZIONE: Max Price qui */}
                </div>
              </div>

              {/* Range Slider per il Prezzo Massimo */}
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Prezzo Massimo (€):</span>
                </label>
                <input
                  type="range"
                  name="max"
                  min={prezzoMin}
                  max={prezzoMax}
                  step="0.01"
                  value={prezzoMaxSelezionato}
                  onChange={handlePriceRangeChange}
                  className="range range-secondary"
                />
                <div className='flex justify-between text-xs px-2'>
                  <span>€{prezzoMin.toFixed(2)}</span> {/* CORREZIONE: Min Price qui */}
                  <span>€{prezzoMax.toFixed(2)}</span>
                </div>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn btn-warning mr-2"
                  onClick={handleResetFiltro}
                >
                  Reset Filtro
                </button>
                <form method="dialog">
                  <button className="btn btn-secondary">Chiudi</button>
                </form>
                {/* L'applicazione è automatica, il pulsante chiude solo il modale */}
                <button type="submit" className="btn btn-primary">
                  Chiudi e Visualizza
                </button>
              </div>
            </form>
          </div>
        </dialog>
      </div>

      <div
        id="contenuto"
        className="pt-32 grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="p-4 space-y-4">
          {
            (filteredData.length === 0 && data.length > 0 &&
              (prezzoMinSelezionato !== prezzoMin ||
                prezzoMaxSelezionato !== prezzoMax ||
                nomeRicerca !== "")) ? (
              <div role="alert" className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>Nessun risultato trovato per i criteri di ricerca.</span>
              </div>
            ) : (
              filteredData.map((item) => (
                <Prodotto key={item.id} data={item} rimuoviSpesa={handleRimuoviSpesa} />
              ))
            )
          }
        </div>

        {/* COLONNA SINISTRA → GRAFICO A TORTA */}
        <div className="p-4 card bg-base-200 shadow-xl space-y-4">
          <h2 className="text-xl font-bold mb-4">Spesa totale per categoria</h2>

          {/* --- GRAFICO A TORTA --- */}
          <div style={{ height: 350 }}>
            <ResponsivePie
              data={dataPerCategoria}
              margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              arcLinkLabelsSkipAngle={10}
              arcLabelsSkipAngle={10}
              colors={{ scheme: "paired" }}
              tooltip={({ datum }) => (
                <div
                  style={{
                    padding: "6px 12px",
                    background: "white",
                    color: "black",
                    borderRadius: "6px",
                    border: "1px solid #ddd",
                    fontWeight: "bold"
                  }}
                >
                  {datum.label}: €{datum.value.toFixed(2)}
                </div>
              )}
            />
          </div>

          <hr className="my-6" />

          {/* --- SELETTORE PERIODO --- */}
          <div className="mb-4">
            <label className="font-bold mr-2">Periodo:</label>
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="select select-bordered"
            >
              <option value="tutto">Tutto</option>
              <option value="anno">Ultimo anno</option>
              <option value="mese">Ultimo mese</option>
              <option value="settimana">Ultima settimana</option>
            </select>
          </div>

          {/* --- GRAFICO LINEA --- */}
          <h3 className="text-lg font-bold mt-4 mb-2">
            Andamento della spesa nel tempo
          </h3>

          {<div style={{ height: 300 }}>
            <ResponsiveLine
              data={dataPerPeriodo}
              margin={{ top: 30, right: 50, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
              axisBottom={{
                tickRotation: -45
              }}
              colors={{ scheme: "set2" }}
              pointSize={8}
              pointBorderWidth={2}
              useMesh={true}
              tooltip={({ datum, point }) => {
                const label = datum?.label ?? point?.data?.xFormatted;
                const value = datum?.value ?? point?.data?.yFormatted;

                return (
                  <div
                    style={{
                      padding: "8px 14px",
                      background: "rgba(255,255,255,0.97)",
                      color: "black",
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      fontWeight: "bold",
                      fontSize: "0.85rem",
                      boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
                      zIndex: 999999,
                      pointerEvents: "none",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}: €{Number(value).toFixed(2)}
                  </div>
                );
              }}


            />
          </div>}
        </div>




      </div>

    </div>

  )
}

export default App