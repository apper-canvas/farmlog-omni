import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: "Home" },
    { name: "Farms", href: "/farms", icon: "Wheat" },
    { name: "Crops", href: "/crops", icon: "Sprout" },
    { name: "Tasks", href: "/tasks", icon: "CheckSquare" },
    { name: "Finances", href: "/finances", icon: "DollarSign" },
    { name: "Weather", href: "/weather", icon: "CloudSun" },
  ];

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
      <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <ApperIcon name="Wheat" size={20} className="text-white" />
          </div>
          <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            FarmLog Pro
          </h1>
        </div>
        <nav className="mt-8 flex-1 px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                )
              }
            >
              <ApperIcon
                name={item.icon}
                size={20}
                className="mr-3 flex-shrink-0"
              />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
          onClick={() => setIsMobileOpen(true)}
        >
          <ApperIcon name="Menu" size={24} />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileOpen(false)} />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform duration-300 ease-in-out translate-x-0">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <ApperIcon name="X" size={24} className="text-white" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <ApperIcon name="Wheat" size={20} className="text-white" />
                  </div>
                  <h1 className="ml-3 text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    FarmLog Pro
                  </h1>
                </div>
                <nav className="mt-8 px-3 space-y-1">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                          isActive
                            ? "bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-r-2 border-primary-500"
                            : "text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                        )
                      }
                    >
                      <ApperIcon
                        name={item.icon}
                        size={20}
                        className="mr-3 flex-shrink-0"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
};

export default Sidebar;