import { useState, useRef, useEffect } from 'react';
import { IoClose, IoImageOutline, IoVideocamOutline } from 'react-icons/io5';
import { useUser } from '../context/UserContext'; // Załóżmy, że masz ten hook
import { CgSpinner } from 'react-icons/cg';

const MAX_CONTENT_LENGTH = 1000;

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    const { user } = useUser();
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setContent('');
                setFile(null);
                setPreviewUrl(null);
                setIsSubmitting(false);
            }, 300); // Czekamy na animację zamknięcia
        }
    }, [isOpen]);

    useEffect(() => {
                const handleKeyDown = (event) => {
                    if (event.key === 'Escape') {
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
            
    if (!isOpen) {
        return null;
    }
    
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => setPreviewUrl(reader.result);
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleDragEvents = (e, dragging) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };
    
    const handleDrop = (e) => {
        handleDragEvents(e, false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            // Symulujemy event, aby użyć tej samej logiki co przy kliknięciu
            handleFileChange({ target: { files: [droppedFile] } });
        }
    };

    const handleClose = () => {
        setContent('');
        setFile(null);
        setPreviewUrl(null);
        setIsSubmitting(false);
        onClose();
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content && !file) {
            alert('Post cannot be empty. Add content or a file.');
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({ content, file });
            handleClose(); 
        } catch (error) {
            console.error("Failed to create post:", error);
            alert(`Error: ${error.message || 'Could not create post.'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-2xl shadow-xl w-full max-w-lg flex flex-col border border-borderGrayHover"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex items-center justify-between p-4 border-b border-borderGrayHover">
                    <h2 className="text-lg font-bold text-whitePrimary">Create a new post</h2>
                    <button onClick={onClose} className="text-borderGrayHover hover:text-white transition-colors">
                        <IoClose size={24} />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="p-4">
                        <div 
                            className={`relative flex gap-4 p-4 rounded-lg border-2 ${isDragging ? 'border-bluePrimary' : 'border-transparent'}`}
                            onDragEnter={(e) => handleDragEvents(e, true)}
                            onDragOver={(e) => handleDragEvents(e, true)}
                            onDragLeave={(e) => handleDragEvents(e, false)}
                            onDrop={handleDrop}
                        >
                            <img src={user?.profileImageUrl} alt="Your avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                            <textarea
                                className="w-full bg-transparent text-whitePrimary resize-none focus:outline-none placeholder:text-borderGrayHover text-lg"
                                rows="5"
                                placeholder="What's on your mind?"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                maxLength={MAX_CONTENT_LENGTH}
                            />
                        </div>

                        {previewUrl && (
                            <div className="relative mt-4 border border-borderGrayHover rounded-lg overflow-hidden">
                                {file.type.startsWith('image/') && <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain" />}
                                {file.type.startsWith('video/') && <video src={previewUrl} controls className="max-h-80 w-full" />}
                                <button type="button" onClick={() => { setFile(null); setPreviewUrl(null); }} className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white hover:bg-black/80">
                                    <IoClose size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                    
                    <footer className="p-4 border-t border-borderGrayHover flex justify-between items-center mt-auto">
                        {/* Pasek narzędzi */}
                        <div className="flex items-center gap-4">
                            <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <button type="button" onClick={() => fileInputRef.current.click()} title="Add Photo/Video" className="text-bluePrimary hover:text-blue-300 transition-colors">
                                <IoImageOutline size={24} />
                            </button>
                        </div>

                        {/* Licznik znaków i przycisk Post */}
                        <div className="flex items-center gap-4">
                            <span className={`text-sm ${content.length > MAX_CONTENT_LENGTH - 50 ? 'text-yellow-400' : 'text-borderGrayHover'}`}>
                                {content.length} / {MAX_CONTENT_LENGTH}
                            </span>
                            <button
                                type="submit"
                                disabled={isSubmitting || (!content.trim() && !file)}
                                className="bg-bluePrimary text-white font-bold py-2 px-6 rounded-full flex items-center gap-2 disabled:opacity-50 transition-colors hover:bg-blueHover"
                            >
                                {isSubmitting ? <CgSpinner className="animate-spin"/> : null}
                                {isSubmitting ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    );
}