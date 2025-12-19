import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ShoeForm from './components/ShoeForm';

// --- DIE LISTE DER SCHUHARTEN ---
// Das kann deine Freundin beliebig erweitern!
const SHOE_TYPES = [
  "Halbschuhe (Herren)",
  "Halbschuhe (Damen)",
  "Stiefel (Allgemein)",
  "Stiefeletten",
  "Marschstiefel",
  "Reitstiefel",
  "Pumps",
  "Sandalen",
  "Sneakers / Turnschuhe",
  "Barockschuhe",
  "Schnabelschuhe",
  "Tanzschuhe",
  "Plateauschuhe",
  "Arbeitsschuhe",
  "Hausschuhe",
  "Mokassins",
  "Clogs",
  "Ballettschuhe",
  "Römersandalen",
  "Gamaschen",
  "Historisch (Sonstige)",
  "Sonstiges"
];

function App() {
  const [shoes, setShoes] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  // --- FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState(''); // Für Freitext (Nr, Größe...)
  const [filterType, setFilterType] = useState('Alle'); // Für Dropdown

  const auth = { username: 'schuhfee', password: 'theater123' };

  // --- DATA FETCHING ---
  const fetchShoes = () => {
    axios.get('http://localhost:8080/api/shoes', { auth })
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
    axios.delete(`http://localhost:8080/api/shoes/${id}`, { auth })
      .then(() => setShoes(prev => prev.filter(shoe => shoe.id !== id)))
      .catch(err => alert("Fehler: " + err));
  };

  const handleStatusChange = (shoe, newStatus) => {
    const updatedShoe = { ...shoe, status: newStatus };
    axios.put(`http://localhost:8080/api/shoes/${shoe.id}`, updatedShoe, { auth })
      .then(response => {
        setShoes(prev => prev.map(s => (s.id === shoe.id ? response.data : s)));
      })
      .catch(() => alert("Fehler beim Status-Update"));
  };

  // --- FILTER LOGIK ---
  // Wir nehmen alle Schuhe und filtern sie basierend auf den Eingaben
  const filteredShoes = shoes.filter(shoe => {
    // 1. Textsuche: Suche in Nummer ODER Größe (Case insensitive)
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      shoe.inventoryNumber.toLowerCase().includes(lowerSearch) ||
      shoe.size.toLowerCase().includes(lowerSearch);

    // 2. Typ-Filter: Passt der Typ? (Oder ist "Alle" gewählt?)
    const matchesType = filterType === 'Alle' || shoe.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">
              👠 Theater Fundus
            </h1>
            <p className="text-gray-500 text-sm mt-1">{shoes.length} Schuhe im Lager</p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow transition transform active:scale-95"
          >
            {showForm ? 'Schließen' : '+ Neuer Schuh'}
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        {/* --- SUCH- & FILTERLEISTE --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Freitext Suche */}
            <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Suche (Nr. oder Größe)</label>
                <input
                    type="text"
                    placeholder="🔍 z.B. 1001 oder 42..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>

            {/* Kategorie Filter */}
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorie Filter</label>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                    <option value="Alle">Alle Kategorien anzeigen</option>
                    <option disabled>──────────</option>
                    {SHOE_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
            </div>
        </div>

        {showForm && <ShoeForm onShoeAdded={handleShoeAdded} shoeTypes={SHOE_TYPES} />}

        {/* Leere Liste nach Filter */}
        {filteredShoes.length === 0 && !error && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-xl">Keine Schuhe gefunden.</p>
            {(searchTerm || filterType !== 'Alle') && (
                <button
                    onClick={() => {setSearchTerm(''); setFilterType('Alle');}}
                    className="mt-2 text-blue-600 underline"
                >
                    Filter zurücksetzen
                </button>
            )}
          </div>
        )}

        {/* Grid Ansicht */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredShoes.map(shoe => (
            <div key={shoe.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition duration-200 border border-gray-100 flex flex-col relative group">

              {/* Inventarnummer Badge */}
              <div className="absolute top-3 right-3 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                {shoe.inventoryNumber}
              </div>

              <div className="p-5 flex-grow pt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-1 leading-tight">{shoe.type}</h2>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded text-gray-600">
                        Gr. {shoe.size}
                    </span>
                </div>
              </div>

              {/* Status & Löschen Footer */}
              <div className="bg-gray-50 p-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <select
                  value={shoe.status}
                  onChange={(e) => handleStatusChange(shoe, e.target.value)}
                  className={`flex-grow text-xs font-medium border-none rounded focus:ring-1 focus:ring-blue-500 cursor-pointer py-1 pl-1 bg-transparent ${
                    shoe.status === 'Verfügbar' ? 'text-green-700' :
                    shoe.status === 'Ausgeliehen' ? 'text-yellow-700' :
                    shoe.status === 'In Reparatur' ? 'text-orange-700' :
                    'text-red-700'
                  }`}
                >
                  <option value="Verfügbar">🟢 Verfügbar</option>
                  <option value="Ausgeliehen">🟡 Ausgeliehen</option>
                  <option value="In Reparatur">🟠 Reparatur</option>
                  <option value="Ausgemustert">🔴 Weg</option>
                </select>

                <button
                    onClick={() => handleDelete(shoe.id)}
                    className="text-gray-300 hover:text-red-500 transition p-1"
                    title="Löschen"
                >
                    🗑
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default App;