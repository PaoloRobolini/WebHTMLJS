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
    <>
      <div>

      </div>
      {
        data.map((item) => (
            <Prodotto key={item.id} data={item}></Prodotto>
        )
        )
      }
    </>
  )
}

export default App
