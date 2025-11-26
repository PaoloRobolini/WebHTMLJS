import { useState } from "react";
import parse from 'html-react-parser';

function Prodotto({data}) {
    
    const [item, setItem] = useState(data)

 console.log(`Dati impostati: ${Object.keys(item)} `)

    return <div>
        <h2>{item.nome}</h2>
        <p>Importo: {item.prezzo}€</p>
        <p>Data: {
            new Date(item.created).toLocaleDateString('it-IT', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        }</p>
        <p>Categoria: {item.tipologia}</p>
        {

        }
    </div>
}

export default Prodotto