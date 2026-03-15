const BASE_URL = 'https://api.openweathermap.org/data/2.5';
const ICON_URL = 'https://openweathermap.org/img/wn';

const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const weatherDisplay = document.getElementById('weather-display');
const errorMessage = document.getElementById('error-message');
const searchHistoryEl = document.getElementById('search-history');

let searchHistory = JSON.parse(localStorage.getItem('weatherSearchHistory')) || [];

function init() {
      searchForm.addEventListener('submit', handleSearch);
      renderSearchHistory();

    if (searchHistory.length > 0) {
              fetchWeather(searchHistory[0]);
    }
}

async function handleSearch(e) {
      e.preventDefault();
      const city = cityInput.value.trim();
      if (!city) return;

    await fetchWeather(city);
      cityInput.value = '';
}

async function fetchWeather(city) {
      try {
                showLoading();

          const currentRes = await fetch(
                        `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
                    );

          if (!currentRes.ok) throw new Error('City not found');

          const currentData = await currentRes.json();

          const forecastRes = await fetch(
                        `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
                    );
                const forecastData = await forecastRes.json();

          displayCurrentWeather(currentData);
                displayForecast(forecastData);
                addToHistory(city);

          weatherDisplay.classList.remove('hidden');
                errorMessage.classList.add('hidden');
      } catch (error) {
                weatherDisplay.classList.add('hidden');
                errorMessage.classList.remove('hidden');
                console.error('Error fetching weather:', error);
      }
}

function displayCurrentWeather(data) {
      document.getElementById('city-name').textContent = `${data.name}, ${data.sys.country}`;
      document.getElementById('current-date').textContent = formatDate(new Date());
      document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
      document.getElementById('humidity').textContent = `${data.main.humidity}%`;
      document.getElementById('wind-speed').textContent = `${data.wind.speed} m/s`;
      document.getElementById('feels-like').textContent = `${Math.round(data.main.feels_like)}°C`;
      document.getElementById('pressure').textContent = `${data.main.pressure} hPa`;

    const iconEl = document.getElementById('weather-icon');
      iconEl.src = `${ICON_URL}/${data.weather[0].icon}@2x.png`;
      iconEl.alt = data.weather[0].description;
}

function displayForecast(data) {
      const container = document.getElementById('forecast-cards');
      container.innerHTML = '';

    const dailyForecasts = data.list.filter((item) =>
              item.dt_txt.includes('12:00:00')
                                                ).slice(0, 5);

    dailyForecasts.forEach((day) => {
              const card = document.createElement('div');
              card.className = 'forecast-card';
              card.innerHTML = `
                          <p class="day">${formatDay(new Date(day.dt * 1000))}</p>
                                      <img src="${ICON_URL}/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
                                                  <p class="temp">${Math.round(day.main.temp)}°C</p>
                                                              <p class="description">${day.weather[0].description}</p>
                                                                      `;
              container.appendChild(card);
    });
}

function addToHistory(city) {
      const normalized = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      searchHistory = searchHistory.filter((c) => c.toLowerCase() !== city.toLowerCase());
      searchHistory.unshift(normalized);
      searchHistory = searchHistory.slice(0, 8);
      localStorage.setItem('weatherSearchHistory', JSON.stringify(searchHistory));
      renderSearchHistory();
}

function renderSearchHistory() {
      searchHistoryEl.innerHTML = '';
      searchHistory.forEach((city) => {
                const btn = document.createElement('button');
                btn.className = 'history-btn';
                btn.textContent = city;
                btn.addEventListener('click', () => fetchWeather(city));
                searchHistoryEl.appendChild(btn);
      });
}

function showLoading() {
      document.getElementById('city-name').textContent = 'Loading...';
}

function formatDate(date) {
      return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
      });
}

function formatDay(date) {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

init();
