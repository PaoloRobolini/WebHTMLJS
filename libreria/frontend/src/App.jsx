import { useState } from 'react'
import './App.css'

function App() {

  const [data, setData] = useState([])
  const [showFormAggiunta, setFormAggiunta] = useState(false)
  const [showEliminatutto, setShowEliminaTutto] = useState(false)

  const resetAll = async () => {
     try {
      const response = await fetch('http://localhost:11000/api/data/deleteAll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      if(!response.ok){
        throw new Error('Qualcosa non funziona nell\'elimina tutto')
      }
      const vuota = await response.json()
      setData(vuota)
      console.log('Ho eliminato tutto')
    } catch (error) {
      console.error('Errore: ' + error)
    }
  }

  const generaLibri = async () => {
    try {
      const response = await fetch('http://localhost:11000/api/data/genera') 
      if(!response.ok){
        throw new Error('Qualcosa non funziona nella generazione')
      }
      const generati = await response.json()
      setData(generati)
      console.log('Ho generato i 20 libri')
    } catch (error) {
      console.error('Errore: ' + error)
    }
  }

  useState(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:11000/api/data/get')
        if (!response.ok) {
          throw new Error('Qualcosa non funziona nella GET')
        }
        const jsonData = await response.json()
        setData(jsonData)
        console.log('Dati fetchati:', jsonData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const chiamataPost = async (book) => {
    try {
      const response = await fetch('http://localhost:11000/api/data/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
      })
      if (!response.ok) {
        throw new Error('Qualcosa non funziona nel POST')
      }
      const data = await response.json()
      console.log('Success:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <>
      <div className = "join join-vertical fixed top-15 left-15 z-5">
        <button type="button" className="btn btn-primary 0 mb-10" onClick={() => setFormAggiunta((statoPrec) => !statoPrec)}>
        Aggiungi Un Libro
      </button>
      <button type="button" className = "btn btn-success mb-10" onClick={generaLibri}>
        Genera 20 libri
      </button>
      <button type="button" className = "btn btn-error" onClick={() => setShowEliminaTutto(true)}>
        Elimina tutto
      </button>
      </div>
      
      { /* FORM ELIMINA TUTTO */ }

      {
        showEliminatutto && <div className="fixed inset-0 bg-opacity-0 bg-gray-00 flex items-center justify-center z-50">
            <div className="bg-gray-600 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <div className="flex justify-end space-x-3">
                <div className="join join-horizontal flex items-center justify-center">
                    <button className="join-item btn btn-error ml-3 mx-auto" type="submit" onClick = {resetAll}>Elimina</button>
                    <button onClick={() => {
                      setShowEliminaTutto(false)
                    }} className="btn btn-neutral mr-3">Annulla</button>
                  </div>
              </div>
            </div>
          </div>
      }

      { /* FORM AGGINUTA */ }

      {
        (showFormAggiunta &&

          <div className="fixed inset-0 bg-opacity-0 bg-gray-00 flex items-center justify-center z-50">
            <div className="bg-gray-600 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <div className="flex justify-end space-x-3">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const newUser = {
                      id: data.length + 1,
                      titolo: formData.get('titolo'),
                      autore: formData.get('autore'),
                      anno: formData.get('anno'),
                      genere: formData.get('genere')
                    }
                    setData([...data, newUser])
                    chiamataPost(newUser)
                    setFormAggiunta(false)
                    e.target.reset()
                  }}>
                  <div className="join join-vertical flex justify-center"></div>
                  
                  <h3 className="font-bold text-lg mb-4">Aggiungi un nuovo libro</h3>
                  
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="text" name="titolo" placeholder="Titolo" required />
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="text" name="autore" placeholder="Autore" required />
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="number" name="anno" placeholder="Anno pubblicazione" required />
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="text" name="genere" placeholder="Genere" required />

                  <div className="join join-horizontal flex items-center justify-center">
                    <button className="join-item btn btn-primary ml-3 mx-auto" type="submit">Submit</button>
                    <button onClick={() => {
                      setFormAggiunta(false)
                      e.target.reset()
                    }} className="btn btn-neutral mr-3">Annulla</button>
                  </div>
                </form>

              </div>
            </div>
          </div>

        )
      }


      <div className="max-w-lg mx-auto px-4">
        {data.map((item) => (
          <div key={item.id} className="card glass p-6 mb-4 shadow-lg text-center">
            <h3>{item.titolo}</h3>
            <p>Autore: {item.autore}</p>
            <p>Anno: {item.anno}</p>
            <p>Genere: {item.genere}</p>
          </div>
        ))}
      </div>

    </>
  )
}

export default App
