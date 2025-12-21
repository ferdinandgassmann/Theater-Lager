import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

function ShoeForm({ onShoeAdded, shoeTypes }) {
  const [formData, setFormData] = useState({
    shelfLocation: '',
    type: '', // Jetzt leerer Startwert für freie Eingabe
    sizesInput: '', // NEU: String für "38, 39, 40"
    description: '', // NEU: Beschreibung
    image: null
  });
  const [loading, setLoading] = useState(false);

  const auth = { username: 'schuhfee', password: 'theater123' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Größen splitten (Feature: Massen-Input)
    // Aus "38, 39, 40" wird ein Array ["38", "39", "40"]
    const sizes = formData.sizesInput.split(',').map(s => s.trim()).filter(s => s !== '');

    if (sizes.length === 0) {
        alert("Bitte mindestens eine Größe eingeben!");
        setLoading(false);
        return;
    }

    try {
      let lastAddedShoe = null;

      // 2. Schleife für jeden Schuh
      for (const size of sizes) {
          const shoePayload = {
            shelfLocation: formData.shelfLocation,
            inventoryNumber: "AUTO-" + Date.now() + Math.random().toString().slice(2,5),
            type: formData.type || 'Sonstiges', // Fallback
            size: size, // Die aktuelle Größe aus der Schleife
            description: formData.description,
            status: 'Verfügbar'
          };

          const res = await axios.post(`${API_URL}/api/shoes`, shoePayload, { auth });
          const newShoeId = res.data.id;
          lastAddedShoe = { ...res.data, shelfLocation: formData.shelfLocation, size: size };

          // 3. Bild hochladen (das gleiche Bild für alle Schuhe in diesem Batch)
          if (formData.image) {
            const imagePayload = new FormData();
            imagePayload.append('file', formData.image);
            await axios.post(`${API_URL}/api/shoes/${newShoeId}/image`, imagePayload, {
                headers: { 'Content-Type': 'multipart/form-data' },
                auth
            });
            lastAddedShoe.hasImage = true; // Markierung für Frontend
            lastAddedShoe.imageUpdate = Date.now();
          }

          // Jeden Schuh einzeln zur Liste hinzufügen, damit man Fortschritt sieht
          onShoeAdded(lastAddedShoe);
      }

      // Reset
      setFormData({ shelfLocation: '', type: '', sizesInput: '', description: '', image: null });
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
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold"
          />
        </div>

        {/* Typ (Freitext + Vorschläge) */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorie / Typ</label>
          <input
            list="shoe-types-list" // Verknüpfung zur Datalist
            type="text"
            required
            placeholder="Wählen oder Tippen..."
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <datalist id="shoe-types-list">
             {shoeTypes.map(t => <option key={t} value={t} />)}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
         {/* Größen (Multi) */}
         <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Größe(n)</label>
          <input
            type="text"
            required
            placeholder="z.B. 38, 39, 40 (Komma trennt!)"
            value={formData.sizesInput}
            onChange={e => setFormData({...formData, sizesInput: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">Tipp: Mehrere Größen mit Komma trennen, um mehrere Schuhe anzulegen.</p>
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

      {/* Beschreibung (NEU) */}
      <div className="mb-4">
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Beschreibung / Notizen</label>
          <textarea
            rows="2"
            placeholder="z.B. Roter Absatz, leichter Kratzer..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
          />
      </div>

      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg flex justify-center">
        {loading ? 'Speichere...' : 'Im Lager speichern'}
      </button>
    </form>
  );
}

export default ShoeForm;