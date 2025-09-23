import ProfileHeader from "../components/ProfileHeader";
import ProfilePosts from "../components/ProfilePosts";
import React, {useEffect, useState} from "react";
import { getMyProfile, getUserProfile } from "../services/userProfileService";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import { useUser } from '../context/UserContext';

export default function Profile() {
    const { username: usernameFromParams } = useParams(); 
    const { user: currentUser } = useUser();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isOwnProfile = !usernameFromParams || usernameFromParams === currentUser.username;

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

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (!profile) return <p>No profile data</p>;


    return (
        <div className="container pt-8 max-w-5xl">
            <main className="bg-slate-50">
                <ProfileHeader profile={profile} isOwnProfile={isOwnProfile}/>
                <ProfilePosts profile={profile} isOwnProfile={isOwnProfile}/>
            </main>
            <Footer />
        </div>
    );
}