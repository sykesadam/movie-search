/*
TODO

-Fixa history grejer.
-Kanske bättre animation än max height.
-Lägga till "Watchlist" funktion

*/
function setHistory(searchValue, type) {
	history.pushState(
		{ searchValue, type },
		searchValue,
		`?t=${type}&s=${searchValue}`
	);
}

async function getResult(urlQuery) {
	const searchValue =
		urlQuery === undefined
			? document.querySelector(".searchbar__field").value
			: urlQuery;
	const movie = document.querySelector("#movie").checked,
		show = document.querySelector("#show").checked,
		person = document.querySelector("#person").checked;
	let data;

	if (movie) {
		data = await getMovies(searchValue);
		setHistory(searchValue, "movie");
		return appendResults(data, "movie");
	}
	if (show) {
		data = await getTVShows(searchValue);
		setHistory(searchValue, "tv");
		return appendResults(data, "tv");
	}
	if (person) {
		data = await getPeople(searchValue);
		setHistory(searchValue, "person");
		return appendResults(data, "person");
	}
}

function appendResults(data, type) {
	const searchData = data.results;
	let items = document.querySelectorAll(".item");
	items.forEach((item, i) => {
		item.style.opacity = 0;
	});

	setTimeout(() => {
		const results = document.querySelector(".results");
		results.innerHTML = "";

		if (type == "movie") results.innerHTML = movieItems(searchData);
		if (type == "tv") results.innerHTML = tvItems(searchData);
		if (type == "person") results.innerHTML = personItems(searchData);

		items = document.querySelectorAll(".item");
		items.forEach((item, i) => {
			setTimeout(() => {
				item.style.opacity = 1;
				item.style.transform = "translateX(0)";
			}, 75 * i);
		});

		document.querySelectorAll(".card").forEach((element) => {
			element.addEventListener("click", () => {
				if (!element.classList.contains("open")) {
					element.classList.add("open");
					movieInfo(element);
				} else {
					element.classList.remove("open");
					lessInfo(element);
				}
			});
		});
	}, 300);
}

function movieItems(data) {
	let content = "";
	data.forEach((result) => {
		content += `<article class="item item--movie" data-id="${result.id}">
				<div class="card card--movie">
					<img src="https://image.tmdb.org/t/p/w154${result.poster_path}" loading="lazy" alt="${result.title} poster" />
					<h1 class="card__title">${result.title} (${result.release_date})</h1>
				</div>
				<div class="more-info"></div>
			</article>`;
	});
	return content;
}

function tvItems(data) {
	let content = "";
	data.forEach((result) => {
		content += `<article class="item item--tv" data-id="${result.id}">
				<div class="card card--tv">
					<img src="${
						result.poster_path == undefined
							? "https://via.placeholder.com/100x150"
							: "https://image.tmdb.org/t/p/w154" +
							  result.poster_path
					}" loading="lazy" alt="${result.title} poster" />
					<h1 class="card__title">${result.name} (${result.first_air_date})</h1>
				</div>
				<div class="more-info"></div>
			</article>`;
	});
	return content;
}

function personItems(data) {
	let content = "";
	data.forEach((result) => {
		content += `<article class="item item--person" data-id="${result.id}">
				<div class="card card--person">
					<img src="${
						result.profile_path === null
							? "https://via.placeholder.com/100x150"
							: "https://image.tmdb.org/t/p/w154" +
							  result.profile_path
					}" loading="lazy" alt="${result.title} poster" />
					<h1 class="card__title">${result.name}</h1>
				</div>
				<div class="more-info"></div>
			</article>`;
	});
	return content;
}

function printArr(array, type) {
	let data = "";
	if (type === "writers") {
		array.forEach((a) => (data += `<li>${a.name} (${a.job})</li>`));
	} else if (type === "cast") {
		array.forEach((a) => (data += `<li>${a.name} (${a.character})</li>`));
	} else {
		array.forEach((a) => (data += `<li>${a.name}</li>`));
	}
	return data;
}

async function movieInfo(element) {
	element.parentElement.style.zIndex = "100";

	const movies = document.querySelectorAll(".item");

	for (let i = 0; i < movies.length; i++) {
		movies[i].style.transform =
			"translateY(-" + movies[i].offsetTop + "px)";
	}

	// separat detailsView funktion, förmodligen moviedetails, tvdetails osv
	const movieID = element.parentElement.dataset.id;
	const movieDetails = await getMovieDetails(movieID);
	const movieCredits = await getMovieCredits(movieID);

	console.log(movieDetails);
	console.log(movieCredits);

	const director = movieCredits.crew.filter(({ job }) => job === "Director");
	const writers = movieCredits.crew.filter(({ job }) => {
		if (job === "Screenplay" || job === "Story" || job === "Writer")
			return true;
	});
	const cast = movieCredits.cast.slice(0, 5);

	history.pushState(
		{ search: false, detailView: true },
		movieDetails.title,
		`?movie=${movieDetails.title}&id=${movieDetails.id}`
	);

	const moreInfo = element.parentElement.querySelector(".more-info");

	moreInfo.innerHTML = `
	<div class="plot">
		<h2>Synopsis</h2>
		<p class="plot__text">${movieDetails.overview}</p>
	</div>
	<div class="score">${movieDetails.vote_average}</div>
	<div class="creator">
		<h2>Director</h2>
		<ul class="list">
			${printArr(director)}
		</ul>
	</div>
	<div class="creator creator--writer">
		<h2>Writer(s)</h2>
		<ul class="list">
			${printArr(writers, "writers")}
		</ul>
	</div>
	<div class="runtime">
		<h2>Length</h2>
		<p>${movieDetails.runtime}min</p>
	</div>
	<div class="genre">
		<h2>Genre</h2>
		<ul class="list">
			${printArr(movieDetails.genres)}
		</ul>
	</div>	
	<div class="actors">
		<h2>Actors</h2>
		<ul class="list">
			${printArr(cast, "cast")}
		</ul>
	</div>
	<div class="finances">
		<h2>Budget</h2>
		<p class="finances--budget">$${movieDetails.budget.toLocaleString("en-GB")}</p>
		<h2 class="finances__title--box-office">Box Office</h2>
		<p class="finances--box-office">$${movieDetails.revenue.toLocaleString(
			"en-GB"
		)}</p>
	</div>
	`;
	moreInfo.style.display = "grid";
	setTimeout(() => {
		moreInfo.classList.add("show");
	}, 350);
}

function lessInfo(element) {
	history.back();

	const movies = document.querySelectorAll(".item");
	const moreInfo = element.parentElement.querySelector(".more-info");
	moreInfo.classList.remove("show");
	setTimeout(() => {
		moreInfo.style.display = "none";
		movies.forEach((movie) => (movie.style.transform = "translateY(0)"));
		element.parentElement.style.zIndex = "0";
	}, 350);
}

// document.querySelector(".search-button").addEventListener("click", search);
document.querySelector(".searchbar__field").addEventListener("keydown", (e) => {
	if (e.keyCode === 13) getResult();
});

document.querySelector(".search-form").addEventListener("submit", (e) => {
	e.preventDefault();
});

// Startpage

async function getPopularMovies() {
	const response = await fetch(
		`https://api.themoviedb.org/3/movie/popular?api_key=2426d550977235ca6217917baa94407f&page=1`
	);
	const data = await response.json();

	return data;
}
async function getPopularTVShows() {
	const response = await fetch(
		`https://api.themoviedb.org/3/tv/popular?api_key=2426d550977235ca6217917baa94407f&page=1`
	);
	const data = await response.json();

	return data;
}

async function startpage() {
	let popularMoviesData = await getPopularMovies();
	popularMoviesData = popularMoviesData.results.slice(0, 10);

	const popularMovies = document.querySelector(".cards--popular-movies");

	popularMoviesData.forEach((movie) => {
		popularMovies.innerHTML += `
		<div>
			<a>
				<img src="https://image.tmdb.org/t/p/w154${movie.poster_path}" alt="${movie.title}">
			</a>
		</div>
		`;
	});

	let popularTVData = await getPopularTVShows();
	popularTVData = popularTVData.results.slice(0, 10);
	const popularTVShows = document.querySelector(".cards--popular-tv");

	popularTVData.forEach((tv) => {
		popularTVShows.innerHTML += `
		<div>
			<a>
				<img src="https://image.tmdb.org/t/p/w154${tv.poster_path}" alt="${tv.name}">
			</a>
		</div>
		`;
	});
}

window.addEventListener("DOMContentLoaded", async function (e) {
	let params = new URL(document.location).searchParams;

	if (params.has("t")) {
		switch (params.get("t")) {
			case "movie":
				document.querySelector("#movie").checked = true;
				break;
			case "tv":
				document.querySelector("#show").checked = true;
				break;
			case "person":
				document.querySelector("#person").checked = true;
				break;
		}

		const data = await getResult(params.get("s"));
		document.querySelector(".searchbar__field").value = params.get(
			"search"
		);

		return appendResults(data, params.get("t"));
	}
	if (params.has("id")) {
		const data = await getMovieDetails(params.get("id"));

		// return detailsView(data);

		console.log(data);
	}

	return startpage();
});

// API REQUESTS
async function getMovies(searchword) {
	const response = await fetch(
		`https://api.themoviedb.org/3/search/movie?api_key=2426d550977235ca6217917baa94407f&query=${searchword}&page=1`
	);
	const data = await response.json();
	return data;
}

async function getTVShows(searchword) {
	const response = await fetch(
		`https://api.themoviedb.org/3/search/tv?api_key=2426d550977235ca6217917baa94407f&page=1&query=${searchword}`
	);
	const data = await response.json();
	return data;
}

async function getPeople(searchword) {
	const response = await fetch(
		`https://api.themoviedb.org/3/search/person?api_key=2426d550977235ca6217917baa94407f&page=1&query=${searchword}`
	);
	const data = await response.json();
	return data;
}

async function getMovieDetails(id) {
	const response = await fetch(
		`https://api.themoviedb.org/3/movie/${id}?api_key=2426d550977235ca6217917baa94407f`
	);
	const data = await response.json();
	return data;
}

async function getMovieCredits(id) {
	const response = await fetch(
		`https://api.themoviedb.org/3/movie/${id}/credits?api_key=2426d550977235ca6217917baa94407f`
	);
	const data = await response.json();
	return data;
}
