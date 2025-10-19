import React, { useState, useRef, useEffect } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'; // WAŻNE: Importuj style biblioteki
import { uploadProfileImage } from '../services/userProfileService';
import { FaTimes, FaUpload, FaCamera } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';

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

    useEffect(() => {
        if (!isOpen) {
            // Dajemy małe opóźnienie, aby animacja zamknięcia się zakończyła
            setTimeout(() => {
                setPreviewUrl('');
                setError('');
                setCrop(undefined);
            }, 300);
        }
    }, [isOpen]);

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
        <div className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-borderGrayHover" onClick={e => e.stopPropagation()}>
                <header className="flex items-center justify-between p-4 border-b border-borderGrayHover">
                    <h2 className="text-lg font-bold text-whitePrimary">Change Profile Photo</h2>
                    <button onClick={onClose} className="text-borderGrayHover hover:text-white">
                        <FaTimes size={20} />
                    </button>
                </header>

                <div className="p-6">
                    {/* --- POPRAWKA: Input jest teraz zawsze w DOM, ale ukryty --- */}
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />

                    {!previewUrl ? (
                        // Widok początkowy - duży przycisk do uploadu
                        <label 
                            htmlFor="file-upload" 
                            className="relative cursor-pointer bg-backgoudBlack border-2 border-dashed border-borderGrayHover rounded-lg flex flex-col items-center justify-center p-12 hover:border-bluePrimary transition-colors"
                        >
                            <FaUpload className="text-4xl text-borderGrayHover mb-3"/>
                            <span className="font-semibold text-whitePrimary">Click to upload an image</span>
                            <p className="text-xs text-borderGrayHover">PNG, JPG, GIF up to 10MB</p>
                        </label>
                    ) : (
                        // Widok kadrowania
                        <div className="flex justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                circularCrop
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop me"
                                    src={previewUrl}
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '60vh' }}
                                />
                            </ReactCrop>
                        </div>
                    )}
                    {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
                </div>
                
                <footer className="p-4 border-t border-borderGrayHover flex justify-between items-center mt-auto">
                    {/* --- NOWOŚĆ: Przycisk do zmiany zdjęcia --- */}
                    <div>
                        {previewUrl && (
                             <label 
                                htmlFor="file-upload"
                                className="bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-borderGrayHover transition-colors cursor-pointer"
                            >
                                <FaCamera /> Change
                            </label>
                        )}
                    </div>

                    {/* Przyciski akcji */}
                    <div className="flex gap-3">
                        <button onClick={onClose} className="bg-borderGrayHover/50 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-borderGrayHover transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={isUploading || !previewUrl} className="bg-bluePrimary text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors hover:bg-blueHover">
                            {isUploading ? <CgSpinner className="animate-spin"/> : null}
                            {isUploading ? 'Uploading...' : 'Save & Upload'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}