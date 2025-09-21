import { Link, useLocation, Outlet} from "react-router-dom";

export default function SettingsPage() {
    const location = useLocation();
    const {pathname} = location;

    return (
        <div className="container pt-8 max-w-5xl">
            <div className="border flex flex-row bg-white min-h-[80vh]">
                <div className="w-1/4 border-r">
                    <ul>
                        <li>
                            <Link className={`block cursor-pointer p-4 px-8 ${pathname === "/profile/edit" ? "font-bold border-l-2 border-l-black" : ""}`} to="edit">
                                Edit Profile
                            </Link>
                        </li>
                    </ul>

                </div>
                <div className="w-3/4 p-10">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}