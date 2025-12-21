import React from 'react';

function ImageModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-2 animate-fade-in"
            onClick={onClose} // Klick auf Hintergrund schließt
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl transition z-50"
            >
                ✕
            </button>

            <img
                src={imageUrl}
                alt="Großansicht"
                className="max-w-full max-h-[90vh] object-contain rounded shadow-2xl animate-scale-up"
                onClick={(e) => e.stopPropagation()} // Klick aufs Bild macht nichts (verhindert Schließen)
            />
        </div>
    );
}

export default ImageModal;