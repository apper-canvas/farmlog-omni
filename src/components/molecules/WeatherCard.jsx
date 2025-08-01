import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";

const WeatherCard = ({ weather }) => {
  const getWeatherIcon = (conditions) => {
    const condition = conditions?.toLowerCase() || "";
    if (condition.includes("rain")) return "CloudRain";
    if (condition.includes("cloud")) return "Cloud";
    if (condition.includes("sun") || condition.includes("clear")) return "Sun";
    if (condition.includes("storm")) return "CloudLightning";
    if (condition.includes("snow")) return "CloudSnow";
    return "Sun";
  };

  const getTemperatureColor = (temp) => {
    if (temp >= 80) return "text-red-600";
    if (temp >= 60) return "text-yellow-600";
    return "text-blue-600";
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-900">
          Today's Weather
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
              <ApperIcon 
                name={getWeatherIcon(weather.conditions)} 
                size={24} 
                className="text-white" 
              />
            </div>
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={`text-2xl font-bold ${getTemperatureColor(weather.tempHigh)}`}>
                  {weather.tempHigh}°
                </span>
                <span className="text-gray-600">
                  / {weather.tempLow}°F
                </span>
              </div>
              <p className="text-sm text-gray-700 capitalize">{weather.conditions}</p>
            </div>
          </div>
        </div>
        
        {weather.precipitation > 0 && (
          <div className="flex items-center space-x-2 mb-3">
            <ApperIcon name="Droplets" size={16} className="text-blue-500" />
            <span className="text-sm text-gray-700">
              {weather.precipitation}" precipitation expected
            </span>
          </div>
        )}
        
        {weather.alerts && weather.alerts.length > 0 && (
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <ApperIcon name="AlertTriangle" size={16} className="text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Weather Alert</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">{weather.alerts[0]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;