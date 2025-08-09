//Server installation using API goes here
//Use api   
//OpenWeather API was used on this assignment
//Website OpenWeather: https://home.openweathermap.org/api_keys
//Used the example code that was sent on Teams
//Researched more about dotenv, apparently it allows node to read env variables and make things easier to manuever when calling the API
require('dotenv').config();
const express = require("express"); 
const fetch  = require("node-fetch");

//Debug tool to see if the API was loaded
//Need to install previous version of node fetch for the APi to work
console.log('Loaded WEATHER_API_KEY:', process.env.API_KEY); 
console.log('Loaded EXCHANGE_API_KEY', process.env.EXCHANGE_KEY);

const app = express();

app.use(express.static("public"));

//Get the weather
app.get("/api/weather", async (req, res) => {
//check if the city is exisitng or there is a city
  const city = req.query.city;
  const apiKey = process.env.API_KEY;

  if (!city) {
    // If no city is provided
    res.status(400).json({ error:"City is required"});
  } else {
    // Proceed to fetch the weather
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        res.status(response.status).json({ error: data.message });
      } else {
        res.json(data);
      }
    } catch (error) {
      console.error("Server error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
});

//Get exchange rate
app.get("/api/exchange", async (req, res) => {
  const base = req.query.base; 
  const change = req.query.change;

if (!base || !change) {
    return res.status(400).json({error: "Both 'base' and 'change' currencies are required"});
  }

  try {
    const url = `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_KEY}/pair/${base}/${change}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({error: data.error});
    }

    res.json(data);
  } catch (error) {
    console.error("Exchange API error:", error);
    res.status(500).json({error: "Internal server error"});
  }
});

const PORT = 3000;
//Tell the server to listen for HTTP requests
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});