import React, { useState, useEffect } from 'react'; // useEffect neu importiert
import axios from 'axios';
import API_URL from '../config';

// Standard-Kategorien als Fallback, falls DB leer ist
const DEFAULT_TYPES = [
  "Halbschuhe (Herren)", "Halbschuhe (Damen)", "Stiefel", "Stiefeletten",
  "Pumps", "Sandalen", "Sneaker", "Historisch", "Sonstiges"
];

function ShoeForm({ onShoeAdded }) {
  const [formData, setFormData] = useState({
    shelfLocation: '',
    type: '',
    sizesInput: '',
    description: '',
    image: null
  });

  // States für die Kategorien-Logik
  const [availableTypes, setAvailableTypes] = useState(DEFAULT_TYPES);
  const [isCustomType, setIsCustomType] = useState(false); // Tippt man gerade was eigenes?
  const [loading, setLoading] = useState(false);

  const auth = { username: 'schuhfee', password: 'theater123' };

  // 1. Beim Laden: Kategorien aus der DB holen
  useEffect(() => {
      axios.get(`${API_URL}/api/shoes/types`, { auth })
        .then(res => {
            if(res.data && res.data.length > 0) {
                // Mische DB-Typen mit Defaults (und entferne Duplikate)
                const merged = Array.from(new Set([...DEFAULT_TYPES, ...res.data])).sort();
                setAvailableTypes(merged);
            }
        })
        .catch(err => console.error("Konnte Kategorien nicht laden", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const sizes = formData.sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');

    if (sizes.length === 0) {
        alert("Bitte mindestens eine Größe eingeben!");
        setLoading(false);
        return;
    }

    // Prüfen ob Typ gewählt wurde
    if (!formData.type) {
        alert("Bitte eine Kategorie wählen!");
        setLoading(false);
        return;
    }

    try {
      let lastAddedShoe = null;

      for (const size of sizes) {
          const shoePayload = {
            shelfLocation: formData.shelfLocation,
            inventoryNumber: "AUTO-" + Date.now() + Math.random().toString().slice(2,5),
            type: formData.type,
            size: size,
            description: formData.description,
            status: 'Verfügbar'
          };

          const res = await axios.post(`${API_URL}/api/shoes`, shoePayload, { auth });
          const newShoeId = res.data.id;
          lastAddedShoe = { ...res.data, shelfLocation: formData.shelfLocation, size: size };

          if (formData.image) {
            const imagePayload = new FormData();
            imagePayload.append('file', formData.image);
            await axios.post(`${API_URL}/api/shoes/${newShoeId}/image`, imagePayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                auth
            });
            lastAddedShoe.hasImage = true;
            lastAddedShoe.imageUpdate = Date.now();
          }
          onShoeAdded(lastAddedShoe);
      }

      // Falls wir eine neue Custom Kategorie hatten, fügen wir sie sofort zur Liste hinzu
      if(isCustomType && !availableTypes.includes(formData.type)) {
          setAvailableTypes(prev => [...prev, formData.type].sort());
      }

      // Reset
      setFormData({ shelfLocation: '', type: '', sizesInput: '', description: '', image: null });
      setIsCustomType(false); // Zurück zum Dropdown
      alert(`${sizes.length} Schuh(e) erfolgreich angelegt!`);

    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 animate-fade-in-down">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Neuen Schuh im Lager erfassen</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Regal */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Regal / Kiste</label>
          <input
            type="text"
            required
            placeholder="z.B. A-01"
            value={formData.shelfLocation}
            onChange={e => setFormData({...formData, shelfLocation: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold"
          />
        </div>

        {/* SMART KATEGORIE WAHL */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorie / Typ</label>

          {!isCustomType ? (
              <select
                value={formData.type}
                onChange={(e) => {
                    if(e.target.value === "NEW_CUSTOM_ENTRY") {
                        setIsCustomType(true);
                        setFormData({...formData, type: ''});
                    } else {
                        setFormData({...formData, type: e.target.value});
                    }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              >
                  <option value="" disabled>Bitte wählen...</option>
                  {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  <option disabled>──────────</option>
                  <option value="NEW_CUSTOM_ENTRY" className="font-bold text-blue-600">✨ Neue Kategorie erstellen...</option>
              </select>
          ) : (
              <div className="flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    placeholder="Neue Kategorie eingeben..."
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full p-3 border border-blue-500 ring-1 ring-blue-500 rounded-lg outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => { setIsCustomType(false); setFormData({...formData, type: ''}); }}
                    className="px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-xl"
                    title="Zurück zur Liste"
                  >
                    ↩
                  </button>
              </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         {/* Größen (Multi) */}
         <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Größe(n)</label>
          <input
            type="text"
            required
            placeholder="z.B. 38, 39, 40"
            value={formData.sizesInput}
            onChange={e => setFormData({...formData, sizesInput: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Bild */}
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Foto (Optional)</label>
            <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({...formData, image: e.target.files[0]})}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
      </div>

      {/* Beschreibung */}
      <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Beschreibung / Notizen</label>
          <textarea
            rows="2"
            placeholder="z.B. Roter Absatz, leichter Kratzer..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex justify-center text-lg">
        {loading ? 'Speichere...' : 'Im Lager speichern'}
      </button>
    </form>
  );
}

export default ShoeForm;