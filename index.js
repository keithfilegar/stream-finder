const apiKey = 'bddc714743msh7cb71e3d76c6f90p121999jsnb6ff9b4a7f9f'
const apiHost = 'imdb8.p.rapidapi.com'
const baseURL = 'https://imdb8.p.rapidapi.com/title'

const store = {
    searchStarted: false,
    searchList: [],
    viewPageKey: ""
}

// ======== HTML GENERATION ==========

function generateHomePage() {
    return `
    <h1>Stream Finder</h1>
    <h3>Too many streaming services to keep track of? Search below to find out where to watch something!</h3>
    <form class="searchContent">
        <label for="searchSubject">Search for a TV show or Movie!</label>
        <br>
        <input type="text" id="searchSubject" required>
        <button type="submit" class="js-submit">Search</button>
    </form>
    <div class="js-error-message hidden"></div>`
}

// ======== API INTERACTIONS ==========

function formatSearchQuery(params) {
    const queryItem = Object.keys(params).map(key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

        return queryItem.join()
}

function displaySearchResults(responseJson) {
    console.log(responseJson)
    $('.js-content-container').empty();


    // Display error message if search yields no results
    if(!responseJson.hasOwnProperty('results')){
        console.log('no results found')
        $('.js-content-container').append(
            `<div class="no-results-error">
                <h3>Sorry! We weren't able to find anything by that name. Please try another search.</h3>
            </div>`
        )
        return
    }

    $('.js-content-container').append(
        `<ul class="js-list-container"></ul>`
    )

    for(i = 0; i < responseJson.results.length; i++) {
        //filter out unwanted response values
        if(responseJson.results[i].title === undefined){
            continue;
        }

        //button id is structured to format id value needed to make additional calls
        $('.js-list-container').append(
            `<li class="group">
                <div class="item">
                <h3>${responseJson.results[i].title}</h3>
                <p>${responseJson.results[i].year}</p>
                <button id="${responseJson.results[i].id.replace("/title/", "").replaceAll("/", "")}">Streaming Details</button>
                </div>

                <div class="item">
                <img src="${responseJson.results[i].image.url}">
            </li>`
        )
    }

}

function getUserSearch(searchTerm) {
    const params = {
        q: searchTerm
    }

    const options = {
        headers: new Headers({
            "x-rapidapi-key": apiKey,
            "x-rapidapi-host": apiHost
        })
    }

    const searchQuery = formatSearchQuery(params)
    const url = baseURL + '/find?' + searchQuery
    console.log(url)

    fetch(url, options)
    .then(response => {
        if(!response.ok) {
            alert("Error")
            throw Error(response.status + ": " + response.message)
        }
        return response.json()
    })
    .then(responseJson => displaySearchResults(responseJson))
    .catch(error => {
        alert("Something went wrong. Please try again later.")
        console.log(error)
    })
}

// ======== EVENT HANDLERS ==========

function handleUserSearch() {
    $('.js-content-container').on('click', '.js-submit', event => {
        event.preventDefault();
        console.log("Working");
        const searchTerm = $('#searchSubject').val();

        getUserSearch(searchTerm);
        store.searchStarted = false;
    })
}

// ======== RENDER ==========

function renderHomeView() {
    $('.js-content-container').html(generateHomePage());
}

function render() {
    if(store.searchStarted === false) {
        renderHomeView();
    }
}

function handleApp(){
    render();
    handleUserSearch();
}

$(handleApp);
