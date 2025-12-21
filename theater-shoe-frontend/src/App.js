import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShoeForm from './components/ShoeForm';
import HistoryModal from './components/HistoryModal';
import EditShoeModal from './components/EditShoeModal';
import API_URL from './config';
import ImageModal from './components/ImageModal';

// Standard Start-Werte (Fallback, falls DB leer ist)
const DEFAULT_TYPES = [
  "Halbschuhe (Herren)", "Halbschuhe (Damen)", "Stiefel", "Stiefeletten",
  "Pumps", "Sandalen", "Sneaker", "Historisch", "Sonstiges"
];

function App() {
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // NEU: Dynamische Kategorien für den Filter
  const [shoeTypes, setShoeTypes] = useState(DEFAULT_TYPES);

  // Filter & Auswahl States
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Alle');
  const [filterStatus, setFilterStatus] = useState('Alle');
  const [selectedIds, setSelectedIds] = useState([]);

  // Bulk Action States
  const [bulkProduction, setBulkProduction] = useState('');
  const [bulkDate, setBulkDate] = useState('');

  // Modals
  const [historyShoe, setHistoryShoe] = useState(null);
  const [editingShoe, setEditingShoe] = useState(null);
  const [viewingImage, setViewingImage] = useState(null);

  const auth = { username: 'schuhfee', password: 'theater123' };

  // --- DATA FETCHING ---
  const fetchShoes = () => {
    // 1. Schuhe laden
    axios.get(`${API_URL}/api/shoes`, { auth })
      .then(res => setShoes(res.data))
      .catch(err => setError('Konnte Backend nicht erreichen.'));

    // 2. Kategorien laden (für den Filter)
    axios.get(`${API_URL}/api/shoes/types`, { auth })
      .then(res => {
         if(res.data && res.data.length > 0) {
             // Wir mischen Defaults mit DB-Werten und entfernen Duplikate
             const merged = Array.from(new Set([...DEFAULT_TYPES, ...res.data])).sort();
             setShoeTypes(merged);
         }
      })
      .catch(console.error);
  };

  useEffect(() => { fetchShoes(); }, []);

  const handleShoeAdded = (newShoe) => {
    setShoes(prev => [...prev, newShoe]);
    // Wenn es ein neuer Typ ist (Custom), fügen wir ihn auch dem Filter hinzu
    if(newShoe.type && !shoeTypes.includes(newShoe.type)) {
        setShoeTypes(prev => [...prev, newShoe.type].sort());
    }
    setShowForm(false);
  };

  const handleShoeUpdated = (updatedShoe) => {
    setShoes(prev => prev.map(s => s.id === updatedShoe.id ? updatedShoe : s));
    // Auch hier prüfen, ob durch Bearbeiten eine neue Kategorie entstand
    if(updatedShoe.type && !shoeTypes.includes(updatedShoe.type)) {
        setShoeTypes(prev => [...prev, updatedShoe.type].sort());
    }
    setEditingShoe(null);
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

  // --- BACKUP / EXPORT FUNKTION ---
  const handleExport = () => {
     // CSV Header
     let csvContent = "data:text/csv;charset=utf-8,";
     csvContent += "Regal/Kiste;Typ;Größe;Status;Produktion;Beschreibung;Bild-Link\n";

     // Daten Zeilen
     shoes.forEach(shoe => {
         const imageLink = `${API_URL}/api/shoes/${shoe.id}/image`;
         const row = [
             shoe.shelfLocation || "",
             shoe.type,
             shoe.size,
             shoe.status,
             shoe.currentProduction || "",
             // Wichtig: Beschreibung in Anführungszeichen setzen, falls Kommas drin sind
             `"${(shoe.description || "").replace(/"/g, '""')}"`,
             imageLink
         ].join(";");
         csvContent += row + "\n";
     });

     const encodedUri = encodeURI(csvContent);
     const link = document.createElement("a");
     link.setAttribute("href", encodedUri);
     const date = new Date().toISOString().slice(0,10);
     link.setAttribute("download", `Lager_Backup_${date}.csv`);
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
   };

  // --- STATISTIK ---
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
    if (filterStatus === status) { setFilterStatus('Alle'); }
    else { setFilterStatus(status); }
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

  // --- FILTER LOGIK ---
  const filteredShoes = shoes.filter(shoe => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
          (shoe.shelfLocation && shoe.shelfLocation.toLowerCase().includes(lowerSearch)) ||
          shoe.size.toLowerCase().includes(lowerSearch) ||
          (shoe.currentProduction && shoe.currentProduction.toLowerCase().includes(lowerSearch));

    const matchesType = filterType === 'Alle' || shoe.type === filterType;
    const matchesStatus = filterStatus === 'Alle' || shoe.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-40 font-sans text-gray-800 relative">
      <div className="max-w-7xl mx-auto p-4 md:p-8">

        {/* HEADER */}
        <div className="mb-8">
           {/* HEADER BEREICH */}
           <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
               {/* LOGO & TITEL KOMBINATION */}
               <div
                   className="flex items-center gap-6 cursor-pointer group select-none"
                   onClick={() => setFilterStatus('Alle')}
               >
                   {/* DAS LOGO */}
                   <img
                       src="/logo.png"
                       alt="Shoe on a Shelf Logo"
                       className="w-32 h-32 rounded-2xl shadow-lg group-hover:scale-105 transition-transform bg-blue-50"
                       onError={(e) => { e.target.style.display='none'; }} // Falls Logo fehlt, einfach ausblenden
                   />
                   <div>
                       <h1 className="text-4xl md:text-5xl font-extrabold text-blue-800 tracking-tight leading-none">
                           Shoe on a Shelf
                       </h1>
                       <p className="text-sm text-blue-500 font-bold uppercase tracking-wider mt-2 pl-1">
                           Theater Schuh Lager
                       </p>
                   </div>
               </div>

               {/* BUTTON */}
               <button
                   onClick={() => setShowForm(!showForm)}
                   className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-3 text-lg"
               >
                   <span>{showForm ? 'Schließen' : 'Neu erfassen'}</span>
                   {!showForm && <span className="text-2xl leading-none pb-1">+</span>}
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
                {/* DYNAMISCHE KATEGORIEN IM FILTER */}
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full p-2 border border-gray-300 rounded bg-white">
                    <option value="Alle">Alle Kategorien</option>
                    {shoeTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>
            <div>
                 <button onClick={selectAllFiltered} className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200 transition text-sm font-bold border border-gray-200">Alle auswählen</button>
            </div>
        </div>

        {showForm && <ShoeForm onShoeAdded={handleShoeAdded} />}

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

                  {/* Nur anzeigen, wenn shelfLocation existiert */}
                  {shoe.shelfLocation && (
                      <div className="absolute top-2 right-2 z-10 bg-white/90 backdrop-blur text-blue-900 text-[10px] font-bold uppercase px-2 py-1 rounded-lg shadow-sm border border-blue-100 flex items-center gap-1">
                          <span>📍</span> {shoe.shelfLocation}
                      </div>
                  )}

                  {/* BILD BEREICH */}
                                    <div className="h-40 w-full bg-blue-50 flex items-center justify-center overflow-hidden relative group-hover:bg-blue-100 transition-colors">
                                        {(shoe.imageUpdate || shoe.hasImage) ? (
                                          <>
                                             <img
                                                src={`${API_URL}/api/shoes/${shoe.id}/image${shoe.imageUpdate ? `?t=${shoe.imageUpdate}` : ''}`}
                                                alt={shoe.type}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                             />

                                             {/* OVERLAY: Klick-Bereich für Zoom (Lupe) */}
                                             <div
                                                  onClick={(e) => {
                                                    e.stopPropagation(); // WICHTIG: Verhindert Auswahl des Schuhs!
                                                    setViewingImage(`${API_URL}/api/shoes/${shoe.id}/image${shoe.imageUpdate ? `?t=${shoe.imageUpdate}` : ''}`);
                                                  }}
                                                  className="absolute inset-0 flex items-end justify-end p-2 opacity-0 group-hover:opacity-100 md:opacity-0 md:hover:opacity-100 touch-target-mobile transition-opacity bg-gradient-to-t from-black/50 via-transparent to-transparent cursor-zoom-in"
                                             >
                                                  {/* Auf Mobile zeigen wir das Icon immer leicht an, damit man weiß, dass man klicken kann */}
                                                  <div className="bg-white/90 text-blue-900 rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform md:hidden block">
                                                      🔍
                                                  </div>
                                                  {/* Auf Desktop nur beim Hovern (durch group-hover oben geregelt) */}
                                                  <div className="bg-white/90 text-blue-900 rounded-full p-1.5 shadow-sm hover:scale-110 transition-transform hidden md:block">
                                                      🔍
                                                  </div>
                                             </div>
                                          </>
                                        ) : null}

                                        {/* Fallback Icon (Kein Foto) */}
                                        <div className={`w-full h-full flex flex-col items-center justify-center text-blue-300 absolute top-0 left-0 ${(shoe.imageUpdate || shoe.hasImage) ? 'hidden' : 'flex'}`}>
                                            <span className="text-4xl">👞</span>
                                            <span className="text-xs font-bold mt-1 uppercase tracking-widest opacity-50">Kein Foto</span>
                                        </div>
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
                    {/* --- NEU: BESCHREIBUNG / NOTIZ AUF DER KARTE --- */}
                                        {shoe.description && (
                                            <div
                                                className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic"
                                                title={shoe.description} // Zeigt beim Drüberfahren (Desktop) alles an
                                            >
                                                <span className="not-italic mr-1">📝</span>
                                                {/* Text nach 60 Zeichen abschneiden, damit Karte nicht platzt */}
                                                {shoe.description.length > 60
                                                    ? shoe.description.substring(0, 60) + "..."
                                                    : shoe.description}
                                            </div>
                                        )}

                                        {/* ... hier drunter kommt die Action Bar (Buttons) ... */}

                    {/* ACTION BAR - Clean & Right Aligned */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end items-center gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); setHistoryShoe(shoe); }}
                            className="h-8 w-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full flex items-center justify-center transition shadow-sm"
                            title="Verlauf"
                        >
                            <span className="text-sm">📜</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); setEditingShoe(shoe); }}
                            className="h-8 w-8 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-full flex items-center justify-center transition shadow-sm"
                            title="Bearbeiten"
                        >
                            <span className="text-sm">✏️</span>
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(shoe.id); }}
                            className="h-8 w-8 bg-gray-50 hover:bg-red-100 text-gray-400 hover:text-red-500 rounded-full flex items-center justify-center transition shadow-sm ml-1"
                            title="Löschen"
                        >
                            <span className="text-sm">🗑</span>
                        </button>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>

        {/* --- FOOTER MIT BACKUP BUTTON --- */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8 pb-4">
            <button onClick={handleExport} className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded hover:bg-gray-100 transition">
                📥 Datensicherung herunterladen (.csv)
            </button>
            <p className="text-[10px] text-gray-400 mt-2">© Theater Schuh Lager V1.0</p>
        </div>

      </div>

      {/* --- MODALS --- */}
      {historyShoe && <HistoryModal shoe={historyShoe} onClose={() => setHistoryShoe(null)} />}
      {/* Das Bild-Modal einfügen: */}
      {viewingImage && <ImageModal imageUrl={viewingImage} onClose={() => setViewingImage(null)} />}

      {/* Übergabe der dynamischen Kategorien an das Bearbeiten-Fenster */}
      {editingShoe && (
          <EditShoeModal
            shoe={editingShoe}
            shoeTypes={shoeTypes}
            onClose={() => setEditingShoe(null)}
            onUpdate={handleShoeUpdated}
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