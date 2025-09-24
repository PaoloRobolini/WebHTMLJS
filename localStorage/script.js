const listaHTML = document.getElementById("cosedafare")
const coseDaFare = 

function salvaInLocale() {
    const jsonData = JSON.stringify(coseDaFare)
    localStorage.setItem("todo", jsonData)
}

function caricaDaLocale() {
    return JSON.parse(localStorage.getItem("todo")) || []
}

coseDaFare.push({
    content: 'prova'
})

function aggiornaLista() {
 listaHTML.innerText = ""
 for(const todo of coseDaFare){
    listaHTML.innerHTML += "<li>" + todo.content + '</li>'
 }
}

aggiornaLista()