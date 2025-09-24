import { LiaCommentSolid } from "react-icons/lia";
import { addComment } from "../services/commentsService";
import { useState } from 'react';
import { addLikeToPost, removeLikeFromPost } from "../services/likesService";
import { formatTimeAgo } from '../utils/dateFormatter';
import { useNavigate } from "react-router-dom";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComments } from "react-icons/fa6";

const CONTENT_TRUNCATE_LENGTH = 150;

export default function Post({post, onCommentAdded, onLikeUpdated, onOpenModal}) {
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);
    const [isContentExpanded, setIsContentExpanded] = useState(false);
    const navigate = useNavigate();

    if (!post) {
        return null;
    }

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
                return <img className="w-full" src={post.mediaUrl} alt={`Post by ${post.username}`} />;
            case 'VIDEO':
                return (
                    <video controls className="w-full">
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

    const shouldTruncate = post && post.content.length > CONTENT_TRUNCATE_LENGTH;
    const renderedContent = shouldTruncate && !isContentExpanded 
        ? `${post.content.substring(0, CONTENT_TRUNCATE_LENGTH)}...`
        : post?.content;

    return (
        <div className="border roudned-lg border-slate-200 mb-5 bg-white">
            <div className="p-3 flex flex-row">
                <div className="flex-1">
                    <a>
                        <img className="rounded-full w-8 inline cursor-pointer transition-transform duration-300 hover:scale-110" 
                            onClick={handleProfileClick} 
                            src={post.profileImageUrl} 
                            alt={`${post.username} profile`}/>
                        <span className="font-medium text-sm ml-2 cursor-pointer hover:underline" onClick={handleProfileClick}>
                            {post.username}
                        </span>
                    </a>
                </div>
            </div>
            
            <div className="px-3 text-sm pb-2 break-words">
                <span>{renderedContent}</span>
                    {shouldTruncate && (
                        <button 
                            onClick={() => setIsContentExpanded(!isContentExpanded)} 
                            className="text-gray-500 text-sm ml-2 font-semibold cursor-pointer hover:underline"
                        >
                            {isContentExpanded ? 'hide' : 'more'}
                        </button>
                    )}
            </div>

            <div className="relative cursor-pointer" onDoubleClick={handleDoubleClickLike}>
                {renderMedia()}
                {showLikeAnimation && (
                    <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                        <AiFillLike className="text-white text-8xl drop-shadow-lg like-animation" />
                    </div>
                )}
            </div>

            <div className="p-3 flex flex-row text-2xl">
                <div className="flex">
                    <button onClick={handleToggleLike} className="mr-3 hover:opacity-70 cursor-pointer">
                        {post.likedByUser 
                            ? <AiFillLike className="text-blue-500" /> 
                            : <AiOutlineLike />
                        }
                    </button>

                    <button onClick={() => onOpenModal(post.id)} className="mr-3 hover:text-gray-500 cursor-pointer">
                        <FaRegComments />
                    </button>
                </div>
            </div>
            <div className="font-medium text-sm px-3">{post.likesCount} likes</div>

            

           <div className="px-3 text-sm space-y-1 border-t border-slate-200 mt-2 pt-2 break-words">
                {post.commentsCount > 3 && (
                    <div onClick={() => onOpenModal(post.id)} className="text-gray-500 cursor-pointer hover:underline">
                        Zobacz wszystkie komentarze ({post.commentsCount})
                    </div>
                )}
           
                {post.comments && post.comments.map(comment => (
                    <div key={comment.commentId} className="break-word overflow-hidden">
                        <span className="font-medium">{comment.username}</span> {comment.content}
                    </div>
                ))}
            </div>

            <div className="text-gray-500 uppercase p-3 text-xs tracking-wide mt-2">
                {formatTimeAgo(post.createdAt)}
            </div>

            <div className="p-3 flex flex-row border-t">
                <div className="flex items-center text-2xl">
                    <LiaCommentSolid />
                </div>
                <div className="flex-1 pr-3 py-1">
                    <input 
                        type="text" 
                        className="w-full px-3 py-1 text-sm outline-0 bg-transparent"  
                        placeholder="Add a comment ..." 
                        onChange={(e) => setNewCommentText(e.target.value)}
                        value={newCommentText}
                        disabled={isSubmitting}
                        maxLength="500"
                        onKeyDown={handleKeyDown}/>
                </div>
                <div className="flex items-center text-sm">
                    <button 
                        className="text-sky-500 font-medium cursor-pointer disabled:text-sky-200"
                        onClick={handleSubmitComment}
                        disabled={!newCommentText.trim() || isSubmitting}
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    )
}