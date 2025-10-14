import Post from "../components/Post";
import { useSearchParams, useNavigate } from 'react-router-dom';
import Footer from "../components/Footer";
import { getMyFollowersPosts } from '../services/postsService';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostModal from '../components/PostModal';
import EmptyFeedPlaceholder from "../components/EmptyFeedPlaceholder";
import PostSkeleton from "../components/skeletons/PostSkeleton"; // <-- NOWY IMPORT
import SuggestionsSidebar from "../components/SuggestionsSidebar"; 
import { CgSpinner } from "react-icons/cg";

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedPostId = searchParams.get('post');
    const observer = useRef();

    const handleOpenPostModal = (postId) => setSearchParams({ post: postId });
    const handleClosePostModal = () => {navigate('.', { replace: true }); };

    const fetchPosts = useCallback(async (currentPage) => {
        // Ustawienie ładowania tylko jeśli ładujemy pierwszą stronę
        if (currentPage === 0) setLoading(true);
        try {
            const response = await getMyFollowersPosts(currentPage, 5); // Zmniejszmy do 5 dla lepszego efektu infinite scroll
            setPosts(prevPosts => {
                // Unikaj duplikatów
                const newPosts = response.content.filter(p1 => !prevPosts.some(p2 => p2.id === p1.id));
                return [...prevPosts, ...newPosts];
            });
            setHasMore(!response.last);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        // Resetuj posty przy odświeżeniu, aby uniknąć duplikatów
        setPosts([]);
        setPage(0);
        setHasMore(true);
        fetchPosts(0);
    }, [fetchPosts]);

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        if (page > 0 && hasMore) {
            fetchPosts(page);
        }
    }, [page, hasMore, fetchPosts]);

    const handleAddNewComment = (postId, newComment) => {
        setPosts(currentPosts => 
            currentPosts.map(post => {
                if (post.id === postId) {
                    // Zwracamy zaktualizowany obiekt posta
                    return {
                        ...post,
                        comments: [newComment, ...post.comments], // Dodajemy nowy komentarz na początek listy
                        commentsCount: post.commentsCount + 1 // Zwiększamy licznik
                    };
                }
                return post; // Zwracamy posta bez zmian
            })
        );
    };

     const handleLikeUpdate = (postId, newLikeStatus) => {

        setPosts(currentPosts =>
            currentPosts.map(post => {
                if (post.id === postId) {
                const newLikesCount = post.likesCount + (newLikeStatus ? 1 : -1);
                
                return {
                    ...post,
                    likesCount: newLikesCount,
                    likedByUser: newLikeStatus
                };
            }
                return post; // Zwracamy posta bez zmian
            })
        );
    };
    //TODO sugestie znajomych pokazywac
    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <div className="container pt-8 max-w-5xl flex-grow">
                {selectedPostId && (
                    <PostModal postId={selectedPostId} onClose={handleClosePostModal} />
                )}

                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* --- LEWA KOLUMNA - FEED --- */}
                    <div className="lg:col-span-2">
                        {loading && posts.length === 0 ? (
                            // Skeletony wyświetlane tylko przy pierwszym ładowaniu
                            <div className="space-y-8">
                                <PostSkeleton />
                                <PostSkeleton />
                            </div>
                        ) : posts.length > 0 ? (
                            <div className="space-y-8">
                                {posts.map((post, index) => (
                                    <div ref={posts.length === index + 1 ? lastPostElementRef : null} key={`${post.id}-${index}`}>
                                        <Post 
                                            post={post} 
                                            onCommentAdded={handleAddNewComment} 
                                            onLikeUpdated={handleLikeUpdate}
                                            onOpenModal={handleOpenPostModal}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            // Pusty feed, jeśli nie ma postów i nie ładujemy
                            <EmptyFeedPlaceholder />
                        )}

                        {/* Wskaźnik doładowywania kolejnych postów */}
                        {loading && posts.length > 0 && (
                            <div className="flex justify-center my-8">
                                <CgSpinner className="animate-spin text-bluePrimary text-4xl" />
                            </div>
                        )}

                        {!hasMore && posts.length > 0 && (
                            <p className="text-center text-borderGrayHover my-8">You've reached the end.</p>
                        )}
                    </div>

                    <div className="hidden lg:block">
                        <SuggestionsSidebar />
                    </div>
                </main>
            </div>
            
            <Footer />
        </div>
    );
}

export default HomePage;