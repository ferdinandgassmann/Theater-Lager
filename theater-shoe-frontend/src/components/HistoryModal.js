import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';

function HistoryModal({ shoe, onClose }) {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const auth = { username: 'schuhfee', password: 'theater123' };

    useEffect(() => {
        // Lade die Historie vom Backend
        axios.get(`${API_URL}/api/shoes/${shoe.id}/history`, { auth })
            .then(res => {
                setHistory(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [shoe.id]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">

                {/* Header */}
                <div className="bg-blue-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg">📜 Verlauf: {shoe.inventoryNumber}</h3>
                    <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-0 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Lade Daten...</div>
                    ) : history.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            Noch keine Einträge vorhanden. <br/>
                            <span className="text-xs">Verleih den Schuh, um Geschichte zu schreiben!</span>
                        </div>
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-4 py-3">Produktion</th>
                                    <th className="px-4 py-3">Ausgeliehen</th>
                                    <th className="px-4 py-3">Zurück</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {history.map(entry => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 font-bold text-gray-800">
                                            {entry.production}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {entry.rentedAt}
                                        </td>
                                        <td className="px-4 py-3">
                                            {entry.returnedAt ? (
                                                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs border border-green-100">
                                                    {entry.returnedAt}
                                                </span>
                                            ) : (
                                                <span className="text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs border border-yellow-100 animate-pulse">
                                                    Noch offen
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 p-3 border-t text-right">
                    <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800 font-semibold px-4 py-2">
                        Schließen
                    </button>
                </div>
            </div>
        </div>
    );
}

export default HistoryModal;