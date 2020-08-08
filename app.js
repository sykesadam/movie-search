/*
TODO

-Fixa history grejer.
-Kanske bättre animation än max height.
-Lägga till "Watchlist" funktion

*/
function setSearchHistory(searchValue, type) {
	history.pushState(
		{ searchValue, type },
		searchValue,
		`?t=${type}&s=${searchValue}`
	);
}

function setItemHistory(details, type) {
	let title;
	if (type === "tv" || type === "person") title = details.name;
	if (type === "movie") title = details.title;

	history.pushState(
		{ details, type },
		details.title,
		`?${type}=${title}&id=${details.id}`
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
		setSearchHistory(searchValue, "movie");
		return appendResults(data, "movie");
	}
	if (show) {
		data = await getTVShows(searchValue);
		setSearchHistory(searchValue, "tv");
		return appendResults(data, "tv");
	}
	if (person) {
		data = await getPeople(searchValue);
		setSearchHistory(searchValue, "person");
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

		if (type === "movie") results.innerHTML = movieItems(searchData);
		if (type === "tv") results.innerHTML = tvItems(searchData);
		if (type === "person") results.innerHTML = personItems(searchData);

		items = document.querySelectorAll(".item");
		items.forEach((item, i) => {
			setTimeout(() => {
				item.style.opacity = 1;
				item.style.transform = "translateX(0)";
			}, 100 * i);
		});

		document.querySelectorAll(".card").forEach((element) => {
			element.addEventListener("click", () => {
				if (!element.classList.contains("open")) {
					element.classList.add("open");
					if (type === "movie") movieInfo(type, element);
					if (type === "tv") tvInfo(type, element);
					if (type === "person") personInfo(type, element);
				} else {
					element.classList.remove("open");
					lessInfo(element);
				}
			});
		});
	}, 400);
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
	console.log(data);
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
	} else if (type === "season") {
		array.forEach((a) => {
			data += `
				<li class="episode">Episode ${a.episode_number}</li>
				<div class="episode-info">
					<p>${a.overview}</p>
				</div>
			`;
		});
	} else {
		array.forEach((a) => (data += `<li>${a.name}</li>`));
	}
	return data;
}

function animateOutCards(element) {
	element.parentElement.style.zIndex = "100";

	const movies = document.querySelectorAll(".item");

	for (let i = 0; i < movies.length; i++) {
		movies[i].style.transform =
			"translateY(-" + movies[i].offsetTop + "px)";
	}
}

async function movieInfo(type, element) {
	animateOutCards(element);

	const id = element.parentElement.dataset.id;
	const movieDetails = await getMovieDetails(id);
	const movieCredits = await getMovieCredits(id);

	// console.log(movieDetails);
	// console.log(movieCredits);

	const director = movieCredits.crew.filter(({ job }) => job === "Director");
	const writers = movieCredits.crew.filter(({ job }) => {
		if (job === "Screenplay" || job === "Story" || job === "Writer")
			return true;
	});
	const cast = movieCredits.cast.slice(0, 5);

	setItemHistory(movieDetails, type);

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

async function tvInfo(type, element) {
	animateOutCards(element);

	const id = element.parentElement.dataset.id;
	const tvDetails = await getTVShowDetails(id);

	const tvCredits = await getTVShowCredits(id);

	console.log(tvCredits.cast);

	const cast = tvCredits.cast.slice(0, 5);

	setItemHistory(tvDetails, type);

	const moreInfo = element.parentElement.querySelector(".more-info");

	moreInfo.innerHTML = `
	<div class="plot">
		<h2>Synopsis</h2>
		<p class="plot__text">${tvDetails.overview}</p>
	</div>
	<div class="score">${tvDetails.vote_average}</div>
	<div class="creator">
		<h2>Creators</h2>
		<ul class="list">
			${printArr(tvDetails.created_by)}
		</ul>
	</div>
	<div class="runtime">
		<h2>Length</h2>
		<p>${tvDetails.episode_run_time} min</p>
	</div>
	<div class="genre">
		<h2>Genre</h2>
		<ul class="list">
			${printArr(tvDetails.genres)}
		</ul>
	</div>	
	<div class="actors">
		<h2>Actors</h2>
		<ul class="list">
			${printArr(cast, "cast")}
		</ul>
	</div>
	<div class="seasons">
		<h2>Seasons</h2>
		<ul class="list">
			${printArr(tvDetails.seasons)}
		</ul>
	</div>
	`;

	moreInfo.style.display = "grid";
	setTimeout(() => {
		moreInfo.classList.add("show");
	}, 350);
}

async function personInfo(type, element) {
	animateOutCards(element);

	const id = element.parentElement.dataset.id;
	const personDetails = await getPersonDetails(id);

	const tvCredits = await getTVShowCredits(id);

	console.log(personDetails);

	setItemHistory(personDetails, type);

	const moreInfo = element.parentElement.querySelector(".more-info");

	moreInfo.innerHTML = `
	<div class="plot">
		<h2>Synopsis</h2>
		<p class="plot__text">${tvDetails.overview}</p>
	</div>
	<div class="score">${tvDetails.vote_average}</div>
	<div class="creator">
		<h2>Creators</h2>
		<ul class="list">
			${printArr(tvDetails.created_by)}
		</ul>
	</div>
	<div class="runtime">
		<h2>Length</h2>
		<p>${tvDetails.episode_run_time} min</p>
	</div>
	<div class="genre">
		<h2>Genre</h2>
		<ul class="list">
			${printArr(tvDetails.genres)}
		</ul>
	</div>	
	<div class="actors">
		<h2>Actors</h2>
		<ul class="list">
			${printArr(cast, "cast")}
		</ul>
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

// document.querySelector(".searchbar__field").addEventListener("keydown", (e) => {
// 	if (e.keyCode === 13) getResult();
// });

document.querySelector(".search-form").addEventListener("submit", (e) => {
	e.preventDefault();
	getResult();
});

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

async function loadContent() {
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
		document.querySelector(".searchbar__field").value = params.get(
			"search"
		);
		return getResult(params.get("s"));
	}
	if (params.has("id")) {
		if (params.has("movie")) {
			document.querySelector("#movie").checked = true;
			return movieDetailsView(await getMovieDetails(params.get("id")));
		}
		if (params.has("tv")) {
			document.querySelector("#show").checked = true;
			return tvShowDetailsView(await getTVShowDetails(params.get("id")));
		}
		if (params.has("person")) {
			document.querySelector("#person").checked = true;
			console.log("snart");
		}
	}

	return startpage();
}

window.addEventListener("DOMContentLoaded", loadContent);
window.addEventListener("popstate", loadContent);

async function tvShowDetailsView(data) {
	const results = document.querySelector(".results");
	const tvCredits = await getTVShowCredits(data.id);

	const cast = tvCredits.cast.slice(0, 5);

	const season = await getTVShowEpisodes(data.id, 1);
	console.log(season);

	results.innerHTML = `
	<article class="item item--tv" data-id="${
		data.id
	}"  style="opacity: 1; transform: translateY(0);">
		<div class="card card--tv">
			<img src="${
				data.poster_path == undefined
					? "https://via.placeholder.com/100x150"
					: "https://image.tmdb.org/t/p/w154" + data.poster_path
			}" loading="lazy" alt="${data.title} poster" />
			<h1 class="card__title">${data.name} (${data.first_air_date})</h1>
		</div>
		<div class="more-info show" style="display: grid;">
			<div class="plot">
				<h2>Synopsis</h2>
				<p class="plot__text">${data.overview}</p>
			</div>
			<div class="score">${data.vote_average}</div>
			<div class="creator">
				<h2>Creators</h2>
				<ul class="list">
					${printArr(data.created_by)}
				</ul>
			</div>
			<div class="runtime">
				<h2>Length</h2>
				<p>${data.episode_run_time} min</p>
			</div>
			<div class="genre">
				<h2>Genre</h2>
				<ul class="list">
					${printArr(data.genres)}
				</ul>
			</div>	
			<div class="actors">
				<h2>Actors</h2>
				<ul class="list">
					${printArr(cast, "cast")}
				</ul>
			</div>
			<div class="seasons">
				<h2>Seasons</h2>
				<ul class="list">
					${printArr(data.seasons)}
				</ul>
			</div>
			<div class="episodes">
				<h2>${season.name}</h2>
				<ul class="list">
					${printArr(season.episodes, "season")}
				</ul>
			</div>
		</div>
	</article>`;
	const episodes = document.querySelectorAll(".episode");
	episodes.forEach((episode) =>
		episode.addEventListener("click", () => {
			episodes.forEach((episode) =>
				episode.classList.remove("show-episode")
			);
			episode.classList.add("show-episode");
		})
	);
}

async function movieDetailsView(data) {
	const results = document.querySelector(".results");
	const movieCredits = await getMovieCredits(data.id);

	const director = movieCredits.crew.filter(({ job }) => job === "Director");
	const writers = movieCredits.crew.filter(({ job }) => {
		if (job === "Screenplay" || job === "Story" || job === "Writer")
			return true;
	});
	const cast = movieCredits.cast.slice(0, 5);

	results.innerHTML = `<article class="item item--movie" data-id="${
		data.id
	}" style="opacity: 1; transform: translateY(0);">
				<div class="card card--movie open">
					<img src="https://image.tmdb.org/t/p/w154${
						data.poster_path
					}" loading="lazy" alt="${data.title} poster" />
					<h1 class="card__title">${data.title} (${data.release_date})</h1>
				</div>
				<div class="more-info show" style="display: grid;">
	<div class="plot">
		<h2>Synopsis</h2>
		<p class="plot__text">${data.overview}</p>
	</div>
	<div class="score">${data.vote_average}</div>
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
		<p>${data.runtime}min</p>
	</div>
	<div class="genre">
		<h2>Genre</h2>
		<ul class="list">
			${printArr(data.genres)}
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
		<p class="finances--budget">$${data.budget.toLocaleString("en-GB")}</p>
		<h2 class="finances__title--box-office">Box Office</h2>
		<p class="finances--box-office">$${data.revenue.toLocaleString("en-GB")}</p>
	</div>
	</article>`;
}
