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

let messaggio = ""

submit.onclick = () => {
    for (const [key, value] of Object.entries(datiUtente)) {
    messaggio += '${key}: ${value}<br>'
    }
    divRisultato.innerText = messaggio
    console.log(messaggio)
    messaggio = ""
}
/** 
 * document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('feedbackForm');
    const divRisultato = document.getElementById('risultato');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        leggiDatiUtente();
    let riepilogo = '<h2 style=\'font-weight:bold\'>Riepilogo del Feedback</h2>';
    riepilogo += '<b>Nome:</b> ' + datiUtente.nome + '<br>';
    riepilogo += '<b>Email:</b> ' + datiUtente.email + '<br>';
    riepilogo += '<b>Data:</b> ' + datiUtente.data + '<br>';
    riepilogo += '<b>Ora:</b> ' + datiUtente.ora + '<br>';
    riepilogo += '<b>Messaggio:</b> ' + datiUtente.messaggio + '<br>';
    riepilogo += '<b>Iscrizione alla newsletter:</b> ' + (datiUtente.newsletter === 'si' ? 'Sì' : 'No');
        divRisultato.innerHTML = riepilogo;
    });
});
*/
