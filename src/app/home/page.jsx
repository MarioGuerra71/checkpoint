"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn");
    if (!loggedIn) {
      router.push("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">¡Bienvenido a Home!</h1>
      <p className="text-lg text-gray-700 mb-6">
        Has iniciado sesión correctamente.
      </p>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
