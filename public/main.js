//Code starts here
//Use api   
//OpenWeather API was used on this assignment
//Website OpenWeather: https://home.openweathermap.org/api_keys
//Researched more about dotenv, apparently it allows node to read env variables and make things easier to manuever when calling the API
//To understand local storage and session storage, I used the code that was sent to us by our professor as a stepping stone.
const input = document.querySelector("input");
const button = document.querySelector("button");
const weatherContainer = document.querySelector(".weather-container");
const message = document.getElementById("alert");

//RLimit weather requests once every 5 seconds
const WEATHER_RATE_LIMIT_MS = 5000;

button.addEventListener("click", async () => {
  const city = input.value.trim();
  message.textContent = "";
  message.style.color = "red";
  weatherContainer.innerHTML = "";

  if (!city) {
    message.textContent = "Enter an existing City.";
    return;
  }

  //Check last request time to rate-limit
  const lastWeatherRequest = sessionStorage.getItem("lastWeatherRequest");
  if (lastWeatherRequest && Date.now() - lastWeatherRequest < WEATHER_RATE_LIMIT_MS) {
    message.textContent = "Please wait before making another weather request.";
    return;
  }

  //Check if cached weather data exists and is fresh
  const cacheKey = `weather_${city.toLowerCase()}`;
  const cachedWeather = JSON.parse(localStorage.getItem(cacheKey));
  if (cachedWeather && (Date.now() - cachedWeather.timestamp < 10 * 60 * 1000)) {
    //Use cached data to display weather
    displayWeather(cachedWeather.data, true);
    return;
  }

  //Make API call if no fresh cached data
  const response = await fetch(`/api/weather?city=${city}`);

  if (!response.ok) {
    message.textContent = "something went wrong, please try again.";
    return;
  } else {
    const ans = await response.json();

    //Store the response in localStorage with timestamp for caching
    localStorage.setItem(cacheKey, JSON.stringify({
      data: ans,
      timestamp: Date.now()
    }));

    //Update the last request time to enforce rate-limiting
    sessionStorage.setItem("lastWeatherRequest", Date.now());

    //Display the weather data
    displayWeather(ans, false);
  }
});

//Helper function to display weather data with cache info
function displayWeather(ans, fromCache) {
  message.textContent = fromCache 
    ? `Loaded from cache: Here's the weather for ${ans.name}.`
    : `Here's the weather for ${ans.name} and was loaded successfully.`;
  message.style.color = fromCache ? "blue" : "green";

  weatherContainer.innerHTML = `
    <h2>Weather in ${ans.name}</h2>
    <p>Temperature: ${ans.main.temp} °C</p>
    <p>Weather: ${ans.weather[0].description}</p>
    <p>Humidity: ${ans.main.humidity}%</p>
    <p>Wind Speed: ${ans.wind.speed} m/s</p>
  `;
}

//Exchange code starts here
const exchangeForm = document.getElementById("exchangeForm");
const exchangeResult = document.getElementById("exchangeResult");
const exchangeMessage = document.getElementById("exchangeAlert");

//limit exchange requests to once every 5 seconds
const EXCHANGE_RATE_LIMIT_MS = 5000;

exchangeForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const base = document.getElementById("base").value;
  const change = document.getElementById("change").value;

  //Reset messages
  exchangeMessage.textContent = "";
  exchangeMessage.style.color = "red";
  exchangeResult.innerHTML = "";

  if (!base || !change) {
    exchangeMessage.textContent = "Please enter both base and target currency.";
    return;
  }

  //Check last request time to rate-limit
  const lastExchangeRequest = sessionStorage.getItem("lastExchangeRequest");
  if (lastExchangeRequest && Date.now() - lastExchangeRequest < EXCHANGE_RATE_LIMIT_MS) {
    exchangeMessage.textContent = "Please wait before making another exchange request.";
    return;
  }

  //Check if cached exchange data exists and is fresh
  const cacheKey = `exchange_${base}_${change}`;
  const cachedExchange = JSON.parse(localStorage.getItem(cacheKey));
  if (cachedExchange && (Date.now() - cachedExchange.timestamp < 10 * 60 * 1000)) {
    displayExchange(cachedExchange.data, base, change, true);
    return;
  }

  //Make API call if no fresh cached data
  const res = await fetch(`/api/exchange?base=${base}&change=${change}`);

  if (!res.ok) {
    exchangeMessage.textContent = "Something went wrong, please try again.";
    return;
  } else {
    const ans = await res.json();

    //Store the response in localStorage with timestamp for caching
    localStorage.setItem(cacheKey, JSON.stringify({
      data: ans,
      timestamp: Date.now()
    }));

    //Update the last request time to enforce rate-limiting
    sessionStorage.setItem("lastExchangeRequest", Date.now());

    //Display the exchange rate
    displayExchange(ans, base, change, false);
  }
});

//Helper function to display exchange rate with cache info
function displayExchange(ans, base, change, fromCache) {
  exchangeMessage.textContent = fromCache
    ? `Loaded from cache: Exchange rate for ${base} to ${change}.`
    : `Exchange rate loaded successfully for ${base} to ${change}.`;
  exchangeMessage.style.color = fromCache ? "blue" : "green";

  exchangeResult.innerHTML = `
    <h2>Exchange Rate</h2>
    <p>1 ${base} = ${ans.conversion_rate} ${change}</p>
  `;
}
