const API_KEY = "b77e169e1fd743aca32130803242406";
const weatherGrid = document.getElementById("weather-grid");
const modal = document.getElementById("modal");
const confirmModal = document.getElementById("confirm-modal");
const addCardButton = document.getElementById("add-card");
const modalClose = document.getElementById("modal-close");
const confirmModalClose = document.getElementById("confirm-modal-close");
const searchButton = document.getElementById("search-button");
const cityInput = document.getElementById("city-input");
const cityNotFound = document.getElementById("city-not-found");
const previewCard = document.getElementById("preview-card");
const addCityButton = document.getElementById("add-city-button");
const previewCity = document.getElementById("preview-city");
const previewTemperature = document.getElementById("preview-temperature");
const previewCondition = document.getElementById("preview-condition");
const previewDetails = document.getElementById("preview-details");
const clearAllButton = document.getElementById("clear-all-button");
const confirmYesButton = document.getElementById("confirm-yes-button");
const confirmNoButton = document.getElementById("confirm-no-button");
const confirmText = document.getElementById("confirm-text");

let cities = JSON.parse(localStorage.getItem("cities")) || [];
let cardToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  cities.forEach((city) => addCityCard(city));
});

addCardButton.addEventListener("click", () => {
  modal.style.display = "block";
});

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

confirmModalClose.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

confirmNoButton.addEventListener("click", () => {
  confirmModal.style.display = "none";
});

confirmYesButton.addEventListener("click", () => {
  if (cardToDelete !== null) {
    removeCityCard(cardToDelete);
  } else {
    clearAllCities();
  }
  confirmModal.style.display = "none";
});

searchButton.addEventListener("click", async () => {
  const cityName = cityInput.value.trim();
  if (cityName) {
    const weatherData = await fetchWeather(cityName);
    if (weatherData) {
      cityNotFound.style.display = "none";
      previewCard.style.display = "flex";
      addCityButton.style.display = "inline-block";
      updatePreviewCard(weatherData);
    } else {
      cityNotFound.style.display = "block";
      previewCard.style.display = "none";
      addCityButton.style.display = "none";
    }
  }
});

addCityButton.addEventListener("click", () => {
  const cityName = cityInput.value.trim();
  if (cityName) {
    const weatherData = JSON.parse(previewCard.dataset.weather);
    cities.push(weatherData);
    localStorage.setItem("cities", JSON.stringify(cities));
    addCityCard(weatherData);
    modal.style.display = "none";
  }
});

clearAllButton.addEventListener("click", () => {
  confirmText.textContent = "Are you sure you want to delete all cards?";
  cardToDelete = null;
  confirmModal.style.display = "block";
});

function updatePreviewCard(data) {
  previewCard.dataset.weather = JSON.stringify(data);
  previewCity.textContent = `${data.location.name}, ${data.location.region}`;
  previewTemperature.innerHTML = `<i class="fas fa-thermometer-half"></i> ${data.current.temp_c}°C`;
  previewCondition.innerHTML = `<img src="${data.current.condition.icon}" alt="${data.current.condition.text}"> ${data.current.condition.text}`;
  previewDetails.innerHTML = `
        <div><i class="fas fa-tint"></i> ${data.current.humidity}%</div>
        <div><i class="fas fa-wind"></i> ${data.current.wind_kph.toFixed(
          2
        )} kph</div>
        <div><i class="fas fa-eye"></i> ${data.current.vis_km} km</div>
        <div><i class="fas fa-cloud"></i> ${data.current.cloud}%</div>
    `;
}

function addCityCard(data) {
  const card = document.createElement("div");
  card.className = "weather-grid__item weather-card";
  card.innerHTML = `
        <span class="weather-card__close">&times;</span>
        <div class="weather-card__city">${data.location.name}, ${
    data.location.region
  }</div>
        <div class="weather-card__temperature"><i class="fas fa-thermometer-half"></i> ${
          data.current.temp_c
        }°C</div>
        <div class="weather-card__condition"><img src="${
          data.current.condition.icon
        }" alt="${data.current.condition.text}"> ${
    data.current.condition.text
  }</div>
        <div class="weather-card__details">
            <div><i class="fas fa-tint"></i> ${data.current.humidity}%</div>
            <div><i class="fas fa-wind"></i> ${data.current.wind_kph.toFixed(
              2
            )} kph</div>
            <div><i class="fas fa-eye"></i> ${data.current.vis_km} km</div>
            <div><i class="fas fa-cloud"></i> ${data.current.cloud}%</div>
        </div>
    `;
  card.querySelector(".weather-card__close").addEventListener("click", () => {
    confirmText.textContent = "Are you sure you want to delete this card?";
    cardToDelete = card;
    confirmModal.style.display = "block";
  });
  weatherGrid.insertBefore(card, addCardButton);
}

function removeCityCard(card) {
  const cityIndex = Array.from(weatherGrid.children).indexOf(card);
  cities.splice(cityIndex, 1);
  localStorage.setItem("cities", JSON.stringify(cities));
  weatherGrid.removeChild(card);
}

function clearAllCities() {
  cities = [];
  localStorage.setItem("cities", JSON.stringify(cities));
  const cards = weatherGrid.querySelectorAll(".weather-card");
  cards.forEach((card) => weatherGrid.removeChild(card));
}

async function fetchWeather(city) {
  try {
    const response = await fetch(
      `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`
    );
    if (response.ok) {
      const data = await response.json();
      return {
        location: {
          name: data.location.name,
          region: data.location.region,
        },
        current: {
          temp_c: data.current.temp_c,
          humidity: data.current.humidity,
          wind_kph: data.current.wind_kph,
          vis_km: data.current.vis_km,
          cloud: data.current.cloud,
          condition: {
            text: data.current.condition.text,
            icon: data.current.condition.icon,
          },
        },
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching weather data:", error);
    return null;
  }
}
