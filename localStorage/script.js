'use strict;'
const listaHTML = document.getElementById("listacosedafare")
let coseDaFare = []

const salvaInLocale = () => {
    const jsonData = JSON.stringify(coseDaFare)
    localStorage.setItem("todo", jsonData)
}


const caricaDaLocale = () => {
    return JSON.parse(localStorage.getItem("todo")) || []
}
 /**
coseDaFare.push({
    content: 'prova'
})
*/

coseDaFare = caricaDaLocale()

const eliminaElemento = (pos) => {
    coseDaFare.splice(pos, 1)
    console.log(coseDaFare)
}

const aggiornaLista = () => {
    console.log("aggiorno")
 listaHTML.innerText = ""
 for(const todo of coseDaFare){
    listaHTML.innerHTML += "<li>" + todo.content + '</li>'
 }
 coseDaFare.forEach((todo,idx) => {
    const pulsanteElimina = document.createElement("button")
    pulsanteElimina.onclick = () => eliminaElemento(idx)
    listaHTML.innerHTML += `<li>${todo.content}<button>X</button></li>`
 });
}

//aggiornaLista()


const aggiungiForm = document.getElementById("coseDaFare")
aggiungiForm.onsubmit = (evt) => {

    console.log("Eseguo callback di aggiungiForm")
    evt.preventDefault()
    const nome = document.getElementById("nome").value.trim()
    console.log("ho aggiunto")
    //crea la cosa da fare
    const cosaDaFare = {
        content: nome
    }
    //salva e aggiungi alla lista
    coseDaFare.push(cosaDaFare)
    //aggiorna UI
    aggiornaLista()
    nome.innerText.value = ""
    //aggiorna la persistenza su localStorage
    salvaInLocale()
}
    
