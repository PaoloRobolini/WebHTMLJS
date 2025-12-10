import { useState, useEffect, useCallback, useMemo } from 'react';
import './App.css';
import Prodotto from './prodotto';
import PocketBase from 'pocketbase';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";

// Inizializzazione di PocketBase
const pb = new PocketBase('http://127.0.0.1:8090');

const THEMES_NON_PREDEFINITI = ['cyberpunk', 'synthwave', 'forest', 'aqua'];
const THEMES_MAP = {
  'Scuro (default)': 'dark',
  'Chiaro': 'winter',
};
THEMES_NON_PREDEFINITI.forEach(thm => {
  const maiuscolo = thm[0].toUpperCase() + thm.slice(1);
  THEMES_MAP[maiuscolo] = thm;
});

const CATEGORIE = ['Abbigliamento', 'Alimentari', 'Cartoleria', 'Casa e Arredamento', 'Giochi ed elettronica',
  'Medicinali e salute', 'Sport e tempo libero', 'Lavoro'].sort().concat('Altro');

function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [prezzoMin, setPrezzoMin] = useState(0);
  const [prezzoMax, setPrezzoMax] = useState(0);
  const [prezzoMinSel, setPrezzoMinSel] = useState(0);
  const [prezzoMaxSel, setPrezzoMaxSel] = useState(0);
  const [nomeRicerca, setNomeRicerca] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [rangeModificato, setRangeModificato] = useState(false);
  const [periodo, setPeriodo] = useState("tutto");

  // Gestione tema
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleThemeChange = (event) => setTheme(event.target.value);

  const calculatePriceRange = useCallback((currentData) => {
    if (currentData.length === 0) return { min: 0, max: 0 };
    const prezzi = currentData.map(item => Number(item.prezzo));
    return { min: Math.min(...prezzi), max: Math.max(...prezzi) };
  }, []);

  // Fetch iniziale dati
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("http://127.0.0.1:8090/api/collections/spese/records");
        if (!res.ok) throw new Error("Errore fetch");
        const resp = await res.json();
        const listaProdotti = resp.items.map(item => ({
          nome: item.nome,
          descrizione: item.descrizione,
          prezzo: Number(item.prezzo),
          quantita: item.quantita,
          tipologia: item.tipologia,
          data_acquisto: item.data_acquisto,
          data_creazione: item.created,
          id: item.id
        }));
        setData(listaProdotti);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  // Calcolo range prezzi
  useEffect(() => {
    if (data.length === 0) return;
    const { min, max } = calculatePriceRange(data);
    setPrezzoMin(min);
    setPrezzoMax(max);

    if (!rangeModificato) {
      setPrezzoMinSel(min);
      setPrezzoMaxSel(max);
    }
  }, [data, calculatePriceRange, rangeModificato]);

  // Filtri automatici
  useEffect(() => {
    if (data.length === 0) {
      setFilteredData([]);
      return;
    }

    let currentFiltered = data.filter(item => {
      const isPriceMatch = item.prezzo >= prezzoMinSel && item.prezzo <= prezzoMaxSel;
      if (!nomeRicerca) return isPriceMatch;
      const searchTerm = nomeRicerca.toLowerCase();
      const isTextMatch = item.nome.toLowerCase().includes(searchTerm) || item.descrizione.toLowerCase().includes(searchTerm);
      return isPriceMatch && isTextMatch;
    });

    setFilteredData(currentFiltered);
  }, [data, prezzoMinSel, prezzoMaxSel, nomeRicerca]);

  const HandleRicercaPerNome = (e) => setNomeRicerca(e.target.value);

  const handlePriceRangeChange = (e) => {
    const val = Number(e.target.value);
    if (e.target.name === 'min') {
      setPrezzoMinSel(Math.min(val, prezzoMaxSel));
    } else {
      setPrezzoMaxSel(Math.max(val, prezzoMinSel));
    }
    setRangeModificato(true);
  }

  const handleResetFiltro = () => {
    setPrezzoMinSel(prezzoMin);
    setPrezzoMaxSel(prezzoMax);
    setNomeRicerca("");
    setRangeModificato(false);
    document.getElementById("ricercaNome").value = "";
    document.getElementById("modaleFiltro").close();
  }

  const handleAggiungiSpesa = async (nuovoAcquisto) => {
    try {
      const res = await fetch("http://127.0.0.1:8090/api/collections/spese/records", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuovoAcquisto)
      });
      if (!res.ok) {
        const errData = await res.json();
        console.error(errData);
        alert(`Errore: ${res.status}`);
        return;
      }

      const recordCreato = await res.json();
      recordCreato.prezzo = Number(recordCreato.prezzo);

      setData(prev => [recordCreato, ...prev]);
      document.getElementById("formSpesa").reset();
      document.getElementById("modaleAggiungiSpesa").close();

    } catch (err) {
      console.error(err);
      alert("Errore di rete");
    }
  }

  const handleRimuoviSpesa = useCallback((id) => async () => {
    try {
      await pb.collection('spese').delete(id);
      setData(prev => {
        const newData = prev.filter(item => item.id !== id);
        const { min, max } = calculatePriceRange(newData);
        setPrezzoMin(min);
        setPrezzoMax(max);
        if (!rangeModificato) {
          setPrezzoMinSel(min);
          setPrezzoMaxSel(max);
        }
        return newData;
      });
    } catch (err) {
      console.error(err);
      alert("Errore rimozione");
    }
  }, [calculatePriceRange, rangeModificato]);

  // Dati grafico a torta
  const dataPerCategoria = useMemo(() => {
    const mappa = {};
    data.forEach(item => {
      if (!mappa[item.tipologia]) mappa[item.tipologia] = 0;
      mappa[item.tipologia] += Number(item.prezzo) * Number(item.quantita);
    });
    return Object.keys(mappa).map(cat => ({
      id: cat,
      label: cat,
      value: mappa[cat]
    }));
  }, [data]);

  // Dati grafico a linee
  const dataPerPeriodo = useMemo(() => {
    if (data.length === 0) return [];
    const oggi = new Date();
    let dataInizio;
    switch (periodo) {
      case "settimana":
        dataInizio = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - 7);
        break;
      case "mese":
        dataInizio = new Date(oggi.getFullYear(), oggi.getMonth() - 1, oggi.getDate());
        break;
      case "anno":
        dataInizio = new Date(oggi.getFullYear() - 1, oggi.getMonth(), oggi.getDate());
        break;
      default:
        dataInizio = new Date(0);
        break;
    }

    const mappa = {};
    data.forEach(item => {
      const d = new Date(item.data_acquisto);
      if (d >= dataInizio) {
        const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const costo = Number(item.prezzo) * Number(item.quantita);
        if (!mappa[day]) mappa[day] = 0;
        mappa[day] += costo;
      }
    });

    const dateOrdinate = Object.keys(mappa).sort();
    return [
      {
        id: "Spesa Totale",
        data: dateOrdinate.map(day => ({ x: day, y: mappa[day] }))
      }
    ];
  }, [data, periodo]);

  return (
    <div className="container mx-auto p-4" data-theme={theme}>
      {/* BARRA NAV */}
      <div id="barraNav" className="card fixed top-4 left-4 right-4 z-50 shadow-xl glass rounded-box p-4 text-primary-content/80 flex justify-between items-center">
        <div className="flex items-center">
          <button className="btn btn-primary btn-sm m-2" onClick={() => document.getElementById("modaleAggiungiSpesa").showModal()}>Aggiungi Spesa</button>
          <input type="text" placeholder="Cerca Spesa" className="input input-bordered input-primary w-full max-w-xs m-2" id="ricercaNome" value={nomeRicerca} onChange={HandleRicercaPerNome} />
          <button className="btn btn-secondary btn-sm m-2" disabled={data.length === 0} onClick={() => document.getElementById("modaleFiltro").showModal()}>Range di prezzo</button>
        </div>

        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn m-1">
            Tema
            <svg width="12px" height="12px" className="inline-block h-2 w-2 fill-current opacity-60" viewBox="0 0 2048 2048"><path d="M1799 349l242 241-1017 1017L7 590l242-241 775 775 775-775z"></path></svg>
          </div>
          <ul tabIndex={0} className="dropdown-content bg-base-300 rounded-box z-10 w-52 p-2 shadow-2xl" onChange={handleThemeChange} data-theme={theme}>
            {Object.keys(THEMES_MAP).map(thm => (
              <li key={thm}>
                <input type="radio" name="theme-dropdown" className="theme-controller w-full btn btn-sm btn-block btn-ghost justify-start" aria-label={thm} value={THEMES_MAP[thm]} checked={THEMES_MAP[thm] === theme} onChange={() => { }} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CONTENUTO */}
      <div id="contenuto" className="pt-32 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* COLONNA PRODOTTI */}
        <div className="p-4 space-y-4">
          {filteredData.length === 0 ? (
            data.length === 0 ? (
              <div className="card bg-base-200/50 shadow-xl p-6 text-center text-primary-content">
                Nessuna spesa registrata. Clicca su "Aggiungi Spesa" per iniziare.
              </div>
            ) : (
              <div role="alert" className="alert alert-warning">
                Nessun risultato trovato per i criteri di ricerca.
              </div>
            )
          ) : filteredData.map(item => <Prodotto key={item.id} data={item} rimuoviSpesa={handleRimuoviSpesa} />)}
        </div>

        {/* COLONNA GRAFICI */}
        <div className="p-4 card bg-base-200 shadow-xl space-y-4">
          <h2 className="text-xl font-bold mb-4">Spesa totale per categoria</h2>
          <div style={{ height: 350 }}>
            <ResponsivePie
              data={dataPerCategoria}
              margin={{ top: 30, right: 80, bottom: 30, left: 80 }}
              innerRadius={0.5} padAngle={1} cornerRadius={3} activeOuterRadiusOffset={8}
              arcLinkLabelsSkipAngle={10} arcLabelsSkipAngle={10} colors={{ scheme: "paired" }}
              tooltip={({ datum }) => <div style={{ padding: "6px 12px", background: "white", color: "black", borderRadius: "6px", border: "1px solid #ddd", fontWeight: "bold" }}>{datum.label}: €{datum.value.toFixed(2)}</div>}
            />
          </div>

          <hr className="my-6" />

          <div className="mb-4">
            <label className="font-bold mr-2">Periodo:</label>
            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} className="select select-bordered">
              <option value="tutto">Tutto</option>
              <option value="anno">Ultimo anno</option>
              <option value="mese">Ultimo mese</option>
              <option value="settimana">Ultima settimana</option>
            </select>
          </div>

          <h3 className="text-lg font-bold mt-4 mb-2">Andamento della spesa nel tempo</h3>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={dataPerPeriodo}
              margin={{ top: 30, right: 50, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto", stacked: false }}
              axisBottom={{ tickRotation: -45 }}
              colors={{ scheme: "set2" }}
              pointSize={8} pointBorderWidth={2} useMesh={true}
              tooltip={({ datum, point }) => {
                const label = datum?.label ?? point?.data?.xFormatted;
                const value = datum?.value ?? point?.data?.yFormatted;
                return <div style={{ padding: "8px 14px", background: "rgba(255,255,255,0.97)", color: "black", borderRadius: "8px", border: "1px solid #ccc", fontWeight: "bold", fontSize: "0.85rem", boxShadow: "0 4px 14px rgba(0,0,0,0.25)", pointerEvents: "none" }}>{label}: €{Number(value).toFixed(2)}</div>
              }}
            />
          </div>

        </div>

      </div>
      {/* MODALE AGGIUNGI SPESA */}
      <dialog id="modaleAggiungiSpesa" className="modal">
        <form method="dialog" id="formSpesa" className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">Aggiungi nuova spesa</h3>

          <input type="text" name="nome" placeholder="Nome prodotto" className="input input-bordered w-full" required />
          <input type="text" name="descrizione" placeholder="Descrizione" className="input input-bordered w-full" />
          <input type="number" name="prezzo" placeholder="Prezzo (€)" className="input input-bordered w-full" step="0.01" min="0" required />
          <input type="number" name="quantita" placeholder="Quantità" className="input input-bordered w-full" min="1" defaultValue={1} required />

          <select name="tipologia" className="select select-bordered w-full" required>
            {CATEGORIE.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <input type="date" name="data_acquisto" className="input input-bordered w-full" required />

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => document.getElementById("modaleAggiungiSpesa").close()}>Chiudi</button>
            <button type="submit" className="btn btn-primary" onClick={(e) => {
              e.preventDefault();
              const form = e.target.closest("form");
              const nuovoAcquisto = {
                nome: form.nome.value,
                descrizione: form.descrizione.value,
                prezzo: parseFloat(form.prezzo.value),
                quantita: parseInt(form.quantita.value),
                tipologia: form.tipologia.value,
                data_acquisto: form.data_acquisto.value
              };
              handleAggiungiSpesa(nuovoAcquisto);
            }}>Aggiungi</button>
          </div>
        </form>
      </dialog>

      {/* MODALE FILTRO PREZZO */}
      <dialog id="modaleFiltro" className="modal">
        <form method="dialog" className="modal-box flex flex-col gap-4">
          <h3 className="font-bold text-lg">Filtro per prezzo</h3>

          <div className="flex items-center gap-2">
            <label className="w-16">Min (€)</label>
            <input type="number" name="min" value={prezzoMinSel} min={prezzoMin} max={prezzoMaxSel} onChange={handlePriceRangeChange} className="input input-bordered flex-1" />
          </div>

          <div className="flex items-center gap-2">
            <label className="w-16">Max (€)</label>
            <input type="number" name="max" value={prezzoMaxSel} min={prezzoMinSel} max={prezzoMax} onChange={handlePriceRangeChange} className="input input-bordered flex-1" />
          </div>

          <div className="modal-action">
            <button type="button" className="btn btn-ghost" onClick={() => document.getElementById("modaleFiltro").close()}>Chiudi</button>
            <button type="button" className="btn btn-warning" onClick={handleResetFiltro}>Reset</button>
            <button type="submit" className="btn btn-primary" onClick={() => document.getElementById("modaleFiltro").close()}>Applica</button>
          </div>
        </form>
      </dialog>

    </div>
  )
}

export default App;
