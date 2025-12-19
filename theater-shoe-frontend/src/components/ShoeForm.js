import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

function ShoeForm({ onShoeAdded, shoeTypes }) {
  const [formData, setFormData] = useState({
    shelfLocation: '', // Früher inventoryNumber
    type: 'Sonstiges',
    size: '',
    image: null
  });
  const [loading, setLoading] = useState(false);

  const auth = { username: 'schuhfee', password: 'theater123' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 1. Erst den Schuh datensatz anlegen
    try {
      // Wir senden shelfLocation an das Backend
      // inventoryNumber lassen wir automatisch generieren oder leer
      const shoePayload = {
        shelfLocation: formData.shelfLocation,
        inventoryNumber: "AUTO-" + Date.now().toString().slice(-4), // Fake ID für interne Zwecke
        type: formData.type,
        size: formData.size,
        status: 'Verfügbar'
      };

      const res = await axios.post(`${API_URL}/api/shoes`, shoePayload, { auth });
      const newShoeId = res.data.id;

      // 2. Bild hochladen (falls vorhanden)
      if (formData.image) {
        const imagePayload = new FormData();
        imagePayload.append('file', formData.image);
        await axios.post(`${API_URL}/api/shoes/${newShoeId}/image`, imagePayload, {
            headers: { 'Content-Type': 'multipart/form-data' },
            auth
        });
      }

      // Alles fertig
      onShoeAdded({ ...res.data, shelfLocation: formData.shelfLocation });
      setFormData({ shelfLocation: '', type: 'Sonstiges', size: '', image: null });
      setLoading(false);
    } catch (err) {
      alert('Fehler beim Speichern: ' + err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8 animate-fade-in-down">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Neuen Schuh in Kiste legen</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

        {/* --- ÄNDERUNG: REGAL STATT INVENTARNUMMER --- */}
        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Regal / Kiste</label>
          <input
            type="text"
            required
            placeholder="z.B. A-01"
            value={formData.shelfLocation}
            onChange={e => setFormData({...formData, shelfLocation: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none uppercase font-bold"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Typ</label>
          <select
            value={formData.type}
            onChange={e => setFormData({...formData, type: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {shoeTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-600 mb-1">Größe</label>
          <input
            type="text"
            required
            placeholder="z.B. 42"
            value={formData.size}
            onChange={e => setFormData({...formData, size: e.target.value})}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Foto (Optional)</label>
            <input
                type="file"
                accept="image/*"
                onChange={e => setFormData({...formData, image: e.target.files[0]})}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
        </div>
      </div>

      <button type="submit" disabled={loading} className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition shadow-lg flex justify-center">
        {loading ? 'Speichere...' : 'In den Fundus aufnehmen'}
      </button>
    </form>
  );
}

export default ShoeForm;