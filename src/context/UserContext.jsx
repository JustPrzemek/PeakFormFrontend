import React, { createContext, useState, useEffect, useContext } from 'react';
// ✅ 1. Importujemy getMyProfile zamiast getMyProfilePicture
import { getMyProfile } from '../services/userProfileService';

const UserContext = createContext(null);

export function UserProvider({ children }) {
    // ✅ 2. Zamiast osobnych stanów, trzymamy cały obiekt użytkownika
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // ✅ 3. Zmieniamy funkcję na getMyProfile, żeby pobrać wszystkie dane naraz
                const data = await getMyProfile();
                // ✅ 4. Ustawiamy w stanie cały obiekt użytkownika
                setUser(data); 
            } catch (error) {
                console.error("Failed to fetch user for context:", error);
                // W przypadku błędu, np. wygaśnięcia tokena, user pozostanie null
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    // ✅ 5. Nowa, bardziej elastyczna funkcja do aktualizacji
    // Przyda się np. po edycji profilu
    const updateUser = (newUserData) => {
        setUser(prevUser => ({ ...prevUser, ...newUserData }));
    };

    // Funkcja do aktualizacji samego zdjęcia (nadal może być przydatna)
    const updateProfilePicture = (newUrl) => {
        if (user) {
            setUser(prevUser => ({ ...prevUser, profileImageUrl: newUrl }));
        }
    };

    // ✅ 6. Udostępniamy cały obiekt 'user' oraz funkcje do jego aktualizacji
    const value = { user, updateUser, updateProfilePicture, loading };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    return useContext(UserContext);
}