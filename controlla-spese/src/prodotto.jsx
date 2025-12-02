import { useState } from "react";

function Prodotto({ data, rimuoviSpesa }) {

    const [item, setItem] = useState(data)


    const data_acquisto = new Date(item.data_acquisto)
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
        hour12: false,
    };

    const userReadableDate = data_acquisto.toLocaleString('it-IT', options);
    // console.log(userReadableDate);

    return <div className="card --card-p: 10px glass m-10 pt-10 pb-10 rounded-box 10 text-primary-content/80 text-center" >
        <h2 className="bold">{item.nome}</h2>
        <p>Importo: {item.prezzo}€</p>
        <p>Data: {
            userReadableDate
        }</p>
        <p>Categoria: {item.tipologia}</p>
        <p>
            {
                item.descrizione ? `Descrizione: ${item.descrizione}` : 'Nessuna descrizione fornita'
            }
        </p>
        <div className ="btn btn-primary btn-ghost btn-circle mr-4" onClick={rimuoviSpesa(item.id)}>
            <img src="src/assets/cestino.svg" alt="Elimina Spesa" width={24} height={24}/>
        </div>
    </div>
}

export default Prodotto