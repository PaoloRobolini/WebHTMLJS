import { useState } from 'react'
import './App.css'

function App() {

  const chiamataPost = async (user) => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const data = await response.json()
      console.log('Success:', data)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <>
      <form
      onSubmit={async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const newUser = {
          name: formData.get('name'),
          address: formData.get('address'),
          email: formData.get('email')
        }
        setData([...data, newUser])
        chiamataPost(newUser)
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        margin: '32px auto',
        padding: '24px',
        borderRadius: '12px',
        background: '#fff',
        boxShadow: '0 4px 16px rgba(44, 62, 80, 0.08)',
        border: '1px solid #e1e1e1' 
      }}
    >
      <input type="text" name="name" placeholder="Name" required />
      <input type="text" name="address" placeholder="Address" required />
      <input type="email" name="email" placeholder="Email" required />
      <button type="submit">Submit</button>
    </form>
    </>
  )
}

export default App
