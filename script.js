const API_KEY = '73156cc07a338c898b0875097a367089';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const weatherDisplay = document.getElementById('weatherDisplay');
const cityInput = document.getElementById('cityInput');

// ===== DARK MODE TOGGLE =====
const themeToggle = document.getElementById('themeToggle');
const themeLabel = document.getElementById('themeLabel');

// Dark Mode aus LocalStorage laden
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeToggle.checked = true;
        themeLabel.textContent = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggle.checked = false;
        themeLabel.textContent = '🌙 Dark Mode';
    }
}

// Dark Mode umschalten
function toggleTheme() {
    if (themeToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
        themeLabel.textContent = '☀️ Light Mode';
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
        themeLabel.textContent = '🌙 Dark Mode';
    }
}

// Event-Listener für Toggle
themeToggle.addEventListener('change', toggleTheme);
loadTheme();


// wetter von Standort automatisch
function getWeatherByLocation() {
    if (!navigator.geolocation) {
        showError('Dein Browser unterstützt leider keinen Standort-Zugriff :(.');
        return;
    }

    weatherDisplay.className = 'weather-display active';
    weatherDisplay.innerHTML = '<div class="loading">📍 Dein Standort wird ermittelt, einen Moment Gedult bitte...</div>';

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await fetchWeatherByCoords(lat, lon);
        },
        (error) => {
            showError('Standort-Zugriff wurde verweigert. Bitte gib deine Stadt manuell ein.');
        }
    );
}

// Standort manuell eingeben
async function getWeatherByCity() {
    const city = cityInput.value.trim();
    if (!city) {
        showError('Bitte gib eine Stadt ein!');
        return;
    }

    weatherDisplay.className = 'weather-display active';
    weatherDisplay.innerHTML = '<div class="loading">🔍 Wetter wird geladen...</div>';

    await fetchWeatherByCity(city);
}

async function fetchWeatherByCity(city) {
    try {
        const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=de`;
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Die Stadt wurde leider nicht gefunden. Bitte überprüfe die Schreibweise.');
            }
            throw new Error('Wetter-Daten konnten leider nicht geladen werden.');
        }
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    try {
        const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=de`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Wetter-Daten konnten leider nicht geladen werden.');
        }
        
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        showError(error.message);
    }
}


function displayWeather(data) {
    const temp = Math.round(data.main.temp);
    const description = data.weather[0].description;
    const icon = getWeatherEmoji(data.weather[0].id);
    const city = data.name;
    const country = data.sys.country;

    const outfit = getOutfit(temp);

    weatherDisplay.className = 'weather-display active';
    weatherDisplay.innerHTML = `
        <div class="city-name">${city}, ${country}</div>
        <div class="weather-icon">${icon}</div>
        <div class="temperature">${temp}<span>°C</span></div>
        <div class="weather-description">${description}</div>
        
        <div class="outfit-section">
            <h3>👔 Angemessene Kleidung wäre zum Beispiel:</h3>
            <div class="outfit-recommendation">
                <span class="outfit-emoji">${outfit.emoji}</span>
                <span class="outfit-text">${outfit.text}</span>
            </div>
        </div>
    `;
}

function showError(message) {
    weatherDisplay.className = 'weather-display active';
    weatherDisplay.innerHTML = `
        <div class="error">⚠️ ${message}</div>
    `;
}

function getOutfit(temp) {
    if (temp >= 25) {
        return {
            emoji: '🩳',
            text: 'T-Shirt & Shorts – es wird warm!'
        };
    } else if (temp >= 18) {
        return {
            emoji: '👕',
            text: 'Leichtes T-Shirt & Jeans – perfekt!'
        };
    } else if (temp >= 10) {
        return {
            emoji: '🧥',
            text: 'Pullover & leichte Jacke – frühlingshafte/herbstliche Temperaturen'
        };
    } else if (temp >= 0) {
        return {
            emoji: '🧣',
            text: 'Winterjacke, Schal & Mütze – es wird kühl'
        };
    } else {
        return {
            emoji: '❄️',
            text: 'Extra warm anziehen -Es wird frostig'
        };
    }
}

function getWeatherEmoji(weatherId) {
    if (weatherId >= 200 && weatherId < 300) return '⛈️';  // Gewitter
    if (weatherId >= 300 && weatherId < 500) return '🌧️';  // Nieselregen
    if (weatherId >= 500 && weatherId < 600) return '🌧️';  // Regen
    if (weatherId >= 600 && weatherId < 700) return '❄️';  // Schnee
    if (weatherId >= 700 && weatherId < 800) return '🌫️';  // Nebel
    if (weatherId === 800) return '☀️';                     // Klar
    if (weatherId >= 801 && weatherId < 810) return '⛅';   // Bewölkt
    return '🌤️';                                            // Standard
}

cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeatherByCity();
    }
});

window.addEventListener('load', () => {
    // Testlauf für Defaultstadt Berlin
    // cityInput.value = 'Berlin';
    // getWeatherByCity();
});