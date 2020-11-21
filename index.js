const apiKey = '019af6d65amshfdcba9ddad7b7b6p15a8c3jsnb361c08911f2'
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
    <h1 class="home-header">Stream Finder</h1>
    <h2 class="home-text">Find where your favorite movies and shows are streaming!</h2>
    <div class="search-form-container">
        <form class="searchContent">
            <label for="searchSubject">Search for a TV show or Movie!</label>
            <br>
            <input type="text" id="searchSubject" required>
            <br>
            <button type="submit" class="js-submit home-search">Search</button>
        </form>
    </div>

    <div class="js-error-message hidden"></div>`
}

function generateResultsHeader(responseJson) {
    return `
    <header class="group">
        <div class="header-content-container">
            <h1 class="item">Stream Finder</h1>
            <form class="js-user-form item">
                <label for="searchSubject">Search another TV show or Movie!</label>
                <br>
                <input type="text" id="searchSubject" required>
                <button type="submit" class="js-submit header-search">Search</button>
                <div class="js-error-message hidden"></div>
            </form>
        </div>
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
            <img src="${responseJson.results[i].image.url}" class="result-poster">
        </div>

        <div id="listItem${i}" class="detail-button-container item">
            <button id="${responseJson.results[i].id.replace("/title/", "").replaceAll("/", "")}" class="list-button" onclick="this.disabled = true">Streaming Details</button>
        </div>
    </li>
    `
}

function generateDetailOverview(responseJson) {
    return `
        <div class="overview-container${store.listId}">
            <section class="search-summary">
                <h3 class="plot-summary">Plot Summary</h3>
                <p>${responseJson.plotOutline.text}</p>
                <p class="rating">${responseJson.certificates.US[0].certificate}</p>
            </section>
        </div>`
}

function generateStreamDetails(metaDataJson) {  
    let viewOptionsArray = metaDataJson.waysToWatch.optionGroups[i].watchOptions
    let watchOptionsHtml = ''
    console.log("generate stream details working")
    console.log(viewOptionsArray)

    watchOptionsHtml += `
        <section class="group">
            <div class="item">
                <h3 class="stream-method">${metaDataJson.waysToWatch.optionGroups[i].displayName}</h3>
                ${generateWatchOptions(viewOptionsArray)}
            </div>
        </section>`

    return watchOptionsHtml;
}

function generateMetacriticInfo(metaDataJson){
    let metacriticHtml = ""
    if(metaDataJson.metacritic.reviewCount > 0) {
        metacriticHtml += `
        <section class="group">
            <div class="item">
                <h3>Metacritic Info</h3>
                <p>Metacritic Score: ${metaDataJson.metacritic.metaScore}</p>
                <p>User Score: ${metaDataJson.metacritic.userScore}</p>
            </div>
        </section>
        `
    }
    return metacriticHtml
}

function generateWatchOptions(viewOptionsArray) {
    let viewOptionHtml = ""
    for(x = 0; x < viewOptionsArray.length; x ++) {
        viewOptionHtml += `
        <div>
            <h3 class="service-name">${viewOptionsArray[x].primaryText}</h3>
            <p><a href="${viewOptionsArray[x].link.uri}" class="service-link" target="_blank">${viewOptionsArray[x].secondaryText}</a></p>
        </div>`
    }
    return viewOptionHtml;
}

// ======== API INTERACTIONS ==========

// --------- Handle User Search GET title/find ----------
function formatSearchQuery(params) {
    const queryItem = Object.keys(params).map(key =>
        `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)

        return queryItem.join();
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

    $('.js-content-container').html(generateResultsHeader(responseJson));

    for(i = 0; i < responseJson.results.length; i++) {
        //filter out unwanted response values
        if(responseJson.results[i].title === undefined || responseJson.results[i].image === undefined || responseJson.results[i].year === undefined){
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
        //alert("Something went wrong. Please try again later.")
        console.log(error.status)
    })
}

function displayOverviewResults(overviewJson){
    $('#' + store.listId).empty();

    $('#' + store.listId).html(generateDetailOverview(overviewJson));
}

function displayStreamDetails(responseJson){
    console.log(responseJson)
    let responseId = Object.keys(responseJson);

    let metaDataJson = responseJson[responseId[0]];
    console.log(metaDataJson);

    let streamInfoHtml = generateMetacriticInfo(metaDataJson);

    for(i = 0; i < metaDataJson.waysToWatch.optionGroups.length; i++) {
        if(metaDataJson.waysToWatch.optionGroups[i].displayName === "ON TV") {
            console.log("option group skipped")
            continue;
        }
        streamInfoHtml += generateStreamDetails(metaDataJson);
    }

    $('#' + store.listId).append(streamInfoHtml);
}

// --------- Handle Detail View GET title/overview-detail ----------
function getOverviewDetails() {
    const params = {
        tconst: store.detailId
    }

    const overviewDetailQuery = formatSearchQuery(params);
    const url = baseURL + '/get-overview-details?' + overviewDetailQuery;
    console.log(url);

    fetch(url, options)
    .then(response => {
        if(!response.ok) {
            alert("Error")
            throw Error(response.status + ": " + response.message)
        }
        return response.json();
    })
    .then(responseJson => displayOverviewResults(responseJson))
    .catch(error => {
        //alert("Something went wrong. Please try again later.")
        console.log(error.status)
    })
}

// --------- Handle Detail View GET title/meta-data ----------
function getMetaData() {
    const params = {
        ids: store.detailId
    }

    const metatDataQuery = formatSearchQuery(params);
    const url = baseURL + '/get-meta-data?' + metatDataQuery;
    console.log(url);

    fetch(url, options)
    .then(response => {
        if(!response.ok) {
            alert("Error")
            throw Error(response.status + ": " + response.message)
        }
        return response.json();
    })
    .then(responseJson => displayStreamDetails(responseJson))
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
    $('body').on('click', '.detail-button-container', event => { 
        if($(event.currentTarget).hasClass('clicked')) {
            return false;
        }

        store.detailId = event.target.id;
        store.listId = event.currentTarget.id;
        console.log(store.listId)
        
        getOverviewDetails();
        // setTimeout to prevent race condition
        setTimeout(() => {  getMetaData(); }, 2000);

        $(event.currentTarget).addClass('clicked')
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
