const API_GEOLOCATION_URL = "https://geocoding-api.open-meteo.com/v1/search";
const API_FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

const cityForm = document.querySelector("#cityForm");
cityForm.addEventListener("submit", onCityFormSubmit);

async function onCityFormSubmit(event) {
  event.preventDefault();

  const cityInput = document.querySelector("#city");
  const cityName = cityInput.value.trim();

  if (!cityName) {
    alert("Introduceti numele unui oras!");
  }
  const cityCoordinate = await getCityCoordinates(cityName);
  if (cityCoordinate === null) {
    alert(`Nu s-au putut prelua coordonatele orasului ${cityName}`);
    return;
  }

  const weatherResponse = await getWeather(
    cityCoordinate.lat,
    cityCoordinate.long
  );
  const weatherData = parseApiData(weatherResponse);
  console.log(weatherData);
}

async function getCityCoordinates(cityName) {
  const apiUrl = new URL(API_GEOLOCATION_URL);
  apiUrl.searchParams.append("name", cityName);
  apiUrl.searchParams.append("count", 1);

  console.log(apiUrl.toString());

  const response = await fetch(apiUrl.toString());
  const data = await response.json();

  if (!data || !data.hasOwnProperty("results")) {
    return null;
  }
  const result = data.results[0];

  return { lat: result.latitude, long: result.longitude };

  console.log(data);
}

async function getWeather(lat, long) {
  const apiUrl = new URL(API_FORECAST_URL);
  apiUrl.searchParams.append("latitude", lat);
  apiUrl.searchParams.append("longitude", long);
  apiUrl.searchParams.append("timezone", "auto");
  apiUrl.searchParams.append(
    "hourly",
    "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
  );

  console.log(apiUrl.toString());
  const response = await fetch(apiUrl.toString());
  const data = await response.json();
  return data;
}

//functie parsare raspuns -> fiecarei ora din time sa aiba corespondenta in tem, umiditate si vant
function parseApiData(data) {
  const numberOfItems = data.hourly.time.length;
  let currentWeather = null;
  const forecasts = [];

  const currentDateTime = new Date();

  for (let i = 0; i < numberOfItems; i++) {
    const itemDateTime = new Date(data.hourly.time[i]);

    const isToday =
      currentDateTime.toDateString() === itemDateTime.toDateString();

    const isCurrentHour =
      currentDateTime.getHours() === itemDateTime.getHours();

    if (isToday && isCurrentHour) {
      currentWeather = {
        date: data.hourly.time[i],
        temp: data.hourly.temperature_2m[i],
        wind: data.hourly.wind_speed_10m[i],
        humidity: data.hourly.relative_humidity_2m[i],
        code: data.hourly.weather_code[i],
      };
    } else {
      if (isCurrentHour) {
        forecasts.push({
          date: data.hourly.time[i],
          temp: data.hourly.temperature_2m[i],
          wind: data.hourly.wind_speed_10m[i],
          humidity: data.hourly.relative_humidity_2m[i],
          code: data.hourly.weather_code[i],
        });
      }
    }
  }

  return {
    current: currentWeather,
    forecasts: forecasts,
  };
}

function displayWeather(cityName, weather) {
  const pageContent = document.querySelector("");
}
