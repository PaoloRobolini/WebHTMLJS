import { useState, useEffect } from 'react'
import './App.css'

function App() {

  const [data, setData] = useState([])
  const [showFormAggiunta, setFormAggiunta] = useState(false)
  const [showEliminatutto, setShowEliminaTutto] = useState(false)
  const [showFormModifica, setShowFormModifica] = useState(false)
  const [libroDaModificare, setLibroDaModificare] = useState(null)

  const modificaLibro = (libro) => {
    setLibroDaModificare(libro)
    setShowFormModifica(true)
  }

  const eliminaLibro = async (isbn) => {
    // console.log(`Elimino il libro: ${JSON.stringify(isbn)}`)
    try {
      const response = await fetch(`http://localhost:11000/api/data/delete/${isbn}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          body: JSON.stringify({ 'isbn': isbn })
        }
      })
      if (!response.ok) {
        console.error('Qualcosa non funziona nell\'elimina libro')
      }
      const aggiornati = await response.json()
      setData(aggiornati)
      // console.log(`Ho eliminato il libro con ISBN: ${isbn}`)
    }
    catch (error) {
      console.error('Errore: ' + error)
    }
  }

  const resetAll = async () => {
    try {
      const response = await fetch('http://localhost:11000/api/data/deleteAll', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (!response.ok) {
        console.error('Qualcosa non funziona nell\'elimina tutto')
      }
      const vuota = await response.json()
      setData(vuota)
      // console.log('Ho eliminato tutto')
    } catch (error) {
      console.error('Errore: ' + error)
    }
  }

  const generaLibri = async () => {
    try {
      const response = await fetch('http://localhost:11000/api/data/genera')
      if (!response.ok) {
        console.error('Qualcosa non funziona nella generazione')
      }
      const generati = await response.json()
      setData(generati)
      // console.log('Ho generato i 20 libri')
    } catch (error) {
      console.error('Errore: ' + error)
    }
  }

  useState(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:11000/api/data/get')
        if (!response.ok) {
          console.error('Qualcosa non funziona nella GET')
        }
        const jsonData = await response.json()
        setData(jsonData)
        // console.log('Dati fetchati:', jsonData)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }
    fetchData()
  }, [])

  const chiamataPatch = async (book) => {
    // console.log(`Chiamata PATCH con:`, book)
    try {
      const response = await fetch('http://localhost:11000/api/data/patch', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(book)
      })
      if (!response.ok) {
        console.error('Qualcosa non funziona nel PATCH')
      }
      const data = await response.json()
      setData(data)
      // console.log('Success:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

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
        console.error('Qualcosa non funziona nel POST')
      }
      const data = await response.json()
      // console.log('Success:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Gestione ESC per chiudere i form
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        if (showFormAggiunta) setFormAggiunta(false)
        if (showEliminatutto) setShowEliminaTutto(false)
        if (showFormModifica) setShowFormModifica(false)
      }
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [showFormAggiunta, showEliminatutto, showFormModifica])

  return (

    <>
      <div className="join join-vertical fixed top-15 left-15 z-5">
        <button type="button" className="btn btn-block btn-primary 0 mb-10" onClick={() => setFormAggiunta((statoPrec) => !statoPrec)}>
          Aggiungi Un Libro
        </button>
        <button type="button" className="btn btn-block btn-success mb-10" onClick={generaLibri}>
          Genera 20 libri
        </button>
        {data.length !== 0 && <button type="button" className="btn btn-block btn-error" onClick={() => setShowEliminaTutto(true)}>
          Elimina tutto
        </button>}
      </div>

      { /* FORM ELIMINA TUTTO */}

      {
        showEliminatutto &&

        <div className="fixed inset-0 glass flex items-center justify-center z-50">
          <div className="bg-gray-600 p-6 rounded-xl shadow-2xl max-w-sm w-full">
            <div className="join join-vertical flex justify-end space-x-3 space-y-10">
              <h1 className="join-item font-bold text-lg mb-4">Sei sicuro di voler eliminare tutti i libri?</h1>
              <p className="join-item">L'azione è <strong>irreversibile!</strong></p>
              <div className="join join-horizontal flex items-center justify-center">
                <button className="join-item btn btn-primary ml-3 mx-auto" onClick={() => {
                  resetAll()
                  setShowEliminaTutto(false)
                }
                }
                >Elimina</button>
                <button onClick={() => {
                  setShowEliminaTutto(false)
                }} className="btn btn-neutral mr-3 join-item">Annulla</button>
              </div>
            </div>
          </div>
        </div>
      }

      {/* FORM AGGIUNTA */}

      {
        (showFormAggiunta &&

          <div className="fixed inset-0 glass flex items-center justify-center z-50">
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
                    <button className="join-item btn btn-primary ml-3 mx-auto" type="submit">Aggiungi</button>
                    <button onClick={(e) => {
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


      {/* FORM MODIFICA LIBRO */}
      {
        (showFormModifica &&

          <div className="fixed inset-0 glass flex items-center justify-center z-50">
            <div className="bg-gray-600 p-6 rounded-xl shadow-2xl max-w-sm w-full">
              <div className="flex justify-end items-center space-x-3">
                <form className="w-full align-middle"
                  onSubmit={async (e) => {
                    // Modifica libro
                    e.preventDefault()
                    const formData = new FormData(e.target)
                    const libroModificato = {
                      'titolo': formData.get('titolo'),
                      'autore': formData.get('autore'),
                      'anno': formData.get('anno'),
                      'genere': formData.get('genere'),
                      'formato': libroDaModificare.formato,
                      'isbn': libroDaModificare.isbn
                    }
                    // console.log(libroModificato)
                    // Aggiorna l'array di libri
                    data.map((libro) => {
                      if (libro.isbn === libroDaModificare.isbn) {
                        libro.titolo = libroModificato.titolo
                        libro.autore = libroModificato.autore
                        libro.anno = libroModificato.anno
                        libro.genere = libroModificato.genere
                      }
                    })
                    setData([...data])
                    setShowFormModifica(false)
                    e.target.reset()
                    chiamataPatch(libroModificato)
                  }
                  }
                >
                  <div className="join join-vertical flex text-center justify-center">
                    <h3 className="font-bold text-xl mb-4">Modifica libro</h3>

                    <label className="block text-sm font-medium mb-2">Titolo</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="titolo" placeholder="Titolo" required defaultValue={libroDaModificare.titolo} />

                    <label className="block text-sm font-medium mb-2">Autore</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="autore" placeholder="Autore" required defaultValue={libroDaModificare.autore} />

                    <label className="block text-sm font-medium mb-2">Anno pubblicazione</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="number" name="anno" placeholder="Anno pubblicazione" required defaultValue={libroDaModificare.anno} />

                    <label className="block text-sm font-medium mb-2">Genere</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="genere" placeholder="Genere" required defaultValue={libroDaModificare.genere} />

                    <label className="block text-sm font-medium mb-2">ISBN</label>

                    <div className="join join-horizontal flex items-center justify-center">
                      <button className="join-item btn btn-primary ml-3 mx-auto" type="submit">Modifica</button>
                      <button onClick={() => {
                        eliminaLibro(libroDaModificare.isbn)
                        setShowFormModifica(false)
                      }} className="btn btn-error mx-auto"> Elimina
                      </button>
                      <button onClick={() => {
                        setShowFormModifica(false)
                      }} className="btn btn-neutral mr-3 mx-auto">Annulla</button>
                    </div>
                  </div>



                </form>

              </div>
            </div>
          </div>

        )
      }

      <div className="max-w-lg mx-auto px-4 mt-40">
        {data.length === 0 ? (
          <>
            <div className="flex join join-vertical join-justify-center mb-10">
              <h2 className="text-center join-item font-bold text-4xl mb-50">Nessun libro presente.</h2>
              <h2 className="text-center join-item font-bold text-xl">Creane uno o lasciali generare a Faker!</h2>
            </div>

          </>
        ) : (
          data.map((item) => (
            <div key={item.isbn} className="card glass p-6 mb-4 shadow-lg text-center">
              <h3>{item.titolo}</h3>
              <p>Autore: {item.autore}</p>
              <p>Anno: {item.anno}</p>
              <p>Genere: {item.genere}</p>
              <p>Formato: {item.formato}</p>
              <p>ISBN: {item.isbn}</p>
              <button onClick={() => modificaLibro(item)} className="btn btn-warning mt-4">Modifica</button>
            </div>
          ))
        )
        }
      </div>

    </>
  )
}

export default App
