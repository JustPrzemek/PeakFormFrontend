import React, { useState, useEffect, useCallback } from 'react';
import { getPostDetails } from '../services/postsService';
import { FaTimes, FaHeart, FaRegHeart, FaRegComment, FaRegPaperPlane, FaRegBookmark } from 'react-icons/fa';
import { addLikeToPost, removeLikeFromPost } from '../services/likesService';
import { formatTimeAgo } from '../utils/dateFormatter';
import { addComment } from "../services/commentsService";
import { LiaCommentSolid } from "react-icons/lia";
import { FaRegComments } from "react-icons/fa6";
import PostModalSkeleton from './skeletons/PostModalSkeleton';
import { LuBicepsFlexed } from "react-icons/lu";

const CONTENT_TRUNCATE_LENGTH = 150;

export default function PostModal({ postId, onClose }) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showLikeAnimation, setShowLikeAnimation] = useState(false);

    const [isContentExpanded, setIsContentExpanded] = useState(false);

    // Funkcja do ładowania szczegółów posta i pierwszej strony komentarzy
    const fetchInitialPostData = useCallback(async () => {
        if (!postId) return;
        setLoading(true);
        setError(null);
        try {
            const data = await getPostDetails(postId, 0, 10);
            setPost(data);
            setComments(data.comments.content);
            setHasMoreComments(!data.comments.last);
            setPage(0); // Resetuj stronę
        } catch (err) {
            setError("Could not load post. Please try again later.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [postId]);

    // Funkcja do dociągania kolejnych komentarzy
    const fetchMoreComments = async () => {
        if (loading || !hasMoreComments) return;

        setLoading(true);
        try {
            const nextPage = page + 1;
            const data = await getPostDetails(postId, nextPage, 10);
            setComments(prev => [...prev, ...data.comments.content]);
            setHasMoreComments(!data.comments.last);
            setPage(nextPage);
        } catch (err) {
            console.error("Could not load more comments:", err);
        } finally {
            setLoading(false);
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

    const handleSubmitComment = async () => {
        if (!newCommentText.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const commentData = { postId: postId, content: newCommentText.trim() };
            const newlyAddedComment = await addComment(commentData);
            setComments(prevComments => [newlyAddedComment, ...prevComments]);
            setPost(prevPost => ({ ...prevPost, commentsCount: prevPost.commentsCount + 1 }));
            setNewCommentText('');
        } catch (error) {
            console.error("Błąd podczas dodawania komentarza:", error);
            alert("Nie udało się dodać komentarza. Spróbuj ponownie.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleLike = async () => {
        if (!post) return;

        const isCurrentlyLiked = post.likedByUser;
        // Optymistyczna aktualizacja UI
        setPost(prevPost => ({
            ...prevPost,
            likedByUser: !isCurrentlyLiked,
            likesCount: prevPost.likesCount + (!isCurrentlyLiked ? 1 : -1)
        }));

        try {
            if (isCurrentlyLiked) {
                await removeLikeFromPost(post.postId);
            } else {
                await addLikeToPost(post.postId);
            }
        } catch (error) {
            console.error("Błąd podczas zmiany polubienia:", error);
            // Wycofanie zmiany w razie błędu
            setPost(prevPost => ({
                ...prevPost,
                likedByUser: isCurrentlyLiked,
                likesCount: prevPost.likesCount
            }));
            alert("Nie udało się zaktualizować polubienia.");
        }
    };

    const handleDoubleClickLike = async () => {
        // Pokaż animację i schowaj ją po 1 sekundzie
        setShowLikeAnimation(true);
        setTimeout(() => {
            setShowLikeAnimation(false);
        }, 1000);

        // Jeśli post jest już polubiony, nie rób nic więcej
        if (post.likedByUser) return;

        // Jeśli post nie jest polubiony, wywołaj logikę dodawania polubienia
        // (możemy skopiować i uprościć logikę z handleToggleLike)
        setPost(prevPost => ({
            ...prevPost,
            likedByUser: true,
            likesCount: prevPost.likesCount + 1
        }));

        try {
            await addLikeToPost(post.postId);
        } catch (error) {
            console.error("Błąd podczas dodawania polubienia:", error);
            // W razie błędu cofnij optymistyczną aktualizację
            setPost(prevPost => ({
                ...prevPost,
                likedByUser: false,
                likesCount: prevPost.likesCount - 1
            }));
            alert("Nie udało się dodać polubienia.");
        }
    };

    const renderMedia = () => {
        if (!post?.mediaUrl) return null;

        switch(post.mediaType) {
            case 'IMAGE':
                return <img src={post.mediaUrl} alt={`Post by ${post.username}`} className="max-h-full w-auto object-contain"/>;
            case 'VIDEO':
                return (
                    <video controls autoPlay loop className="max-h-full w-auto object-contain">
                        <source src={post.mediaUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                );
            default:
                return null;
        }
    };

    // Uruchom pobieranie danych, gdy zmieni się postId
    useEffect(() => {
        fetchInitialPostData();
    }, [fetchInitialPostData]);
    
    // Blokowanie scrollowania tła, gdy modal jest otwarty
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!postId) return null;

    // Logika do renderowania skróconej lub pełnej treści
    const shouldTruncate = post && post.content.length > CONTENT_TRUNCATE_LENGTH;
    const renderedContent = shouldTruncate && !isContentExpanded 
        ? `${post.content.substring(0, CONTENT_TRUNCATE_LENGTH)}...`
        : post?.content;

    return (
        <div 
            className="fixed inset-0 bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center animate-fade-in"
            onClick={onClose}
        >
            <button onClick={onClose} className="absolute top-4 right-4 text-white z-50 text-2xl hover:opacity-75 transition-opacity">
                <FaTimes />
            </button>

            {loading && !post ? (
                <PostModalSkeleton />
            ) : error ? (
                <div className="text-center p-10 text-red-500 bg-surfaceDarkGray rounded-2xl">{error}</div>
            ) : post && (
                <div 
                    className="bg-surfaceDarkGray rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col lg:flex-row overflow-hidden relative cursor-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Lewa strona - Media (dostosowana responsywnie) */}
                    <div className="w-full lg:w-3/5 bg-black flex items-center justify-center h-1/2 lg:h-full flex-shrink-0 relative"
                        onDoubleClick={handleDoubleClickLike}>
                        {renderMedia()}
                        {showLikeAnimation && (
                        <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                            <LuBicepsFlexed className="text-white text-8xl drop-shadow-lg like-animation" />
                        </div>
                    )}
                    </div>

                    {/* Prawa strona - Info i komentarze (dostosowana responsywnie) */}
                    <div className="w-full lg:w-2/5 flex flex-col h-1/2 lg:h-full bg-surfaceDarkGray text-whitePrimary">
                        {/* Header */}
                        <div className="p-4 flex items-center border-b border-borderGrayHover flex-shrink-0">
                            <img src={post.userProfileImageUrl} className="w-10 h-10 rounded-full mr-3" alt={post.username}/>
                            <span className="font-bold">{post.username}</span>
                        </div>

                        {/* Główna, przewijalna treść */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Opis posta */}
                            <div className="flex items-start">
                                <div className="flex-1 min-w-0 break-words text-sm">
                                    <span className="font-bold mr-2">{post.username}</span>
                                    <span>{renderedContent}</span>
                                    {shouldTruncate && (
                                        <button onClick={() => setIsContentExpanded(!isContentExpanded)} className="text-borderGrayHover text-sm ml-1 font-semibold">
                                            {isContentExpanded ? 'less' : 'more'}
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            {/* Lista komentarzy */}
                            {comments.map(comment => (
                                <div key={comment.commentId} className="flex items-start">
                                    <img src={comment.profileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={comment.username}/>
                                    <div className="flex-1 min-w-0 break-words text-sm">
                                        <span className="font-bold mr-2">{comment.username}</span>
                                        <span>{comment.content}</span>
                                        <p className="text-xs text-borderGrayHover mt-0.5">{formatTimeAgo(comment.createdAt)}</p>
                                    </div>
                                </div>
                            ))}

                            {hasMoreComments && (
                                <button onClick={fetchMoreComments} disabled={loading} className="text-sm text-borderGrayHover hover:underline">
                                    {loading ? 'Loading...' : 'Load more comments'}
                                </button>
                            )}
                        </div>

                        {/* Stopka - akcje i dodawanie komentarza */}
                        <div className="p-4 border-t border-borderGrayHover mt-auto flex-shrink-0">
                            <div className="flex justify-between items-center text-2xl mb-2">
                                <div className="flex gap-4">
                                    <button onClick={handleToggleLike} className="hover:text-borderGrayHover transition-colors">
                                        {post.likedByUser ? <LuBicepsFlexed className="text-blue-500" /> : <LuBicepsFlexed />}
                                    </button>
                                    {/* <button className="hover:text-borderGrayHover transition-colors"><FaRegComment /></button> */}
                                    {/* <button className="hover:text-borderGrayHover transition-colors"><FaRegPaperPlane /></button> */}
                                </div>
                                {/* <button className="hover:text-borderGrayHover transition-colors"><FaRegBookmark /></button> */}
                            </div>
                            
                            <div className="font-bold text-sm">{post.likesCount} likes</div>
                            <div className="text-borderGrayHover uppercase text-xs mt-1">{formatTimeAgo(post.createdAt)}</div>
                            
                            <div className="mt-2 pt-2 border-t border-borderGrayHover/50">
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="text" 
                                        className="w-full bg-transparent text-sm outline-none placeholder:text-borderGrayHover" 
                                        placeholder="Add a comment..." 
                                        onChange={(e) => setNewCommentText(e.target.value)}
                                        value={newCommentText}
                                        disabled={isSubmitting}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <button 
                                        className="text-bluePrimary font-bold text-sm disabled:text-blue-900"
                                        onClick={handleSubmitComment}
                                        disabled={!newCommentText.trim() || isSubmitting}
                                    >
                                        Post
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}