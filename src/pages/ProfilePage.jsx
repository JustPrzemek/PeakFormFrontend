import ProfileHeader from "../components/ProfileHeader";
import ProfilePosts from "../components/ProfilePosts";
import React, {useEffect, useState} from "react";
import { getMyProfile, getUserProfile } from "../services/userProfileService";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { followUser, unfollowUser } from "../services/followService";
import FollowsModal from '../components/FollowsModal';
import ProfilePageSkeleton from "../components/skeletons/ProfilePageSkeleton";

export default function Profile() {
    const { username: usernameFromParams } = useParams(); 
    const { user: currentUser } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isOwnProfile = !usernameFromParams || usernameFromParams === currentUser?.username;
    const [modalState, setModalState] = useState({ isOpen: false, type: null });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                let data;
                if (isOwnProfile) {
                    // Jeśli to nasz profil, wołamy stary endpoint
                    data = await getMyProfile();
                } else {
                    // Jeśli to profil kogoś innego, wołamy nowy endpoint z nazwą z URL
                    data = await getUserProfile(usernameFromParams);
                }
                setProfile(data);
            } catch (err) {
                setError(err.toString());
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [usernameFromParams, isOwnProfile]);

    const handleFollowToggle = async () => {
        if (!profile || isOwnProfile) return;

        try {
            if (profile.following) {
                // Chcemy odobserwować
                await unfollowUser(profile.username);
                setProfile(prevProfile => ({
                    ...prevProfile,
                    following: false,
                    followersCount: prevProfile.followersCount - 1,
                }));
            } else {
                // Chcemy zaobserwować
                await followUser(profile.username);
                setProfile(prevProfile => ({
                    ...prevProfile,
                    following: true,
                    followersCount: prevProfile.followersCount + 1,
                }));
            }
        } catch (error) {
            console.error("Failed to toggle follow state", error);
            // Można tu wyświetlić jakiś toast z błędem
        }
    };

    if (loading) return <ProfilePageSkeleton />;
    if (error) return <p className="text-red-500 text-center mt-10">Error: {error}</p>;
    if (!profile) return <p className="text-center mt-10 text-whitePrimary">Profile not found.</p>;

    return (
        <div className="bg-backgoudBlack min-h-screen flex flex-col">
            <div className="container pt-8 max-w-5xl flex-grow">
                <main>
                    <ProfileHeader 
                        profile={profile} 
                        isOwnProfile={isOwnProfile} 
                        onFollowToggle={handleFollowToggle} 
                        onOpenModal={(type) => setModalState({ isOpen: true, type })}
                    />
                    <ProfilePosts 
                        profile={profile} 
                        isOwnProfile={isOwnProfile}
                    />
                </main>
            </div>
            <Footer />
            <FollowsModal 
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, type: null })}
                modalType={modalState.type}
                username={profile.username}
            />
        </div>
    );
}