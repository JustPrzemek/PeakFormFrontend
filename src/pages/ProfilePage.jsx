import ProfileHeader from "../components/ProfileHeader";
import ProfilePosts from "../components/ProfilePosts";
import React, {useEffect, useState} from "react";
import { getMyProfile, getUserProfile } from "../services/userProfileService";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { followUser, unfollowUser } from "../services/followService";
import FollowsModal from '../components/FollowsModal';

export default function Profile() {
    const { username: usernameFromParams } = useParams(); 
    const { user: currentUser } = useUser();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isOwnProfile = !usernameFromParams || usernameFromParams === currentUser.username;

    const [modalState, setModalState] = useState({ isOpen: false, type: null });
    const openModal = (type) => setModalState({ isOpen: true, type: type });
    const closeModal = () => setModalState({ isOpen: false, type: null });

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

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!profile) return <p>No profile data</p>;

    return (
        <>
            <div className="container pt-8 max-w-5xl">
                <main className="bg-slate-50">
                    <ProfileHeader 
                        profile={profile} 
                        isOwnProfile={isOwnProfile} 
                        onFollowToggle={handleFollowToggle} 
                        onOpenModal={openModal}/>
                    <ProfilePosts profile={profile} isOwnProfile={isOwnProfile}/>
                </main>
                <Footer />
            </div>
            <FollowsModal 
                isOpen={modalState.isOpen}
                onClose={closeModal}
                modalType={modalState.type}
                username={profile.username}
            />
        </>
    );
}