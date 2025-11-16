import ProfilePost from "./ProfilePost";
import PostModal from '../PostModal';
import { useEffect, useState, useRef, useCallback } from "react";
import { getMyPosts, getUserPosts } from "../../services/postsService";
import { IoGrid, IoHeartOutline, IoStatsChart } from "react-icons/io5";
import ProfileStatsCharts from './ProfileStatsCharts';

export default function ProfilePosts({ profile, isOwnProfile, activeTab}) {
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [selectedPostId, setSelectedPostId] = useState(null);

    const observer = useRef();

    const handleOpenPostModal = (postId) => {
        setSelectedPostId(postId);
    };

    const handleClosePostModal = () => {
        setSelectedPostId(null);
    };

    const lastPostRef = useCallback((node) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && hasMore) {
                setPage((prev) => prev + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    useEffect(() => {
        setPosts([]);
        setPage(0);
        setHasMore(true);
    }, [profile.username]);

    useEffect(() => {
        // Nie rób nic, jeśli nie ma już więcej postów do załadowania
        if (!hasMore) return;

        const fetchPosts = async () => {
            setLoading(true);
            try {
                let data;
                // Tutaj dzieje się magia!
                if (isOwnProfile) {
                    data = await getMyPosts(page, 6);
                } else {
                    data = await getUserPosts(profile.username, page, 6);
                }
                
                setPosts((prev) => [...prev, ...data.content]);
                setHasMore(!data.last);
            } catch (err) {
                console.error(err);
                // Warto też zatrzymać dalsze próby pobierania w razie błędu
                setHasMore(false); 
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
        // Zależności: Uruchom ponownie, gdy zmieni się strona LUB nazwa użytkownika
    }, [page, profile.username, isOwnProfile, hasMore]);

    const renderContent = () => {
        switch (activeTab) {
            case 'posts':
                return (
                    <div className="grid grid-cols-3 gap-1 md:gap-4">
                        {/* Tutaj wklej swoją logikę mapowania postów i infinite scroll */}
                        {/* Przykład: */}
                        {posts.map((post, index) => (
                             <div ref={posts.length === index + 1 ? lastPostRef : null} key={post.id}>
                                <ProfilePost post={post} onOpenModal={handleOpenPostModal} />
                             </div>
                        ))}
                        {loading && <p className="col-span-3 text-center text-borderGrayHover">Loading...</p>}
                    </div>
                );
            case 'stats':
                // return (
                //     <div className="text-center py-16 text-borderGrayHover">
                //         <IoStatsChart className="mx-auto text-5xl mb-4" />
                //         <h3 className="font-bold text-xl text-whitePrimary">Activity Stats</h3>
                //         <p>This feature is coming soon!</p>
                //     </div>
                // );
                return <ProfileStatsCharts />;
            case 'liked':
                 return (
                    <div className="text-center py-16 text-borderGrayHover">
                        <IoHeartOutline className="mx-auto text-5xl mb-4" />
                        <h3 className="font-bold text-xl text-whitePrimary">Liked Posts</h3>
                        <p>This feature is coming soon!</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <>
            {/* Modal do postów (bez zmian) */}
            {selectedPostId && <PostModal postId={selectedPostId} onClose={handleClosePostModal} />}

            {/* 5. USUWAMY CAŁY DIV Z ZAKŁADKAMI (ten z border-t) */}
            
            {/* 6. Zostawiamy tylko kontener na treść. Usuwamy 'mt-4' */}
            <div>
                {renderContent()}
            </div>
        </>
    );
}