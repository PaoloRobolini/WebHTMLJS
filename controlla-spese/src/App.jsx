import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto'
import "cally"
import PocketBase from 'pocketbase';

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  const [prezzoMin, setPrezzoMin] = useState(0);
  const [prezzoMax, setPrezzoMax] = useState(0);

  const [prezzoMinSelezionato, setPrezzoMinSelezionato] = useState(0)
  const [prezzoMaxSelezionato, setPrezzoMaxSelezionato] = useState(0)

  const THEMES_NON_PREDEFINITI = ['cyberpunk', 'synthwave', 'forest', 'aqua'];
  const THEMES = {
    'Scuro (default)': 'dark',
    'Chiaro': 'winter',
  }
  THEMES_NON_PREDEFINITI.map(thm => {
    const maiuscolo = thm[0].toUpperCase() + thm.slice(1)
    THEMES[maiuscolo] = thm
  }
  )

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');


  const handleThemeChange = (event) => {
    const selectedTheme = event.target.value
    setTheme(selectedTheme)
    localStorage.setItem('theme', selectedTheme)
    console.log(`Tema cambiato in: ${selectedTheme}`)
  }


  //Stato per il tema
  useEffect(() => {
    // Scrive il tema corrente su localStorage, salvandolo per la prossima visita
    localStorage.setItem('theme', theme);

    // Applica il tema al DOM
    document.documentElement.setAttribute('data-theme', theme);

  }, [theme]);

  let categorie = ['Abbigliamento', 'Alimentari', 'Cartoleria', 'Casa e Arredamento', 'Giochi ed elettronica',
    'Medicinali e salute', 'Sport e tempo libero', 'Lavoro']

  categorie = [...categorie.sort(), 'Altro']

  const pb = new PocketBase('http://127.0.0.1:8090');

  //Inizializzazione dati
  useEffect(() => {

    async function fetchData() {

      const fetchData = async () => {
        const fetchData = await fetch("http://127.0.0.1:8090/api/collections/spese/records")
        const response = await fetchData.json()
        return response.items
      }

      const resp = await fetchData()
      console.log(resp)
      const listaProdotti = resp.map(item => ({
        nome: item.nome,
        descrizione: item.descrizione,
        prezzo: item.prezzo,
        quantita: item.quantita,
        tipologia: item.tipologia,
        data_acquisto: item.data_acquisto,
        data_creazione: item.created,
        id: item.id
      }))
      // console.log(listaProdotti)
      setData(listaProdotti)
    }
    fetchData()
  }
    , []
  )

  // useEffect per calcolare il prezzo minimo e massimo all'inizio
  useEffect(() => {

    if (data.length === 0) return;

    const prezzi = data.map(item => Number(item.prezzo));
    const minPrezzoMap = Math.min(...prezzi);
    const maxPrezzoMap = Math.max(...prezzi);


    if (minPrezzoMap < prezzoMin) {
      setPrezzoMin(minPrezzoMap)
      setPrezzoMinSelezionato(minPrezzoMap)
    }
    if (maxPrezzoMap > prezzoMax) {
      setPrezzoMax(maxPrezzoMap)
      setPrezzoMaxSelezionato(maxPrezzoMap)
    }

    if (prezzoMinSelezionato < prezzoMin) {
      setPrezzoMinSelezionato(minPrezzoMap)
    }

    if (prezzoMaxSelezionato > prezzoMax) {
      setPrezzoMaxSelezionato(maxPrezzoMap)
    }

    handleApplicaFiltro();

    console.log(`Prezzi calcolati da useEffect: Min = ${minPrezzoMap}, Max = ${maxPrezzoMap}, prezzi selezionati: Min = ${prezzoMinSelezionato}, Max = ${prezzoMaxSelezionato}`);
  }, [data]
  )


  const handlePriceRangeChange = (event) => {
    const { name, value } = event.target;
    const valore = Number(value);
    if (name === 'min') {
      console.log(`Valore Minimo selezionato: ${valore}`);
      setPrezzoMinSelezionato(valore)
      if (valore > prezzoMaxSelezionato) {
        setPrezzoMaxSelezionato(valore)
      }
    } else if (name === 'max') {
      console.log(`Valore Massimo selezionato: ${valore}`);
      setPrezzoMaxSelezionato(valore)
      if (valore < prezzoMinSelezionato) {
        setPrezzoMinSelezionato(valore)
      }
    }
  }

  const handleResetFiltro = () => {
    setFilteredData(...data);
    document.getElementById("formFiltro").close();
  }

  const handleApplicaFiltro = () => {
    const copiaDati = [...data];
    const datiFiltrati = copiaDati.filter(item => {
      const prezzoItem = Number(item.prezzo);
      return prezzoItem >= prezzoMinSelezionato && prezzoItem <= prezzoMaxSelezionato;
    });
    console.log(`Dati filtrati: ${JSON.stringify(datiFiltrati)}`);
    setFilteredData(datiFiltrati);
  }

  const handleAggiungiSpesa = async (nuovoAcquisto) => {
    try {
      const response = await fetch("http://127.0.0.1:8090/api/collections/spese/records", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuovoAcquisto)
      });

      // 2. Gestione della Risposta
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Errore durante l'invio a PocketBase:", errorData);
        alert(`Errore nell'aggiunta: ${response.status} ${response.statusText}`);
        return;
      }

      document.getElementById("formSpesa").reset();


      // Crea Record preso da PocketBase
      const recordCreato = await response.json();

      console.log(`Creato il record ${JSON.stringify(recordCreato)}`);
      // 3. Aggiorna data
      setData(prevData => [recordCreato, ...prevData]);
      console.log(`Nuovi dati: ${JSON.stringify(data)}`);
      // 4. Chiude il Modale
      document.getElementById("modaleAggiungiSpesa").close();

    } catch (error) {
      //Errori vari perché quando mai qualcosa va bene
      console.error("Errore di rete o catch finale:", error);
      alert("Impossibile connettersi al server PocketBase.");
    }


  };

  const handleRimuoviSpesa = (id) => async () => {
    await pb.collection('spese').delete(id);
    // fetch(`http://127.0.0.1:8090/api/collections/spese/records/$`) 
    setData((prevData) => prevData.filter((item) => item.id !== id));
    console.log(`Spesa con ID ${id} rimossa con successo.`);
  }

  return (
    <div className="container mx-auto p-4" data-theme={theme}>
      <div id="barraNav"
        className="
         card fixed 
         top-10 left-10 right-10 z-50  /* Corretto: 40px di stacco laterale */
         shadow-xl glass rounded-box p-4 --noise: 0.1
         text-primary-content/80
         flex justify-start items-center" > {/* Corretto: justify-start per allineare tutto a sinistra nella navbar */}
        <div className="join" >
          <button className="btn btn-primary btn-sm m-2" onClick={
            () => {
              document.getElementById("modaleAggiungiSpesa").showModal()
            }
          }>
            Aggiungi Spesa
          </button>

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
                    quantita: formData.get("quantita"),
                    prezzo: formData.get("prezzo"),
                    tipologia: formData.get("categoria"),
                    descrizione: formData.get("descrizione"),
                    data_acquisto: `${dataAcquisto} ${oraAcquisto}:00Z`
                  };

                  await handleAggiungiSpesa(nuovoAcquisto, "aggiungi");

                  form.reset();
                  document.getElementById("modaleAggiungiSpesa").close();
                }}
              >

                <h2 className="font-bold text-lg mb-4">Aggiungi una nuova spesa</h2>

                <div className="flex flex-col items-start mx-auto w-full max-w-xs">

                  <input
                    type="text"
                    name="nome"
                    placeholder="Nome Spesa"
                    className="input rounded-lg w-full mb-2"
                    required
                  />

                  <input
                    type="number"
                    name="prezzo"
                    placeholder="Importo (€)"
                    className="input rounded-lg w-full mb-2"
                    min="0"
                    step="0.01"
                    required
                  />

                  <input
                    type="number"
                    name="quantita"
                    placeholder="Quantità"
                    className="input rounded-lg w-full mb-4"
                    min="1"
                    required
                  />

                  <label className="input rounded-lg mb-4 w-full">
                    <span className="label-text">Data di acquisto</span>
                    <input type="date" name="data" required />
                  </label>

                  <label className="input rounded-lg mb-4 w-full">
                    <span className="label-text">Ora di acquisto</span>
                    <input type="time" name="ora" required />
                  </label>

                  <select
                    name="categoria"
                    className="select rounded-lg w-full max-w-xs mb-4"
                    required
                  >
                    <option value="" disabled defaultValue>
                      Scegli categoria
                    </option>
                    {
                      categorie.map(cat => {
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
                      className="btn btn-secondary"
                      onClick={() => document.getElementById("formSpesa").reset()}
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

          {/* MODALE FILTRO */}
          <dialog id="modaleFiltro" className="modal">
            <div className="modal-box" data-theme={theme}>
              <form id="formFiltro" onSubmit={(e) => { e.preventDefault(); handleApplicaFiltro(); }}>
                <h2 className="font-bold text-lg mb-4">Filtra per prezzo</h2>

                {/* Visualizzazione del range di prezzo corrente */}
                <div className="text-xl font-mono mb-4 text-center">
                  Da €{prezzoMinSelezionato} a €{prezzoMaxSelezionato}
                </div>

                {/* Range Slider per il Prezzo Minimo */}
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Prezzo Minimo (€):</span>
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
                    <span>€{prezzoMin.toFixed(2)}</span>
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
                    <span>€{prezzoMax.toFixed(2)}</span>
                    <span>€{prezzoMax.toFixed(2)}</span>
                  </div>
                </div>

                <div className="modal-action">
                  <button
                    type="button"
                    className="btn btn-warning mr-2"
                    onClick={handleResetFiltro}
                  >
                    Annulla Filtro
                  </button>
                  <form method="dialog">
                    <button className="btn btn-secondary">Chiudi</button>
                  </form>
                  <button type="submit" className="btn btn-primary">
                    Applica Filtro
                  </button>
                </div>
              </form>
            </div>
          </dialog>

          <button className="btn btn-secondary btn-sm m-2" disabled={
            data.length === 0 ? true : false
          }
            onClick={() => {
              document.getElementById("modaleFiltro").showModal()
            }}>Filtra per...</button>

        </div>
        <div className="dropdown mb-72 rounded-border fixed right-50 top">
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
          <ul tabIndex="-1" className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
            onChange={handleThemeChange}
            data-theme={theme}
          >

            {Object.keys(THEMES).map((thm) => (
              <li key={thm}>
                <input
                  type="radio"
                  name="theme-dropdown"
                  className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                  aria-label={thm}
                  value={THEMES[thm]} />
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* {<div id ="riempi" className = "card pb-40px" ></div>} */}
      <div id="contenuto" className="mt-32">
        {
          (filteredData.length > 0 ? filteredData : data).map((item) => (
            <Prodotto key={item.id} data={item} rimuoviSpesa={handleRimuoviSpesa} />
          ))
        }
      </div>
    </div>
  )
}

export default App