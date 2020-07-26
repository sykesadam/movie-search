/*
TODO

-Fixa history grejer.
-Kanske bättre animation än max height.
-Lägga till "Watchlist" funktion

*/

async function getAll(searchword) {
	const response = await fetch(
		`https://api.themoviedb.org/3/search/movie?api_key=2426d550977235ca6217917baa94407f&query=${searchword}&page=1`
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

window.addEventListener("load", async (event) => {
	let params = new URL(document.location).searchParams;
	if (params.has("search")) {
		const data = await getAll(params.get("search"));
		appendSearchResult(data);
	}
});

async function search() {
	const searchValue = document.querySelector(".searchbar__field").value;

	const data = await getAll(searchValue);

	history.pushState(
		{ search: true, value: searchValue },
		searchValue,
		`?search=${searchValue}`
	);

	return appendSearchResult(data);
}

function appendSearchResult(data) {
	const searchData = data.results;
	let movieElements = document.querySelectorAll(".movie");
	movieElements.forEach((movie, i) => {
		movie.style.opacity = 0;
	});
	console.log(searchData);
	setTimeout(() => {
		const movieResults = document.querySelector(".movie__results");
		movieResults.innerHTML = "";
		searchData.forEach((result) => {
			const movieResult = `<article class="movie" data-id="${result.id}">
			<div class="movie__card">
			<img src="https://image.tmdb.org/t/p/w154${result.poster_path}" />
			<h1 class="movie__title">${result.title} (${result.release_date})</h1>
			</div>
			<div class="more-info"></div>
		</article>`;
			movieResults.innerHTML += movieResult;
		});
		movieElements = document.querySelectorAll(".movie");
		movieElements.forEach((movie, i) => {
			setTimeout(() => {
				movie.style.opacity = 1;
				movie.style.transform = "translateX(0)";
			}, 50 * i);
		});

		document.querySelectorAll(".movie__card").forEach((element) => {
			element.addEventListener("click", () => {
				if (!element.classList.contains("open")) {
					element.classList.add("open");
					moreInfo(element);
				} else {
					element.classList.remove("open");
					lessInfo(element);
				}
			});
		});
	}, 300);
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

async function moreInfo(element) {
	element.parentElement.style.zIndex = "100";

	const movies = document.querySelectorAll(".movie");

	for (let i = 0; i < movies.length; i++) {
		movies[i].style.transform =
			"translateY(-" + movies[i].offsetTop + "px)";
	}

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
		{ search: false },
		movieDetails.title,
		`?movie=${movieDetails.title}`
	);

	const moreInfo = element.parentElement.querySelector(".more-info");

	moreInfo.innerHTML = `
	<div class="plot">
		<h1>Synopsis</h1>
		<p class="plot__text">${movieDetails.overview}</p>
	</div>
	<div class="score">${movieDetails.vote_average}</div>
	<div class="creator">
		<h1>Director</h1>
		<ul class="list">
			${printArr(director)}
		</ul>
	</div>
	<div class="creator creator--writer">
		<h1>Writer(s)</h1>
		<ul class="list">
			${printArr(writers, "writers")}
		</ul>
	</div>
	<div class="runtime">
		<h1>Length</h1>
		<p>${movieDetails.runtime}min</p>
	</div>
	<div class="genre">
		<h1>Genre</h1>
		<ul class="list">
			${printArr(movieDetails.genres)}
		</ul>
	</div>	
	<div class="actors">
		<h1>Actors</h1>
		<ul class="list">
			${printArr(cast, "cast")}
		</ul>
	</div>
	<div class="finances">
		<h1>Budget</h1>
		<p>$${movieDetails.budget.toLocaleString("en-GB")}</p>
		<h1 class="accolades--box-office">Box Office</h1>
		<p>$${movieDetails.revenue.toLocaleString("en-GB")}</p>
	</div>
	`;
	moreInfo.style.display = "grid";
	setTimeout(() => {
		moreInfo.classList.add("show");
	}, 350);
}

function lessInfo(element) {
	history.back();

	const movies = document.querySelectorAll(".movie");
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
	if (e.keyCode === 13) search();
});

document.querySelector(".search-form").addEventListener("submit", (e) => {
	e.preventDefault();
});
