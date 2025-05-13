import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = async () => {
  try {
    const token = localStorage.getItem("token");
    
    await api.post(
      "/auth/logout",
      {},
      {
        withCredentials: true // Wysyła cookies
      }
    );

    localStorage.clear();
    navigate("/login");
  } catch (err) {
    console.error("Błąd wylogowania:", err);
  }
};

  return (
    <div className="flex min-h-screen">
      <button
        className="absolute top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? "Zamknij" : "Menu"}
      </button>

      <aside
        className={`bg-gray-800 text-white p-4 space-y-4 transform top-0 left-0 w-64 h-full fixed z-40 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <h2 className="text-xl font-bold">Panel</h2>
        <nav className="space-y-2">
          <a href="/dashboard" className="block hover:underline">Strona główna</a>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="w-full text-left hover:underline"
            >
              Wyloguj się
            </button>
          ) : (
            <>
              <a href="/login" className="block hover:underline">Zaloguj się</a>
              <a href="/register" className="block hover:underline">Rejestracja</a>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 p-8 ml-0 md:ml-64">
        <h1 className="text-2xl font-bold">Witaj w Dashboardzie!</h1>
        <p className="mt-4">Tu będą Twoje dane i zakładki.</p>
      </main>
    </div>
  );
}