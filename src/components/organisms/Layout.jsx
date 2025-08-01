import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Sidebar from "@/components/organisms/Sidebar";
import weatherService from "@/services/api/weatherService";
import taskService from "@/services/api/taskService";
import { notificationService } from "@/services/api/notificationService";
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

    const initializeNotifications = async () => {
      try {
        // Request notification permission
        await notificationService.requestPermission();
        
        // Load tasks and start monitoring
        const tasks = await taskService.getAll();
        notificationService.startMonitoring(tasks);
        
        // Set up periodic task refresh for notifications
        const interval = setInterval(async () => {
          try {
            const updatedTasks = await taskService.getAll();
            notificationService.startMonitoring(updatedTasks);
          } catch (error) {
            console.error("Failed to refresh tasks for notifications:", error);
          }
        }, 5 * 60 * 1000); // Refresh every 5 minutes

        return () => {
          clearInterval(interval);
          notificationService.stopMonitoring();
        };
      } catch (error) {
        console.error("Failed to initialize notifications:", error);
      }
    };

    loadWeather();
    const cleanupNotifications = initializeNotifications();

    return () => {
      if (cleanupNotifications) {
        cleanupNotifications.then(cleanup => cleanup && cleanup());
      }
    };
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