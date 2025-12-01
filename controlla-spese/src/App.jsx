import { useState, useEffect } from 'react'
import './App.css'
import Prodotto from './prodotto';



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


  return (
    <div className="container mx-auto p-4">

      <div id ="barraNav" className="card fixed top-10 left-50 right-50 z-50 shadow-xl --card-p: 10px glass rounded-box p-4 text-primary-content/80
      flex justify-center items-center" ><h2>Prova</h2></div>
      {/* {<div id ="riempi" className = "card pb-40px" ></div>} */}
      <div id="contenuto" className = "mt-32">
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
