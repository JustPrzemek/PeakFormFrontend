import { useState, useRef, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

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
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(selectedFile);
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
            className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center"
            onClick={handleClose}
        >
            <div 
                className="bg-surfaceDarkGray rounded-lg shadow-xl w-full max-w-md p-8"
                onClick={(e) => e.stopPropagation()}
            >

                <h2 className="text-2xl font-bold mb-6 text-whitePrimary">Create a new post</h2>

                <form onSubmit={handleSubmit}>

                    <div className="space-y-6">
                        <textarea
                            className="w-full p-2 bg-transparent border border-borderGrayHover text-whitePrimary rounded-md focus:outline-none focus:ring-1 focus:ring-bluePrimary"
                            rows="4"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        
                        {previewUrl && (
                            <div className="border rounded-lg overflow-hidden">
                                {file.type.startsWith('image/') && (
                                    <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain" />
                                )}
                                {file.type.startsWith('video/') && (
                                    <video src={previewUrl} controls className="max-h-80 w-full" />
                                )}
                            </div>
                        )}

                        <div>
                            <input
                                type="file"
                                accept="image/*,video/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current.click()}
                                className="px-4 py-2 bg-borderGrayHover text-whitePrimary rounded-md hover:bg-gray-600"
                            >
                                {file ? 'Change file' : 'Add Photo/Video'}
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button 
                            type="button" 
                            onClick={handleClose} 
                            className="px-4 py-2 bg-gray-600 text-whitePrimary rounded-md hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-bluePrimary text-whitePrimary rounded-md hover:bg-blueHover disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}