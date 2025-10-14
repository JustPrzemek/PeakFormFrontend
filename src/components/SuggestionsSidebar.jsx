import { useUser } from '../context/UserContext'; // Użyj swojego kontekstu użytkownika
import { useNavigate } from 'react-router-dom';
import { getSuggestedUsers } from '../services/homePageService';
import { followUser } from '../services/followService';
import { useState, useEffect } from 'react';

const SuggestionItem = ({ username, avatar, onFollow, onGoToProfile }) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3" >
            <img src={avatar || 'https://via.placeholder.com/150'} alt={username} className="h-10 w-10 rounded-full object-cover" />
            <div>
                <p className="font-bold text-sm text-whitePrimary hover:underline cursor-pointer" onClick={() => onGoToProfile()} >{username}</p>
                <p className="text-xs text-borderGrayHover">Suggested for you</p>
            </div>
        </div>
        {/* Po kliknięciu wywołujemy funkcję przekazaną w props z nazwą użytkownika */}
        <button 
            onClick={() => onFollow(username)} 
            className="text-xs font-bold text-bluePrimary hover:text-white cursor-pointer"
        >
            Follow
        </button>
    </div>
);

export default function SuggestionsSidebar() {
    const { user, loading: userLoading } = useUser();
    const navigate = useNavigate();

    const [suggestions, setSuggestions] = useState([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(true);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const suggestedUsers = await getSuggestedUsers();
                setSuggestions(suggestedUsers);
            } catch (error) {
                console.error("Erroe while requesting suggestions", error);
            } finally {
                setLoadingSuggestions(false);
            }
        };

        fetchSuggestions();
    }, []);

    const handleFollow = async (usernameToFollow) => {
        try {
            await followUser(usernameToFollow);
            setSuggestions(prevSuggestions => 
                prevSuggestions.filter(suggestion => suggestion.username !== usernameToFollow)
            );
        } catch (error) {
            console.error(`failed to follow ${usernameToFollow}:`, error);
        }
    };

    if (userLoading) return null;

    return (
        <div className="fixed w-80 p-5 space-y-6">
            {/* Panel zalogowanego użytkownika */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate(`/profile/${user.username}`)}>
                    <img src={user.profileImageUrl} alt={user.username} className="h-14 w-14 rounded-full object-cover"/>
                    <div>
                        <p className="font-bold text-whitePrimary">{user.username}</p>
                        <p className="text-sm text-borderGrayHover">{user.name}</p> 
                    </div>
                </div>
                {/* <button className="text-xs font-bold text-bluePrimary hover:text-white">Switch</button> */}
                {/* <div>
                    <p className='text-whitePrimary'>
                        Motto dnia hahahah mozna dodac takie cos na przyszłość
                    </p>
                </div> */}
            </div>
            
            {/* Panel sugestii */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-borderGrayHover">Suggestions For You</p>
                    {/* <button className="text-xs font-bold text-whitePrimary hover:text-borderGrayHover">See All</button> */}
                </div>
                
                {/* === NOWY KOD: RENDEROWANIE LISTY SUGESTII === */}
                {loadingSuggestions ? (
                    <p className="text-sm text-borderGrayHover">Wczytywanie sugestii...</p>
                ) : (
                    suggestions.map(suggestedUser => (
                        <SuggestionItem
                            key={suggestedUser.username}
                            username={suggestedUser.username}
                            avatar={suggestedUser.profileImageUrl} // Mapujemy pole z API na prop `avatar`
                            onFollow={handleFollow} 
                            onGoToProfile={() => navigate(`/profile/${suggestedUser.username}`)}
                        />
                    ))
                )}
                {/* Jeśli nie ma sugestii po załadowaniu */}
                {!loadingSuggestions && suggestions.length === 0 && (
                     <p className="text-sm text-borderGrayHover">No suggestions for you. <br />
                     To see suggestions set your locations first.</p>
                )}
            </div>
        </div>
    );
}