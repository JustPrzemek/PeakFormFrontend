
export default function ProfileHeader({ profile }) {

    
    return (
        <div className="grid grid-cols-3 mb-10">
            <div className="bg-green p-3 rounded flex items-start justify-center">
                <img 
                    src={profile.profileImageUrl} 
                    alt="Profile Image" 
                    className="rounded-full"
                    width="150" />
            </div>
            <div className="p-3 text-gray-600 col-span-2">
                <div className="flex items-center">
                    <h1 className="inline-block text-3xl align-bottom block">
                        {profile.username}
                    </h1>
                    <button className="bg-white ml-3 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded text-sm">
                        Edit profile
                    </button>

                </div>
                <div className="flex flex-row py-5 max-w-sm hidden lg:flex">
                    <div className="basis-1/3">
                        <strong>{profile.postsCount}</strong> posts
                    </div>

                    <div className="basis-1/3">
                        <strong>{profile.followersCount}</strong> followers
                    </div>

                    <div className="basis-1/3">
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