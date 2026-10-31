const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");

const weatherSection = document.getElementById("weatherSection");
const forecastSection = document.getElementById("forecastSection");

const message = document.getElementById("message");

const cityName = document.getElementById("cityName");
const currentDate = document.getElementById("currentDate");

const temperature = document.getElementById("temperature");
const weatherDescription = document.getElementById("weatherDescription");
const weatherIcon = document.getElementById("weatherIcon");
const feelsLike = document.getElementById("feelsLike");

const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const rain = document.getElementById("rain");

const forecastContainer = document.getElementById("forecastContainer");

const locationBtn = document.getElementById("locationBtn");

const weatherConditions = {

    0: {
        description: "Ciel dégagé",
        icon: "☀️"
    },

    1: {
        description: "Principalement dégagé",
        icon: "🌤️"
    },

    2: {
        description: "Partiellement nuageux",
        icon: "⛅"
    },

    3: {
        description: "Nuageux",
        icon: "☁️"
    },

    45: {
        description: "Brouillard",
        icon: "🌫️"
    },

    48: {
        description: "Brouillard givrant",
        icon: "🌫️"
    },

    51: {
        description: "Bruine légère",
        icon: "🌦️"
    },

    53: {
        description: "Bruine modérée",
        icon: "🌦️"
    },

    55: {
        description: "Bruine dense",
        icon: "🌧️"
    },

    61: {
        description: "Pluie légère",
        icon: "🌧️"
    },

    63: {
        description: "Pluie modérée",
        icon: "🌧️"
    },

    65: {
        description: "Forte pluie",
        icon: "🌧️"
    },

    71: {
        description: "Neige légère",
        icon: "🌨️"
    },

    73: {
        description: "Neige modérée",
        icon: "🌨️"
    },

    75: {
        description: "Forte neige",
        icon: "❄️"
    },

    80: {
        description: "Averses légères",
        icon: "🌦️"
    },

    81: {
        description: "Averses modérées",
        icon: "🌧️"
    },

    82: {
        description: "Fortes averses",
        icon: "⛈️"
    },

    95: {
        description: "Orage",
        icon: "⛈️"
    },

    96: {
        description: "Orage avec grêle",
        icon: "⛈️"
    },

    99: {
        description: "Fort orage avec grêle",
        icon: "⛈️"
    }

};



searchForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const city = cityInput.value.trim();

    if (city === "") {
        message.textContent = "Veuillez saisir une ville.";
        return;
    }

    try {

        message.textContent = "Recherche en cours...";

        // Appel de l'API Geocoding
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Erreur lors de la recherche.");
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            throw new Error("Ville introuvable.");
        }

        const location = data.results[0];

        const latitude = location.latitude;
        const longitude = location.longitude;

        const name = location.name;
        const country = location.country || "";

        // Appeler la fonction météo
        await getWeather(latitude, longitude, name, country);

        message.textContent = "";

    } catch (error) {

        message.textContent = error.message;

        weatherSection.classList.add("hidden");
        forecastSection.classList.add("hidden");

        console.error(error);

    }

});

async function getWeather(latitude, longitude, name, country = "") {

    message.textContent = "Récupération des données météo...";

    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.search = new URLSearchParams({

        latitude: latitude,
        longitude: longitude,

        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "precipitation",
            "weather_code",
            "wind_speed_10m"
        ].join(","),

        daily: [
            "weather_code",
            "temperature_2m_max",
            "temperature_2m_min"
        ].join(","),

        timezone: "auto",
        forecast_days: "5"

    });

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Impossible de récupérer la météo.");
    }

    const data = await response.json();

    // Affichage de la météo actuelle
    displayCurrentWeather(data, name, country);

    // Affichage des prévisions
    displayForecast(data);

    message.textContent = "";

    weatherSection.classList.remove("hidden");
    forecastSection.classList.remove("hidden");

}


function displayCurrentWeather(data, name, country) {

    const current = data.current;

    const condition = weatherConditions[current.weather_code] || {
        description: "Conditions inconnues",
        icon: "🌡️"
    };

    cityName.textContent = country ? `${name}, ${country}` : name;

    
    currentDate.textContent = new Intl.DateTimeFormat("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());

    
    temperature.textContent =
        `${Math.round(current.temperature_2m)}°C`;

    
    weatherDescription.textContent = condition.description;

   weatherIcon.textContent = condition.icon;


    feelsLike.textContent =
        `Ressenti : ${Math.round(current.apparent_temperature)}°C`;

        humidity.textContent =
        `${current.relative_humidity_2m}%`;

        wind.textContent =
        `${current.wind_speed_10m} km/h`;

    
    rain.textContent =
        `${current.precipitation} mm`;

}


function displayForecast(data) {

    forecastContainer.innerHTML = "";

    const daily = data.daily;

    for (let i = 0; i < daily.time.length; i++) {

        const date = new Date(`${daily.time[i]}T12:00:00`);

        const day = new Intl.DateTimeFormat("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short"
        }).format(date);

        const code = daily.weather_code[i];

        const condition = weatherConditions[code] || {
            description: "Inconnu",
            icon: "🌡️"
        };

        const max = Math.round(daily.temperature_2m_max[i]);
        const min = Math.round(daily.temperature_2m_min[i]);

        const card = document.createElement("div");

        card.classList.add("forecast-card");

        const dayElement = document.createElement("p");
        dayElement.textContent = day;

        const iconElement = document.createElement("div");
        iconElement.classList.add("icon");
        iconElement.textContent = condition.icon;

        const descriptionElement = document.createElement("small");
        descriptionElement.textContent = condition.description;

        const maxElement = document.createElement("h3");
        maxElement.textContent = `${max}°C`;

        const minElement = document.createElement("p");
        minElement.textContent = `Min : ${min}°C`;

        card.append(
            dayElement,
            iconElement,
            descriptionElement,
            maxElement,
            minElement
        );

        forecastContainer.appendChild(card);

    }

}



async function getLocationName(latitude, longitude) {

    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&accept-language=fr`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Impossible de trouver votre ville.");
    }

    const data = await response.json();

    const address = data.address;

    const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        "Position inconnue";

    const country = address.country || "";

    return {
        city: city,
        country: country
    };
}

locationBtn.addEventListener("click", function () {

    if (!navigator.geolocation) {

        message.textContent =
            "Votre navigateur ne supporte pas la géolocalisation.";

        return;
    }

    message.textContent = "Recherche de votre position...";

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            try {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                // Identifier la ville
                const location = await getLocationName(
                    latitude,
                    longitude
                );

                // Récupérer la météo
                await getWeather(
                    latitude,
                    longitude,
                    location.city,
                    location.country
                );

            } catch (error) {

                message.textContent = error.message;

                console.error(error);

            }

        },

        function (error) {

            if (error.code === error.PERMISSION_DENIED) {

                message.textContent =
                    "Vous devez autoriser la géolocalisation.";

            } else if (error.code === error.POSITION_UNAVAILABLE) {

                message.textContent =
                    "Votre position est indisponible.";

            } else {

                message.textContent =
                    "Le délai de localisation est dépassé.";

            }

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }

    );

});


function initializeWeather() {

    if (!navigator.geolocation) {

        message.textContent =
            "La géolocalisation n'est pas disponible.";

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            try {

                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                const location = await getLocationName(
                    latitude,
                    longitude
                );

                await getWeather(
                    latitude,
                    longitude,
                    location.city,
                    location.country
                );

            } catch (error) {

                message.textContent = error.message;

            }

        },

        function () {

            message.textContent =
                "Autorisez la localisation pour afficher votre météo.";

        }

    );

}

initializeWeather();