// src/components/modals/ImageUploadModal.jsx
import { useState, useRef, useEffect, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { uploadProfileImage } from '../../services/userProfileService';
import { FaTimes, FaUpload, FaCamera } from 'react-icons/fa';
import { CgSpinner } from 'react-icons/cg';
import toast from 'react-hot-toast';

/**
 * Funkcja pomocnicza do centrowania crop area na obrazie.
 * Używana przez bibliotekę react-image-crop.
 * 
 * @param {number} mediaWidth - Szerokość obrazu
 * @param {number} mediaHeight - Wysokość obrazu
 * @param {number} aspect - Proporcje (1 = kwadrat)
 */
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight,
    );
}

/**
 * Modal do uploadu i kadrowania zdjęcia profilowego.
 * 
 * Używa biblioteki react-image-crop do kadrowania obrazu w proporcji 1:1 (kwadrat).
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 * @param {function} props.onUploadSuccess - Callback wywoływany po pomyślnym uploadzie (przyjmuje URL nowego zdjęcia)
 */
export default function ImageUploadModal({ isOpen, onClose, onUploadSuccess }) {
    // ========== STAN KOMPONENTU ==========
    const [previewUrl, setPreviewUrl] = useState('');
    const imgRef = useRef(null);
    const [crop, setCrop] = useState(); // Stan do przechowywania informacji o zaznaczeniu (crop area)
    const [completedCrop, setCompletedCrop] = useState(null); // Stan po zakończeniu zaznaczania (finalne współrzędne)
    const [error, setError] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const aspect = 1; // 1:1 dla kwadratu (profilowe zdjęcie)

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Resetuje stan modala po zamknięciu.
     */
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setPreviewUrl('');
                setError('');
                setCrop(undefined);
                setCompletedCrop(null);
            }, 300);
        }
    }, [isOpen]);

    /**
     * Obsługa zamykania modala klawiszem Escape.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    /**
     * Blokuje scrollowanie body, gdy modal jest otwarty.
     */
    useEffect(() => {
        if (isOpen) {
            const originalOverflow = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            
            return () => {
                document.body.style.overflow = originalOverflow;
            };
        }
    }, [isOpen]);

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY ==========
    
    /**
     * Obsługuje wybór pliku z inputa.
     * Tworzy preview URL i resetuje crop area.
     */
    const handleFileChange = useCallback((e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            
            // Walidacja typu pliku
            if (!file.type.startsWith('image/')) {
                toast.error('Please select an image file.');
                return;
            }
            
            // Walidacja rozmiaru (max 10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                toast.error('File size must be less than 10MB.');
                return;
            }
            
            setCrop(undefined); // Resetuj zaznaczenie
            setError('');
            const reader = new FileReader();
            reader.addEventListener('load', () => setPreviewUrl(reader.result.toString() || ''));
            reader.readAsDataURL(file);
        }
    }, []);

    /**
     * Wywoływane po załadowaniu obrazu.
     * Automatycznie ustawia początkowy crop area na środku obrazu.
     */
    const onImageLoad = useCallback((e) => {
        if (aspect) {
            const { width, height } = e.currentTarget;
            setCrop(centerAspectCrop(width, height, aspect));
        }
    }, [aspect]);

    /**
     * Obsługuje wysłanie przyciętego obrazu.
     * Tworzy canvas, rysuje na nim przycięty obraz i wysyła do API.
     */
    const handleSubmit = useCallback(async () => {
        if (!completedCrop || !imgRef.current) {
            setError('Please select a crop area.');
            toast.error('Please select a crop area.');
            return;
        }

        setIsUploading(true);
        setError('');

        // Tworzymy canvas do przetworzenia obrazu
        const canvas = document.createElement('canvas');
        const image = imgRef.current;
        
        // Skalowanie - obliczamy współczynniki, bo crop jest w pikselach ekranu,
        // a naturalWidth/Height to rzeczywiste wymiary obrazu
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        // Rysujemy przycięty fragment obrazu na canvas
        ctx.drawImage(
            image,
            completedCrop.x * scaleX, // Pozycja X w rzeczywistym obrazie
            completedCrop.y * scaleY, // Pozycja Y w rzeczywistym obrazie
            completedCrop.width * scaleX, // Szerokość w rzeczywistym obrazie
            completedCrop.height * scaleY, // Wysokość w rzeczywistym obrazie
            0, 0, // Pozycja na canvas (zaczynamy od 0,0)
            completedCrop.width, // Szerokość na canvas
            completedCrop.height, // Wysokość na canvas
        );

        // Konwertujemy canvas na blob (plik) i wysyłamy
        canvas.toBlob(async (blob) => {
            if (!blob) {
                setError('Could not process image.');
                toast.error('Could not process image.');
                setIsUploading(false);
                return;
            }
            try {
                const croppedFile = new File([blob], "profile.jpg", { type: "image/jpeg" });
                const newImageUrl = await uploadProfileImage(croppedFile);
                onUploadSuccess(newImageUrl);
                toast.success('Profile image updated successfully!');
                onClose();
            } catch (err) {
                const errorMessage = err.message || 'An error occurred while uploading.';
                setError(errorMessage);
                toast.error(errorMessage);
            } finally {
                setIsUploading(false);
            }
        }, 'image/jpeg', 0.9); // 0.9 = jakość JPEG (90%)
    }, [completedCrop, onUploadSuccess, onClose]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center" 
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-borderGrayHover" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-borderGrayHover">
                    <h2 className="text-lg font-bold text-whitePrimary">Change Profile Photo</h2>
                    <button 
                        onClick={onClose} 
                        className="text-borderGrayHover hover:text-whitePrimary transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes size={20} />
                    </button>
                </header>

                {/* Główna treść */}
                <div className="p-6">
                    {/* Ukryty input do wyboru pliku */}
                    <input 
                        id="file-upload" 
                        name="file-upload" 
                        type="file" 
                        className="sr-only" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                    />

                    {!previewUrl ? (
                        /* Widok początkowy - przycisk do uploadu */
                        <label 
                            htmlFor="file-upload" 
                            className="relative cursor-pointer bg-backgoudBlack border-2 border-dashed border-borderGrayHover rounded-lg flex flex-col items-center justify-center p-12 hover:border-bluePrimary transition-colors"
                        >
                            <FaUpload className="text-4xl text-borderGrayHover mb-3"/>
                            <span className="font-semibold text-whitePrimary">Click to upload an image</span>
                            <p className="text-xs text-borderGrayHover mt-1">PNG, JPG, GIF up to 10MB</p>
                        </label>
                    ) : (
                        /* Widok kadrowania - ReactCrop pozwala użytkownikowi wybrać obszar do przycięcia */
                        <div className="flex justify-center">
                            <ReactCrop
                                crop={crop}
                                onChange={(_, percentCrop) => setCrop(percentCrop)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                circularCrop // Okrągłe kadrowanie dla zdjęcia profilowego
                            >
                                <img
                                    ref={imgRef}
                                    alt="Crop preview"
                                    src={previewUrl}
                                    onLoad={onImageLoad}
                                    style={{ maxHeight: '60vh' }}
                                />
                            </ReactCrop>
                        </div>
                    )}
                    
                    {/* Komunikat błędu */}
                    {error && (
                        <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
                    )}
                </div>
                
                {/* Footer z przyciskami */}
                <footer className="p-4 border-t border-borderGrayHover flex justify-between items-center mt-auto">
                    {/* Przycisk zmiany zdjęcia (widoczny tylko gdy jest preview) */}
                    <div>
                        {previewUrl && (
                            <label 
                                htmlFor="file-upload"
                                className="bg-transparent border border-borderGrayHover text-whitePrimary font-bold py-2 px-4 rounded-lg flex items-center gap-2 text-sm hover:bg-borderGrayHover transition-colors cursor-pointer"
                            >
                                <FaCamera size={16} /> Change
                            </label>
                        )}
                    </div>

                    {/* Przyciski akcji */}
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="bg-backgoudBlack text-whitePrimary font-semibold py-2 px-4 rounded-lg text-sm hover:bg-borderGrayHover/50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={isUploading || !previewUrl || !completedCrop} 
                            className="bg-bluePrimary text-whitePrimary font-bold py-2 px-6 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blueHover"
                        >
                            {isUploading && <CgSpinner className="animate-spin" size={20} />}
                            {isUploading ? 'Uploading...' : 'Save & Upload'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}