import { useEffect  } from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    
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
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-75 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-surfaceDarkGray rounded-lg shadow-xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-whitePrimary">{title}</h3>
                <p className="mt-2 text-sm text-borderGrayHover">{message}</p>
                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-whitePrimary text-surfaceDarkGray rounded-md hover:bg-borderGrayHover transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-surfaceDarkGray rounded-md hover:bg-borderGrayHover transition cursor-pointer"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}