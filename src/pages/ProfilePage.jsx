import ProfileHeader from "../components/ProfileHeader";
import ProfilePosts from "../components/ProfilePosts";
import React, {useEffect, useState} from "react";
import { getMyProfile } from "../services/userProfileService";
import Footer from "../components/Footer";

export default function Profile() {

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
    if (!profile) return <p>No profile data</p>;


    return (
        <div className="container pt-8 max-w-5xl">
            <main className="bg-slate-50">
                <ProfileHeader profile={profile}/>
                <ProfilePosts profile={profile}/>
            </main>
            <Footer />
        </div>
    );
}