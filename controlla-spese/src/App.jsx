import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto'
import "cally"
import PocketBase from 'pocketbase';

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const THEMES = ['light', 'dark', 'cyberpunk', 'synthwave', 'winter'];

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
    setData((prevData) => prevData.filter((item) => item.id !== id));
    console.log(`Spesa con ID ${id} rimossa con successo.`);
  }

  return (
    <div className="container mx-auto p-4">
      <div id="barraNav"
        className="
         card fixed 
         top-10 left-10 right-10 z-50  /* Corretto: 40px di stacco laterale */
         shadow-xl glass rounded-box p-4 --noise: 0.1
         text-primary-content/80
         flex justify-start items-center" > {/* Corretto: justify-start per allineare tutto a sinistra nella navbar */}
        <div className="join">
          <button className="btn btn-primary btn-sm m-2" onClick={
            () => {
              document.getElementById("modaleAggiungiSpesa").showModal()
            }
          }>
            Aggiungi Spesa
          </button>

          {/* MODALE AGGIUNTA */}
          <dialog id="modaleAggiungiSpesa" className="modal" >
            <div className="modal-box"> {/* Rimosso justify-right, non necessario */}

              <form id="formSpesa">

                {/* INIZIO DEL FORM: Allineamento automatico a sinistra */}
                <h3 className="font-bold text-lg mb-4">Aggiungi una nuova spesa</h3>

                {/* CONTENITORE DEL FORM: Rimosse le classi join/center per l'allineamento a sinistra */}
                {/* Usiamo flex-col per impilare gli input verticalmente */}
                <div className="flex flex-col items-start mx-auto w-full max-w-xs">
                  <input type="text" placeholder="Nome Spesa" className="input input-bordered w-full mb-2" id="getNome" />
                  <input type="number" placeholder="Importo (€)" className="input input-bordered w-full mb-2" id="getPrezzo" />
                  <input type="number" placeholder="Quantità" className="input input-bordered w-full mb-4" id="getQuantita" />
                  <label className="input mb-4">
                    <span className="label">Data di acquisto</span>
                    <input type="date" id="getData" />
                  </label>
                  <label className="input mb-4">
                    <span className="label">Ora di acquisto</span>
                    <input type="time" id="getOra" />
                  </label>

                  {/* Select ha bisogno di w-full max-w-xs per allinearsi */}
                  <select defaultValue="Categoria" className="select select-bordered w-full max-w-xs mb-4" id="getCategoria">
                    <option disabled={true}>Scegli tra le seguenti categorie</option>
                    <option>Abbigliamento</option>
                    <option>Alimentari</option>
                    <option>Cartoleria</option>
                    <option>Casa e arredamento</option>
                    <option>Giochi ed elettronica</option>
                    <option>Medicinali e Salute</option>
                    <option>Altro</option>
                  </select>
                  <textarea placeholder="Descrizione (opzionale)" className="textarea textarea-bordered w-full max-w-xs mb-4" id="getDescrizione"></textarea>
                </div>
              </form>
              {/* FINE DEL MODALE E PULSANTI D'AZIONE */}
              <div className="modal-action">

                <form method="dialog">
                  <button className="btn btn-secondary">Annulla</button>
                </form>

                {/* Pulsante Aggiungi Spesa (sulla stessa riga, allineato a destra) */}
                <button className="btn btn-primary" onClick={async () => {
                  const dataAcquisto = document.getElementById("getData").value
                  const oraAcquisto = document.getElementById("getOra").value
                  const nuovoAcquisto = {
                    nome: document.getElementById("getNome").value,
                    quantita: document.getElementById("getQuantita").value,
                    prezzo: document.getElementById("getPrezzo").value,
                    tipologia: document.getElementById("getCategoria").value,
                    descrizione: document.getElementById("getDescrizione").value,
                    data_acquisto: `${dataAcquisto} ${oraAcquisto}:00Z`
                  }

                  console.log(`Nuovo acquisto: ${JSON.stringify(nuovoAcquisto)}`);
                  await handleAggiungiSpesa(nuovoAcquisto, 'aggiungi');
                }
                }>Aggiungi Spesa</button>
              </div>
            </div>
          </dialog>

          {/* MODALE FILTRO */}
          <dialog id="modaleFiltro" className="modal">
            <div id="modal-box">
              <form id="formFiltro">
                <h3 className="font-bold text-lg mb-4">Aggiungi una nuova spesa</h3>
              </form>
            </div>
          </dialog>

          <button className="btn btn-secondary btn-sm m-2" onClick={() => {
            document.getElementById("modaleFiltro").showModal()
          }}>Filtra per...</button>

        </div>
        <div className="dropdown mb-72 rounded-border fixed right-50 top-5">
            <div tabIndex={0} role="button" className="btn m-1">
              Tema
              <svg
                width="12px"
                height="12px"
                className="inline-block h-2 w-2 fill-current opacity-60"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 2048 2048">
                <path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path>
              </svg>
            </div>
            {/*SCELTA TEMI*/}
            <ul tabIndex="-1" className="dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
            onChange={handleThemeChange}
            >

              {THEMES.map((thm) => (
                <li key={thm}>
                  <input
                    type="radio"
                    name="theme-dropdown"
                    className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start"
                    aria-label={thm}
                    value={thm} />
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
