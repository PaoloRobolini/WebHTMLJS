import { useState } from 'react'
import './App.css'
import { useEffect } from 'react'

async function fetchData(){
  const risposta = await fetch("http://127.0.0.1:8090/api/collections/spese/records")
  const data = await risposta.json()
  console.log(data)
  return data
}

function App() {
  const [data, setData] = useState([])
  
  useEffect(() => {
    fetchData().then((data) => setData(data.items))
  }
  , []
)

  console.log(data)

  return (
    <>
      {data.map((item) => (
        <div key={item.id}>
          <h2>{item.nome}</h2>
          <p>Importo: {item.prezzo}€</p>
          <p>Data: {item.data}</p>
          <p>Categoria: {item.tipologia}</p>
          {
            item.descrizione || <p>Descrizione assente</p>
          }
        </div>
        )
    )
    }
    </>
  )
}

export default App
