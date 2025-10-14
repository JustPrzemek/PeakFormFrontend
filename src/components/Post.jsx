import { LiaCommentSolid } from "react-icons/lia";
import { addComment } from "../services/commentsService";
import { useState } from 'react';
import { addLikeToPost, removeLikeFromPost } from "../services/likesService";
import { formatTimeAgo } from '../utils/dateFormatter';
import { useNavigate } from "react-router-dom";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComments } from "react-icons/fa6";
import { FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark, FaEllipsisH } from 'react-icons/fa';


const CONTENT_TRUNCATE_LENGTH = 100;

export default function Post({post, onCommentAdded, onLikeUpdated, onOpenModal}) {
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const navigate = useNavigate();

    if (!post) return null;

    const handleSubmitComment = async () => {
        if (!newCommentText.trim() || isSubmitting) {
            return; // Nie wysyłaj pustych komentarzy lub gdy już wysyłamy
        }

        setIsSubmitting(true);
        try {
            const commentData = {
                postId: post.id,
                content: newCommentText.trim()
            };
            // Wywołujemy serwis, który wysyła dane do API
            const newCommentFromServer = await addComment(commentData);
            
            // Wywołujemy funkcję od rodzica, aby zaktualizować stan globalny
            onCommentAdded(post.id, newCommentFromServer);

            // Czyścimy pole input
            setNewCommentText('');
        } catch (error) {
            console.error("Błąd podczas dodawania komentarza:", error);
            alert("Nie udało się dodać komentarza. Spróbuj ponownie.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleLike = async () => {
        const isCurrentlyLiked = post.likedByUser;
        try {
            if (isCurrentlyLiked) {
                const response = await removeLikeFromPost(post.id); // API zwróci { likedByUser: false }
                onLikeUpdated(post.id, response.likedByUser); // Przekazujemy `false` do rodzica
            } else {
                const response = await addLikeToPost(post.id); // API zwróci { likedByUser: true }
                onLikeUpdated(post.id, response.likedByUser); // Przekazujemy `true` do rodzica
            }
        } catch (error) {
            console.error("Błąd podczas zmiany polubienia:", error);
            alert("Nie udało się zaktualizować polubienia.");
        }
    };

    const handleDoubleClickLike = async () => {
        setShowLikeAnimation(true);
        setTimeout(() => {
            setShowLikeAnimation(false);
        }, 1000);
        if (!post.likedByUser) { // Lajkujemy tylko, jeśli post nie jest jeszcze polubiony
            try {
                const response = await addLikeToPost(post.id);
                onLikeUpdated(post.id, response);
            } catch (error) {
                console.error("Błąd podczas dodawania polubienia:", error);
            }
        }
    };

    // Obsługa wysyłania komentarza klawiszem Enter
    const handleKeyDown = (e) => {
        // Sprawdzamy, czy naciśnięty klawisz to 'Enter'
        if (e.key === 'Enter') {
            // Zapobiegamy domyślnej akcji (np. przeładowaniu strony), jeśli input jest w formularzu
            e.preventDefault();
            // Wywołujemy istniejącą funkcję do wysyłania komentarza
            handleSubmitComment();
        }
    };
    
    const renderMedia = () => {
        if (!post.mediaUrl) return null;

        switch(post.mediaType) {
            case 'IMAGE':
                return <img 
                           className="w-full h-auto max-h-[80vh] object-contain mx-auto"
                           src={post.mediaUrl} 
                           alt={`Post by ${post.username}`} 
                       />;
            case 'VIDEO':
                return (
                    <video 
                        controls 
                        className="w-full h-auto max-h-[80vh] mx-auto"
                    >
                        <source src={post.mediaUrl} type="video/mp4" />
                        Twoja przeglądarka nie obsługuje tagu video.
                    </video>
                );
            default:
                return null;
        }
    };

    const handleProfileClick = () => {
        navigate(`/profile/${post.username}`);
    };

    const handleCommenterProfileClick = (commenter) => {
        navigate(`/profile/${commenter}`);
    }

     const handleOpenModalClick = () => {
        onOpenModal(post.id);
    };

     const shouldTruncate = post.content && post.content.length > CONTENT_TRUNCATE_LENGTH;
    const renderedContent = shouldTruncate && !isContentExpanded 
        ? `${post.content.substring(0, CONTENT_TRUNCATE_LENGTH)}...`
        : post?.content;

    return (
        <div className="bg-surfaceDarkGray rounded-2xl border border-borderGrayHover/50 text-whitePrimary hover:-translate-y-1 transition-all duration-300">
            {/* --- NAGŁÓWEK POSTA --- */}
            <div className="flex items-center justify-between p-4 cursor-pointer" onClick={handleOpenModalClick}>
                <div className="flex items-center gap-3 cursor-pointer" 
                    onClick={(e) => {
                        e.stopPropagation();
                        handleProfileClick()}}>
                    <img className="h-10 w-10 rounded-full object-cover" src={post.profileImageUrl} alt={`${post.username} profile`} />
                    <div>
                        <span className="font-bold text-sm hover:underline">{post.username}</span>
                        <p className="text-xs text-borderGrayHover">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                </div>
                {/* <button className="text-borderGrayHover hover:text-whitePrimary"><FaEllipsisH /></button> */}
            </div>
            <div className="px-4 mb-4 text-sm leading-relaxed cursor-pointer" onClick={handleOpenModalClick}>
                {renderedContent}
                {shouldTruncate && (
                            <button onClick={(e) => {
                                e.stopPropagation();
                                setIsContentExpanded(!isContentExpanded)
                                }}
                                className="text-borderGrayHover ml-1 font-semibold cursor-pointer">
                                {isContentExpanded ? 'less' : 'more'}
                            </button>
                        )}
            </div>            
            {/* --- MEDIA (OBRAZ/WIDEO) --- */}
            <div className="relative cursor-pointer max-h-[80vh] bg-black" onDoubleClick={handleDoubleClickLike} onClick={handleOpenModalClick} >
                {renderMedia()}
                {showLikeAnimation && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <AiFillLike className="text-white text-8xl drop-shadow-lg like-animation" />
                    </div>
                )}
            </div>

            <div className="p-4">
                {/* --- PASEK AKCJI --- */}
                <div className="flex justify-between items-center text-2xl text-whitePrimary">
                    <div className="flex gap-4">
                        <button onClick={handleToggleLike} className="hover:text-borderGrayHover transition-colors">
                            {post.likedByUser ? <AiFillLike className="text-bluePrimary cursor-pointer" /> : <AiOutlineLike className="cursor-pointer"/>}
                        </button>
                        <button onClick={() => onOpenModal(post.id)} className="hover:text-borderGrayHover transition-colors">
                            <FaRegComment className="cursor-pointer"/>
                        </button>
                        {/* <button className="hover:text-borderGrayHover transition-colors"><FaRegPaperPlane /></button> Placeholder */}
                    </div>
                    {/* <button className="hover:text-borderGrayHover transition-colors"><FaRegBookmark /></button> Placeholder */}
                </div>

                {/* --- INFORMACJE O POLUBIENIACH I OPIS --- */}
                <div className="mt-3 text-sm">
                    <p className="font-bold">{post.likesCount} likes</p>
                    <div className="mt-1 break-words">
                        <span className="font-bold cursor-pointer hover:underline" onClick={handleProfileClick}>{post.username}</span>
                    </div>
                </div>

                {/* --- KOMENTARZE --- */}
                <div className="mt-2 text-sm">
                    {post.commentsCount > 2 && (
                        <p onClick={() => onOpenModal(post.id)} className="text-borderGrayHover cursor-pointer hover:underline">
                            View all {post.commentsCount} comments
                        </p>
                    )}
                    <div className="space-y-0.5 mt-1">
                        {post.comments && post.comments.slice(0, 2).map(comment => (
                            <div key={comment.commentId}>
                                <span className="font-bold cursor-pointer hover:underline" onClick={() => handleCommenterProfileClick(comment.username)}>{comment.username}</span>
                                <span className="ml-2">{comment.content}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* --- FORMULARZ DODAWANIA KOMENTARZA --- */}
            <div className="border-t border-borderGrayHover/50 px-4 py-2">
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        className="w-full bg-transparent text-sm outline-none placeholder:text-borderGrayHover" 
                        placeholder="Add a comment..." 
                        onChange={(e) => setNewCommentText(e.target.value)}
                        value={newCommentText}
                        disabled={isSubmitting}
                        maxLength="500"
                        onKeyDown={handleKeyDown}
                    />
                    <button 
                        className="text-bluePrimary font-bold text-sm cursor-pointer disabled:text-blue-900 disabled:cursor-not-allowed"
                        onClick={handleSubmitComment}
                        disabled={!newCommentText.trim() || isSubmitting}
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
}