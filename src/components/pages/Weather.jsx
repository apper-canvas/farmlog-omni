import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Header from "@/components/organisms/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/Card";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import ApperIcon from "@/components/ApperIcon";
import weatherService from "@/services/api/weatherService";
import { format, addDays } from "date-fns";
import Chart from "react-apexcharts";

const Weather = () => {
  const { weather: currentWeather } = useOutletContext();
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadWeatherData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const forecastData = await weatherService.getForecast();
      setForecast(forecastData);
    } catch (err) {
      setError("Failed to load weather data");
      console.error("Weather data loading error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeatherData();
  }, []);

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

  const getChartData = () => {
    if (!forecast.length) return null;
    
    return {
      series: [{
        name: "Temperature",
        data: forecast.map(day => day.tempHigh)
      }],
      options: {
        chart: {
          type: "area",
          height: 300,
          toolbar: { show: false }
        },
        colors: ["#7CB342"],
        xaxis: {
          categories: forecast.map(day => format(new Date(day.date), "MMM dd"))
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value}°F`
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: "smooth",
          width: 3
        },
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            colorStops: [{
              offset: 0,
              color: "#7CB342",
              opacity: 0.3
            }, {
              offset: 100,
              color: "#7CB342",
              opacity: 0.05
            }]
          }
        }
      }
    };
  };

  const getPrecipitationData = () => {
    if (!forecast.length) return null;
    
    return {
      series: [{
        name: "Precipitation",
        data: forecast.map(day => day.precipitation)
      }],
      options: {
        chart: {
          type: "column",
          height: 200,
          toolbar: { show: false }
        },
        colors: ["#2196F3"],
        xaxis: {
          categories: forecast.map(day => format(new Date(day.date), "MMM dd"))
        },
        yaxis: {
          labels: {
            formatter: (value) => `${value}"`
          }
        },
        dataLabels: {
          enabled: false
        }
      }
    };
  };

  if (loading) return <Loading type="dashboard" />;
  if (error) return <Error message={error} onRetry={loadWeatherData} />;

  return (
    <div className="space-y-6 p-6">
      <Header 
        title="Weather Forecast" 
        subtitle="7-day weather outlook for your farming operations"
      />

      {/* Current Weather */}
      {currentWeather && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Current Weather</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                  <ApperIcon 
                    name={getWeatherIcon(currentWeather.conditions)} 
                    size={32} 
                    className="text-white" 
                  />
                </div>
                <div>
                  <div className="flex items-baseline space-x-3">
                    <span className={`text-4xl font-bold ${getTemperatureColor(currentWeather.tempHigh)}`}>
                      {currentWeather.tempHigh}°
                    </span>
                    <span className="text-xl text-gray-600">
                      / {currentWeather.tempLow}°F
                    </span>
                  </div>
                  <p className="text-lg text-gray-700 capitalize mt-1">{currentWeather.conditions}</p>
                </div>
              </div>
              
              {currentWeather.precipitation > 0 && (
                <div className="text-right">
                  <div className="flex items-center space-x-2 text-blue-600">
                    <ApperIcon name="Droplets" size={20} />
                    <span className="text-lg font-semibold">{currentWeather.precipitation}"</span>
                  </div>
                  <p className="text-sm text-gray-600">Expected rain</p>
                </div>
              )}
            </div>
            
            {currentWeather.alerts && currentWeather.alerts.length > 0 && (
              <div className="mt-4 bg-yellow-100 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ApperIcon name="AlertTriangle" size={20} className="text-yellow-600" />
                  <div>
                    <h4 className="font-semibold text-yellow-800">Weather Alert</h4>
                    <p className="text-yellow-700">{currentWeather.alerts[0]}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Temperature Chart */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>7-Day Temperature Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart {...getChartData()} />
          </CardContent>
        </Card>
      )}

      {/* Precipitation Chart */}
      {forecast.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Precipitation Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <Chart {...getPrecipitationData()} />
          </CardContent>
        </Card>
      )}

      {/* Daily Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Detailed Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                <div className="font-semibold text-gray-900 mb-2">
                  {index === 0 ? "Today" : format(new Date(day.date), "EEE, MMM dd")}
                </div>
                
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ApperIcon 
                    name={getWeatherIcon(day.conditions)} 
                    size={24} 
                    className="text-white" 
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <span className={`text-xl font-bold ${getTemperatureColor(day.tempHigh)}`}>
                      {day.tempHigh}°
                    </span>
                    <span className="text-gray-600">/ {day.tempLow}°</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 capitalize">{day.conditions}</p>
                  
                  {day.precipitation > 0 && (
                    <div className="flex items-center justify-center space-x-1 text-blue-600">
                      <ApperIcon name="Droplets" size={14} />
                      <span className="text-sm">{day.precipitation}"</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Agricultural Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Agricultural Weather Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Droplets" size={16} className="mr-2 text-blue-500" />
                Watering Schedule
              </h4>
              <p className="text-gray-700 text-sm">
                Monitor precipitation forecasts to optimize irrigation schedules. 
                Reduce watering 1-2 days before expected rainfall.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Thermometer" size={16} className="mr-2 text-red-500" />
                Temperature Management
              </h4>
              <p className="text-gray-700 text-sm">
                Watch for frost warnings and extreme heat. Consider protective measures 
                for sensitive crops during temperature extremes.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Wind" size={16} className="mr-2 text-gray-500" />
                Storm Preparation
              </h4>
              <p className="text-gray-700 text-sm">
                Secure equipment and provide crop protection before severe weather. 
                Plan harvest activities around storm forecasts.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center">
                <ApperIcon name="Sun" size={16} className="mr-2 text-yellow-500" />
                Optimal Conditions
              </h4>
              <p className="text-gray-700 text-sm">
                Take advantage of clear, mild weather for planting, harvesting, 
                and field maintenance activities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Weather;