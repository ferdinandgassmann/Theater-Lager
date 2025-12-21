import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

function EditShoeModal({ shoe, shoeTypes, onClose, onUpdate }) {
    const [formData, setFormData] = useState({
        shelfLocation: shoe.shelfLocation || '',
        type: shoe.type || '',
        size: shoe.size || '',
        description: shoe.description || '', // NEU: Beschreibung
        image: null
    });
    const [loading, setLoading] = useState(false);

    const auth = { username: 'schuhfee', password: 'theater123' };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Textdaten aktualisieren
            const payload = {
                ...formData,
                status: shoe.status,
                currentProduction: shoe.currentProduction,
                inventoryNumber: shoe.inventoryNumber
            };

            const res = await axios.put(`${API_URL}/api/shoes/${shoe.id}`, payload, { auth });
            let updatedShoe = res.data;

            // 2. Bild aktualisieren (nur wenn ein neues ausgewählt wurde)
            if (formData.image) {
                const imagePayload = new FormData();
                imagePayload.append('file', formData.image);
                await axios.post(`${API_URL}/api/shoes/${shoe.id}/image`, imagePayload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    auth
                });
                updatedShoe.imageUpdate = Date.now();
            }

            onUpdate(updatedShoe);
            onClose();
        } catch (err) {
            alert('Fehler beim Speichern: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-amber-500 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">✏️ Schuh bearbeiten</h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Regal / Kiste</label>
                        <input
                            type="text"
                            required
                            value={formData.shelfLocation}
                            onChange={e => setFormData({...formData, shelfLocation: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none font-bold uppercase"
                        />
                    </div>

                    {/* TYP IST JETZT FREI EINGEBBAR MIT VORSCHLÄGEN */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategorie / Typ</label>
                        <input
                            list="edit-shoe-types-list"
                            type="text"
                            required
                            placeholder="Wählen oder Tippen..."
                            value={formData.type}
                            onChange={e => setFormData({...formData, type: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                        <datalist id="edit-shoe-types-list">
                             {shoeTypes.map(t => <option key={t} value={t} />)}
                        </datalist>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Größe</label>
                        <input
                            type="text"
                            required
                            value={formData.size}
                            onChange={e => setFormData({...formData, size: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none"
                        />
                    </div>

                    {/* NEU: BESCHREIBUNG */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Beschreibung / Notizen</label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Neues Bild (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFormData({...formData, image: e.target.files[0]})}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Abbrechen</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded shadow transition">
                            {loading ? 'Speichere...' : 'Speichern'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditShoeModal;