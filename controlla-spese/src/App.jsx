import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto'
import "cally"

function App() {

  const [data, setData] = useState([])

  useEffect(() => {
    async function fetchData() {
      const risposta = await fetch("http://127.0.0.1:8090/api/collections/spese/records")
      const data = await risposta.json()
      const listaProdotti = data.items.map(item => ({
        nome: item.nome,
        descrizione: item.descrizione,
        prezzo: item.prezzo,
        quantita: item.quantita,
        tipologia: item.tipologia,
        data_acquisto: item.created,
        id: item.id
      }))
      console.log(listaProdotti)
      setData(listaProdotti)
    }
    fetchData()
  }
    , []
  )

  useEffect(() => {
    // fetch("http://127.0.0.1:8090/api/collections/spese/records")
  }, [data])


  const handleAggiungiSpesa = async (nuovoAcquisto) => {

    // 1. Invio a PocketBase (Richiesta POST)
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
        // Se la risposta non è un successo (es. 400 Bad Request, 500 Internal Error)
        const errorData = await response.json();
        console.error("Errore durante l'invio a PocketBase:", errorData);
        alert(`Errore nell'aggiunta: ${response.status} ${response.statusText}`);
        return; // Blocca l'esecuzione se c'è un errore
      }

      // Il record creato (con l'ID e la data di creazione assegnati da PocketBase)
      const recordCreato = await response.json();

      // 3. Aggiornamento dello Stato React (solo se PocketBase ha avuto successo)
      // Usiamo la funzione di callback per garantire di lavorare sullo stato più recente
      setData(prevData => [recordCreato, ...prevData]);

      // 4. Chiudi il Modale
      document.getElementById("modaleAggiungiSpesa").close();

    } catch (error) {
      console.error("Errore di rete o catch finale:", error);
      alert("Impossibile connettersi al server PocketBase.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div id="barraNav"
        className="
         card fixed 
         top-10 left-10 right-10 z-50  /* Corretto: 40px di stacco laterale */
         shadow-xl glass rounded-box p-4 
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

          {/* MODALE CORRETTO */}
          <dialog id="modaleAggiungiSpesa" className="modal" data-theme="dark">
            <div className="modal-box"> {/* Rimosso justify-right, non necessario */}

              {/* INIZIO DEL FORM: Allineamento automatico a sinistra */}
              <h3 className="font-bold text-lg mb-4">Aggiungi una nuova spesa</h3>

              {/* CONTENITORE DEL FORM: Rimosse le classi join/center per l'allineamento a sinistra */}
              {/* Usiamo flex-col per impilare gli input verticalmente */}
              <div className="flex flex-col items-start mx-auto w-full max-w-xs">
                <input type="text" placeholder="Nome Spesa" className="input input-bordered w-full mb-2" id="getNome" />
                <input type="number" placeholder="Importo (€)" className="input input-bordered w-full mb-2" id="getPrezzo" />
                <input type="number" placeholder="Quantità" className="input input-bordered w-full mb-4" id="getQuantita" />
                <input type="date" placeholder="Data di Acquisto" className="input input-bordered w-full mb-4" id="getData" />
                <input type="time" placeholder="Ora di Acquisto" className="input input-bordered w-full mb-4" id="getOra" />

                {/* Select ha bisogno di w-full max-w-xs per allinearsi */}
                <select defaultValue="Categoria" className="select select-bordered w-full max-w-xs mb-4" id="getCategoria">
                  <option disabled={true}>Scegli tra le seguenti categorie</option>
                  <option>Abbigliamento</option>
                  <option>Alimentari</option>
                  <option>Giochi ed elettronica</option>
                  <option>Casa e arredamento</option>
                </select>
                <textarea placeholder="Descrizione (opzionale)" className="textarea textarea-bordered w-full max-w-xs mb-4" id="getDescrizione"></textarea>
              </div>

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
                    categoria: document.getElementById("getCategoria").value,
                    descrizione: document.getElementById("getDescrizione").value,
                    data_acquisto: `${dataAcquisto} ${oraAcquisto}:00Z`
                  }
                  await handleAggiungiSpesa(nuovoAcquisto);
                }
                }>Aggiungi Spesa</button>
              </div>
            </div>
          </dialog>

          <button className="btn btn-secondary btn-sm m-2">Filtra Spese</button>
        </div>
      </div>
      {/* {<div id ="riempi" className = "card pb-40px" ></div>} */}
      <div id="contenuto" className="mt-32">
        {
          data.map((item) => (
            <Prodotto key={item.id} data={item}></Prodotto>
          )
          )
        }
      </div>
    </div>
  )
}

export default App
