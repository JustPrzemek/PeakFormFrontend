import { IoIosImages } from "react-icons/io";
import { MdOutlineQueryStats } from "react-icons/md";
import { AiOutlineLike } from "react-icons/ai";
import ProfilePost from "./ProfilePost";
import PostModal from './PostModal';
import { useEffect, useState, useRef, useCallback } from "react";
import { getMyPosts, getUserPosts } from "../services/postsService";

export default function ProfilePosts({ profile, isOwnProfile}) {
    
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

    return (
        <>
            {selectedPostId && (
                <PostModal postId={selectedPostId} onClose={handleClosePostModal} />
            )}
            <ul className="flex flex-row p-2 text-sm items-center justify-center border-t text-gray-400 h-16 lg:hidden">

                <li className="flex-1 text-center">
                    <strong className="text-black block">{profile.postsCount}</strong> Posts
                </li>

                <li className="flex-1 text-center">
                    <strong className="text-black block">{profile.followersCount}</strong> Followers
                </li>

                <li className="flex-1 text-center">
                    <strong className="text-black block">{profile.followingCount}</strong> Following
                </li>
                
            </ul>
            <div className="flex flex-row text-2xl items-center justify-center border-t uppercase text-gray-400 tracking-widest h-16 lg:text-xs">
                <a href="" className="text-black border-t border-black flex justify-center items-center h-full mr-16 cursor-pointer">

                    <IoIosImages />
                    <span className="hidden ml-2 lg:inline-block">Posts</span>
                </a>

                <a href="" className="flex justify-center items-center h-full mr-16 cursor-pointer">

                    <AiOutlineLike />
                    <span className="hidden ml-2 lg:inline-block">Liked</span>
                </a>

                <a href="" className="flex justify-center items-center h-full mr-16 cursor-pointer">

                    <MdOutlineQueryStats />
                    <span className="hidden ml-2 lg:inline-block">Stats</span>
                </a>

            </div>
            <div className="grid grid-cols-3 gap-1 lg:gap-8">
                {posts.map((post, index) => {
                    const ref = index === posts.length - 1 ? lastPostRef : null;
                    return (
                        <div ref={ref} key={post.id}>
                            <ProfilePost 
                                post={post} 
                                onOpenModal={handleOpenPostModal} 
                            />
                        </div>
                    );
                })}
                {loading && <p className="col-span-3 text-center  text-gray-600">Loading...</p>}
                {!hasMore && <p className="col-span-3 text-center  text-gray-600">No more posts</p>}
            </div>
        </>
    );
}