import { Link} from "react-router-dom";
import React, { useState } from 'react';

export default function ProfileHeader({ profile, isOwnProfile, onFollowToggle, onOpenModal}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

     const handleClick = async () => {
        setIsSubmitting(true);
        await onFollowToggle();
        setIsSubmitting(false);
    };

    const followButton = () => {
        if (profile.following) {
            return (
                <button 
                    onClick={handleClick}
                    disabled={isSubmitting}
                    className="bg-white ml-3 text-gray-800 font-semibold py-1 px-4 border border-gray-400 rounded text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50"
                >
                    Unfollow
                </button>
            );
        } else {
            return (
                <button 
                    onClick={handleClick}
                    disabled={isSubmitting}
                    className="bg-blue-500 ml-3 text-white font-semibold py-1 px-4 border border-blue-500 rounded text-sm cursor-pointer hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                >
                    Follow
                </button>
            );
        }
    };

    return (
        <div className="grid grid-cols-3 mb-10">
            <div className="bg-green p-3 rounded flex items-start justify-center">
                <img 
                    src={profile.profileImageUrl} 
                    alt="Profile Image" 
                    className="w-[150px] h-[150px] rounded-full object-cover" 
                    width="150" />
            </div>
            <div className="p-3 text-gray-600 col-span-2">
                <div className="flex items-center">
                    <h1 className="inline-block text-3xl align-bottom block">
                        {profile.username}
                    </h1>
                    {isOwnProfile ? (
                        <Link to='/profile/edit'>
                            <button className="bg-white ml-3 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded text-sm cursor-pointer hover:bg-gray-100 transition-colors duration-200">
                                Edit profile
                            </button>
                        </Link>
                    ) : (
                        followButton()
                    )}
                </div>
                <div className="flex flex-row py-5 max-w-sm hidden lg:flex">
                    <div className="basis-1/3">
                        <strong>{profile.postsCount}</strong> posts
                    </div>

                    <div onClick={() => onOpenModal('followers')} className="basis-1/3 cursor-pointer hover:text-gray-800">
                        <strong>{profile.followersCount}</strong> followers
                    </div>

                    <div onClick={() => onOpenModal('following')} className="basis-1/3 cursor-pointer hover:text-gray-800">
                        <strong>{profile.followingCount}</strong> following
                    </div>
                </div>

                <h3 className="font-bold">
                    {profile.bioTitle}
                </h3>

                <p className="break-words whitespace-pre-line max-w-full line-clamp-5">{profile.profileBio}</p>
            </div>
        </div>
    );
}