import { useState } from "react";
import axios from "axios";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    age: "",
    weight: "",
    height: "",
    goal: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const payload = {
      email: formData.email,
      password: formData.password,
      username: formData.username,
      age: Number(formData.age),       // Konwersja na number
      weight: Number(formData.weight), // Konwersja na number
      height: Number(formData.height), // Konwersja na number
      goal: formData.goal
    };

    console.log("Wysyłane dane:", payload); // Debugowanie

    const response = await axios.post("http://localhost:8080/api/auth/register", payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    setMessage("Rejestracja zakończona. Sprawdź e-mail.");
  } catch (error: any) {
    console.error("Pełny błąd:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    setMessage(error.response?.data?.message || "Błąd rejestracji. Sprawdź dane.");
  }
};

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Rejestracja</h2>
        <input
          className="w-full p-2 mb-4 border rounded"
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="password"
          name="password"
          placeholder="Hasło"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="text"
          name="username"
          placeholder="Nazwa użytkownika"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="number"
          name="age"
          placeholder="Wiek"
          value={formData.age}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="number"
          name="weight"
          placeholder="Waga (kg)"
          value={formData.weight}
          onChange={handleChange}
          required
        />
        <input
          className="w-full p-2 mb-4 border rounded"
          type="number"
          name="height"
          placeholder="Wzrost (cm)"
          value={formData.height}
          onChange={handleChange}
          required
        />
        <select
          className="w-full p-2 mb-4 border rounded"
          name="goal"
          value={formData.goal}
          onChange={handleChange}
          required
        >
          <option value="">Wybierz cel</option>
          <option value="maintenance">Utrzymanie wagi</option>
          <option value="weight_loss">Redukcja</option>
          <option value="weight_gain">Masa</option>
        </select>
        <button
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          type="submit"
        >
          Zarejestruj się
        </button>
        {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
      </form>
    </div>
  );
}
