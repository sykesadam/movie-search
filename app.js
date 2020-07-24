async function getMovies(title) {
	const response = await fetch(
		`http://www.omdbapi.com/?apikey=e1248c77&s=${title}`
	);
	const data = await response.json();

	return data;
}

async function getMoviesByID(id) {
	const response = await fetch(
		`http://www.omdbapi.com/?apikey=e1248c77&i=${id}`
	);
	const data = await response.json();

	return data;
}

window.addEventListener("load", async (event) => {
	let params = new URL(document.location).searchParams;
	if (params.has("search")) {
		const data = await getMovies(params.get("search"));
		const movies = data.Search;
		appendSearchResult(movies);
	}
});

async function search() {
	const searchValue = document.querySelector(".searchbar__field").value;

	const data = await getMovies(searchValue);
	const movies = data.Search;

	history.pushState(
		{ search: true, value: searchValue },
		searchValue,
		`?search=${searchValue}`
	);

	return appendSearchResult(movies);
}

async function appendSearchResult(movies) {
	let movieElements = document.querySelectorAll(".movie");
	movieElements.forEach((movie, i) => {
		movie.style.opacity = 0;
	});

	setTimeout(() => {
		const movieResults = document.querySelector(".movie__results");
		movieResults.innerHTML = "";
		movies.forEach((movie) => {
			const movieResult = `<article class="movie" data-id="${movie.imdbID}">
			<div class="movie__card">
			<img src="${movie.Poster}" />
			<h1 class="movie__title">${movie.Title} (${movie.Year})</h1>
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

async function moreInfo(element) {
	element.parentElement.style.zIndex = "100";

	const movies = document.querySelectorAll(".movie");

	for (let i = 0; i < movies.length; i++) {
		movies[i].style.transform =
			"translateY(-" + movies[i].offsetTop + "px)";
	}

	const movieID = element.parentElement.dataset.id;
	const data = await getMoviesByID(movieID);

	history.pushState({ search: false }, data.Title, `?movie=${data.Title}`);

	const moreInfo = element.parentElement.querySelector(".more-info");

	moreInfo.innerHTML = `
	<div class="plot">
		<h1>Synopsis</h1>
		<p class="plot__text">${data.Plot}</p>
	</div>
	<div class="score score--imdb-rating">${data.imdbRating}</div>
	<div class="score score--metascore">${data.Metascore}</div>
	<div class="creator">
		<h1>Director</h1>
		<p>${data.Director}</p>
	</div>
	<div class="creator">
		<h1>Writer(s)</h1>
		<p>${data.Writer}</p>
	</div>
	<div class="runtime">
		<h1>Length</h1>
		<p>${data.Runtime}</p>
	</div>
	<div class="genre">
		<h1>Genre</h1>
		<p>${data.Genre}</p>
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
	}, 100);

	movies.forEach((movie) => (movie.style.transform = "translateY(0)"));
	element.parentElement.style.zIndex = "0";
}

// document.querySelector(".search-button").addEventListener("click", search);
document.querySelector(".searchbar__field").addEventListener("keydown", (e) => {
	if (e.keyCode === 13) search();
});

//<h1 class="movie__title">${movie.Title}</h1>

// Actors: "Leonardo DiCaprio, Joseph Gordon-Levitt, Ellen Page, Tom Hardy"
// Awards: "Won 4 Oscars. Another 152 wins & 217 nominations."
// BoxOffice: "$292,568,851"
// Country: "USA, UK"
// DVD: "07 Dec 2010"
// Director: "Christopher Nolan"
// Genre: "Action, Adventure, Sci-Fi, Thriller"
// Language: "English, Japanese, French"
// Metascore: "74"
// Plot: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O."
// Poster: "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg"
// Production: "Warner Bros. Pictures"
// Rated: "PG-13"
// Ratings: (3) [{…}, {…}, {…}]
// Released: "16 Jul 2010"
// Response: "True"
// Runtime: "148 min"
// Title: "Inception"
// Type: "movie"
// Website: "N/A"
// Writer: "Christopher Nolan"
// Year: "2010"
// imdbID: "tt1375666"
// imdbRating: "8.8"
// imdbVotes: "1,980,743"
// __proto__: Object
