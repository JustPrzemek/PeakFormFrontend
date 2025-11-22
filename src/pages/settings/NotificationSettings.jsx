import React, { useState } from 'react';

export default function NotificationSettings() {
    const [settings, setSettings] = useState({
        emailUpdates: true,
        newFollower: true,
        postLikes: false
    });

    const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <div className="max-w-lg">
            <h2 className="text-2xl font-bold mb-6">Notifications</h2>
            <div className="space-y-4">
                <ToggleItem 
                    label="Email Updates" 
                    desc="Receive news and updates from PeakForm"
                    checked={settings.emailUpdates} 
                    onChange={() => toggle('emailUpdates')} 
                />
                <ToggleItem 
                    label="New Followers" 
                    desc="Notify me when someone follows me"
                    checked={settings.newFollower} 
                    onChange={() => toggle('newFollower')} 
                />
                 <ToggleItem 
                    label="Post Likes" 
                    desc="Notify me when someone likes my post"
                    checked={settings.postLikes} 
                    onChange={() => toggle('postLikes')} 
                />
            </div>
        </div>
    );
}

function ToggleItem({ label, desc, checked, onChange }) {
    return (
        <div className="flex items-center justify-between p-4 bg-backgoudBlack rounded-lg border border-borderGrayHover/30">
            <div>
                <h4 className="font-bold">{label}</h4>
                <p className="text-xs text-borderGrayHover">{desc}</p>
            </div>
            <div 
                onClick={onChange}
                className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${checked ? 'bg-bluePrimary' : 'bg-gray-600'}`}
            >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${checked ? 'left-7' : 'left-1'}`}></div>
            </div>
        </div>
    );
}