import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMyProfilePicture } from '../services/userProfileService';// Upewnij się, że ścieżka jest poprawna

// 1. Tworzymy Context
const UserContext = createContext(null);

// 2. Tworzymy "Providera" - komponent, który będzie dostarczał dane
export function UserProvider({ children }) {
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ten useEffect pobierze zdjęcie tylko raz, gdy aplikacja startuje
    useEffect(() => {
        const fetchPicture = async () => {
            try {
                const data = await getMyProfilePicture();
                setProfilePictureUrl(data.profileImageUrl);
            } catch (error) {
                console.error("Failed to fetch profile picture for context:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPicture();
    }, []);

    // Funkcja do aktualizacji zdjęcia z dowolnego miejsca w aplikacji
    const updateProfilePicture = (newUrl) => {
        setProfilePictureUrl(newUrl);
    };

    const value = { profilePictureUrl, updateProfilePicture, loading };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

// 3. Tworzymy custom hooka dla łatwiejszego użycia contextu
export function useUser() {
    return useContext(UserContext);
}