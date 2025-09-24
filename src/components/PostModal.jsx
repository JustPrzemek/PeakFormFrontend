import React, { useState, useEffect, useCallback } from 'react';
import { getPostDetails } from '../services/postsService';
import { FaTimes } from 'react-icons/fa';
import { addLikeToPost, removeLikeFromPost } from '../services/likesService';
import { formatTimeAgo } from '../utils/dateFormatter';
import { addComment } from "../services/commentsService";
import { LiaCommentSolid } from "react-icons/lia";
import { AiFillLike, AiOutlineLike } from "react-icons/ai";
import { FaRegComments } from "react-icons/fa6";

const CONTENT_TRUNCATE_LENGTH = 150;

export default function PostModal({ postId, onClose }) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            className="fixed inset-0 bg-gray bg-opacity-75 backdrop-blur-sm z-50 flex justify-center items-center cursor-pointer"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex overflow-hidden relative cursor-auto"
                onClick={(e) => e.stopPropagation()} // Zapobiega zamykaniu po kliknięciu w modal
            >
                <button onClick={onClose} className="absolute top-2 right-2 text-white z-10 text-2xl">
                    <FaTimes />
                </button>

                {loading && !post && <p className="text-center w-full p-10">Loading...</p>}
                {error && <p className="text-center w-full p-10 text-red-500">{error}</p>}

                {post && (
                    <>
                        {/* Lewa strona - Obrazek */}
                        <div className="w-1/2 bg-black flex items-center justify-center">
                            {renderMedia()}
                        </div>

                        {/* Prawa strona - Info i komentarze */}
                        <div className="w-1/2 flex flex-col h-full">
                            {/* Header */}
                            <div className="p-4 flex items-center border-b">
                                <img src={post.userProfileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={post.username}/>
                                <span className="font-bold">{post.username}</span>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Opis posta */}
                                <div className="break-words">
                                    <span className="font-bold mr-2">{post.username}</span>
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
                                
                                {/* Lista komentarzy */}
                                {comments.map(comment => (
                                    <div key={comment.commentId} className="flex items-start">
                                        <img src={comment.profileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={comment.username}/>
                                        {/* ZMIANA 3: Upewnienie się, że klasa `break-words` jest na kontenerze komentarza */}
                                        <div className="flex-1 min-w-0 break-words">
                                            <span className="font-bold mr-2">{comment.username}</span>
                                            <span>{comment.content}</span>
                                        </div>
                                    </div>
                                ))}

                                {hasMoreComments && (
                                    <button onClick={fetchMoreComments} disabled={loading} className="text-blue-500 hover:underline">
                                        {loading ? 'Ładowanie...' : 'Wczytaj więcej komentarzy'}
                                    </button>
                                )}
                            </div>

                            {/* Stopka - akcje i dodawanie komentarza */}
                            <div className="p-4 border-t">
                                <div className="flex flex-row text-2xl mb-2">
                                    <button onClick={handleToggleLike} className="mr-3 hover:opacity-70 cursor-pointer">
                                        {post.likedByUser 
                                            ? <AiFillLike className="text-blue-500" /> 
                                            : <AiOutlineLike />
                                        }
                                    </button>
                                    <button className="mr-3 hover:text-gray-500 cursor-pointer">
                                        <FaRegComments />
                                    </button>
                                </div>
                                
                                <div className="font-bold text-sm">{post.likesCount} likes</div>
                                <div className="text-gray-500 uppercase text-xs mt-1">
                                    {formatTimeAgo(post.createdAt)} 
                                </div>
                            </div>
                            <div className="mt-2 border-t">
                                   <div className="p-3 flex flex-row ">
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
                                                onKeyDown={handleKeyDown} />
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
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}