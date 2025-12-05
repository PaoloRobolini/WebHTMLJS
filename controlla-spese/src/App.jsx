import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto'
import "cally"
import PocketBase from 'pocketbase';

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])


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

  // useEffect(() => {
  //   console.log(`Dati aggiornati con successo: ${JSON.stringify(data)}`);
  // }, [data]
  // )


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
                      <option value="" disabled selected>
                        Scegli categoria
                      </option>
                      {
                        categorie.map(cat => {
                          return <option>{cat}</option>
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
            <div className="modal-box">
              <form id="formFiltro">
                <h2 className="font-bold text-lg mb-4">Filtra per...</h2>
                <fieldset className="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
                  <legend className="fieldset-legend">Login options</legend>
                  {<label className="label">
                    <input type="checkbox" defaultChecked className="checkbox" />
                    Remember me
                  </label>}
                </fieldset>
                <select
                  name="categoria"
                  className="select rounded-lg w-full max-w-xs mb-4"
                  required
                >
                  <option value="" disabled selected>
                    Scegli categoria
                  </option>
                  {
                    categorie.map(cat => {
                      return <option>{cat}</option>
                    })
                  }
                </select>
              </form>
              <div className="modal-action">

                <form method="dialog">
                  <button className="btn btn-secondary">Annulla</button>
                </form>

                {/* Pulsante Aggiungi Spesa (sulla stessa riga, allineato a destra) */}
                <button className="btn btn-primary">Applica</button>
              </div>
            </div>
          </dialog>

          <button className="btn btn-secondary btn-sm m-2" onClick={() => {
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
          data.map((item) => (
            <Prodotto key={item.id} data={item} rimuoviSpesa={handleRimuoviSpesa}></Prodotto>
          )
          )
        }
      </div>
    </div>
  )
}

export default App
