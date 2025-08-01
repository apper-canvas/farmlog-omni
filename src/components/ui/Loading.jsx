import React from "react";

const Loading = ({ type = "default" }) => {
  if (type === "dashboard") {
    return (
      <div className="space-y-6 p-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="skeleton h-8 w-48 rounded-lg"></div>
          <div className="skeleton h-10 w-32 rounded-lg"></div>
        </div>
        
        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="skeleton h-4 w-20 rounded mb-2"></div>
              <div className="skeleton h-8 w-16 rounded mb-1"></div>
              <div className="skeleton h-3 w-24 rounded"></div>
            </div>
          ))}
        </div>
        
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="skeleton h-6 w-32 rounded mb-4"></div>
            <div className="skeleton h-64 w-full rounded"></div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="skeleton h-6 w-32 rounded mb-4"></div>
            <div className="skeleton h-64 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="skeleton h-6 w-48 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="skeleton h-4 w-4 rounded"></div>
                <div className="skeleton h-4 w-32 rounded"></div>
                <div className="skeleton h-4 w-24 rounded"></div>
                <div className="skeleton h-4 w-20 rounded"></div>
                <div className="skeleton h-4 w-16 rounded"></div>
                <div className="flex-1">
                  <div className="skeleton h-4 w-full rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (type === "cards") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
            <div className="skeleton h-6 w-32 rounded mb-3"></div>
            <div className="skeleton h-4 w-24 rounded mb-2"></div>
            <div className="skeleton h-4 w-20 rounded mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="skeleton h-8 w-20 rounded"></div>
              <div className="skeleton h-8 w-8 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  );
};

export default Loading;