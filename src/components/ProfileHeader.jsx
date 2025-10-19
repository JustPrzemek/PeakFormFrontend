import { Link } from "react-router-dom";
import React, { useState } from 'react';
import { GrPlan } from "react-icons/gr";

export default function ProfileHeader({ profile, isOwnProfile, onFollowToggle, onOpenModal}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleClick = async () => {
        setIsSubmitting(true);
        await onFollowToggle();
        setIsSubmitting(false);
    };

    return (
        <div className="bg-surfaceDarkGray text-whitePrimary rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start mb-10">
            {/* Awatar */}
            <div className="flex-shrink-0">
                <img 
                    src={profile.profileImageUrl} 
                    alt="Profile" 
                    className="w-36 h-36 rounded-full object-cover border-2 border-backgoudBlack shadow-lg" 
                />
            </div>

            {/* Informacje */}
            <div className="w-full text-center md:text-left">
                {/* Nazwa i przyciski */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    {isOwnProfile ? (
                        <Link to='/profile/edit'>
                            <button className="bg-borderGrayHover/50 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-borderGrayHover transition-colors">
                                Edit Profile
                            </button>
                        </Link>
                    ) : (
                        <button 
                            onClick={handleClick}
                            disabled={isSubmitting}
                            className={`font-semibold py-2 px-6 rounded-lg text-sm transition-colors disabled:opacity-50 ${
                                profile.following 
                                ? 'bg-borderGrayHover/50 hover:bg-borderGrayHover'
                                : 'bg-bluePrimary text-white hover:bg-blueHover'
                            }`}
                        >
                            {isSubmitting ? '...' : (profile.following ? 'Unfollow' : 'Follow')}
                        </button>
                    )}
                </div>

                {/* Statystyki */}
                <div className="flex justify-center md:justify-start gap-8 mb-4">
                    <div className="text-center">
                        <strong className="block text-lg">{profile.postsCount}</strong>
                        <span className="text-sm text-borderGrayHover">Posts</span>
                    </div>
                    <div onClick={() => onOpenModal('followers')} className="text-center cursor-pointer">
                        <strong className="block text-lg">{profile.followersCount}</strong>
                        <span className="text-sm text-borderGrayHover hover:text-white">Followers</span>
                    </div>
                    <div onClick={() => onOpenModal('following')} className="text-center cursor-pointer">
                        <strong className="block text-lg">{profile.followingCount}</strong>
                        <span className="text-sm text-borderGrayHover hover:text-white">Following</span>
                    </div>
                </div>

                {/* Bio */}
                <div className="max-w-prose">
                    <h3 className="font-bold">{profile.bioTitle}</h3>
                    <p className="text-sm text-borderGrayHover whitespace-pre-line">{profile.profileBio}</p>
                </div>

                {/* Aktywny Plan (jeśli jest) */}
                {profile.activePlanName && (
                    <div className="mt-4 bg-bluePrimary/10 border border-bluePrimary/30 p-3 rounded-lg flex items-center gap-3">
                        <GrPlan className="text-bluePrimary"/>
                        <div>
                            <p className="text-xs text-blue-300 font-bold">ACTIVE PLAN</p>
                            <p className="text-sm font-semibold">{profile.activePlanName}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}