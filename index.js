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
    .then(responseJson => console.log(responseJson))
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
