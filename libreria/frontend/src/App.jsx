import { useState } from 'react'
import './App.css'

function App() {

  const [data, setData] = useState([])
  const [showFormAggiunta, setFormAggiunta] = useState(false)

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

    {
      (showFormAggiunta &&  <form
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
      }}>
      <input type="text" name="titolo" placeholder="Titolo" required />
      <input type="text" name="autore" placeholder="Autore" required />
      <input type="number" name="anno" placeholder="Anno pubblicazione" required />
      <input type="text" name="genere" placeholder="Genere" required />
      <button type="submit">Submit</button>
    </form>)
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
