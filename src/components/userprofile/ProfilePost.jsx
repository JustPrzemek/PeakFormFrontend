import { FaHeart, FaComment } from 'react-icons/fa';
import { LuBicepsFlexed } from "react-icons/lu";

export default function ProfilePost({post, onOpenModal }) {

    const renderMedia = () => {
        if (!post.mediaUrl) {
            return <div className="bg-surfaceDarkGray w-full h-full"></div>;
        }

        const mediaClasses = "absolute inset-0 object-cover w-full h-full transition-transform duration-300 group-hover:scale-105";

        if (post.mediaType === 'VIDEO') {
            return (
                <video
                    src={post.mediaUrl}
                    className={mediaClasses}
                    loop
                    muted
                    autoPlay // Dodajemy autoplay, aby wideo odtwarzało się na miniaturce
                    playsInline // Ważne dla urządzeń mobilnych
                />
            );
        }
        
        return (
            <img
                src={post.mediaUrl}
                alt="Post thumbnail"
                className={mediaClasses}
            />
        );
    };

    return (
        <div 
            className="relative aspect-square overflow-hidden rounded-md cursor-pointer group bg-surfaceDarkGray"
            onClick={() => onOpenModal(post.id)}
        >
            {/* Media (zdjęcie/wideo) - teraz z efektem hover */}
            {renderMedia()}
            
            {/* Nowa nakładka z płynnym przejściem */}
            <div className="absolute inset-0 z-10 flex items-center justify-center gap-8 bg-black/60 
                           opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                
                {/* Statystyka polubień */}
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <LuBicepsFlexed />
                    <span>{post.likesCount}</span>
                </div>

                {/* Statystyka komentarzy */}
                <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <FaComment />
                    <span>{post.commentsCount}</span>
                </div>
            </div>
        </div>
    );
}