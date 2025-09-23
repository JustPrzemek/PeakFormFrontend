import React, { useState, useEffect, useCallback } from 'react';
import { getPostDetails } from '../services/postsService';
import { FaTimes } from 'react-icons/fa';

export default function PostModal({ postId, onClose }) {
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                        <div className="w-1/2 flex flex-col">
                            {/* Header */}
                            <div className="p-4 border-b flex items-center">
                                <img src={post.userProfileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={post.username}/>
                                <span className="font-bold">{post.username}</span>
                            </div>

                            {/* Komentarze - scrollowalne */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {/* Opis posta */}
                                <div className="flex items-start">
                                    <img src={post.userProfileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={post.username}/>
                                    <div>
                                        <span className="font-bold mr-2">{post.username}</span>
                                        <span>{post.content}</span>
                                    </div>
                                </div>

                                {/* Lista komentarzy */}
                                {comments.map(comment => (
                                    <div key={comment.commentId} className="flex items-start">
                                        <img src={comment.profileImageUrl} className="w-8 h-8 rounded-full mr-3" alt={comment.username}/>
                                        <div>
                                            <span className="font-bold mr-2">{comment.username}</span>
                                            <span>{comment.content}</span>
                                        </div>
                                    </div>
                                ))}

                                {hasMoreComments && (
                                    <button onClick={fetchMoreComments} disabled={loading} className="text-blue-500 hover:underline">
                                        {loading ? 'Loading...' : 'Load more comments'}
                                    </button>
                                )}
                            </div>

                            {/* Stopka - akcje i dodawanie komentarza */}
                            <div className="p-4 border-t">
                                <div className="font-bold text-sm">{post.likesCount} likes</div>
                                <div className="text-gray-500 uppercase text-xs mt-1">
                                    {/* Tutaj można użyć formatTimeAgo(post.createdAt) */}
                                    {new Date(post.createdAt).toLocaleDateString()} 
                                </div>
                                <div className="mt-2">
                                    {/* Tutaj można dodać formularz dodawania komentarza */}
                                    <p className="text-sm text-gray-400">Comment functionality to be added here.</p>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}