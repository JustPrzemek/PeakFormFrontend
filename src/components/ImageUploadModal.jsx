import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // WAŻNE: Importuj style biblioteki
import { uploadProfileImage } from '../services/userProfileService';

// Funkcja pomocnicza z dokumentacji biblioteki
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    );
}

export default function ImageUploadModal({ isOpen, onClose, onUploadSuccess }) {
    const [previewUrl, setPreviewUrl] = useState('');
    const imgRef = useRef(null);
    const [crop, setCrop] = useState(); // Stan do przechowywania informacji o zaznaczeniu
    const [completedCrop, setCompletedCrop] = useState(null); // Stan po zakończeniu zaznaczania
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const aspect = 1; // 1:1 dla kwadratu

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setCrop(undefined); // Resetuj zaznaczenie
            const reader = new FileReader();
            reader.addEventListener('load', () => setPreviewUrl(reader.result.toString() || ''));
            reader.readAsDataURL(e.target.files[0]);
            setError('');
        }
    };

    function onImageLoad(e) {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }

    const handleSubmit = async () => {
        if (!completedCrop || !imgRef.current) {
            setError('Please select a crop area.');
            return;
        }

        setIsUploading(true);
        setError('');

        // Tworzymy "płótno" (canvas) i rysujemy na nim przycięty obraz
        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height,
        );

        // Konwertujemy canvas na plik i wysyłamy
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError('Could not process image.');
                setIsUploading(false);
                return;
            }
            try {
                const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
                const newImageUrl = await uploadProfileImage(croppedFile);
                onUploadSuccess(newImageUrl);
                onClose();
            } catch (err) {
                setError(err.message || 'An error occurred.');
            } finally {
                setIsUploading(false);
            }
        }, 'image/jpeg');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">Crop Your Photo</h2>
                <input type="file" accept="image/*" onChange={handleFileChange} className="cursor-pointer hover:underline focus:outline-none"/>
                
                {previewUrl && (
                    <div className="mt-4 flex justify-center">
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspect}
                            circularCrop // To daje "kółeczko"!
                        >
                            <img
                                ref={imgRef}
                                alt="Crop me"
                                src={previewUrl}
                                onLoad={onImageLoad}
                                style={{ maxHeight: '70vh' }}
                            />
                        </ReactCrop>
                    </div>
                )}
                
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                
                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="bg-sky-500 text-white font-semibold py-1 px-2 rounded text-sm disabled:opacity-50 cursor-pointer hover:bg-sky-700 transition-colors duration-200">Cancel</button>
                    <button onClick={handleSubmit} disabled={isUploading} className="bg-sky-500 text-white font-semibold py-1 px-2 rounded text-sm disabled:opacity-50 cursor-pointer hover:bg-sky-700 transition-colors duration-200">
                        {isUploading ? 'Uploading...' : 'Save & Upload'}
                    </button>
                </div>
            </div>
        </div>
    );
}