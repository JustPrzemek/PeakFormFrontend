// src/components/modals/CreatePostModal.jsx
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { IoClose, IoImageOutline } from 'react-icons/io5';
import { useUser } from '../../context/UserContext';
import { CgSpinner } from 'react-icons/cg';
import toast from 'react-hot-toast';

/**
 * Maksymalna długość treści posta (w znakach).
 */
const MAX_CONTENT_LENGTH = 1000;

/**
 * Modal do tworzenia nowego posta.
 * 
 * Pozwala użytkownikowi:
 * - Napisać treść posta
 * - Dodać zdjęcie lub wideo
 * - Przeciągnąć i upuścić plik (drag & drop)
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Czy modal jest otwarty
 * @param {function} props.onClose - Funkcja wywoływana przy zamykaniu modala
 * @param {function} props.onSubmit - Funkcja wywoływana przy wysłaniu posta (przyjmuje { content, file })
 */
export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    // ========== STAN KOMPONENTU ==========
    const { user } = useUser();
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    // ========== EFEKTY UBOCZNE ==========
    
    /**
     * Resetuje stan modala po zamknięciu.
     * Opóźnienie 300ms pozwala na zakończenie animacji zamknięcia.
     */
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setContent('');
                setFile(null);
                setPreviewUrl(null);
                setIsSubmitting(false);
                setIsDragging(false);
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

    // ========== FUNKCJE OBSŁUGUJĄCE EVENTY (useCallback) ==========
    
    /**
     * Obsługuje wybór pliku z inputa.
     * Tworzy preview URL dla wybranego pliku.
     */
    const handleFileChange = useCallback((e) => {
        const selectedFile = e.target?.files?.[0] || e;
        if (!selectedFile) return;
        
        // Walidacja typu pliku
        if (!selectedFile.type.startsWith('image/') && !selectedFile.type.startsWith('video/')) {
            toast.error('Please select an image or video file.');
            return;
        }
        
        // Walidacja rozmiaru (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (selectedFile.size > maxSize) {
            toast.error('File size must be less than 10MB.');
            return;
        }
        
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(selectedFile);
    }, []);

    /**
     * Obsługuje eventy drag & drop (enter, over, leave).
     */
    const handleDragEvents = useCallback((e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }, []);
    
    /**
     * Obsługuje upuszczenie pliku (drop).
     */
    const handleDrop = useCallback((e) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileChange(droppedFile);
        }
    }, [handleDragEvents, handleFileChange]);

    /**
     * Usuwa wybrany plik i jego preview.
     */
    const handleRemoveFile = useCallback(() => {
        setFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, []);

    /**
     * Resetuje stan modala i zamyka go.
     */
    const handleClose = useCallback(() => {
        setContent('');
        setFile(null);
        setPreviewUrl(null);
        setIsSubmitting(false);
        setIsDragging(false);
        onClose();
    }, [onClose]);
    
    /**
     * Obsługuje wysłanie formularza.
     * Waliduje dane i wywołuje onSubmit.
     */
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        
        // Walidacja - post musi mieć treść lub plik
        if (!content.trim() && !file) {
            toast.error('Post cannot be empty. Add content or a file.');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await onSubmit({ content: content.trim(), file });
            handleClose(); 
        } catch (error) {
            console.error("Failed to create post:", error);
            toast.error(error.message || 'Could not create post.');
        } finally {
            setIsSubmitting(false);
        }
    }, [content, file, onSubmit, handleClose]);

    // ========== OBLICZENIA (useMemo) ==========
    
    /**
     * Sprawdza, czy przycisk submit powinien być aktywny.
     */
    const canSubmit = useMemo(() => {
        return (content.trim().length > 0 || file !== null) && !isSubmitting;
    }, [content, file, isSubmitting]);

    /**
     * Sprawdza, czy zbliżamy się do limitu znaków.
     */
    const isNearLimit = useMemo(() => {
        return content.length > MAX_CONTENT_LENGTH - 50;
    }, [content.length]);

    // ========== WARUNKOWE RENDEROWANIE ==========
    if (!isOpen) return null;

    // ========== RENDEROWANIE ==========
    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-center items-center"
            onClick={handleClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-borderGrayHover"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-borderGrayHover">
                    <h2 className="text-lg font-bold text-whitePrimary">Create a new post</h2>
                    <button 
                        onClick={handleClose} 
                        className="text-borderGrayHover hover:text-whitePrimary transition-colors"
                        aria-label="Close modal"
                    >
                        <IoClose size={24} />
                    </button>
                </header>

                {/* Formularz */}
                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-4">
                        {/* Obszar tekstu z drag & drop */}
                        <div 
                            className={`relative flex gap-4 p-4 rounded-lg border-2 transition-colors ${
                                isDragging ? 'border-bluePrimary bg-bluePrimary/10' : 'border-transparent'
                            }`}
                            onDragEnter={(e) => handleDragEvents(e, true)}
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDrop={handleDrop}
                        >
                            {/* Avatar użytkownika */}
                            <img 
                                src={user?.profileImageUrl || 'https://via.placeholder.com/40'} 
                                alt="Your avatar" 
                                className="w-10 h-10 rounded-full object-cover flex-shrink-0" 
                            />
                            
                            {/* Pole tekstowe */}
                            <textarea
                                className="w-full bg-transparent text-whitePrimary resize-none focus:outline-none placeholder:text-borderGrayHover text-lg"
                                rows="5"
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={MAX_CONTENT_LENGTH}
                            />
                        </div>

                        {/* Preview pliku */}
                        {previewUrl && file && (
                            <div className="relative mt-4 border border-borderGrayHover rounded-lg overflow-hidden">
                                {file.type.startsWith('image/') && (
                                    <img 
                                        src={previewUrl} 
                                        alt="Preview" 
                                        className="max-h-80 w-full object-contain" 
                                    />
                                )}
                                {file.type.startsWith('video/') && (
                                    <video 
                                        src={previewUrl} 
                                        controls 
                                        className="max-h-80 w-full" 
                                    />
                                )}
                                {/* Przycisk usuwania preview */}
                                <button 
                                    type="button" 
                                    onClick={handleRemoveFile} 
                                    className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-whitePrimary hover:bg-black/80 transition-colors"
                                    aria-label="Remove file"
                                >
                                    <IoClose size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Footer z narzędziami */}
                    <footer className="p-4 border-t border-borderGrayHover flex justify-between items-center mt-auto">
                        {/* Przycisk dodawania pliku */}
                        <div className="flex items-center gap-4">
                            <input 
                                type="file" 
                                accept="image/*,video/*" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()} 
                                title="Add Photo/Video" 
                                className="text-bluePrimary hover:text-blueHover transition-colors"
                                aria-label="Add photo or video"
                            >
                                <IoImageOutline size={24} />
                            </button>
                        </div>

                        {/* Licznik znaków i przycisk submit */}
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${isNearLimit ? 'text-yellow-400' : 'text-borderGrayHover'}`}>
                                {content.length} / {MAX_CONTENT_LENGTH}
                            </span>
                            <button
                                type="submit"
                                disabled={!canSubmit}
                                className="bg-bluePrimary text-whitePrimary font-bold py-2 px-6 rounded-full flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:bg-blueHover"
                            >
                                {isSubmitting && <CgSpinner className="animate-spin" size={20} />}
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
}