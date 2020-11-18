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
            <div class="js-error-message hidden"></div>
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

        <div id="listItem${i}" class="detail-button-container">
            <button id="${responseJson.results[i].id.replace("/title/", "").replaceAll("/", "")}" class="list-button">Streaming Details</button>
        </div>
    </li>
    `
}

function generateDetailOverview(responseJson) {
    return `
        <div class="overview-container${store.listId}">
            <section class="search-summary">
                <h3>Plot Summary</h3>
                <p>${responseJson.plotOutline.text}</p>
            </section>
        </div>`
}

function generateStreamDetails(metaDataJson) {  
    let viewOptionsArray = metaDataJson.optionGroups[i].watchOptions
    let watchOptionsHtml = ''
    console.log(viewOptionsArray)

    watchOptionsHtml += `
        <section class="group">
            <div class="item">
                <h3>${metaDataJson.optionGroups[i].displayName}</h3>
                ${generateWatchOptions(viewOptionsArray)}
            </div>
        </section>`

    return watchOptionsHtml;
}

function generateWatchOptions(viewOptionsArray) {
    let viewOptionHtml = ""
    for(x = 0; x < viewOptionsArray.length; x ++) {
        viewOptionHtml += `
        <div>
            <h3>${viewOptionsArray[x].primaryText}</h3>
            <p><a href="${viewOptionsArray[x].link.uri}" target="_blank">${viewOptionsArray[x].secondaryText}</a></p>
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

    let metaDataJson = responseJson[responseId[0]].waysToWatch;
    console.log(metaDataJson);

    let streamInfoHtml = "";

    for(i = 0; i < metaDataJson.optionGroups.length; i++) {
        if(metaDataJson.optionGroups[i].displayName === "ON TV") {
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
