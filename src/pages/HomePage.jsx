import Post from "../components/Post";
import Footer from "../components/Footer";
import { getMyFollowersPosts } from '../services/postsService';
import { useState, useEffect, useRef, useCallback } from 'react';
import PostModal from '../components/PostModal';

function HomePage() {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);

    const [selectedPostId, setSelectedPostId] = useState(null);
    const observer = useRef();

    const handleOpenPostModal = (postId) => {
        setSelectedPostId(postId);
    };

    const handleClosePostModal = () => {
        setSelectedPostId(null);
    };

    const lastPostElementRef = useCallback(node => {
        if (loading) return; // Jeśli już ładujemy, nic nie rób
        if (observer.current) observer.current.disconnect(); // Rozłącz poprzedniego observera

        observer.current = new IntersectionObserver(entries => {
            // Jeśli element jest widoczny i mamy jeszcze posty do załadowania
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1); // Zwiększ numer strony, co uruchomi useEffect do pobrania danych
            }
        });

        if (node) observer.current.observe(node); // Zacznij obserwować nowy ostatni element
    }, [loading, hasMore]);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const response = await getMyFollowersPosts(page, 10); // Pobieramy dane dla aktualnej strony
                setPosts(prevPosts => {
                    // Łączymy stare posty z nowymi
                    return [...prevPosts, ...response.content];
                });
                setHasMore(!response.last); // Ustawiamy `hasMore` na podstawie odpowiedzi z API
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            }
            setLoading(false);
        };

        if (hasMore) {
           fetchPosts();
        }
    }, [page]);

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

    return (
        <div className="container pt-8 max-w-5xl">
           {selectedPostId && (
                <PostModal postId={selectedPostId} onClose={handleClosePostModal} />
            )}
            <main className="grid grid-cols-3">
                <div className="md:px-12 lg:px-0 col-span-3 lg:col-span-2">
                   HELLO 
                    {posts.map((post, index) => {
                        const isLastPost = posts.length === index + 1;
                        return (
                            <div ref={isLastPost ? lastPostElementRef : null} key={post.id}>
                                <Post 
                                    post={post} 
                                    onCommentAdded={handleAddNewComment} 
                                    onLikeUpdated={handleLikeUpdate}
                                    onOpenModal={handleOpenPostModal}
                                />
                            </div>
                        );
                    })}
                    {loading && <p className="text-center text-gray-500 my-4">Loading posts...</p>}
                    {!hasMore && <p className="text-center text-gray-500 my-4">There is no more posts.</p>}
                </div>
                <div className="col-span-1 hidden lg:block">
                    <div className="fixed p-5 w-80">
                        <Footer />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default HomePage;