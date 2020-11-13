const apiKey = 'bddc714743msh7cb71e3d76c6f90p121999jsnb6ff9b4a7f9f'
const apiHost = 'imdb8.p.rapidapi.com'
const baseURL = 'https://imdb8.p.rapidapi.com/title'

const store = {
    searchStarted: false,
    detailId: "",
    listId: ""
}

const options = {
    headers: new Headers({
        "x-rapidapi-key": apiKey,
        "x-rapidapi-host": apiHost
    })
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

function generateResultsHeader(responseJson) {
    return `
    <header class="group">
        <h1 class="item">Stream Finder</h1>
        <form class="js-user-form item">
            <label for="searchSubject">Search for a TV show or Movie!</label>
            <br>
            <input type="text" id="searchSubject" required>
            <button type="submit" class="js-submit">Search</button>
        </form>
    </header>

    <h2>Showing Resuls for: "${responseJson.query}"</h2>

    <div>
        <ul class="js-list-container"></ul>
    </div>`
}

function generateListPage(responseJson) {
    //button id is structured to format id value needed to make additional calls
    return `
    <li class="group">
        <div class="list-info item">
            <h3>${responseJson.results[i].title}</h3>
            <p>${responseJson.results[i].year}</p>
            
        </div>

        <div class="list-image item">
            <img src="${responseJson.results[i].image.url}">
        </div>

        <section id="listItem${i}" class="js-detail-container">
            <button id="${responseJson.results[i].id.replace("/title/", "").replaceAll("/", "")}" class="list-button">Streaming Details</button>
        </section>
    </li>
    `
}

function generateDetailView(responseJson) {
    
}

// ======== API INTERACTIONS ==========

// --------- Handle User Search GET title/find ----------
function formatSearchQuery(params) {
    const queryItem = Object.keys(params).map(key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

        return queryItem.join()
}

function displaySearchResults(responseJson) {
    console.log(responseJson)
    
    // Display error message if search yields no results
    if(!responseJson.hasOwnProperty('results')){
        console.log('no results found')

        $('.js-error-message').removeClass('hidden')
        $('.js-error-message').append(
            `<h3>Sorry! We weren't able to find anything by that name. Please try another search.</h3>`
        )
        return
    }
    $('.js-content-container').empty();

    $('body').html(generateResultsHeader(responseJson));

    for(i = 0; i < responseJson.results.length; i++) {
        //filter out unwanted response values
        if(responseJson.results[i].title === undefined){
            continue;
        }

        $('.js-list-container').append(generateListPage(responseJson))
    }

}

function getUserSearch(searchTerm) {
    const params = {
        q: searchTerm
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
        // TODO: Identify error when searching word "rubber"
        //alert("Something went wrong. Please try again later.")
        console.log(error.status)
    })
}

// --------- Handle Detail View GET title/overview-detail ----------
function displayOverviewResults(responseJson){
    console.log(responseJson)
    $('#' + store.listId).empty();

    $('#' + store.listId).apend(generateDetailView(responseJson));
    
}

function getOverviewDetails() {
    const params = {
        tconst: store.detailId
    }

    const overviewDetailQuery = formatSearchQuery(params)
    const url = baseURL + '/get-overview-details?' + overviewDetailQuery
    console.log(url)

    fetch(url,options)
    .then(response => {
        if(!response.ok) {
            alert("Error")
            throw Error(response.status + ": " + response.message)
        }
        return response.json()
    })
    .then(responseJson => displayOverviewResults(responseJson))
    .catch(error => {
        //alert("Something went wrong. Please try again later.")
        console.log(error.status)
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

function handleStreamDetails() {
    $('body').on('click', '.js-detail-container', event => {
        store.detailId = event.target.id
        console.log(store.detailId)

        store.listId = event.currentTarget.id
        console.log(store.detailId)
        console.log(store.listId)
        getOverviewDetails();
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
    handleStreamDetails();
}

$(handleApp);
