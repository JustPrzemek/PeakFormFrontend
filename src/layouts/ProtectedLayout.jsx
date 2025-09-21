import React from 'react';
import { Outlet } from 'react-router-dom';
import { UserProvider } from '../context/UserContext';


export default function ProtectedLayout() {
    return (
        <UserProvider>
            {/* Outlet to specjalny komponent, który renderuje
                element z pasującej, zagnieżdżonej ścieżki <Route> */}
            <Outlet />
        </UserProvider>
    );
}