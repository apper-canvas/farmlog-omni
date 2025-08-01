import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import weatherService from "@/services/api/weatherService";

const Layout = () => {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const weatherData = await weatherService.getCurrentWeather();
        setWeather(weatherData);
      } catch (error) {
        console.error("Failed to load weather:", error);
      }
    };

    loadWeather();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">
            <Outlet context={{ weather }} />
          </main>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        className="z-50"
      />
    </div>
  );
};

export default Layout;