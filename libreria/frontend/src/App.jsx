import { useState, useEffect } from 'react'
import './App.css'

function App() {

  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [showFormAggiunta, setFormAggiunta] = useState(false)
  const [showEliminatutto, setShowEliminaTutto] = useState(false)
  const [showFormModifica, setShowFormModifica] = useState(false)
  const [libroDaModificare, setLibroDaModificare] = useState(null)

  const [generi, setGeneri] = useState([])
  const [formati, setFormati] = useState([])

  const [libroEsempio, setLibroEsempio] = useState(null)

  const modificaLibro = (libro) => {
    setLibroDaModificare(libro)
    setShowFormModifica(true)
  }


  const modificaLibroInfo = (libro) => {
    setLibroDaModificare(libro)
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

  // Genera 20 libri con Faker
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


  //Filtra i dati in base alla query
  const [query, setQuery] = useState('')

  const filterData = (query) => {
    console.log(`Filtrando per query: ${query}`)
    const filtered = data.filter(libro =>
      libro.titolo.toLowerCase().includes(query.toLowerCase()) ||
      libro.autore.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredData(filtered)
  }

  useEffect(() => {
    filterData(query)
  }, [data, query])


  //Fetch iniziale dei dati
  useEffect(() => {
    //Prende i libri dal backend
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

    //Prende il libro di esempio per il form
    const fetchLibroEsempio = async () => {
      try {
        const response = await fetch('http://localhost:11000/api/data/generaEsempio')
        if (!response.ok) {
          console.error('Qualcosa non funziona nella GET del libro di esempio')
        }
        const esempio = await response.json()
        setLibroEsempio(esempio)
        // console.log(`Libro esempio fetchato: ${JSON.stringify(esempio)}`)
      } catch (error) {
        console.error('Error fetching libro esempio:', error)
      }
    }
    fetchLibroEsempio()

    //Estrapola i generi dei libri
    const getGeneri = async () => {
      try {
        const response = await fetch('http://localhost:11000/api/data/get/generi')
        if (!response.ok) {
          console.error('Qualcosa non funziona nella GET dei generi')
        }
        const generi = await response.json()
        setGeneri(generi)
        // console.log(`Generi disponibili: ${JSON.stringify(generi)}`)
      } catch (error) {
        console.error('Error fetching generi:', error)
      }
    }
    getGeneri()

    //Estrapola i formati dei libri
    const getFormati = async () => {
      try {
        const response = await fetch('http://localhost:11000/api/data/get/formati')
        if (!response.ok) {
          console.error('Qualcosa non funziona nella GET dei formati')
        }
        const formati = await response.json()
        setFormati(formati)
        // console.log(`Formati disponibili: ${JSON.stringify(formati)}`)
      } catch (error) {
        console.error('Error fetching formati:', error)
      }
    }
    getFormati()

  }, [])


  //Modifica libro con PATCH e lo aggiunge al vettore
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
      const updatedBook = await response.json()
      setData((prevData) =>
        prevData.map((item) =>
          item.isbn === updatedBook.isbn ? updatedBook : item
        )
      )
      // console.log('Success:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  //Creazione nuovo libro con POST
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
      const nuovoLibro = await response.json()
      setData((prevData) => [nuovoLibro, ...prevData])
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

      <div className="mt-15">
        <header className="bg-gray-900 text-white py-6 shadow-lg fixed w-full top-15 z-10 rounded-xl">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center">Libreria di Faker</h1>
          </div>
          {/* Navbar */}
          <div className="bg-gray-800 mx-10 py-5 mt-10 rounded-xl shadow-lg">
            {/* Bottoni */}
            <div className="navbar-start">
              {/* Tasto aggiungi */}
              <div className="join join-horizontal flex items-center justify-center space-x-3 ml-3">
                <button type="button" className="btn btn-circle btn-ghost 0" onClick={() => setFormAggiunta((statoPrec) => !statoPrec)}>
                  <img src=" assets/aggiungi.svg" alt="Aggiungi Libro" width="64" height="64" />
                </button>

                {/* Tasto genera libri */}
                <button type="button" className="btn btn-circle text-green-600 hover:rotate-180 transition" onClick={generaLibri}>
                  <img src=" assets/random.svg" alt="Genera Libri" width="64" height="64" />
                </button>

                {
                  // Tasto elimina 
                  data.length !== 0 &&
                  <button type="button" className="btn btn-ghost btn-circle" onClick={() => setShowEliminaTutto(true)}>
                    <img src=" assets/cestino.svg" alt="Elimina Tutto" width="64" height="64" />
                  </button>}
              </div>

            </div>

            {/* Barra di ricerca */}
            <div className="navbar-center">
              <input
                type="text"
                placeholder="Cerca un libro..."
                className="input input-bordered w-full-lg"
                onChange={(e) => {
                  setQuery(e.target.value)
                  filterData(e.target.value)
                }}
              />
            </div>
          </div>

        </header>

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
                <button className="join-item btn btn-error ml-3 mx-auto" onClick={() => {
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
                    chiamataPost(newUser)
                    setFormAggiunta(false)
                    e.target.reset()
                  }}>
                  <div className="join join-vertical flex justify-center"></div>

                  <h3 className="font-bold text-lg mb-4">Aggiungi un nuovo libro</h3>

                  <label htmlFor="titolo">Titolo</label>
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="text" name="titolo" placeholder={libroEsempio.titolo} required />
                  <label htmlFor="autore">Autore</label>
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="text" name="autore" placeholder={libroEsempio.autore} required />
                  <label htmlFor="anno">Anno</label>
                  <input className="input-lg input-primary input-bordered w-full join-item mb-4" type="number" name="anno" placeholder={libroEsempio.anno} required />

                  <select className="input-lg input-primary input-bordered w-full join-item mb-4" name="genere" required defaultValue="">
                    <option value="" disabled>Seleziona un genere</option>
                    {(generi || []).map((g) => (
                      <option key={g} value={g} className="text-gray-500">{g}</option>
                    ))}
                  </select>

                  <select className="input-lg input-primary input-bordered w-full join-item mb-4" name="formato" required defaultValue="">
                    <option value="" disabled>Seleziona un formato</option>
                    {(formati || []).map((f) => (
                      <option key={f} value={f} className="text-gray-500">{f}</option>
                    ))}
                  </select>

                  <div className="join join-horizontal flex items-center justify-center">
                    <button className="join-item btn btn-primary ml-3 mx-auto" type="submit">Aggiungi</button>
                    <button onClick={() => {
                      setFormAggiunta(false)
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
                      'formato': formData.get('formato'),
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
                        libro.formato = libroModificato.formato
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
                    <h3 className="font-bold text-4xl mb-4">Modifica libro</h3>

                    <label className="block text-sm font-medium mb-2">Titolo</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="titolo" placeholder="Titolo" required defaultValue={libroDaModificare.titolo} />

                    <label className="block text-sm font-medium mb-2">Autore</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="autore" placeholder="Autore" required defaultValue={libroDaModificare.autore} />

                    <label className="block text-sm font-medium mb-2">Anno pubblicazione</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="number" name="anno" placeholder="Anno pubblicazione" required defaultValue={libroDaModificare.anno} />

                    <label className="block text-sm font-medium mb-2">Genere</label>
                    <input className="input-lg input-primary input-bordered join-item mb-4 text-center" type="text" name="genere" placeholder="Genere" required defaultValue={libroDaModificare.genere} />

                    <select className="input-lg input-primary input-bordered w-full join-item mb-4" name="genere" required defaultValue="">
                      <option value="" disabled>Seleziona un genere</option>
                      {(generi || []).map((g) => (
                        <option key={g} value={g} className="text-gray-500">{g} {libroDaModificare.genere === g && "(attuale)"}</option>
                      ))}
                    </select>

                    <select className="input-lg input-primary input-bordered w-full join-item mb-4" name="formato" required defaultValue="">
                      <option value="" disabled>Seleziona un formato</option>
                      {(formati || []).map((f) => (
                        <option key={f} value={f} className="text-gray-500">{f} {libroDaModificare.formato === f && "(attuale)"}</option>
                      ))}
                    </select>

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

      <div className="max-w mx-auto px-4 mt-90 ml-60 mr-60">
        {filteredData.length === 0 ? (
          data.length === 0 ? (<>
            <div className="flex join join-vertical join-justify-center mb-10">
              <h2 className="text-center join-item font-bold text-4xl mb-50">Nessun libro presente.</h2>
              <h2 className="text-center join-item font-bold text-xl">Creane uno o lasciali generare a Faker!</h2>
            </div>

          </>) : (
            <div className="flex join join-vertical join-justify-center mb-10">
              <h2 className="text-center join-item font-bold text-4xl mb-50">Nessun libro presente.</h2>
              <h2 className="text-center join-item font-bold text-xl">I criteri di ricerca non corrispondono</h2>
            </div>
          )
        ) : (

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-15">
            {filteredData.map((item) => (
              <div key={item.isbn} className="card glass p-6 mb-4 shadow-lg text-center space-y-2">
                <h3>{item.titolo}</h3>
                <p>Autore: {item.autore}</p>
                <p>Anno: {item.anno > 0 ? item.anno : `${-item.anno} a.C.`}</p>
                <p>Genere: {item.genere}</p>
                <p>Formato: {item.formato}</p>
                <p>{item.isbn}</p>
                <div className="join join-horizontal flex align-left space-x-3 mt-4">
                  {/* Info libro */}
                  <button onClick={() => modificaLibro(item)} className="btn btn-ghost btn-circle">
                    <img src=" assets/info.svg" alt="Info Libro" width="30" height="30" />
                  </button>
                  {/* Modifica libro */}
                  <button onClick={() => modificaLibro(item)} className="btn btn-warning btn-circle">
                    <img src=" assets/matita.svg" alt="Modifica Libro" width="30" height="30" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )
        }
      </div>

    </>
  )
}

export default App
