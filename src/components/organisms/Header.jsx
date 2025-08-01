import React from "react";
import ApperIcon from "@/components/ApperIcon";
import WeatherCard from "@/components/molecules/WeatherCard";

const Header = ({ title, subtitle, weather, children }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {children}
          {weather && (
            <div className="w-80 hidden lg:block">
              <WeatherCard weather={weather} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;