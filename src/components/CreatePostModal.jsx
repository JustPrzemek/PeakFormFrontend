import React, { useState, useRef } from 'react';
import { IoClose } from 'react-icons/io5';

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef(null);

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
        // ZMIANA: Zamiast `bg-opacity-50` dodajemy `bg-opacity-30` i `backdrop-blur-sm`
        <div 
            className="fixed inset-0 bg-gray bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center cursor-pointer"
            onClick={handleClose}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold">Create a new post</h3>
                    <button onClick={handleClose} className="text-gray-500 hover:text-gray-800 cursor-pointer">
                        <IoClose size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="p-4">
                        <textarea
                            className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="4"
                            placeholder="What's on your mind?"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        
                        {previewUrl && (
                            <div className="mt-4 border rounded-lg overflow-hidden">
                                {file.type.startsWith('image/') && (
                                    <img src={previewUrl} alt="Preview" className="max-h-80 w-full object-contain" />
                                )}
                                {file.type.startsWith('video/') && (
                                    <video src={previewUrl} controls className="max-h-80 w-full" />
                                )}
                            </div>
                        )}

                        <div className="mt-4">
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
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                            >
                                {file ? 'Change file' : 'Add Photo/Video'}
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end p-4 border-t">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}