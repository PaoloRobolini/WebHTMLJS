import { useState, useEffect } from 'react'
import './App.css'
import parse from 'html-react-parser';

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
          <p>Data: {
          new Date(item.created).toLocaleDateString('it-IT', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
          }</p>
          <p>Categoria: {item.tipologia}</p>
          {
            parse(item.descrizione)
          }
        </div>
        )
        )
    }
    </>
  )
}

export default App
