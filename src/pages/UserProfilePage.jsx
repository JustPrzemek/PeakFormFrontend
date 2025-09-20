import { useEffect, useState } from "react";
import { getMyProfile } from "../services/userProfileService";

export default function UserProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getMyProfile();
                setProfile(data);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p className="text-red-500">Error: {error}</p>;

    return (
        <div className="p-4">
            <img 
                src={profile.profileImageUrl} 
                alt="Profile" 
                className="w-24 h-24 rounded-full mb-4"
            />
            <h1 className="text-2xl font-bold">{profile.username}</h1>
            <p>{profile.profileBio}</p>
            <p>📍 {profile.location}</p>
            <div className="mt-4 flex space-x-4">
                <span>Followers: {profile.followersCount}</span>
                <span>Following: {profile.followingCount}</span>
                <span>Posts: {profile.postsCount}</span>
            </div>
        </div>
    );
}