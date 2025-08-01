import weatherData from "@/services/mockData/weather.json";

class WeatherService {
  constructor() {
    this.weatherData = [...weatherData];
  }

  async getCurrentWeather() {
    await this.delay();
    return { ...this.weatherData[0] };
  }

  async getForecast() {
    await this.delay();
    return [...this.weatherData];
  }

  async delay() {
    return new Promise(resolve => setTimeout(resolve, Math.random() * 300 + 200));
  }
}

export default new WeatherService();