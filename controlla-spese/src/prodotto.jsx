import { useState } from "react";
import parse from 'html-react-parser';

function Prodotto({data}) {
    
    const [item, setItem] = useState(data)


    return <div className="glass m-10 pt-10 pb-10 rounded-box 10 text-primary-content/80 text-center" >
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
            parse(item.descrizione)
        }
    </div>
}

export default Prodotto