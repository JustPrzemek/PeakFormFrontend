import { Link, useLocation, Outlet} from "react-router-dom";
import { FaUserEdit, FaShieldAlt, FaBell } from "react-icons/fa";

const settingsLinks = [
    { 
        path: "/settings/edit", 
        label: "Edit Profile", 
        icon: <FaUserEdit /> 
    },
    { 
        path: "/settings/security", 
        label: "Login & Security", 
        icon: <FaShieldAlt /> 
    },
    { 
        path: "/settings/notifications", 
        label: "Notifications", 
        icon: <FaBell /> 
    },
];

export default function SettingsPage() {
    const location = useLocation();
    const { pathname } = location;

    return (
        <div className="bg-backgoudBlack min-h-screen text-whitePrimary">
            <div className="container pt-8 max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                <div className="bg-surfaceDarkGray rounded-2xl border border-borderGrayHover/30 flex flex-col md:flex-row min-h-[600px] overflow-hidden">
                    
                    {/* LEWY SIDEBAR */}
                    <aside className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-borderGrayHover/50 p-4">
                        <nav className="space-y-1">
                            {settingsLinks.map(link => {
                                const isActive = pathname === link.path;
                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-all ${
                                            isActive 
                                                ? 'bg-bluePrimary/10 text-bluePrimary border-l-4 border-bluePrimary' 
                                                : 'text-borderGrayHover hover:bg-white/5 hover:text-whitePrimary border-l-4 border-transparent'
                                        }`}
                                    >
                                        <span className="text-lg">{link.icon}</span>
                                        <span>{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </aside>

                    {/* PRAWA STRONA (ZMIENNA TREŚĆ) */}
                    <main className="w-full md:w-3/4 p-6 sm:p-10 bg-surfaceDarkGray">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    )
}