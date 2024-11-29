const API_KEY = "3540ed5323b3e51df96ad6cf38f42cba";
const DAY_OF_THE_WEEK = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const getDAY = (datevalue) => DAY_OF_THE_WEEK[new Date(datevalue).getDay()];
const ENDPOINTS = {
	CURRENT_FORECAST_COOORDS: "https://api.openweathermap.org/data/2.5/weather",
	CURRENT_FORECAST: "https://api.openweathermap.org/data/2.5/weather",
	FIVE_DAY_FORECAST: "https://api.openweathermap.org/data/2.5/forecast",
	GEOLOCATION: "http://api.openweathermap.org/geo/1.0/direct",
};

const formatTemp = (value) => `${value.toFixed(1)}℃`;
const formatTime = (time) => {
	let [hours, minutes] = time.split(":");
	return `${hours}:${minutes}`;
};
const getIcon = (iconcode) =>
	`https://openweathermap.org/img/wn/${iconcode}@2x.png`;

document.addEventListener("DOMContentLoaded", () => {
	const loadCurrentForecast = async ({ lat, lon }) => {
		const cityName = "pune";
		const response =
			lat && lon
				? await fetch(
						`${ENDPOINTS.CURRENT_FORECAST_COOORDS}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
				  )
				: await fetch(
						`${ENDPOINTS.CURRENT_FORECAST}?q=${cityName}&appid=${API_KEY}&units=metric`
				  );
		// console.log(await response.json());
		return response.json();
	};

	const loadHourlyForecast = async (city) => {
		const response = await fetch(
			`${ENDPOINTS.FIVE_DAY_FORECAST}?q=${city}&appid=${API_KEY}&units=metric`
		);
		const data = await response.json();
		// console.log(data);
		return data.list.map((forecast) => {
			let {
				dt,
				dt_txt,
				main: { temp, temp_max, temp_min },
				weather: [{ description, icon }],
			} = forecast;
			return {
				dt,
				dt_txt,
				temp,
				temp_max,
				temp_min,
				description,
				icon,
			};
		});
	};

	const loadData = async (data) => {
		const currentforecast = await loadCurrentForecast(data);
		// console.log(currentforecast);
		createCurrentForecast(currentforecast);
		const hourlyForecast = await loadHourlyForecast(currentforecast.name);
		// console.log(hourlyForecast);
		CreateFeelsLike(currentforecast);
		createHumidity(currentforecast);

		createHourlyForecast(hourlyForecast);
		createFiveDayForecast(hourlyForecast);
	};

	const createFiveDayForecast = (hourlyForecast) => {
		const result = Object.groupBy(hourlyForecast, (forecast) =>
			getDAY(forecast.dt_txt.split(" ")[0])
		);
		// console.log(result);

		for (let day in result) {
			let temp_min = Math.min(
				...Array.from(result[day], ({ temp_min }) => temp_min)
			);
			let temp_max = Math.max(
				...Array.from(result[day], ({ temp_max }) => temp_max)
			);
			result[day] = {
				temp_max,
				temp_min,
				icon: getIcon(result[day][0].icon),
			};

			// console.log(result[day].icon);
		}
		const Five_day_Container = document.querySelector(".fiveday-section");
		Five_day_Container.innerHTML = "";
		for (let day in result) {
			// console.log(result[day]);

			const Fiveday_Article = document.createElement("article");
			Fiveday_Article.classList.add("day-wise");

			const dayoftheWeek = document.createElement("h3");
			dayoftheWeek.classList.add("day-week");
			dayoftheWeek.textContent =
				day === DAY_OF_THE_WEEK[new Date().getDay()] ? "Today" : day;

			const Icon = document.createElement("img");
			Icon.classList.add("icon");
			Icon.src = result[day].icon;

			const Max_temp = document.createElement("p");
			Max_temp.classList.add("temp-max");
			Max_temp.textContent = formatTemp(result[day].temp_max);

			const Min_temp = document.createElement("p");
			Min_temp.classList.add("temp-min");
			Min_temp.textContent = formatTemp(result[day].temp_min);
			Fiveday_Article.append(dayoftheWeek, Icon, Max_temp, Min_temp);
			Five_day_Container.appendChild(Fiveday_Article);
		}
	};

	const CreateFeelsLike = ({ main: { feels_like } }) => {
		const element = document.querySelector(".container #feels-like .temp");
		element.textContent = formatTemp(feels_like);
	};

	const createHumidity = ({ main: { humidity } }) => {
		const element = document.querySelector(".container #humidity .hum-temp");
		element.textContent = formatTemp(humidity);
	};
	const createHourlyForecast = (hourlyForecast) => {
		let Data12Entries = hourlyForecast.slice(1, 13);
		const hourlyContainer = document.querySelector(".hourly-section");
		hourlyContainer.innerHTML = "";
		for (const { temp, icon, dt_txt } of Data12Entries) {
			const container = document.createElement("article");
			container.classList.add("hour-info");

			const time = document.createElement("h3");
			time.classList.add("time");
			time.textContent = formatTime(dt_txt.split(" ")[1]);

			const IconImg = document.createElement("img");
			IconImg.classList.add("icon");
			IconImg.src = getIcon(icon);

			const temperature = document.createElement("p");
			temperature.classList.add("hourly-temp");
			temperature.textContent = formatTemp(temp);

			container.append(time, IconImg, temperature);
			hourlyContainer.appendChild(container);
		}
	};

	const createCurrentForecast = async ({
		name,
		main: { temp, temp_max, temp_min },
		weather: [{ description, icon }],
	}) => {
		const Container = document.getElementById("current-forecast");
		Container.innerHTML = "";

		const heading = document.createElement("h1");
		heading.classList.add("heading");
		heading.textContent = `${name}`;

		const temperature = document.createElement("p");
		temperature.classList.add("temp");
		temperature.textContent = `${formatTemp(temp)}`;

		const DesCont = document.createElement("article");
		DesCont.classList.add("img-des");
		const IconImg = document.createElement("img");
		IconImg.classList.add("icon");
		IconImg.src = getIcon(icon);

		const descriptionElement = document.createElement("p");
		descriptionElement.classList.add("description");
		descriptionElement.textContent = `${description}`;

		const MinMaxTemp = document.createElement("p");
		MinMaxTemp.classList.add("min-max-temp");
		MinMaxTemp.textContent = `High:${formatTemp(
			temp_max
		)} ${"--"} Low:${formatTemp(temp_min)}`;
		DesCont.append(IconImg, descriptionElement);
		Container.appendChild(heading);
		Container.appendChild(temperature);
		Container.appendChild(DesCont);
		Container.appendChild(MinMaxTemp);
	};
	// loadData();
	const onInput = async (event) => {
		let cityName = event.target.value.split(",");
		console.log(cityName);

		const cities = await GeolocationInfo(cityName);
		// console.log(cities);
		if (cityName) {
			const datalist = document.getElementById("cities");
			let options = "";
			for (let { lat, lon, name, state, country } of cities) {
				options += `<option data-coords=${JSON.stringify({
					lat,
					lon,
				})} value="${name},${state},${country}"></option>`;
			}
			datalist.innerHTML = options;
			// console.log(datalist);
		}
	};

	// function debounce(func, timeout = 100) {
	// 	let timer;
	// 	return (...args) => {
	// 		clearTimeout(timer);
	// 		timer = setTimeout(() => {
	// 			func.apply(this, args);
	// 		}, timeout);
	// 	};
	// }

	const onSelect = (event) => {
		// let cityName = event.target.value;
		// console.log(cityName);

		let selectedCity = document.querySelector("datalist > option");
		if (selectedCity) {
			// console.log(selectedCity);
			let result = JSON.parse(selectedCity.getAttribute("data-coords"));
			if (result) {
				loadData(result);
			}
		}
	};

	const searchElement = document.getElementById("searchbox");
	// const debounceElement = debounce((event) => onInput(event));
	searchElement.addEventListener("input", onInput);
	searchElement.addEventListener("change", onSelect);
	searchElement.addEventListener("onselect", onSelect);

	const GeolocationInfo = async (cityName) => {
		console.log("geo func called");

		const response = await fetch(
			`${ENDPOINTS.GEOLOCATION}?q=${cityName},&limit=5&appid=${API_KEY}`
		);
		return response.json();
	};

	const loadDataUSingGeoLocation = () => {
		navigator.geolocation.getCurrentPosition(
			({ coords: { latitude: lat, longitude: lon } }) => {
				console.log(lat, lon);

				loadData({ lat, lon });
			},
			() => {
				alert("unable to fetch location");
				loadData();
			}
		);
	};
	loadDataUSingGeoLocation();
	// GeolocationInfo("pune");
});
