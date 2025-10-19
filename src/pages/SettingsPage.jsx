import { Link, useLocation, Outlet} from "react-router-dom";
import { FaUserEdit, FaShieldAlt, FaBell } from "react-icons/fa";

const settingsLinks = [
    { 
        path: "/profile/edit", 
        label: "Edit Profile", 
        icon: <FaUserEdit /> 
    },
    { 
        path: "/settings/security", // Przykład przyszłej podstrony
        label: "Account & Security", 
        icon: <FaShieldAlt /> 
    },
    { 
        path: "/settings/notifications", // Przykład przyszłej podstrony
        label: "Notifications", 
        icon: <FaBell /> 
    },
];

export default function SettingsPage() {
    const location = useLocation();
    const {pathname} = location;

    return (
        <div className="bg-backgoudBlack min-h-screen text-whitePrimary">
            <div className="container pt-8 max-w-5xl mx-auto">
                {/* --- NOWY, STYLOWY KONTENER --- */}
                <div className="bg-surfaceDarkGray rounded-2xl border border-borderGrayHover/30 flex flex-col md:flex-row min-h-[80vh] overflow-hidden">
                    
                    {/* --- LEWY SIDEBAR Z NAWIGACJĄ --- */}
                    <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-borderGrayHover/50 p-4">
                        <nav className="space-y-2">
                            {settingsLinks.map(link => (
                                <Link
                                    key={link.path}
                                    to={link.path.replace('/profile/', '')} // Upewnij się, że to="/edit" dla zagnieżdżonego routingu
                                    className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                                        pathname === link.path 
                                            ? 'bg-bluePrimary/20 text-blue-300' 
                                            : 'text-borderGrayHover hover:bg-backgoudBlack hover:text-whitePrimary'
                                    }`}
                                >
                                    {link.icon}
                                    <span>{link.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </aside>

                    {/* --- PRAWA STRONA Z TREŚCIĄ (OUTLET) --- */}
                    <main className="w-full md:w-3/4 p-6 sm:p-10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}