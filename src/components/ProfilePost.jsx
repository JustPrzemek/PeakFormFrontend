import { IoMdHeartHalf } from "react-icons/io";
import { FaComment } from "react-icons/fa";
import React, {useState} from "react";

export default function ProfilePost({post}) {
    const [showOverlay, setShowOverlay] = useState(false);

    const renderMedia = () => {
        if (!post.mediaUrl) {
            // Możesz tu wyświetlić placeholder, jeśli post nie ma mediów
            return <div className="bg-gray-200 w-full h-full"></div>;
        }

        // Zakładając, że Twoje DTO zwraca mediaType
        if (post.mediaType === 'VIDEO') {
            return (
                <video
                    src={post.mediaUrl}
                    className="absolute inset-0 object-cover w-full h-full"
                    loop
                    muted
                />
            );
        }

        // Domyślnie renderuj obraz
        return (
            <img
                src={post.mediaUrl}
                alt="Post"
                className="absolute inset-0 object-cover w-full h-full"
            />
        );
    };

    return (
        <div className="relative overflow-hidden w-full pt-[100%] "
        onMouseEnter={() => setShowOverlay(true)}
        onMouseLeave={() => setShowOverlay(false)}>
            <a href="#" className="">
                <div className={`bg-gray-800 bg-opacity-60 h-full w-full absolute inset-0 z-10 flex items-center justify-center text-white ${showOverlay ? "" : "hidden"}`}>
                    <IoMdHeartHalf />
                    <span className="ml-2">{post.likesCount}</span>
                    <FaComment className="ml-8"/>
                    <span className="ml-2">{post.commentsCount}</span>
                </div>
            </a>
            {renderMedia()}
        </div>
    );
}