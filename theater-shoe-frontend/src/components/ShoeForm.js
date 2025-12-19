import React, { useState } from 'react';
import axios from 'axios';

// Wir empfangen jetzt "shoeTypes" als Prop von oben
function ShoeForm({ onShoeAdded, shoeTypes }) {
  const [formData, setFormData] = useState({
    inventoryNumber: '',
    type: shoeTypes[0], // Standardmäßig der erste Eintrag
    size: '',
    status: 'Verfügbar'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const auth = { username: 'schuhfee', password: 'theater123' };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    axios.post('http://localhost:8080/api/shoes', formData, { auth })
      .then(response => {
        onShoeAdded(response.data);
        // Formular zurücksetzen
        setFormData({
          inventoryNumber: '',
          type: shoeTypes[0],
          size: '',
          status: 'Verfügbar'
        });
      })
      .catch(err => {
        console.error(err);
        setError('Fehler beim Speichern.');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8 border-l-4 border-blue-500 animate-fade-in-down">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Neuen Schuh anlegen 👞</h3>

      {error && <div className="text-red-600 mb-3 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Inventarnummer */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Inventarnummer</label>
            <input
              type="text"
              name="inventoryNumber"
              value={formData.inventoryNumber}
              onChange={handleChange}
              placeholder="z.B. 1001"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          {/* Schuhart (JETZT ALS DROPDOWN) */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Schuhart</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
            >
              {shoeTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Größe */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Größe</label>
            <input
              type="text"
              name="size"
              value={formData.size}
              onChange={handleChange}
              placeholder="z.B. 42"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border bg-white"
            >
              <option value="Verfügbar">Verfügbar</option>
              <option value="Ausgeliehen">Ausgeliehen</option>
              <option value="In Reparatur">In Reparatur</option>
              <option value="Ausgemustert">Ausgemustert</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
            <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white font-bold py-2 px-6 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
            {isSubmitting ? '...' : 'Speichern'}
            </button>
        </div>
      </form>
    </div>
  );
}

export default ShoeForm;