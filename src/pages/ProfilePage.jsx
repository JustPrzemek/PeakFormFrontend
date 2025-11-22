import ProfileHeader from "../components/userprofile/ProfileHeader";
import ProfilePosts from "../components/userprofile/ProfilePosts";
import React, {useEffect, useState} from "react";
import { getMyProfile, getUserProfile } from "../services/userProfileService";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { followUser, unfollowUser } from "../services/followService";
import FollowsModal from '../components/modals/FollowsModal';
import ProfilePageSkeleton from "../components/skeletons/ProfilePageSkeleton";
import ProfileTabs from "../components/userprofile/ProfileTabs";
import ProfileStatisticPanel from "../components/userprofile/ProfileStatisticPanel";

export default function Profile() {
    const { username: usernameFromParams } = useParams(); 
    const { user: currentUser } = useUser();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isOwnProfile = !usernameFromParams || usernameFromParams === currentUser?.username;
    const [modalState, setModalState] = useState({ isOpen: false, type: null });
    const [activeTab, setActiveTab] = useState('posts');

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
                setActiveTab('posts');
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
            <div className="container pt-8 max-w-6xl flex-grow">
                {/* Główny kontener Flex */}
                <main className="flex flex-col md:flex-row gap-8">
                    
                    {/* --- LEWA KOLUMNA (SIDEBAR) --- */}
                    {/* Na mobile: order-2 (ma być w środku) */}
                    {/* Na desktop: order-1 (ma być po lewej) */}
                    <div className="w-full md:w-1/4 h-fit md:sticky md:top-18 order-2 md:order-1 flex flex-col gap-6">
                        <ProfileTabs 
                            activeTab={activeTab} 
                            setActiveTab={setActiveTab} 
                            isOwnProfile={isOwnProfile} 
                        />
                        {isOwnProfile && <ProfileStatisticPanel />}
                    </div>

                    {/* --- PRAWA KOLUMNA (HEADER + POSTY) --- */}
                    {/* MAGICZNA ZMIANA: */}
                    {/* Używamy klasy 'contents' dla mobile. To sprawia, że ten div znika logicznie na mobile, 
                        a jego dzieci (Header i Posts) stają się bezpośrednimi dziećmi <main>. 
                        Dzięki temu możemy im nadać osobny 'order'. 
                        Na desktopie (md:flex) wraca do bycia normalną kolumną po prawej. */}
                    <div className="contents md:flex md:flex-col md:gap-4 md:w-3/4 md:order-2">
                        
                        {/* Header: Na mobile order-1 (na samej górze) */}
                        <div className="order-1 md:order-none w-full">
                            <ProfileHeader 
                                profile={profile} 
                                isOwnProfile={isOwnProfile} 
                                onFollowToggle={handleFollowToggle} 
                                onOpenModal={(type) => setModalState({ isOpen: true, type })}
                            />
                        </div>

                        {/* Posty: Na mobile order-3 (na samym dole, pod sidebarem) */}
                        <div className="order-3 w-full mt-4 mb-10 md:order-none md:-mt-8 md:mb-0">
                            <ProfilePosts 
                                profile={profile} 
                                isOwnProfile={isOwnProfile}
                                activeTab={activeTab} 
                            />
                        </div>
                    </div>

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