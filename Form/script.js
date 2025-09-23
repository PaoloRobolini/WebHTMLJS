const datiUtente = {
    "nome": "",
    "email": "",
    "data": "",
    "ora": "",
    "messaggio": "",
    "newsletter": ""
}

const submit = document.getElementById('submit')
const divRisultato = document.getElementById('risultato')


submit.onclick = (event) => {
    let messaggio = ""
    event.preventDefault();
    for(const key of Object.keys(datiUtente)) {
        let value = document.getElementById(key).value.trim();
        if (key === "newsletter") {
        value = document.getElementById(key).checked ? "Si" : "No";
            }    
        messaggio += `<b>${key}:</b> ${value}<br>`;
    }
    
    divRisultato.innerHTML = messaggio;
     
}