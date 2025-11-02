import React from 'react';
// Poprawiłem importy ikon, aby pasowały do kodu (brakowało 5)
import { IoGrid, IoHeartOutline, IoStatsChart } from "react-icons/io5";

export default function ProfileTabs({ activeTab, setActiveTab, isOwnProfile }) {
    const getButtonClass = (tabName) => {
        return `flex items-center gap-3 p-3 w-full text-left rounded-lg transition-colors ${
            activeTab === tabName
                ? 'bg-bluePrimary/20 text-blueLight font-semibold' // Styl aktywnej zakładki
                : 'text-borderGrayHover hover:bg-borderGrayHover/30 hover:text-whitePrimary' // Styl nieaktywnej
        }`;
    };

    return (
        <div className="flex flex-col bg-surfaceDarkGray rounded-2xl p-6 gap-2"> 
            <button 
                onClick={() => setActiveTab('posts')}
                className={getButtonClass('posts')}
            >
                <IoGrid size={20} /> 
                <span>POSTS</span>
            </button>
            
            {/* 2. Owijamy przycisk "ACTIVITY" warunkiem */}
            {isOwnProfile && (
                <button 
                    onClick={() => setActiveTab('stats')}
                    className={getButtonClass('stats')}
                >
                    <IoStatsChart size={20} /> 
                    <span>ACTIVITY</span>
                </button>
            )}
            
            <button 
                onClick={() => setActiveTab('liked')}
                className={getButtonClass('liked')}
            >
                <IoHeartOutline size={20} /> 
                <span>LIKED</span>
            </button>
        </div>
    );
}