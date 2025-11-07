import { useState } from 'react'
import './App.css'
import './index.css'

/** 
const Saluta = (props) => {
  console.log(props)
  const nome = props.nome
  
  return (
    <>
      Ciao {nome}
    </>
  )
}
*/

const Saluta = ({ nome }) => {

  return (
    <>
      Ciao {nome}

    </>
  )
}

function Titolo({ titolo }) {
  return <header class="flex items-center justify-between">
    <h1 class="text-3xl font-bold">{titolo}</h1>
    <div class="flex items-center gap-6">
      <label class="flex items-center cursor-pointer select-none">
        <span class="mr-2 text-sm">🌞</span>
        <input type="checkbox" id="themeSwitch" class="sr-only" />
        <div
          class="w-10 h-5 bg-gray-300 dark:bg-gray-600 rounded-full shadow-inner transition-colors duration-300 relative">
          <div
            class="dot absolute left-0 top-0 w-5 h-5 bg-white dark:bg-gray-200 rounded-full shadow transition transform duration-300">
          </div>
        </div>
        <span class="ml-2 text-sm">🌙</span>
      </label>

      <button
        class="bg-indigo-600 dark:bg-indigo-400 text-white dark:text-gray-900 px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-500 transition">
        + Nuova Issue
      </button>
    </div>
  </header>
}

function CampoRicerca({ placeholderText }) {
  return <div className="flex gap-2">
    <select id="filterField"
      className="w-48 px-3 py-2 border border-gray-400 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition">
      <option value="all">Tutti i campi</option>
      <option value="title">Titolo</option>
      <option value="description">Descrizione</option>
      <option value="assignee">Destinatario</option>
      <option value="priority">Priorità</option>
    </select>
    <input type="text" id="searchInput" placeholder={placeholderText}
      className="flex-1 px-4 py-2 rounded-md border border-gray-400 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-300 transition" />
  </div>
}

function Colonna({ status }) {
  return <>
    <div className='flex flex-col bg-gray-200 dark:bg-gray-800 rounded-lg p-4 min-h-[300px] transition-colors duration-300'>
      <h3 className='text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-400 dark:border-gray-600 pb-2'>{status}</h3>
    </div>
  </>

}

function Board({ stati }) {
  let stato0 = stati[0]
  let stato1 = stati[1]
  let stato2 = stati[2]
  let stato3 = stati[3]

  return <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="kanbanBoard">
    <Colonna status={stato0}></Colonna>
    <Colonna status={stato1}></Colonna>
    <Colonna status={stato2}></Colonna>
    <Colonna status={stato3}></Colonna>
  </div>
}

function BoardCompleta({ titolo, placeholderText, stati }) {
  return <div className="max-w-7xl mx-auto space-y-6">
    <Titolo titolo={titolo}></Titolo>
    <CampoRicerca placeholderText={placeholderText}></CampoRicerca>
    <Board stati={stati}></Board>
  </div>
}

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BoardCompleta titolo="KanBan Board" placeholderText="Cerca qualcosa..." stati={['Backlog', 'In Progress', 'Review', 'Done']}></BoardCompleta>
      <div className="glass m-10 pt-10 pb-10 rounded-box 10 text-primary-content/80 text-center" >
        <h1 class="text-5xl font-bold text-[#1e2939]
            drop-shadow-[0_0_8px_#6d28d9]
            drop-shadow-[0_0_16px_#7c3aed]
            drop-shadow-[0_0_32px_#8b5cf6]
            drop-shadow-[0_0_48px_#a78bfa]
            text-indigo-500"
            >
          Remade By Baolo
        </h1>
      </div>
    </>
  )
}

export default App
