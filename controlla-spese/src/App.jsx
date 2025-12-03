import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto'
import "cally"
import PocketBase from 'pocketbase';

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])

 

  useEffect(() => {

    async function fetchData() {

      const fetchData = async () => {
        const fetchData= await fetch("http://127.0.0.1:8090/api/collections/spese/records")
        const response = await fetchData.json()
        // console.log(`Risposta: ${JSON.stringify(response)}`)
        return response.items
      }

      const resp = await fetchData()
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

         

          

          <button className="btn btn-secondary btn-sm m-2" onClick={() => {
            document.getElementById("modaleFiltro").showModal()
          }}>Filtra per...</button>
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
