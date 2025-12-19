import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShoeForm from './components/ShoeForm';
import HistoryModal from './components/HistoryModal';
import API_URL from './config';

const SHOE_TYPES = [
  "Halbschuhe (Herren)", "Halbschuhe (Damen)", "Stiefel (Allgemein)",
  "Stiefeletten", "Marschstiefel", "Reitstiefel", "Pumps", "Sandalen",
  "Sneakers / Turnschuhe", "Barockschuhe", "Schnabelschuhe", "Tanzschuhe",
  "Plateauschuhe", "Arbeitsschuhe", "Hausschuhe", "Mokassins", "Clogs",
  "Ballettschuhe", "Römersandalen", "Gamaschen", "Historisch (Sonstige)", "Sonstiges"
];

function App() {
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Filter & Auswahl States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Alle');
  const [filterStatus, setFilterStatus] = useState('Alle');
  const [selectedIds, setSelectedIds] = useState([]);

  // Bulk Action States
  const [bulkProduction, setBulkProduction] = useState('');
  const [bulkDate, setBulkDate] = useState('');

  // --- HISTORIE STATE ---
  const [historyShoe, setHistoryShoe] = useState(null);

  const auth = { username: 'schuhfee', password: 'theater123' };

  // --- DATA FETCHING ---
  const fetchShoes = () => {
    axios.get(`${API_URL}/api/shoes`, { auth })
      .then(res => setShoes(res.data))
      .catch(err => setError('Konnte Backend nicht erreichen.'));
  };

  useEffect(() => { fetchShoes(); }, []);

  const handleShoeAdded = (newShoe) => {
    setShoes(prev => [...prev, newShoe]);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    if(!window.confirm("Schuh wirklich löschen?")) return;
    axios.delete(`${API_URL}/api/shoes/${id}`, { auth })
      .then(() => {
        setShoes(prev => prev.filter(shoe => shoe.id !== id));
        setSelectedIds(prev => prev.filter(sid => sid !== id));
      })
      .catch(err => alert("Fehler: " + err));
  };

  // --- STATISTIK BERECHNEN ---
  const stats = {
    total: shoes.length,
    available: shoes.filter(s => s.status === 'Verfügbar').length,
    rented: shoes.filter(s => s.status === 'Ausgeliehen').length,
    repair: shoes.filter(s => s.status === 'In Reparatur').length,
    gone: shoes.filter(s => s.status === 'Ausgemustert').length,
    activeProductions: [...new Set(shoes
        .filter(s => s.status === 'Ausgeliehen' && s.currentProduction)
        .map(s => s.currentProduction)
    )].length
  };

  const handleFilterClick = (status) => {
    if (filterStatus === status) {
        setFilterStatus('Alle');
    } else {
        setFilterStatus(status);
    }
  };

  // --- BULK ACTIONS ---
  const handleBulkRent = () => {
    if (!bulkProduction) return alert("Bitte einen Produktions-Namen eingeben!");
    axios.post(`${API_URL}/api/shoes/bulk-rent`, {
      shoeIds: selectedIds, production: bulkProduction, returnDate: bulkDate || null
    }, { auth })
    .then(() => {
      alert(`${selectedIds.length} Schuhe an "${bulkProduction}" verliehen!`);
      fetchShoes(); clearSelection(); setBulkProduction('');
    })
    .catch(err => alert("Fehler beim Verleihen: " + err));
  };

  const handleBulkReturn = () => {
    if(!window.confirm(`${selectedIds.length} Schuhe als 'Verfügbar' markieren?`)) return;
    axios.post(`${API_URL}/api/shoes/bulk-return`, selectedIds, { auth })
    .then(() => { fetchShoes(); clearSelection(); })
    .catch(err => alert("Fehler bei Rückgabe: " + err));
  };

  // --- HELPER ---
  const toggleSelection = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  const selectAllFiltered = () => setSelectedIds(filteredShoes.map(s => s.id));
  const clearSelection = () => setSelectedIds([]);

  // --- FILTER LOGIK (Jetzt mit Regalnummer!) ---
  const filteredShoes = shoes.filter(shoe => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
          (shoe.shelfLocation && shoe.shelfLocation.toLowerCase().includes(lowerSearch)) || // Suche nach Regal!
          shoe.size.toLowerCase().includes(lowerSearch) ||
          (shoe.currentProduction && shoe.currentProduction.toLowerCase().includes(lowerSearch));

    const matchesType = filterType === 'Alle' || shoe.type === filterType;
    const matchesStatus = filterStatus === 'Alle' || shoe.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-32 font-sans text-gray-800 relative">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* HEADER */}
        <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight cursor-pointer" onClick={() => setFilterStatus('Alle')}>
                🎭 Theater Fundus
                </h1>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition"
                >
                    {showForm ? 'Schließen' : '+ Neuer Schuh'}
                </button>
            </div>

            {/* DASHBOARD KACHELN */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div onClick={() => handleFilterClick('Verfügbar')} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition hover:shadow-md ${filterStatus === 'Verfügbar' ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-blue-100'}`}>
                    <p className="text-xs font-bold text-gray-400 uppercase">Lagerbestand</p>
                    <div className="flex items-end gap-2 mt-1">
                        <span className="text-3xl font-bold text-blue-600">{stats.available}</span>
                        <span className="text-sm text-gray-500 mb-1">/ {stats.total} verfügbar</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(stats.available / stats.total) * 100}%` }}></div>
                    </div>
                </div>

                <div onClick={() => handleFilterClick('Ausgeliehen')} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition hover:shadow-md ${filterStatus === 'Ausgeliehen' ? 'ring-2 ring-yellow-500 border-yellow-500 bg-yellow-50' : 'border-yellow-100'}`}>
                    <p className="text-xs font-bold text-gray-400 uppercase">Unterwegs</p>
                    <div className="mt-1">
                        <span className="text-3xl font-bold text-yellow-600">{stats.rented}</span>
                        <span className="text-sm text-gray-500 ml-1">Schuhe</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-2 bg-yellow-100/50 inline-block px-2 py-1 rounded">
                        an <b>{stats.activeProductions}</b> Produktionen
                    </p>
                </div>

                <div onClick={() => handleFilterClick('In Reparatur')} className={`bg-white p-4 rounded-xl shadow-sm border flex flex-col justify-between cursor-pointer transition hover:shadow-md ${filterStatus === 'In Reparatur' ? 'ring-2 ring-orange-500 border-orange-500 bg-orange-50' : 'border-orange-100'}`}>
                    <p className="text-xs font-bold text-gray-400 uppercase">Werkstatt</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-3xl font-bold text-orange-500">{stats.repair}</span>
                        <span className="text-sm text-gray-400">defekt</span>
                    </div>
                </div>

                <div className={`p-4 rounded-xl shadow-sm border transition-colors flex flex-col justify-center items-center cursor-pointer ${selectedIds.length > 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-400'}`} onClick={() => { if (selectedIds.length > 0) window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}>
                    <span className="text-3xl font-bold">{selectedIds.length}</span>
                    <p className="text-xs font-bold uppercase mt-1">Ausgewählt</p>
                    {selectedIds.length > 0 && <p className="text-[10px] mt-1 opacity-80">Aktion starten ↓</p>}
                </div>
            </div>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        {/* AKTIVER FILTER HINWEIS */}
        {filterStatus !== 'Alle' && (
            <div className="mb-4 flex items-center gap-2 animate-fade-in-down">
                <span className="text-sm text-gray-500">Aktiver Filter:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 ${filterStatus === 'Verfügbar' ? 'bg-blue-100 text-blue-800' : filterStatus === 'Ausgeliehen' ? 'bg-yellow-100 text-yellow-800' : filterStatus === 'In Reparatur' ? 'bg-orange-100 text-orange-800' : 'bg-gray-200'}`}>
                    {filterStatus}
                    <button onClick={() => setFilterStatus('Alle')} className="hover:text-black font-extrabold">✕</button>
                </span>
            </div>
        )}

        {/* Filterleiste */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end sticky top-2 z-30">
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Suche</label>
                <input type="text" placeholder="🔍 Regal, Größe oder Produktion..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorie</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                    <option value="Alle">Alle Kategorien</option>
                    {SHOE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                 <button onClick={selectAllFiltered} className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition text-sm font-bold border border-gray-200">Alle auswählen</button>
            </div>
        </div>

        {showForm && <ShoeForm onShoeAdded={handleShoeAdded} shoeTypes={SHOE_TYPES} />}

        {/* GRID VIEW */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredShoes.map(shoe => {
            const isSelected = selectedIds.includes(shoe.id);
            return (
                <div key={shoe.id} onClick={() => toggleSelection(shoe.id)} className={`relative bg-white rounded-xl shadow-sm border cursor-pointer transition-all duration-200 overflow-hidden group ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : 'border-gray-100 hover:shadow-md'}`}>

                  {/* Select Icon */}
                  <div className={`absolute top-2 left-2 z-20 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'}`}>
                          {isSelected && <span className="text-white font-bold text-xs">✓</span>}
                      </div>
                  </div>

                  {/* --- NEU: REGALNUMMER OBEN RECHTS (FETT) --- */}
                  <div className="absolute top-2 right-2 z-10 bg-gray-900/80 backdrop-blur text-white text-xs font-bold uppercase px-2 py-1 rounded shadow-sm border border-white/20">
                    📍 {shoe.shelfLocation || "???"}
                  </div>

                  {/* Bild */}
                  <div className="h-32 w-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <img
                        src={`${API_URL}/api/shoes/${shoe.id}/image`}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400x300?text=No+Img"; }}
                    />
                  </div>

                  <div className="p-3">
                    <h2 className="text-sm font-bold text-gray-800 truncate" title={shoe.type}>{shoe.type}</h2>
                    <p className="text-xs text-gray-500">Größe: <span className="font-bold text-gray-800">{shoe.size}</span></p>

                    <div className="mt-2 flex flex-wrap gap-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${shoe.status === 'Verfügbar' ? 'bg-green-50 text-green-700 border-green-200' : shoe.status === 'Ausgeliehen' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                            {shoe.status}
                        </span>
                    </div>

                    {shoe.status === 'Ausgeliehen' && shoe.currentProduction && (
                        <div className="mt-2 bg-yellow-50 p-1.5 rounded border border-yellow-100">
                            <p className="text-[10px] text-gray-500 uppercase font-bold">Im Stück:</p>
                            <p className="text-xs font-bold text-gray-800 truncate" title={shoe.currentProduction}>🎭 {shoe.currentProduction}</p>
                        </div>
                    )}

                   {/* --- BUTTONS SIND JETZT IMMER SICHTBAR --- */}
                    <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                         {/* Verlauf Button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); setHistoryShoe(shoe); }}
                            className="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1.5 rounded font-bold flex items-center gap-1 transition-colors"
                            title="Verlauf anzeigen"
                        >
                            📜 Verlauf
                        </button>

                        {/* Löschen Button (ganz dezent in grau) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(shoe.id); }}
                            className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                            title="Löschen"
                        >
                            🗑
                        </button>
                    </div>

                  </div>
                </div>
            );
          })}
        </div>
      </div>

      {/* --- MODAL WIRD HIER ANGEZEIGT WENN NOTWENDIG --- */}
      {historyShoe && (
          <HistoryModal
            shoe={historyShoe}
            onClose={() => setHistoryShoe(null)}
          />
      )}

      {/* BULK ACTION BAR */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] p-4 z-50 animate-slide-up">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <span className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full text-sm">{selectedIds.length}</span>
                    <span className="font-medium text-gray-700">Schuhe ausgewählt</span>
                    <button onClick={clearSelection} className="text-sm text-gray-400 underline hover:text-gray-600">Aufheben</button>
                </div>
                <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                    <input type="text" placeholder="Name der Produktion (z.B. Faust)" value={bulkProduction} onChange={(e) => setBulkProduction(e.target.value)} className="border border-gray-300 rounded px-3 py-2 text-sm w-full md:w-64" />
                    <button onClick={handleBulkRent} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 py-2 rounded shadow transition text-sm">📤 Verleihen</button>
                    <div className="w-px h-8 bg-gray-300 mx-2 hidden md:block"></div>
                    <button onClick={handleBulkReturn} className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded shadow transition text-sm">📥 Zurückgeben</button>
                    <button onClick={() => {if(window.confirm("Wirklich löschen?")) { selectedIds.forEach(id => handleDelete(id)); clearSelection(); }}} className="bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-2 rounded transition text-sm">🗑</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}

export default App;