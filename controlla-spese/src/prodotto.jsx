import { useState } from "react";
import parse from 'html-react-parser';

function Prodotto({ data }) {

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
        <h2>{item.nome}</h2>
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
    </div>
}

export default Prodotto